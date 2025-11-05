import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { pb } from '@/lib/services/pocketbase'
import type { Waitlist } from '@/models/waitlist.model'
import { fetchUserByClerkId } from '@/services/user.services'

export async function GET(request: Request) {
	try {
		const url = new URL(request.url)
		const eventId = url.searchParams.get('eventId')
		if (eventId == null || eventId.trim() === '') {
			return NextResponse.json({ error: 'missing_eventId' }, { status: 400 })
		}

		const { userId: clerkId } = await auth()
		if (clerkId == null) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
		}

		const user = await fetchUserByClerkId(clerkId)
		if (user == null) {
			return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
		}

		try {
			await pb.collection('waitlists').getFirstListItem<Waitlist>(`user_id = "${user.id}" && event_id = "${eventId}"`)
			return NextResponse.json({ inWaitlist: true })
		} catch (err: unknown) {
			// PocketBase throws 404 if not found
			if (typeof err === 'object' && err != null && 'status' in err && (err as { status: unknown }).status === 404) {
				return NextResponse.json({ inWaitlist: false })
			}
			throw err
		}
	} catch (error) {
		console.error('Waitlist status error:', error)
		return NextResponse.json({ error: 'server_error' }, { status: 500 })
	}
}
