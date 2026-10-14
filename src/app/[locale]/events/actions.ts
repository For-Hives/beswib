'use server'

import { auth } from '@clerk/nextjs/server'

import { fetchUserByClerkId } from '@/services/user.services'
import { addToWaitlist } from '@/services/waitlist.services'

/**
 * Adds the visitor to the waitlist of an event: the signed-in user of the session, or the e-mail
 * address an anonymous visitor typed. The browser calls this, never addToWaitlist itself, which
 * subscribes whichever user record it is handed.
 * @param eventId The ID of the event.
 * @param email The address of an anonymous visitor (ignored when a session exists).
 * @returns `{}` when subscribed, `{ error: 'already_on_waitlist' }` for a duplicate, null on failure.
 *          Never the waitlist entry: for an address that has an account it carries the id of that user.
 */
export async function joinEventWaitlist(eventId: string, email?: string): Promise<null | { error?: string }> {
	if (typeof eventId !== 'string' || eventId === '') return null

	const { userId: clerkId } = await auth()

	let entry: Awaited<ReturnType<typeof addToWaitlist>>
	if (clerkId != null && clerkId !== '') {
		const user = await fetchUserByClerkId(clerkId)
		entry = await addToWaitlist(eventId, user)
	} else {
		entry = await addToWaitlist(eventId, null, typeof email === 'string' ? email : undefined)
	}

	if (entry == null) return null
	return entry.error === 'already_on_waitlist' ? { error: entry.error } : {}
}
