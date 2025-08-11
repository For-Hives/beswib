const clientId = () => process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
const clientSecret = () => process.env.PAYPAL_CLIENT_SECRET
const webhookId = () => process.env.PAYPAL_WEBHOOK_ID
const apiUrl = () => process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'

if (clientId == null) throw new Error('Missing PayPal client ID')
if (clientSecret == null) throw new Error('Missing PayPal client secret')
if (webhookId == null) throw new Error('Missing PayPal webhook ID')

async function getPayPalAccessToken(): Promise<string> {
	const auth = Buffer.from(`${clientId()}:${clientSecret()}`).toString('base64')
	const res = await fetch(`${apiUrl()}/v1/oauth2/token`, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${auth}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: 'grant_type=client_credentials',
	})
	if (!res.ok) {
		throw new Error('Failed to get PayPal access token')
	}
	const data = (await res.json()) as { access_token?: string }
	if (data.access_token == null) throw new Error('No access token in PayPal response')
	return data.access_token
}

export async function verifyPayPalWebhookSignature({
	headers,
	body,
}: {
	headers: Headers
	body: string
}): Promise<boolean> {
	const authAlgo = headers.get('paypal-auth-algo')
	const certUrl = headers.get('paypal-cert-url')
	const transmissionId = headers.get('paypal-transmission-id')
	const transmissionSig = headers.get('paypal-transmission-sig')
	const transmissionTime = headers.get('paypal-transmission-time')

	if (authAlgo == null) {
		console.error('Missing PAYPAL-AUTH-ALGO header')
		return false
	}
	if (certUrl == null) {
		console.error('Missing PAYPAL-CERT-URL header')
		return false
	}
	if (transmissionId == null) {
		console.error('Missing PAYPAL-TRANSMISSION-ID header')
		return false
	}
	if (transmissionSig == null) {
		console.error('Missing PAYPAL-TRANSMISSION-SIG header')
		return false
	}
	if (transmissionTime == null) {
		console.error('Missing PAYPAL-TRANSMISSION-TIME header')
		return false
	}

	const payload = {
		auth_algo: authAlgo,
		cert_url: certUrl,
		transmission_id: transmissionId,
		transmission_sig: transmissionSig,
		transmission_time: transmissionTime,
		webhook_id: webhookId,
		webhook_event: JSON.parse(body),
	}

	try {
		const token = await getPayPalAccessToken()
		const res = await fetch(`${apiUrl()}/v1/notifications/verify-webhook-signature`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		})
		const data = (await res.json()) as { verification_status?: string }
		return data.verification_status === 'SUCCESS'
	} catch (error) {
		console.error('PayPal webhook signature verification failed:', error)
		return false
	}
}
