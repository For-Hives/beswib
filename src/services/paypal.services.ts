'use server'

import { revalidatePath } from 'next/cache'

interface PayPalAccessToken {
	access_token: string
	expires_in: number
	token_type: string
}

interface PayPalCaptureResponse {
	id: string
	status: string
}

interface PayPalLink {
	href: string
	method?: string
	rel: string
}

interface PayPalOperation {
	api_integration_preference?: {
		rest_api_integration?: {
			third_party_details?: {
				merchant_id?: string
			}
		}
	}
	operation: string
}

interface PayPalOrderResponse {
	id: string
	status: string
}

interface PayPalPartnerReferralResponse {
	collected_consents: unknown[]
	id: string
	legal_consents: unknown[]
	links: PayPalLink[]
	operations: PayPalOperation[]
	partner_client_id: string
	preferred_language_code: string
	products: string[]
	technical_phone_contacts: unknown[]
}

interface Webhook {
	event_types: { name: string }[]
	id: string
	url: string
}

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

export async function createOrder(sellerId: string, amount: string): Promise<{ error?: string; id?: string }> {
	try {
		const token = await getAccessToken()
		const orderData = {
			purchase_units: [
				{
					payment_instruction: {
						platform_fees: [
							{
								amount: {
									value: (parseFloat(amount) * 0.1).toFixed(2), // 10% Platform commission
									currency_code: 'EUR',
								},
							},
						],
					},
					payee: { merchant_id: sellerId },
					amount: {
						value: amount,
						currency_code: 'EUR',
						breakdown: {
							item_total: { value: amount, currency_code: 'EUR' },
						},
					},
				},
			],
			intent: 'CAPTURE',
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

export async function listPayPalWebhooks(): Promise<{ error?: string; webhooks?: Webhook[] }> {
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

		const data = (await response.json()) as { webhooks: Webhook[] }
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
		revalidatePath('/') // To update the UI with the new link
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
