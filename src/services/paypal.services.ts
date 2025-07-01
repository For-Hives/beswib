'use server'

import { revalidatePath } from 'next/cache'

async function getAccessToken() {
	const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Accept-Language': 'en_US',
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: 'Basic ' + btoa(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`),
		},
		body: 'grant_type=client_credentials',
	})
	if (!response.ok) {
		const error = await response.json()
		throw new Error(JSON.stringify(error))
	}
	const data = await response.json()
	return data.access_token
}

export async function onboardSeller(trackingId: string) {
	try {
		const token = await getAccessToken()
		const response = await fetch('https://api-m.sandbox.paypal.com/v2/customer/partner-referrals', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				'PayPal-Partner-Attribution-Id': process.env.PAYPAL_BN_CODE ?? '',
			},
			body: JSON.stringify({
				operations: [
					{
						operation: 'API_INTEGRATION',
						api_integration_preference: {
							rest_api_integration: {
								integration_method: 'PAYPAL',
								integration_type: 'THIRD_PARTY',
								third_party_details: {
									features: ['PAYMENT', 'REFUND'],
								},
							},
						},
					},
				],
				products: ['EXPRESS_CHECKOUT'],
				tracking_id: trackingId,
			}),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(JSON.stringify(error))
		}

		const data = await response.json()
		const actionUrl = data.links.find((l: { rel: string }) => l.rel === 'action_url').href
		revalidatePath('/') // To update the UI with the new link
		return { action_url: actionUrl }
	} catch (error: any) {
		console.error('Onboard error:', error.message)
		return { error: 'Failed to onboard seller' }
	}
}

export async function createOrder(sellerId: string, amount: string) {
	try {
		const token = await getAccessToken()
		const orderData = {
			intent: 'CAPTURE',
			purchase_units: [
				{
					amount: {
						currency_code: 'EUR',
						value: amount,
						breakdown: {
							item_total: { currency_code: 'EUR', value: amount },
						},
					},
					payee: { merchant_id: sellerId },
					payment_instruction: {
						platform_fees: [
							{
								amount: {
									currency_code: 'EUR',
									value: '1.00', // Platform commission
								},
							},
						],
					},
				},
			],
		}

		const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(orderData),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(JSON.stringify(error))
		}

		const data = await response.json()
		return { id: data.id }
	} catch (error: any) {
		console.error('Create order error:', error.message)
		return { error: 'Failed to create order' }
	}
}

export async function capturePayment(orderID: string) {
	try {
		const token = await getAccessToken()
		const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(JSON.stringify(error))
		}

		const data = await response.json()
		return data
	} catch (error: any) {
		console.error('Capture payment error:', error.message)
		return { error: 'Failed to capture payment' }
	}
}
