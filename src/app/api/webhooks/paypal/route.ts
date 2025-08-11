import { NextRequest, NextResponse } from 'next/server'

import type { PayPalWebhookEvent } from '@/models/paypal.model'

import {
	handleCheckoutOrderApproved,
	handleOnboardingCompleted,
	handleSellerConsentGranted,
	handleConsentRevoked,
	handlePaymentCaptureCompleted,
} from '@/services/paypal.services'
import { verifyPayPalWebhookSignature } from '@/lib/paypalWebhookVerify'

// PayPalWebhookEvent type is now imported from models/paypal.model

// Handle GET requests for webhook verification (PayPal may send GET requests to verify the endpoint)
export function GET() {
	return NextResponse.json({
		timestamp: new Date().toISOString(),
		status: 'PayPal webhook endpoint is active',
	})
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.text()
		const headers = request.headers

		// Log webhook for debugging
		console.info('PayPal webhook received:', {
			headers: Object.fromEntries(headers.entries()),
			body: body,
		})

		// Verify webhook signature
		const verified = await verifyPayPalWebhookSignature({ headers, body })
		if (!verified) {
			console.error('PayPal webhook signature verification failed')
			return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
		}

		// Parse the webhook payload
		const webhookEvent = JSON.parse(body) as PayPalWebhookEvent

		console.info('Processing PayPal webhook event:', webhookEvent.event_type)

		let result: unknown = null
		switch (webhookEvent.event_type) {
			case 'MERCHANT.ONBOARDING.COMPLETED':
				result = await handleOnboardingCompleted(webhookEvent)
				break
			case 'MERCHANT.PARTNER-CONSENT.REVOKED':
				result = await handleConsentRevoked(webhookEvent)
				break
			case 'CUSTOMER.MERCHANT-INTEGRATION.SELLER-CONSENT-GRANTED':
				result = await handleSellerConsentGranted(webhookEvent)
				break
			case 'PAYMENT.CAPTURE.COMPLETED':
				result = await handlePaymentCaptureCompleted(webhookEvent)
				break
			case 'CHECKOUT.ORDER.APPROVED':
				result = await handleCheckoutOrderApproved(webhookEvent)
				break
			default:
				console.info('Unhandled PayPal webhook event type:', webhookEvent.event_type)
		}

		return NextResponse.json({ status: 'success', result })
	} catch (error) {
		console.error('PayPal webhook error:', error)
		return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
	}
}
