import { timingSafeEqual } from 'node:crypto'
import { type NextRequest, NextResponse } from 'next/server'

import { checkAdminAccess } from '@/guard/adminGuard'
import { updateExpiredBibsToWithdrawn } from '@/services/bib.services'

/**
 * Who may trigger the maintenance: a scheduler that sends the shared secret of the deployment
 * (Authorization: Bearer <MAINTENANCE_API_TOKEN>), or an admin signed in.
 * The middleware lets every /api path through, so nobody else checks the caller.
 */
async function isAuthorized(request: NextRequest): Promise<boolean> {
	const expected = process.env.MAINTENANCE_API_TOKEN ?? ''
	const provided = request.headers.get('authorization') ?? ''
	if (expected !== '' && provided.startsWith('Bearer ')) {
		const expectedBytes = Buffer.from(expected)
		const providedBytes = Buffer.from(provided.slice('Bearer '.length))
		if (expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes)) {
			return true
		}
	}

	return (await checkAdminAccess()) != null
}

/**
 * API route to manually trigger the update of expired bibs to withdrawn status.
 * This can be called manually by an admin or by a cron job for maintenance.
 */
export async function POST(request: NextRequest) {
	try {
		if (!(await isAuthorized(request))) {
			return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
		}

		const body = (await request.json().catch(() => ({}))) as { sellerUserId?: unknown }
		// Optional: limit to specific seller
		const sellerUserId = typeof body?.sellerUserId === 'string' ? body.sellerUserId : undefined

		const updatedCount = await updateExpiredBibsToWithdrawn(sellerUserId)

		return NextResponse.json(
			{
				updatedCount,
				success: true,
				message: `Successfully updated ${updatedCount} expired bibs to withdrawn status`,
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('API: Error updating expired bibs:', error)

		return NextResponse.json(
			{
				success: false,
				message: error instanceof Error ? error.message : String(error),
				error: 'Failed to update expired bibs',
			},
			{ status: 500 }
		)
	}
}

export function GET() {
	return NextResponse.json(
		{
			usage: {
				method: 'POST',
				description: 'Updates all expired bibs to withdrawn status. Optionally limit to specific seller.',
				body: '{ "sellerUserId": "optional-seller-id" }',
				authorization: 'Bearer <MAINTENANCE_API_TOKEN>, or the session of an admin',
			},
			message: 'Use POST method to trigger expired bibs update',
		},
		{ status: 200 }
	)
}
