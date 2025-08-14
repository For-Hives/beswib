import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/services/paypal', () => ({
	verifyPayPalWebhookSignature: vi.fn(),
}))

vi.mock('@/services/paypal.services', () => ({
	handleSellerConsentGranted: vi.fn().mockResolvedValue({ ok: true }),
	handlePaymentCaptureCompleted: vi.fn().mockResolvedValue({ ok: true }),
	handleOnboardingCompleted: vi.fn().mockResolvedValue({ ok: true }),
	handleConsentRevoked: vi.fn().mockResolvedValue({ ok: true }),
	handleCheckoutOrderApproved: vi.fn().mockResolvedValue({ ok: true }),
}))

import type { NextRequest } from 'next/server'

import { verifyPayPalWebhookSignature } from '@/lib/services/paypal'
import * as paypalServices from '@/services/paypal.services'
import { POST, GET } from '@/app/api/webhooks/paypal/route'

// Helper to build a NextRequest-like object minimal subset for our route
class MockRequest {
	constructor(
		public payload: string,
		public headersObj: Record<string, string> = {}
	) {}
	text() {
		return Promise.resolve(this.payload)
	}
	get headers() {
		return new Headers(this.headersObj)
	}
}

const mkEvent = (event_type: string) => ({ resource: {}, event_type })

describe('PayPal webhook route', () => {
	beforeEach(() => vi.clearAllMocks())

	it('GET returns health', () => {
		const res = GET()
		expect(res.status).toBe(200)
	})

	it('rejects invalid signature', async () => {
		const mockVerify = verifyPayPalWebhookSignature as ReturnType<typeof vi.fn>
		mockVerify.mockResolvedValue(false)
		const req = new MockRequest(JSON.stringify(mkEvent('ANY')))
		const res = await POST(req as unknown as NextRequest)
		const json = (await res.json()) as { error?: string; status?: string }
		expect(res.status).toBe(400)
		expect(json.error).toContain('Invalid webhook signature')
	})

	it('routes PAYMENT.CAPTURE.COMPLETED', async () => {
		const mockVerify = verifyPayPalWebhookSignature as ReturnType<typeof vi.fn>
		mockVerify.mockResolvedValue(true)
		const req = new MockRequest(JSON.stringify(mkEvent('PAYMENT.CAPTURE.COMPLETED')))
		const res = await POST(req as unknown as NextRequest)
		expect(paypalServices.handlePaymentCaptureCompleted).toHaveBeenCalled()
		expect(res.status).toBe(200)
	})

	it('routes CHECKOUT.ORDER.APPROVED', async () => {
		const mockVerify = verifyPayPalWebhookSignature as ReturnType<typeof vi.fn>
		mockVerify.mockResolvedValue(true)
		const req = new MockRequest(JSON.stringify(mkEvent('CHECKOUT.ORDER.APPROVED')))
		const res = await POST(req as unknown as NextRequest)
		expect(paypalServices.handleCheckoutOrderApproved).toHaveBeenCalled()
		expect(res.status).toBe(200)
	})
})
