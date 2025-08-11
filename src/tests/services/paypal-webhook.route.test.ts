import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/paypalWebhookVerify', () => ({
	verifyPayPalWebhookSignature: vi.fn(),
}))

vi.mock('@/services/paypal.services', () => ({
	handleOnboardingCompleted: vi.fn().mockResolvedValue({ ok: true }),
	handleConsentRevoked: vi.fn().mockResolvedValue({ ok: true }),
	handleSellerConsentGranted: vi.fn().mockResolvedValue({ ok: true }),
	handlePaymentCaptureCompleted: vi.fn().mockResolvedValue({ ok: true }),
	handleCheckoutOrderApproved: vi.fn().mockResolvedValue({ ok: true }),
}))

import { verifyPayPalWebhookSignature } from '@/lib/paypalWebhookVerify'
import { POST, GET } from '@/app/api/webhooks/paypal/route'
import * as paypalServices from '@/services/paypal.services'

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

const mkEvent = (event_type: string) => ({ event_type, resource: {} })

describe('PayPal webhook route', () => {
	beforeEach(() => vi.clearAllMocks())

	it('GET returns health', () => {
		const res = GET()
		expect(res.status).toBe(200)
	})

	it('rejects invalid signature', async () => {
		;(verifyPayPalWebhookSignature as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(false)
		const req = new MockRequest(JSON.stringify(mkEvent('ANY')))
		const res = await POST(req as unknown as Request)
		const json = await res.json()
		expect(res.status).toBe(400)
		expect(json.error).toContain('Invalid webhook signature')
	})

	it('routes PAYMENT.CAPTURE.COMPLETED', async () => {
		;(verifyPayPalWebhookSignature as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true)
		const req = new MockRequest(JSON.stringify(mkEvent('PAYMENT.CAPTURE.COMPLETED')))
		const res = await POST(req as unknown as Request)
		expect(paypalServices.handlePaymentCaptureCompleted).toHaveBeenCalled()
		expect(res.status).toBe(200)
	})

	it('routes CHECKOUT.ORDER.APPROVED', async () => {
		;(verifyPayPalWebhookSignature as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true)
		const req = new MockRequest(JSON.stringify(mkEvent('CHECKOUT.ORDER.APPROVED')))
		const res = await POST(req as unknown as Request)
		expect(paypalServices.handleCheckoutOrderApproved).toHaveBeenCalled()
		expect(res.status).toBe(200)
	})
})
