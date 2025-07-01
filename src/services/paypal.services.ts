'use server'

import { revalidatePath } from 'next/cache'

export async function capturePayment(orderID: string) {
	try {
		const token = await getAccessToken()
		const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
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

export async function createOrder(sellerId: string, amount: string) {
	try {
		const token = await getAccessToken()
		const orderData = {
			purchase_units: [
				{
					payment_instruction: {
						platform_fees: [
							{
								amount: {
									value: '1.00', // Platform commission
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

		const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
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

export async function onboardSeller(trackingId: string) {
	try {
		const token = await getAccessToken()
		const response = await fetch('https://api-m.sandbox.paypal.com/v2/customer/partner-referrals', {
			method: 'POST',
			headers: {
				'PayPal-Partner-Attribution-Id': process.env.PAYPAL_BN_CODE ?? '',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				tracking_id: trackingId,
				products: ['EXPRESS_CHECKOUT'],
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

async function getAccessToken() {
	const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
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
		const error = await response.json()
		throw new Error(JSON.stringify(error))
	}
	const data = await response.json()
	return data.access_token
}
