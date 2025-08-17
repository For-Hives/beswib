import { NextRequest, NextResponse } from 'next/server'

import { updateExpiredBibsToWithdrawn } from '@/services/bib.services'

/**
 * API route to manually trigger the update of expired bibs to withdrawn status.
 * This can be called manually or by a cron job for maintenance.
 */
export async function POST(request: NextRequest) {
	try {
		// Optional: Add authentication/authorization here if needed
		// For now, we'll allow any POST request to trigger this

		const body = await request.json().catch(() => ({}))
		const sellerUserId = body?.sellerUserId // Optional: limit to specific seller

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

export async function GET() {
	return NextResponse.json(
		{
			usage: {
				method: 'POST',
				description: 'Updates all expired bibs to withdrawn status. Optionally limit to specific seller.',
				body: '{ "sellerUserId": "optional-seller-id" }',
			},
			message: 'Use POST method to trigger expired bibs update',
		},
		{ status: 200 }
	)
}
