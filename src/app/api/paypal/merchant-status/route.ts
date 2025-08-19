import { NextRequest, NextResponse } from 'next/server'

import { getMerchantIntegrationStatus } from '@/services/paypal.services'
import { getUserData } from '@/services/user.services'

// GET /api/paypal/merchant-status?userId=...
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId') ?? ''
		if (!userId) {
			return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
		}

		const user = await getUserData(userId)
		const merchantId = user?.paypalMerchantId ?? ''
		if (!merchantId) {
			return NextResponse.json({ error: 'Merchant not linked' }, { status: 400 })
		}

		const result = await getMerchantIntegrationStatus(merchantId)
		if ('error' in result) {
			return NextResponse.json({ error: result.error }, { status: 502 })
		}

		return NextResponse.json({ status: result.status })
	} catch (e) {
		console.error('merchant-status error', e)
		return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
	}
}
