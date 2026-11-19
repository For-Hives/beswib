'use server'

import { headers } from 'next/headers'
import { maxLength, minLength, object, optional, pipe, safeParse, string, trim, email as vEmail } from 'valibot'

import { consumeContactQuota, getClientIp } from '@/lib/security/rate-limit'
import { containsLink, isHoneypotFilled, looksLikeBotText } from '@/lib/security/spam'
import { verifyTurnstile } from '@/lib/security/turnstile'
import { sendContactMessage } from '@/services/notification.service'

const ContactSchema = object({
	// Trap field: hidden from visitors, see src/lib/security/spam.ts
	website: optional(pipe(string(), maxLength(500))),
	turnstileToken: optional(pipe(string(), maxLength(2048))),
	name: pipe(string(), trim(), minLength(1, 'Missing required fields'), maxLength(100, 'Name too long')),
	message: pipe(string(), trim(), minLength(1, 'Missing required fields'), maxLength(5000, 'Message too long')),
	email: pipe(string(), trim(), maxLength(320, 'Email too long'), vEmail('Invalid email')),
})

export async function submitContactMessage(input: {
	name: string
	email: string
	message: string
	turnstileToken?: string
	website?: string
}): Promise<{
	success: boolean
	error?: string
	code?: 'invalid_input' | 'captcha' | 'rate_limited' | 'delivery_failed'
}> {
	const result = safeParse(ContactSchema, input)
	if (!result.success) {
		// Prefer the first message; collapse multiple field errors into one short message
		const firstError = result.issues?.[0]?.message ?? 'Invalid input'
		return { success: false, error: firstError, code: 'invalid_input' }
	}

	const { name, message, email, turnstileToken, website } = result.output

	// Robots: trap field filled in, or random letters. The usual success answer, nothing is sent.
	if (isHoneypotFilled(website) || looksLikeBotText({ name, message })) {
		console.warn('Contact form: robot submission dropped.')
		return { success: true }
	}

	// Cloudflare Turnstile, checked here: the action can be called without going through the page
	const turnstile = await verifyTurnstile(turnstileToken)
	if (!turnstile.success) {
		console.warn('Contact form: Turnstile refused.', turnstile.errorCodes)
		return { success: false, error: 'Captcha verification failed', code: 'captcha' }
	}

	// Counted after Turnstile: only messages that would really be delivered use the visitor's quota
	if (!consumeContactQuota(getClientIp(await headers()))) {
		return { success: false, error: 'Too many messages, please try again later', code: 'rate_limited' }
	}

	const ok = await sendContactMessage({ name, message, email, hasLink: containsLink(message) })
	if (!ok) return { success: false, error: 'Notification failed', code: 'delivery_failed' }
	return { success: true }
}
