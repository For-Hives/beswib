import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as svc from '../../src/services/notification.service'

describe('notification.service', () => {
	beforeEach(() => {
		vi.restoreAllMocks()
		// ensure no Resend key by default for tests that expect false
		delete process.env.RESEND_API_KEY
	})

	afterEach(() => {
		vi.restoreAllMocks()
		try {
			vi.unstubAllGlobals()
		} catch {}
	})

	it('sendSaleAlert calls admin email and webhook and returns boolean', async () => {
		process.env.DISCORD_WEBHOOK_URL = 'https://example.com/webhook'
		process.env.NOTIFY_CONTACT_EMAIL_TO = 'contact@example.com'
		process.env.NOTIFY_EMAIL_FROM = 'no-reply@example.com'

		const fetchMock = vi.fn(() => Promise.resolve({ ok: true } as unknown as Response))
		vi.stubGlobal('fetch', fetchMock)

		const ok = await svc.sendSaleAlert({ orderId: 'ORD1', bibId: 'B1', amount: 10 })
		expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(1)
		expect(ok).toBe(true)
	})

	it('sendContactMessage posts to discord (fetch stub) and sends admin email', async () => {
		process.env.DISCORD_WEBHOOK_URL = 'https://example.com/webhook'
		process.env.NOTIFY_CONTACT_EMAIL_TO = 'contact@example.com'
		process.env.NOTIFY_EMAIL_FROM = 'no-reply@example.com'

		const fetchMock = vi.fn(() => Promise.resolve({ ok: true } as unknown as Response))
		vi.stubGlobal('fetch', fetchMock)

		const ok = await svc.sendContactMessage({ name: 'A', message: 'hi', email: 'a@example.com' })
		// postDiscord makes at least one fetch call (summary + full)
		expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(1)
		expect(ok).toBe(true)
	})

	it('sendUserEmail returns false when no Resend key configured', async () => {
		// no RESEND_API_KEY in env
		delete process.env.RESEND_API_KEY
		const res = await svc.sendUserEmail('a@b.com', { subject: 't' })
		expect(res).toBe(false)
	})
})
