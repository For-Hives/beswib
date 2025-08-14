'use server'

import type { Waitlist } from '@/models/waitlist.model'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'

import { pb } from '@/lib/services/pocketbase'

/**
 * Adds a user to the waitlist for a specific event.
 * Prevents duplicate entries.
 * @param eventId The ID of the event.
 * @param user The user joining the waitlist (null for email-only subscriptions).
 * @param email Optional email for non-authenticated users.
 * @returns The created waitlist entry, the existing entry if already added, or null on error.
 *          Returns an object with `error: 'already_on_waitlist'` for duplicates.
 */
export async function addToWaitlist(
	eventId: string,
	user: null | User,
	email?: string
): Promise<null | (Waitlist & { error?: string })> {
	// Validate that we have either a user or an email
	if (user == null && (email == null || email.trim() === '')) {
		console.error(`Either user or email is required to add to waitlist.`)
		return null
	}

	// Email validation for email-only subscriptions
	if (user == null && email != null) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email.trim())) {
			console.error(`Invalid email format: ${email}`)
			return null
		}
	}

	try {
		// Check for existing waitlist entry 🤔
		try {
			let filterQuery = ''
			if (user != null) {
				// Check for authenticated user
				filterQuery = `userId = "${user.id}" && eventId = "${eventId}"`
			} else if (email != null) {
				// Check for email-only subscription
				filterQuery = `email = "${email.trim()}" && eventId = "${eventId}"`
			}

			if (filterQuery !== '') {
				const existingEntry = await pb.collection('waitlists').getFirstListItem<Waitlist>(filterQuery)
				return { ...existingEntry, error: 'already_on_waitlist' }
			}
		} catch (error: unknown) {
			// PocketBase's getFirstListItem throws a 404 error if no record is found, 🤷
			// which is the expected behavior if the user is not already on the waitlist. 👍
			// We only re-throw if it's an unexpected error (not a 404). 💥
			if (
				error != null &&
				typeof error === 'object' &&
				'status' in error &&
				(error as { status: unknown }).status !== 404
			) {
				throw error
			}
		}

		const dataToCreate: Omit<Waitlist, 'id'> = {
			user_id: user?.id ?? null,
			optionPreferences: {},
			mailNotification: true,
			event_id: eventId,
			email: user == null ? email?.trim() : undefined,
			added_at: new Date(),
		}

		const record = await pb.collection('waitlists').create<Waitlist>(dataToCreate)
		return record
	} catch (error: unknown) {
		if (error != null && typeof error === 'object') {
			if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
				console.error('PocketBase error details:', (error as { message: string }).message)
			}
			if ('response' in error) {
				const response = (error as { response: unknown }).response
				if (response != null && typeof response === 'object' && 'data' in response) {
					console.error('PocketBase response data:', (response as { data: unknown }).data)
				}
			}
		}
		const userInfo = user != null ? `user ${user.id}` : `email ${email ?? 'unknown'}`
		throw new Error(
			`Error adding ${userInfo} to waitlist for event ${eventId}: ` +
				(error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches all waitlist entries for a specific user.
 * @param userId The ID of the user whose waitlist entries are to be fetched.
 */
export async function fetchUserWaitlists(userId: string): Promise<(Waitlist & { expand?: { eventId: Event } })[]> {
	if (userId === '') {
		console.error('User ID is required to fetch their waitlists.')
		return []
	}

	try {
		const records = await pb.collection('waitlists').getFullList<Waitlist & { expand?: { eventId: Event } }>({
			sort: '-addedAt',
			filter: `userId = "${userId}"`,
			expand: 'eventId',
		})
		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching waitlists for user ID "${userId}": ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches all email addresses of users on the waitlist for a specific event.
 * Returns both user emails (from user records) and direct email subscriptions.
 * @param eventId The ID of the event.
 * @returns Array of unique email addresses.
 */
export async function fetchWaitlistEmailsForEvent(eventId: string): Promise<string[]> {
	if (eventId === '') {
		console.error('Event ID is required to fetch waitlist emails.')
		return []
	}

	try {
		// Fetch all waitlist entries for the event with user expansion
		const waitlistEntries = await pb.collection('waitlists').getFullList<Waitlist & { expand?: { userId?: User } }>({
			filter: `eventId = "${eventId}" && mailNotification = true`,
			expand: 'userId',
		})

		const emails: string[] = []

		for (const entry of waitlistEntries) {
			if (entry.email != null && entry.email.trim() !== '') {
				// Direct email subscription (non-authenticated user)
				emails.push(entry.email.trim())
			} else if (entry.expand?.userId?.email != null && entry.expand.userId.email.trim() !== '') {
				// Authenticated user email
				emails.push(entry.expand.userId.email.trim())
			}
		}

		// Remove duplicates and return
		return Array.from(new Set(emails))
	} catch (error: unknown) {
		console.error(`Error fetching waitlist emails for event "${eventId}":`, error)
		return []
	}
}

/**
 * Removes a user from the waitlist for a specific event.
 * Supports both authenticated users and email-only subscriptions.
 * @param eventId The ID of the event.
 * @param user The user to remove (null for email-only subscriptions).
 * @param email Optional email for non-authenticated users.
 * @returns True if successfully removed, false otherwise.
 */
export async function removeFromWaitlist(eventId: string, user: null | User, email?: string): Promise<boolean> {
	if (user == null && (email == null || email.trim() === '')) {
		console.error('Either user or email is required to remove from waitlist.')
		return false
	}

	try {
		let filterQuery = ''
		if (user != null) {
			filterQuery = `userId = "${user.id}" && eventId = "${eventId}"`
		} else if (email != null) {
			filterQuery = `email = "${email.trim()}" && eventId = "${eventId}"`
		}

		if (filterQuery === '') {
			return false
		}

		// Find the waitlist entry
		const existingEntry = await pb.collection('waitlists').getFirstListItem<Waitlist>(filterQuery)

		// Delete the entry
		await pb.collection('waitlists').delete(existingEntry.id)
		return true
	} catch (error: unknown) {
		// If the entry doesn't exist (404), consider it a success
		if (error != null && typeof error === 'object' && 'status' in error && error.status === 404) {
			return true
		}
		console.error('Error removing from waitlist:', error)
		return false
	}
}
