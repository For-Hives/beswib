import 'server-only'

import { pb } from '@/lib/services/pocketbase'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Waitlist } from '@/models/waitlist.model'

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
 * Sanitizes values for safe logging to prevent log injection attacks.
 * Removes ANSI escape sequences, control characters, and limits length.
 */
function sanitizeLogValue(value: string | null | undefined): string {
	if (value == null || value === undefined) {
		return '[null]'
	}
	if (typeof value !== 'string') {
		return String(value)
	}

	// Remove ANSI escape sequences, control characters, and normalize whitespace
	const sanitized = value
		// biome-ignore lint/suspicious/noControlCharactersInRegex: Intentional - removing ANSI escape sequences for security
		.replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
		// biome-ignore lint/suspicious/noControlCharactersInRegex: Intentional - removing control characters for log injection prevention
		.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars except \n and \r
		.replace(/[\r\n]/g, ' ') // Replace newlines with spaces
		.trim()

	// Limit length to prevent log flooding
	const maxLength = 100
	if (sanitized.length > maxLength) {
		return `${sanitized.slice(0, maxLength)}...`
	}

	return sanitized
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
			console.warn('Expansion failed, fetching events separately')
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
						console.error('Failed to fetch event %s:', sanitizeLogValue(waitlist.event_id), error)
						return waitlist
					}
				})
			)
			return waitlistsWithEvents
		}

		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching waitlists for user ID "${sanitizeLogValue(userId)}": ${error instanceof Error ? error.message : String(error)}`
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
		console.error('Error fetching waitlist emails for event "%s":', sanitizeLogValue(eventId), error)
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
