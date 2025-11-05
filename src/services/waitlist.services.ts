'use server'

import { pb } from '@/lib/services/pocketbase'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Waitlist } from '@/models/waitlist.model'
import { sendWaitlistConfirmationEmail } from '@/services/email.service'
import { fetchUserByEmail } from '@/services/user.services'

/**
 * Escapes special characters in PocketBase filter queries to prevent injection attacks.
 * PocketBase uses a custom filter syntax where double quotes delimit strings.
 * This function escapes backslashes and double quotes to prevent query manipulation.
 */
function escapePocketBaseFilter(value: string): string {
	if (!value || typeof value !== 'string') {
		return ''
	}
	// Escape backslashes first (to prevent double-escape issues), then escape double quotes
	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

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
				filterQuery = `user_id = "${escapePocketBaseFilter(actualUser.id)}" && event_id = "${escapePocketBaseFilter(eventId)}"`
			} else if (email != null) {
				// Check for email-only subscription (only if no user was found for this email)
				filterQuery = `email = "${escapePocketBaseFilter(email.trim())}" && event_id = "${escapePocketBaseFilter(eventId)}"`
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

		// Send waitlist confirmation email with proper locale detection
		try {
			const emailToUse = actualUser?.email ?? email?.trim()
			const userName = actualUser ? `${actualUser.firstName ?? ''} ${actualUser.lastName ?? ''}`.trim() : undefined
			const userLocale = actualUser?.locale ?? undefined // Use user's locale from DB if available

			if (emailToUse !== undefined && emailToUse != null && emailToUse.trim() !== '') {
				// Get event details for the email (we need to fetch the event)
				const eventRecord = await pb.collection('events').getOne<Event>(eventId)

				void sendWaitlistConfirmationEmail(
					emailToUse,
					userName ?? 'Runner', // Fallback name
					eventRecord.name,
					eventId,
					eventRecord.distanceKm != null && eventRecord.distanceKm !== undefined
						? `${eventRecord.distanceKm} km`
						: undefined,
					eventRecord.typeCourse ?? 'road',
					userLocale // This will auto-detect if undefined
				)
			}
		} catch (emailError: unknown) {
			// Don't fail the waitlist creation if email fails, just log the error
			console.error('Failed to send waitlist confirmation email:', emailError)
		}

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
		// Try to fetch with explicit expansion, only active waitlists (mail_notification: true)
		const records = await pb.collection('waitlists').getFullList<Waitlist & { expand?: { event_id: Event } }>({
			sort: '-added_at',
			filter: `user_id = "${escapePocketBaseFilter(userId)}" && mail_notification = true`,
			expand: 'event_id',
		})

		// If expansion didn't work, try to fetch events separately
		if (records.length > 0 && !records[0].expand?.event_id) {
			console.info('Expansion failed, fetching events separately')
			const waitlistsWithEvents = await Promise.all(
				records.map(async waitlist => {
					try {
						const event = await pb.collection('events').getOne<Event>(waitlist.event_id)
						return {
							...waitlist,
							expand: {
								...waitlist.expand,
								event_id: event,
							},
						}
					} catch (error) {
						console.error(`Failed to fetch event ${waitlist.event_id}:`, error)
						return waitlist
					}
				})
			)
			return waitlistsWithEvents
		}

		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching waitlists for user ID "${userId}": ${error instanceof Error ? error.message : String(error)}`
		)
	}
}

/**
 * Fetches all email addresses with their locales for users on the waitlist for a specific event.
 * Returns both user emails (from user records) and direct email subscriptions.
 * @param eventId The ID of the event.
 * @returns Array of unique email addresses with their preferred locales.
 */
export async function fetchWaitlistEmailsWithLocalesForEvent(
	eventId: string
): Promise<Array<{ email: string; locale?: string }>> {
	if (eventId === '') {
		console.error('Event ID is required to fetch waitlist emails.')
		return []
	}

	try {
		// Fetch all waitlist entries for the event with user expansion
		const waitlistEntries = await pb.collection('waitlists').getFullList<Waitlist & { expand?: { user_id?: User } }>({
			filter: `event_id = "${escapePocketBaseFilter(eventId)}" && mail_notification = true`,
			expand: 'user_id',
		})

		const emailsWithLocales: Array<{ email: string; locale?: string }> = []
		const seenEmails = new Set<string>()

		for (const entry of waitlistEntries) {
			let email: string | null = null
			let locale: string | undefined

			if (entry.email != null && entry.email.trim() !== '') {
				// Direct email subscription (non-authenticated user)
				email = entry.email.trim()
				locale = undefined // No user account, will auto-detect
			} else if (entry.expand?.user_id?.email != null && entry.expand.user_id.email.trim() !== '') {
				// Authenticated user email
				email = entry.expand.user_id.email.trim()
				locale = entry.expand.user_id.locale ?? undefined // Use user's locale from DB
			}

			if (email != null && email !== undefined && email.trim() !== '' && !seenEmails.has(email)) {
				seenEmails.add(email)
				emailsWithLocales.push({ locale, email })
			}
		}

		return emailsWithLocales
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : String(error))
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
			filter: `event_id = "${escapePocketBaseFilter(eventId)}" && mail_notification = true`,
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
 * Disables mail notifications for a user's waitlist entry for a specific event.
 * This effectively "removes" them from the waitlist by stopping notifications.
 * @param eventId The ID of the event.
 * @param user The user to disable notifications for (null for email-only subscriptions).
 * @param email Optional email for non-authenticated users.
 * @returns True if successfully disabled, false otherwise.
 */
export async function disableWaitlistNotifications(
	eventId: string,
	user: null | User,
	email?: string
): Promise<boolean> {
	if (user == null && (email == null || email.trim() === '')) {
		console.error('Either user or email is required to disable waitlist notifications.')
		return false
	}

	try {
		let filterQuery = ''
		if (user != null) {
			filterQuery = `user_id = "${escapePocketBaseFilter(user.id)}" && event_id = "${escapePocketBaseFilter(eventId)}"`
		} else if (email != null) {
			filterQuery = `email = "${escapePocketBaseFilter(email.trim())}" && event_id = "${escapePocketBaseFilter(eventId)}"`
		}

		if (filterQuery === '') {
			return false
		}

		// Find the waitlist entry
		const existingEntry = await pb.collection('waitlists').getFirstListItem<Waitlist>(filterQuery)

		// Update the entry to disable notifications instead of deleting
		await pb.collection('waitlists').update(existingEntry.id, {
			mail_notification: false,
		})
		return true
	} catch (error: unknown) {
		// If the entry doesn't exist (404), consider it a success
		if (error != null && typeof error === 'object' && 'status' in error && error.status === 404) {
			return true
		}
		console.error('Error disabling waitlist notifications:', error)
		return false
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
			filterQuery = `user_id = "${escapePocketBaseFilter(user.id)}" && event_id = "${escapePocketBaseFilter(eventId)}"`
		} else if (email != null) {
			filterQuery = `email = "${escapePocketBaseFilter(email.trim())}" && event_id = "${escapePocketBaseFilter(eventId)}"`
		}

		if (filterQuery === '') {
			return false
		}

		// Find the waitlist entry
		const existingEntry = await pb.collection('waitlists').getFirstListItem<Waitlist>(filterQuery)

		// Delete the entry
		await pb.collection('waitlists').delete(existingEntry.id)
		return true
	} catch {
		// If the entry doesn't exist (404), consider it a success
		return false
	}
}

/**
 * Links existing email-only waitlist entries to a newly created user account.
 * This is typically called when a user signs up and we want to convert their
 * email-only waitlist subscriptions to user-linked subscriptions.
 * @param email The email address to search for.
 * @param user The newly created user to link the waitlist entries to.
 * @returns The number of waitlist entries that were successfully linked.
 */
export async function linkEmailWaitlistsToUser(email: string, user: User): Promise<number> {
	if (email == null || email.trim() === '') {
		console.error('Email is required to link waitlist entries to user.')
		return 0
	}

	if (user?.id == null || user.id.trim() === '') {
		console.error('Valid user with ID is required to link waitlist entries.')
		return 0
	}

	try {
		// Find all email-only waitlist entries for this email
		const emailWaitlistEntries = await pb.collection('waitlists').getFullList<Waitlist>({
			filter: `email = "${escapePocketBaseFilter(email.trim())}" && user_id = null`,
		})

		if (emailWaitlistEntries.length === 0) {
			console.info(`No email-only waitlist entries found for ${email}`)
			return 0
		}

		let linkedCount = 0

		// Update each entry to link to the user account
		for (const entry of emailWaitlistEntries) {
			try {
				await pb.collection('waitlists').update(entry.id, {
					user_id: user.id,
					email: undefined, // Remove the email field since we now have a user_id
				})
				linkedCount++
			} catch (error) {
				console.error(`Failed to link waitlist entry ${entry.id} to user ${user.id}:`, error)
			}
		}

		console.info(`Successfully linked ${linkedCount} waitlist entries from email ${email} to user ${user.id}`)
		return linkedCount
	} catch (error: unknown) {
		console.error(`Error linking email waitlist entries for ${email} to user ${user.id}:`, error)
		return 0
	}
}

/**
 * Re-enables mail notifications for a user's waitlist entry for a specific event.
 * This allows users to rejoin a waitlist they previously left.
 * @param eventId The ID of the event.
 * @param user The user to re-enable notifications for (null for email-only subscriptions).
 * @param email Optional email for non-authenticated users.
 * @returns True if successfully re-enabled, false otherwise.
 */
export async function enableWaitlistNotifications(
	eventId: string,
	user: null | User,
	email?: string
): Promise<boolean> {
	if (user == null && (email == null || email.trim() === '')) {
		console.error('Either user or email is required to enable waitlist notifications.')
		return false
	}

	try {
		let filterQuery = ''
		if (user != null) {
			filterQuery = `user_id = "${escapePocketBaseFilter(user.id)}" && event_id = "${escapePocketBaseFilter(eventId)}"`
		} else if (email != null) {
			filterQuery = `email = "${escapePocketBaseFilter(email.trim())}" && event_id = "${escapePocketBaseFilter(eventId)}"`
		}

		if (filterQuery === '') {
			return false
		}

		// Find the waitlist entry
		const existingEntry = await pb.collection('waitlists').getFirstListItem<Waitlist>(filterQuery)

		// Update the entry to re-enable notifications
		await pb.collection('waitlists').update(existingEntry.id, {
			mail_notification: true,
		})
		return true
	} catch (error: unknown) {
		console.error('Error enabling waitlist notifications:', error)
		return false
	}
}
