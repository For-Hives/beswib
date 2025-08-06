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

		// Parse the webhook payload
		const webhookEvent = JSON.parse(body) as PayPalWebhookEvent

		// Verify webhook signature (basic check - in production, implement proper signature verification)

		// TODO: Implement proper webhook signature verification
		// For now, we'll process the webhook without signature verification
		// In production, you should verify the signature using PayPal's SDK

		console.info('Processing PayPal webhook event:', webhookEvent.event_type)

		switch (webhookEvent.event_type) {
			case 'MERCHANT.ONBOARDING.COMPLETED':
				await handleOnboardingCompleted(webhookEvent)
				break

			case 'MERCHANT.PARTNER-CONSENT.REVOKED':
				await handleConsentRevoked(webhookEvent)
				break

			case 'CUSTOMER.MERCHANT-INTEGRATION.SELLER-CONSENT-GRANTED':
				await handleSellerConsentGranted(webhookEvent)
				break

			default:
				console.info('Unhandled PayPal webhook event type:', webhookEvent.event_type)
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

		console.info('Handling consent revoked:', {
			trackingId,
			merchantId,
		})

		if ((trackingId?.startsWith('seller_') ?? false) === false) {
			console.error('Invalid tracking ID format in consent revoked:', trackingId)
			return
		}

		const userId = trackingId != null ? trackingId.split('_')[1] : undefined
		if (userId == null) {
			console.error('Could not extract user ID from tracking ID:', trackingId)
			return
		}

		// Remove PayPal merchant ID from user
		await updateUser(userId, {
			paypalMerchantId: null,
		})

		console.info('Successfully removed PayPal merchant ID from user:', {
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

		console.info('Handling onboarding completed:', {
			trackingId,
			merchantId,
			consentStatus: resource.consent_status,
			accountStatus: resource.account_status,
		})

		if (merchantId == null || (trackingId?.startsWith('seller_') ?? false) === false) {
			console.error('Invalid tracking ID or missing merchant ID:', { trackingId, merchantId })
			return
		}

		const userId = trackingId != null ? trackingId.split('_')[1] : undefined
		if (userId == null) {
			console.error('Could not extract user ID from tracking ID:', trackingId)
			return
		}

		// Update user with PayPal merchant ID
		await updateUser(userId, {
			paypalMerchantId: merchantId,
		})

		console.info('Successfully updated user with PayPal merchant ID:', {
			userId,
			merchantId,
		})
	} catch (error) {
		console.error('Error handling onboarding completed:', error)
	}
}

// Handle seller consent granted event
async function handleSellerConsentGranted(event: PayPalWebhookEvent) {
	try {
		const { resource } = event
		const merchantId = resource.merchant_id
		const trackingId = resource.tracking_id

		console.info('Handling seller consent granted:', {
			trackingId,
			merchantId,
		})

		if (merchantId == null || (trackingId?.startsWith('seller_') ?? false) === false) {
			console.error('Invalid tracking ID or missing merchant ID:', { trackingId, merchantId })
			return
		}

		const userId = trackingId != null ? trackingId.split('_')[1] : undefined
		if (userId == null) {
			console.error('Could not extract user ID from tracking ID:', trackingId)
			return
		}

		// Update user with PayPal merchant ID
		await updateUser(userId, {
			paypalMerchantId: merchantId,
		})

		console.info('Successfully updated user with PayPal merchant ID (consent granted):', {
			userId,
			merchantId,
		})
	} catch (error) {
		console.error('Error handling seller consent granted:', error)
	}
}
