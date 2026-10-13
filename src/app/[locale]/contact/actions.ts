'use server'

import { maxLength, minLength, object, pipe, safeParse, string, trim, email as vEmail } from 'valibot'

import { sendContactMessage } from '@/services/notification.service'

const ContactSchema = object({
	name: pipe(string(), trim(), minLength(1, 'Missing required fields'), maxLength(100, 'Name too long')),
	message: pipe(string(), trim(), minLength(1, 'Missing required fields'), maxLength(5000, 'Message too long')),
	email: pipe(string(), trim(), maxLength(320, 'Email too long'), vEmail('Invalid email')),
})

export async function submitContactMessage(input: {
	name: string
	email: string
	message: string
}): Promise<{ success: boolean; error?: string; code?: 'invalid_input' | 'delivery_failed' }> {
	const result = safeParse(ContactSchema, input)
	if (!result.success) {
		// Prefer the first message; collapse multiple field errors into one short message
		const firstError = result.issues?.[0]?.message ?? 'Invalid input'
		return { success: false, error: firstError, code: 'invalid_input' }
	}

	const { name, message, email } = result.output

	const ok = await sendContactMessage({ name, message, email })
	if (!ok) return { success: false, error: 'Notification failed', code: 'delivery_failed' }
	return { success: true }
}
