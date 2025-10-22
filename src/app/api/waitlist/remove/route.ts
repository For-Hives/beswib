import { auth, currentUser } from '@clerk/nextjs/server'
import { type NextRequest, NextResponse } from 'next/server'
import { fetchUserByClerkId } from '@/services/user.services'
import { disableWaitlistNotifications } from '@/services/waitlist.services'

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth()
		if (userId == null) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const clerkUser = await currentUser()
		if (!clerkUser) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Fetch user data from our database
		const user = await fetchUserByClerkId(userId)
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const body = (await request.json()) as { eventId?: unknown }
		const { eventId } = body
		if (eventId == null || typeof eventId !== 'string') {
			return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
		}

		// Disable waitlist notifications (soft delete)
		const success = await disableWaitlistNotifications(eventId, user)

		if (success) {
			return NextResponse.json({ success: true })
		} else {
			return NextResponse.json({ error: 'Failed to disable waitlist notifications' }, { status: 500 })
		}
	} catch (error) {
		console.error('❌ API: Error disabling waitlist notifications:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
