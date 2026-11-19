// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { submitContactMessage } from '@/app/[locale]/contact/actions'
import { contactIpLimiter, contactUnknownIpLimiter } from '@/lib/security/rate-limit'
import { sendContactMessage } from '@/services/notification.service'

const requestHeaders = new Headers({ 'x-forwarded-for': '203.0.113.7' })

vi.mock('next/headers', () => ({
	headers: vi.fn(() => Promise.resolve(requestHeaders)),
}))

vi.mock('@/services/notification.service', () => ({
	sendContactMessage: vi.fn(() => Promise.resolve(true)),
}))

const valid = {
	turnstileToken: 'token-from-the-widget',
	name: 'Marie Dupont',
	message: 'Bonjour, je voudrais revendre mon dossard pour le trail de dimanche.',
	email: 'marie@example.com',
}

describe('submitContactMessage', () => {
	beforeEach(() => {
		vi.mocked(sendContactMessage).mockClear()
		contactIpLimiter.reset()
		contactUnknownIpLimiter.reset()
		requestHeaders.set('x-forwarded-for', '203.0.113.7')
		vi.stubEnv('TURNSTILE_SECRET_KEY', '')
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.unstubAllEnvs()
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('sends a regular message', async () => {
		await expect(submitContactMessage(valid)).resolves.toEqual({ success: true })
		expect(sendContactMessage).toHaveBeenCalledWith({
			name: valid.name,
			message: valid.message,
			hasLink: false,
			email: valid.email,
		})
	})

	it('flags a message that contains a link', async () => {
		await submitContactMessage({ ...valid, message: 'Great offer on https://spam.example/promo' })
		expect(sendContactMessage).toHaveBeenCalledWith(expect.objectContaining({ hasLink: true }))
	})

	it('answers success but sends nothing when the trap field is filled in', async () => {
		await expect(submitContactMessage({ ...valid, website: 'https://seo.example' })).resolves.toEqual({
			success: true,
		})
		expect(sendContactMessage).not.toHaveBeenCalled()
	})

	it('answers success but sends nothing when name and message are random letters', async () => {
		const result = await submitContactMessage({
			...valid,
			name: 'FzEwOOmxoOoDAyMmIDdgBtPG',
			message: 'oKcQzvnDkccQlIuC',
		})
		expect(result).toEqual({ success: true })
		expect(sendContactMessage).not.toHaveBeenCalled()
	})

	it('still sends when only the name looks random', async () => {
		await submitContactMessage({ ...valid, name: 'FzEwOOmxoOoDAyMmIDdgBtPG' })
		expect(sendContactMessage).toHaveBeenCalledOnce()
	})

	it('refuses a token Cloudflare rejects', async () => {
		vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret')
		const fetchMock = vi.fn(() =>
			Promise.resolve(Response.json({ success: false, 'error-codes': ['invalid-input-response'] }))
		)
		vi.stubGlobal('fetch', fetchMock)

		await expect(submitContactMessage(valid)).resolves.toMatchObject({ success: false, code: 'captcha' })
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(sendContactMessage).not.toHaveBeenCalled()
	})

	it('refuses a missing token when the secret is configured', async () => {
		vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret')
		const fetchMock = vi.fn()
		vi.stubGlobal('fetch', fetchMock)

		await expect(submitContactMessage({ ...valid, turnstileToken: undefined })).resolves.toMatchObject({
			code: 'captcha',
		})
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('sends when Cloudflare accepts the token', async () => {
		vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret')
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(Response.json({ success: true })))
		)

		await expect(submitContactMessage(valid)).resolves.toEqual({ success: true })
		expect(sendContactMessage).toHaveBeenCalledOnce()
	})

	it('refuses everything in production when TURNSTILE_SECRET_KEY is missing', async () => {
		vi.stubEnv('NODE_ENV', 'production')

		await expect(submitContactMessage(valid)).resolves.toMatchObject({ success: false, code: 'captcha' })
		expect(sendContactMessage).not.toHaveBeenCalled()
	})

	it('allows 3 messages per IP in 10 minutes', async () => {
		for (let i = 0; i < 3; i++) await expect(submitContactMessage(valid)).resolves.toEqual({ success: true })
		await expect(submitContactMessage(valid)).resolves.toMatchObject({ success: false, code: 'rate_limited' })
		expect(sendContactMessage).toHaveBeenCalledTimes(3)

		// Another visitor is not affected
		requestHeaders.set('x-forwarded-for', '198.51.100.20')
		await expect(submitContactMessage(valid)).resolves.toEqual({ success: true })
	})

	it('rejects invalid input before anything else', async () => {
		await expect(submitContactMessage({ ...valid, email: 'not-an-email' })).resolves.toMatchObject({
			code: 'invalid_input',
		})
		expect(sendContactMessage).not.toHaveBeenCalled()
	})
})
