'use server'

import type { Waitlist } from '@/models/waitlist.model'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'

import { fetchUserByEmail } from '@/services/user.services'
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

	let actualUser = user

	// If no user is provided but we have an email, check if this email belongs to an existing user
	if (user == null && email != null) {
		try {
			const existingUser = await fetchUserByEmail(email.trim())
			if (existingUser != null) {
				// Email belongs to an existing user, use the user instead of email-only subscription
				actualUser = existingUser
				console.info(`Email ${email} belongs to existing user ${existingUser.id}, linking to user account`)
			}
		} catch (error) {
			console.error('Error checking for existing user by email:', error)
			// Continue with email-only subscription if we can't check
		}
	}

	try {
		// Check for existing waitlist entry 🤔
		try {
			let filterQuery = ''
			if (actualUser != null) {
				// Check for authenticated user or user found by email
				filterQuery = `user_id = "${actualUser.id}" && event_id = "${eventId}"`
			} else if (email != null) {
				// Check for email-only subscription (only if no user was found for this email)
				filterQuery = `email = "${email.trim()}" && event_id = "${eventId}"`
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
			user_id: actualUser?.id ?? null,
			optionPreferences: {},
			mail_notification: true,
			event_id: eventId,
			email: actualUser == null ? email?.trim() : undefined,
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
		const userInfo = actualUser != null ? `user ${actualUser.id}` : `email ${email ?? 'unknown'}`
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
export async function fetchUserWaitlists(userId: string): Promise<(Waitlist & { expand?: { event_id: Event } })[]> {
	if (userId === '') {
		console.error('User ID is required to fetch their waitlists.')
		return []
	}

	try {
		const records = await pb.collection('waitlists').getFullList<Waitlist & { expand?: { event_id: Event } }>({
			sort: '-added_at',
			filter: `user_id = "${userId}"`,
			expand: 'event_id',
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
		const waitlistEntries = await pb.collection('waitlists').getFullList<Waitlist & { expand?: { user_id?: User } }>({
			filter: `event_id = "${eventId}" && mail_notification = true`,
			expand: 'user_id',
		})

		const emails: string[] = []

		for (const entry of waitlistEntries) {
			if (entry.email != null && entry.email.trim() !== '') {
				// Direct email subscription (non-authenticated user)
				emails.push(entry.email.trim())
			} else if (entry.expand?.user_id?.email != null && entry.expand.user_id.email.trim() !== '') {
				// Authenticated user email
				emails.push(entry.expand.user_id.email.trim())
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
			filterQuery = `user_id = "${user.id}" && event_id = "${eventId}"`
		} else if (email != null) {
			filterQuery = `email = "${email.trim()}" && event_id = "${eventId}"`
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
