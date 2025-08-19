import type {
	PayPalAccessToken,
	PayPalCaptureResponse,
	PayPalOrderResponse,
	PayPalPartnerReferralResponse,
	PayPalPaymentCaptureResource,
	PayPalWebhook,
	PayPalWebhookEvent,
} from '@/models/paypal.model'
import type { BibSale } from '@/models/marketplace.model'

import { PLATFORM_FEE } from '@/constants/global.constant'

import { getTransactionByOrderId, updateTransaction } from './transaction.services'

const PAYPAL_MERCHANT_ID = () => process.env.PAYPAL_MERCHANT_ID ?? ''

export async function handlePaymentCaptureCompleted(event: unknown) {
	if (typeof event !== 'object' || event === null) {
		throw new Error('Invalid webhook event')
	}
	const resourceRaw = (event as { resource?: unknown }).resource
	if (typeof resourceRaw !== 'object' || resourceRaw === null) {
		throw new Error('No resource in webhook event')
	}
	// Normalize the resource to the shape expected by salesComplete
	const resource = resourceRaw as PayPalPaymentCaptureResource & {
		payer?: { payer_id?: string }
		update_time?: string
		create_time?: string
	}
	// Defer orchestration to centralized sales service (avoids static import cycle)
	const mod = await import('./sales.services')
	return mod.salesComplete({ event: { resource } })
}

export async function handleCheckoutOrderApproved(event: unknown) {
	if (typeof event !== 'object' || event === null) {
		throw new Error('Invalid webhook event')
	}
	const resource = (event as { resource?: unknown }).resource
	if (typeof resource !== 'object' || resource === null) {
		throw new Error('No resource in webhook event')
	}
	const orderId = (resource as { id?: string }).id ?? ''
	const payerEmail = (resource as { payer?: { email_address?: string } }).payer?.email_address ?? ''
	const amount =
		(resource as { purchase_units?: [{ amount?: { value?: string } }] }).purchase_units?.[0]?.amount?.value ?? ''
	const currency =
		(resource as { purchase_units?: [{ amount?: { currency_code?: string } }] }).purchase_units?.[0]?.amount
			?.currency_code ?? ''

	// Optionally, update transaction to pending/approved
	let transactionId: string | null = null
	try {
		const transaction = await getTransactionByOrderId(orderId)
		transactionId = transaction?.id ?? null
	} catch (error) {
		console.error('Error finding transaction by orderId:', error)
		transactionId = null
	}
	if (typeof transactionId === 'string' && transactionId !== '') {
		await updateTransaction(transactionId, {
			status: 'pending',
		})
	}

	return {
		transactionId,
		payerEmail,
		orderId,
		currency,
		amount,
	}
}

export async function handleOnboardingCompleted(event: PayPalWebhookEvent) {
	const resource = event.resource as { merchant_id?: string; tracking_id?: string }
	const merchantId = resource.merchant_id
	const trackingId = resource.tracking_id

	if (merchantId == null || (trackingId?.startsWith('seller_') ?? false) === false) {
		throw new Error('Invalid tracking ID or missing merchant ID')
	}

	const userId = trackingId != null ? trackingId.split('_')[1] : undefined
	if (userId == null) {
		throw new Error('Could not extract user ID from tracking ID')
	}

	// updateUser is dynamically imported for SSR compatibility
	await import('./user.services').then(m =>
		m.updateUser(userId, {
			paypalMerchantId: merchantId,
		})
	)

	// Optionally, verify merchant readiness right away (best-effort)
	void getMerchantIntegrationStatus(merchantId).catch(err => {
		console.warn('Merchant status check after onboarding failed:', err)
	})

	return { userId, merchantId }
}

export async function handleSellerConsentGranted(event: PayPalWebhookEvent) {
	const resource = event.resource as { merchant_id?: string; tracking_id?: string }
	const merchantId = resource.merchant_id
	const trackingId = resource.tracking_id

	if (merchantId == null || (trackingId?.startsWith('seller_') ?? false) === false) {
		throw new Error('Invalid tracking ID or missing merchant ID')
	}

	const userId = trackingId != null ? trackingId.split('_')[1] : undefined
	if (userId == null) {
		throw new Error('Could not extract user ID from tracking ID')
	}

	let attempts = 0
	let success = false
	while (attempts < 3 && !success) {
		try {
			// updateUser is dynamically imported for SSR compatibility
			await import('./user.services').then(m =>
				m.updateUser(userId, {
					paypalMerchantId: merchantId,
				})
			)

			// Best-effort immediate status check
			void getMerchantIntegrationStatus(merchantId).catch(() => {})
			success = true
		} catch (err) {
			attempts++
			if (attempts >= 3) {
				throw err
			}
		}
	}

	return { userId, merchantId }
}

export async function handleConsentRevoked(event: PayPalWebhookEvent) {
	// Implement actual logic as needed
	await Promise.resolve()
	return { revoked: true, event }
}

// Interfaces moved to src/models/paypal.model

export async function capturePayment(orderID: string): Promise<{ data?: PayPalCaptureResponse; error?: string }> {
	try {
		const token = await getAccessToken()
		const paypalApiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'
		const response = await fetch(`${paypalApiUrl}/v2/checkout/orders/${orderID}/capture`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			const error = (await response.json()) as { message: string }
			throw new Error(JSON.stringify(error))
		}

		const data = (await response.json()) as PayPalCaptureResponse
		return { data }
	} catch (error) {
		console.error('Capture payment error:', error instanceof Error ? error.message : error)
		return { error: 'Failed to capture payment' }
	}
}

export async function createOrder(sellerId: string, bib: BibSale): Promise<{ error?: string; id?: string }> {
	try {
		// Ensure the seller can actually receive payments (KYC done / account enabled)
		const statusRes = await getMerchantIntegrationStatus(sellerId)
		if ('error' in statusRes) {
			return { error: 'Unable to verify seller PayPal status. Please try again later.' }
		}
		if (statusRes.status.payments_receivable !== true) {
			return {
				error:
					"Seller's PayPal account isn't ready to receive payments yet. Please complete verification on PayPal and retry.",
			}
		}

		const token = await getAccessToken()
		const orderData = {
			purchase_units: [
				{
					payment_instruction: {
						platform_fees: [
							{
								payee: { merchant_id: PAYPAL_MERCHANT_ID() }, // Platform receives fee
								amount: {
									value: (bib.price * PLATFORM_FEE).toFixed(2), // 10% Platform commission
									currency_code: 'EUR',
								},
							},
						],
					},
					payee: { merchant_id: sellerId },
					amount: {
						value: bib.price.toString(),
						currency_code: 'EUR',
						breakdown: {
							item_total: { value: bib.price.toString(), currency_code: 'EUR' },
						},
					},
				},
			],
			intent: 'CAPTURE',
			custom_id: bib.id,
		}

		const paypalApiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'
		const response = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(orderData),
		})

		if (!response.ok) {
			const error = (await response.json()) as { message: string }
			throw new Error(JSON.stringify(error))
		}

		const data = (await response.json()) as PayPalOrderResponse
		return { id: data.id }
	} catch (error) {
		console.error('Create order error:', error instanceof Error ? error.message : error)
		return { error: 'Failed to create order' }
	}
}

export async function getMerchantId(referralId: string): Promise<{ error?: string; merchant_id?: string }> {
	try {
		const token = await getAccessToken()

		const paypalApiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'
		const response = await fetch(`${paypalApiUrl}/v2/customer/partner-referrals/${referralId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			const error = (await response.json()) as { message: string }
			console.error('PayPal API error:', error)
			throw new Error(JSON.stringify(error))
		}

		const data = (await response.json()) as PayPalPartnerReferralResponse & { status?: string }
		console.info('PayPal referral data:', JSON.stringify(data, null, 2))

		// Check if the referral has been completed and get the merchant ID
		if (Array.isArray(data.operations) && data.operations.length > 0) {
			const apiIntegration = data.operations.find(op => op.operation === 'API_INTEGRATION')
			if (apiIntegration?.api_integration_preference) {
				const merchantId =
					apiIntegration.api_integration_preference.rest_api_integration?.third_party_details?.merchant_id
				if (typeof merchantId === 'string' && merchantId.length > 0) {
					console.info('Found merchant ID:', merchantId)
					return { merchant_id: merchantId }
				}
			}
		}

		// Check if the referral is still pending
		if (data.status === 'PENDING' || data.status === 'IN_PROGRESS') {
			return { error: 'Onboarding is still in progress. Please complete the PayPal setup and try again.' }
		}

		// Check if the referral was rejected or failed
		if (data.status === 'REJECTED' || data.status === 'FAILED') {
			return { error: 'PayPal onboarding was rejected or failed. Please try again.' }
		}

		console.info('No merchant ID found in operations. Full data:', JSON.stringify(data, null, 2))
		return { error: 'Merchant ID not found. Please complete the PayPal onboarding process and try again.' }
	} catch (error) {
		console.error('Get merchant ID error:', error instanceof Error ? error.message : error)
		return { error: 'Failed to get merchant ID from PayPal' }
	}
}

export async function listPayPalWebhooks(): Promise<{ error?: string; webhooks?: PayPalWebhook[] }> {
	try {
		const token = await getAccessToken()

		const paypalApiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'
		const response = await fetch(`${paypalApiUrl}/v1/notifications/webhooks`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			const error = (await response.json()) as { message: string }
			console.error('PayPal webhook list error:', error)
			return { error: JSON.stringify(error) }
		}

		const data = (await response.json()) as { webhooks: PayPalWebhook[] }
		return { webhooks: data.webhooks }
	} catch (error) {
		console.error('List webhooks error:', error instanceof Error ? error.message : error)
		return { error: 'Failed to list PayPal webhooks' }
	}
}

export async function onboardSeller(
	trackingId: string
): Promise<{ action_url?: string; error?: string; referral_id?: string }> {
	try {
		const token = await getAccessToken()
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

		const paypalApiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'
		const response = await fetch(`${paypalApiUrl}/v2/customer/partner-referrals`, {
			method: 'POST',
			headers: {
				'PayPal-Partner-Attribution-Id': process.env.PAYPAL_BN_CODE ?? '',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				tracking_id: trackingId,
				products: ['EXPRESS_CHECKOUT'],
				partner_config_override: {
					return_url: `${baseUrl}/en/paypal/callback?trackingId=${trackingId}`,
				},
				operations: [
					{
						operation: 'API_INTEGRATION',
						api_integration_preference: {
							rest_api_integration: {
								third_party_details: {
									features: ['PAYMENT', 'REFUND'],
								},
								integration_type: 'THIRD_PARTY',
								integration_method: 'PAYPAL',
							},
						},
					},
				],
			}),
		})

		if (!response.ok) {
			const error = (await response.json()) as { message: string }
			throw new Error(JSON.stringify(error))
		}

		const data = (await response.json()) as PayPalPartnerReferralResponse
		const actionUrl = data.links.find(l => l.rel === 'action_url')?.href
		return { referral_id: data.id, action_url: actionUrl }
	} catch (error) {
		console.error('Onboard error:', error instanceof Error ? error.message : error)
		return { error: 'Failed to onboard seller' }
	}
}

export async function setupPayPalWebhooks(): Promise<{ error?: string; success?: boolean }> {
	try {
		const token = await getAccessToken()
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
		const webhookUrl = `${baseUrl}/api/webhooks/paypal`

		const paypalApiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'
		const response = await fetch(`${paypalApiUrl}/v1/notifications/webhooks`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				url: webhookUrl,
				event_types: [
					{
						name: 'MERCHANT.ONBOARDING.COMPLETED',
					},
					{
						name: 'MERCHANT.PARTNER-CONSENT.REVOKED',
					},
				],
			}),
		})

		if (!response.ok) {
			const error = (await response.json()) as { message: string }
			console.error('PayPal webhook setup error:', error)
			return { error: JSON.stringify(error) }
		}

		const data = (await response.json()) as { id: string }
		console.info('PayPal webhook setup successful:', data)
		return { success: true }
	} catch (error) {
		console.error('Setup webhooks error:', error instanceof Error ? error.message : error)
		return { error: 'Failed to setup PayPal webhooks' }
	}
}

async function getAccessToken(): Promise<string> {
	const paypalApiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'
	const response = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: 'Basic ' + btoa(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`),
			'Accept-Language': 'en_US',
			Accept: 'application/json',
		},
		body: 'grant_type=client_credentials',
	})
	if (!response.ok) {
		const error = (await response.json()) as { message: string }
		throw new Error(JSON.stringify(error))
	}
	const data = (await response.json()) as PayPalAccessToken
	return data.access_token
}

// --- Merchant Integration Status -------------------------------------------------

import type { PayPalMerchantIntegrationStatus } from '@/models/paypal.model'

/**
 * Fetch merchant integration status from PayPal to verify KYC/payments readiness.
 * Uses GET /v1/customer/partners/{partner_id}/merchant-integrations/{merchant_id}
 */
export async function getMerchantIntegrationStatus(
	merchantId: string
): Promise<
	| { error: string; status?: undefined }
	| { status: PayPalMerchantIntegrationStatus & { primary_email_confirmed: boolean; payments_receivable: boolean } }
> {
	try {
		if (!merchantId) return { error: 'Missing merchantId' }
		const token = await getAccessToken()
		const partnerId = process.env.PAYPAL_PARTNER_ID ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ''
		if (!partnerId) return { error: 'Missing PAYPAL_PARTNER_ID' }

		const paypalApiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'
		const res = await fetch(
			`${paypalApiUrl}/v1/customer/partners/${encodeURIComponent(partnerId)}/merchant-integrations/${encodeURIComponent(
				merchantId
			)}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}
		)

		if (!res.ok) {
			let msg = 'Failed to fetch merchant integration status'
			try {
				const j = (await res.json()) as unknown
				msg = JSON.stringify(j)
			} catch {}
			return { error: msg }
		}

		const data = (await res.json()) as PayPalMerchantIntegrationStatus
		// Ensure booleans present with defaults
		const payments_receivable = data.payments_receivable === true
		const primary_email_confirmed = data.primary_email_confirmed === true
		return { status: { ...data, primary_email_confirmed, payments_receivable } }
	} catch (e) {
		console.error('getMerchantIntegrationStatus error:', e)
		return { error: 'Failed to fetch merchant status' }
	}
}
