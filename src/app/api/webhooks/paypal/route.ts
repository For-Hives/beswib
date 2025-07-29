import { NextRequest, NextResponse } from 'next/server'

import { updateUser } from '@/services/user.services'

interface PayPalWebhookEvent {
	create_time: string
	event_type: string
	resource: {
		account_status?: string
		consent_status?: string
		merchant_id?: string
		partner_client_id?: string
		permissions?: string[]
		tracking_id?: string
	}
	resource_type: string
	summary: string
}

interface PayPalWebhookHeaders {
	'paypal-auth-algo': string
	'paypal-cert-url': string
	'paypal-transmission-id': string
	'paypal-transmission-sig': string
	'paypal-transmission-time': string
}

// Handle GET requests for webhook verification (PayPal may send GET requests to verify the endpoint)
export async function GET() {
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
		console.log('PayPal webhook received:', {
			headers: Object.fromEntries(headers.entries()),
			body: body,
		})

		// Parse the webhook payload
		const webhookEvent: PayPalWebhookEvent = JSON.parse(body)

		// Verify webhook signature (basic check - in production, implement proper signature verification)
		const webhookHeaders: PayPalWebhookHeaders = {
			'paypal-transmission-time': headers.get('paypal-transmission-time') || '',
			'paypal-transmission-sig': headers.get('paypal-transmission-sig') || '',
			'paypal-transmission-id': headers.get('paypal-transmission-id') || '',
			'paypal-cert-url': headers.get('paypal-cert-url') || '',
			'paypal-auth-algo': headers.get('paypal-auth-algo') || '',
		}

		// TODO: Implement proper webhook signature verification
		// For now, we'll process the webhook without signature verification
		// In production, you should verify the signature using PayPal's SDK

		console.log('Processing PayPal webhook event:', webhookEvent.event_type)

		switch (webhookEvent.event_type) {
			case 'MERCHANT.ONBOARDING.COMPLETED':
				await handleOnboardingCompleted(webhookEvent)
				break

			case 'MERCHANT.PARTNER-CONSENT.REVOKED':
				await handleConsentRevoked(webhookEvent)
				break

			default:
				console.log('Unhandled PayPal webhook event type:', webhookEvent.event_type)
		}

		return NextResponse.json({ status: 'success' })
	} catch (error) {
		console.error('PayPal webhook error:', error)
		return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
	}
}

async function handleConsentRevoked(event: PayPalWebhookEvent) {
	try {
		const { resource } = event
		const merchantId = resource.merchant_id
		const trackingId = resource.tracking_id

		console.log('Handling consent revoked:', {
			trackingId,
			merchantId,
		})

		if (!trackingId?.startsWith('seller_')) {
			console.error('Invalid tracking ID format in consent revoked:', trackingId)
			return
		}

		const userId = trackingId.split('_')[1]
		if (!userId) {
			console.error('Could not extract user ID from tracking ID:', trackingId)
			return
		}

		// Remove PayPal merchant ID from user
		await updateUser(userId, {
			paypalMerchantId: null,
		})

		console.log('Successfully removed PayPal merchant ID from user:', {
			userId,
			merchantId,
		})
	} catch (error) {
		console.error('Error handling consent revoked:', error)
	}
}

async function handleOnboardingCompleted(event: PayPalWebhookEvent) {
	try {
		const { resource } = event
		const merchantId = resource.merchant_id
		const trackingId = resource.tracking_id

		console.log('Handling onboarding completed:', {
			trackingId,
			merchantId,
			consentStatus: resource.consent_status,
			accountStatus: resource.account_status,
		})

		if (!merchantId) {
			console.error('No merchant ID in onboarding completed webhook')
			return
		}

		// Extract user ID from tracking ID (format: seller_${userId}_${timestamp})
		if (!trackingId?.startsWith('seller_')) {
			console.error('Invalid tracking ID format:', trackingId)
			return
		}

		const userId = trackingId.split('_')[1]
		if (!userId) {
			console.error('Could not extract user ID from tracking ID:', trackingId)
			return
		}

		// Update user with PayPal merchant ID
		await updateUser(userId, {
			paypalMerchantId: merchantId,
		})

		console.log('Successfully updated user with PayPal merchant ID:', {
			userId,
			merchantId,
		})
	} catch (error) {
		console.error('Error handling onboarding completed:', error)
	}
}
