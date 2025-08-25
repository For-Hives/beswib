import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

import { disableWaitlistNotifications } from '@/services/waitlist.services'
import { fetchUserByClerkId } from '@/services/user.services'

export async function POST(request: NextRequest) {
	try {
		console.log('🔍 API: Starting waitlist removal process')

		const { userId } = await auth()
		console.log('🔍 API: Auth userId:', userId)
		if (!userId) {
			console.log('❌ API: No userId from auth')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const clerkUser = await currentUser()
		console.log('🔍 API: Clerk user:', clerkUser?.id)
		if (!clerkUser) {
			console.log('❌ API: No clerk user')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Fetch user data from our database
		const user = await fetchUserByClerkId(userId)
		console.log('🔍 API: Database user:', user?.id)
		if (!user) {
			console.log('❌ API: User not found in database')
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const body = await request.json()
		console.log('🔍 API: Request body:', body)
		const { eventId } = body
		if (!eventId) {
			console.log('❌ API: No eventId in request')
			return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
		}

		console.log('🔍 API: Calling disableWaitlistNotifications with:', { userId: user.id, eventId })
		// Disable waitlist notifications (soft delete)
		const success = await disableWaitlistNotifications(eventId, user)
		console.log('🔍 API: disableWaitlistNotifications result:', success)

		if (success) {
			console.log('✅ API: Successfully disabled notifications')
			return NextResponse.json({ success: true })
		} else {
			console.log('❌ API: Failed to disable notifications')
			return NextResponse.json({ error: 'Failed to disable waitlist notifications' }, { status: 500 })
		}
	} catch (error) {
		console.error('❌ API: Error disabling waitlist notifications:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
