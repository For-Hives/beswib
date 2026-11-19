import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as svc from '../../services/notification.service'

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

	it('disables every mention except the team @here of the summary', async () => {
		process.env.DISCORD_WEBHOOK_URL = 'https://example.com/webhook'
		const fetchMock = vi.fn((_url: string, _init: RequestInit) => Promise.resolve({ ok: true } as unknown as Response))
		vi.stubGlobal('fetch', fetchMock)

		await svc.sendContactMessage({ name: '@everyone', message: 'hello @here <@123>', email: 'a@example.com' })

		const bodies = fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init.body)))
		expect(bodies).toHaveLength(2)
		const [summary, full] = bodies
		expect(summary.content.startsWith('@here ')).toBe(true)
		expect(summary.content).not.toContain('@everyone')
		expect(summary.allowed_mentions).toEqual({ parse: ['everyone'] })
		expect(full.allowed_mentions).toEqual({ parse: [] })
		expect(full.content).not.toMatch(/@here|<@1/)
	})

	it('posts admin webhooks with no mention allowed by default', async () => {
		const fetchMock = vi.fn((_url: string, _init: RequestInit) => Promise.resolve({ ok: true } as unknown as Response))
		vi.stubGlobal('fetch', fetchMock)

		await svc.sendAdminWebhook('@everyone new bib', { webhookUrl: 'https://example.com/webhook' })

		expect(JSON.parse(String(fetchMock.mock.calls[0][1].body)).allowed_mentions).toEqual({ parse: [] })
	})

	it('flags a link in the contact e-mail subject', async () => {
		delete process.env.DISCORD_WEBHOOK_URL
		process.env.RESEND_API_KEY = 'mock-resend-key'
		process.env.NOTIFY_CONTACT_EMAIL_TO = 'contact@example.com'
		process.env.NOTIFY_EMAIL_FROM = 'no-reply@example.com'
		const { Resend } = await import('resend')
		const send = vi.fn(() => Promise.resolve({ data: { id: 'email-1' }, error: null }))
		// A class: the service calls `new Resend(key)`, which an arrow function cannot answer
		vi.mocked(Resend).mockImplementation(
			class {
				emails = { send }
			} as unknown as typeof Resend
		)

		await svc.sendContactMessage({ name: 'A', message: 'see https://x.example', email: 'a@example.com', hasLink: true })

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({ subject: '[Beswib] [Link in message] New contact message' })
		)
	})
})
