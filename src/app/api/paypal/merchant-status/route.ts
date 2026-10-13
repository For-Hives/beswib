import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { trackServer } from '@/lib/analytics/server'
import { getMerchantIntegrationStatus } from '@/services/paypal.services'
import { fetchUserByClerkId, updateUser } from '@/services/user.services'

// GET /api/paypal/merchant-status
// The PayPal status of the signed-in user. The middleware lets every /api path through, so the caller
// is identified here: never by an id of the query string, which named any seller to anyone
export async function GET() {
	try {
		const { userId: clerkId } = await auth()
		if (clerkId == null || clerkId === '') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const user = await fetchUserByClerkId(clerkId)
		if (user == null) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const merchantId = user.paypalMerchantId ?? ''
		if (!merchantId) {
			return NextResponse.json({ error: 'Merchant not linked' }, { status: 400 })
		}

		const result = await getMerchantIntegrationStatus(merchantId)
		if ('error' in result) {
			return NextResponse.json({ error: result.error }, { status: 502 })
		}

		// Best-effort: if KYC is complete, persist on user
		const status = result.status
		const hasOauthIntegrations = Array.isArray(status.oauth_integrations) ? status.oauth_integrations.length > 0 : false
		const kycComplete =
			status.payments_receivable === true && status.primary_email_confirmed === true && hasOauthIntegrations

		if (kycComplete && user.paypal_kyc !== true) trackServer('paypal_kyc_success')

		// Fire and forget (do not block API)
		void updateUser(user.id, { paypal_kyc: kycComplete }).catch(() => {})

		return NextResponse.json({ status: result.status })
	} catch (e) {
		console.error('merchant-status error', e)
		return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
	}
}
