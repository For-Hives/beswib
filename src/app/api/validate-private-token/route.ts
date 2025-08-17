import { NextRequest, NextResponse } from 'next/server'
import { fetchPrivateBibByToken } from '@/services/bib.services'

export async function POST(request: NextRequest) {
	try {
		const { bibId, token } = await request.json()

		if (!bibId || !token) {
			return NextResponse.json({ error: 'Bib ID and token are required' }, { status: 400 })
		}

		// Try to fetch the private bib with the token
		const bib = await fetchPrivateBibByToken(bibId, token)

		if (!bib) {
			return NextResponse.json({ error: 'Invalid token or bib not found' }, { status: 401 })
		}

		// Token is valid
		return NextResponse.json({ valid: true })
	} catch (error) {
		console.error('Token validation error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
