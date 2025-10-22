'use server'

import { DateTime } from 'luxon'
import { pb } from '@/lib/services/pocketbase'
import { pbDateToLuxon } from '@/lib/utils/date'
import { isSellerProfileComplete } from '@/lib/validation/user'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'
import type { User } from '@/models/user.model'

import { fetchUserById } from './user.services'

/**
 * Creates a new bib listing. Handles both partnered and unlisted events.
 * @param bibData Data for the new bib, including potential unlisted event details.
 * @param sellerUserId The ID of the user (seller) listing the bib.
 */
export async function createBib(bibData: Omit<Bib, 'id'>): Promise<Bib | null> {
	if (bibData.sellerUserId === '') {
		console.error('Seller ID is required to create a bib listing.')
		return null
	}
	if (bibData.registrationNumber === '' || bibData.price === undefined || bibData.price < 0) {
		console.error('Registration Number and a valid Price are required.')
		return null
	}

	// Validate seller profile before allowing bib creation
	const sellerUser = await fetchUserById(bibData.sellerUserId)
	if (!sellerUser) {
		console.error('Seller user not found.')
		return null
	}

	if (!isSellerProfileComplete(sellerUser)) {
		console.error('Seller profile is not complete. Cannot create bib listing.')
		return null
	}

	const status: Bib['status'] = 'available'
	const finalEventId: string = bibData.eventId

	try {
		// Generate private listing token if this is a private listing 🤫
		const privateListingToken = bibData.listed === 'private' ? await generatePrivateListingToken() : undefined

		const dataToCreate: Omit<Bib, 'id'> = {
			validated: false,

			status: status,
			sellerUserId: bibData.sellerUserId,
			registrationNumber: bibData.registrationNumber,
			privateListingToken: privateListingToken,

			price: bibData.price,
			originalPrice: bibData.originalPrice,
			optionValues: bibData.optionValues,
			listed: bibData.listed,
			linkedEmailId: bibData.linkedEmailId,
			eventId: finalEventId,

			buyerUserId: undefined,
		}

		const record = await pb.collection('bibs').create<Bib>(dataToCreate)

		// Send notifications to waitlisted users if the bib is publicly listed
		if (record.listed === 'public' && record.status === 'available') {
			// Import notification service here to avoid circular dependencies
			const { sendNewBibNotification } = await import('./notification.service')
			const { fetchWaitlistEmailsWithLocalesForEvent } = await import('./waitlist.services')
			const { fetchEventById } = await import('./event.services')

			try {
				const [event, waitlistEmailsWithLocales] = await Promise.all([
					fetchEventById(record.eventId),
					fetchWaitlistEmailsWithLocalesForEvent(record.eventId),
				])

				if (event != null && waitlistEmailsWithLocales.length > 0) {
					await sendNewBibNotification(
						{
							eventName: event.name,
							eventLocation: event.location,
							eventId: record.eventId,
							eventDate: event.eventDate,
							bibPrice: record.price,
							bibId: record.id,
						},
						waitlistEmailsWithLocales
					)
				}
			} catch (notificationError) {
				// Log the error but don't fail the bib creation
				console.error('Failed to send waitlist notifications for new bib:', notificationError)
			}
		}

		return record
	} catch (error: unknown) {
		throw new Error('Error creating bib listing: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Fetches all available bibs for a specific event (excluding the current bib).
 * Returns bibs with expanded event and user (seller) details.
 * @param eventId The ID of the event.
 * @param excludeBibId Optional ID of a bib to exclude from results.
 */
export async function fetchAvailableBibsForEvent(
	eventId: string,
	abortSignal?: AbortSignal
): Promise<(Bib & { expand?: { eventId: Event; sellerUserId: User } })[]> {
	if (eventId === '') {
		console.error('Event ID is required to fetch available bibs for event.')
		return []
	}

	// Check if already aborted before starting
	if (abortSignal != null && abortSignal.aborted === true) {
		throw new Error('Request was aborted')
	}

	try {
		const nowIso = formatDateToPbIso(new Date())
		const saleWindowFilter = `((eventId.transferDeadline != null && eventId.transferDeadline >= '${nowIso}') || (eventId.transferDeadline = null && eventId.eventDate >= '${nowIso}'))`

		// Check for abort before making the request
		if (abortSignal != null && abortSignal.aborted === true) {
			throw new Error('Request was aborted')
		}

		const records = await pb.collection('bibs').getFullList<Bib & { expand?: { eventId: Event; sellerUserId: User } }>({
			sort: 'price',
			filter: `eventId = "${eventId}" && status = 'available' && listed = 'public' && lockedAt = null && ${saleWindowFilter}`,
			expand: 'eventId,sellerUserId',
		})

		// Check for abort after the request
		if (abortSignal != null && abortSignal.aborted === true) {
			throw new Error('Request was aborted')
		}

		return records
	} catch (error: unknown) {
		// Don't wrap abort errors
		if (error instanceof Error && error.message === 'Request was aborted') {
			throw error
		}
		throw new Error(
			`Error fetching available bibs for event ${eventId}: ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches all publicly available bibs for the marketplace.
 * Returns bibs with expanded event and user (seller) details.
 */
export async function fetchAvailableBibsForMarketplace(): Promise<
	(Bib & {
		expand?: {
			eventId: Event & { expand?: { organizer: Organizer } }
			sellerUserId: User
		}
	})[]
> {
	try {
		// Only fetch bibs that are not locked or whose lock has expired and with future event or active transfer window
		const nowIso = formatDateToPbIso(new Date())
		const saleWindowFilter = `((eventId.transferDeadline != null && eventId.transferDeadline >= '${nowIso}') || (eventId.transferDeadline = null && eventId.eventDate >= '${nowIso}'))`
		const filter = `status = 'available' && listed = 'public' && lockedAt = null && ${saleWindowFilter}`
		const records = await pb.collection('bibs').getFullList<
			Bib & {
				expand?: {
					eventId: Event & { expand?: { organizer: Organizer } }
					sellerUserId: User
				}
			}
		>({
			sort: '-created',
			filter,
			expand: 'eventId,sellerUserId,eventId.organizer',
		})

		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching available bibs for marketplace: ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Atomically locks a bib for purchase for 5 minutes if not already locked or lock expired.
 * @param bibId The ID of the bib to lock.
 * @param userId The ID of the user attempting to lock.
 */
export async function lockBib(bibId: string, userId: string): Promise<Bib | null> {
	if (!bibId || !userId) return null
	try {
		const bib = await pb.collection('bibs').getOne<Bib>(bibId)
		const now = new Date()
		if (bib.lockedAt != null && bib.lockedAt !== '') {
			// Already locked and not expired
			return null
		}
		const updated = await pb.collection('bibs').update<Bib>(bibId, { lockedAt: now })
		return updated
	} catch (error: unknown) {
		throw new Error('Error locking bib: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Unlocks a bib (clears lockedAt).
 * @param bibId The ID of the bib to unlock.
 */
export async function unlockBib(bibId: string): Promise<Bib | null> {
	if (!bibId) return null
	try {
		const updated = await pb.collection('bibs').update<Bib>(bibId, { lockedAt: null })
		return updated
	} catch (error: unknown) {
		throw new Error('Error unlocking bib: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Checks if a bib is currently locked.
 * @param bibId The ID of the bib to check.
 */

export async function isLocked(bibId: string, timekey: string = ''): Promise<'locked' | 'unlocked' | 'userlocked'> {
	if (!bibId) return 'locked'
	try {
		const bib = await pb.collection('bibs').getOne<Bib>(bibId)
		const lockedAtDt = pbDateToLuxon(bib.lockedAt)?.toUTC()
		const timekeyDt = DateTime.fromISO(timekey).toUTC()

		if (lockedAtDt != null) {
			const nowDt: DateTime = DateTime.now()
			const lockExpiration: DateTime = lockedAtDt.plus({ minutes: 5 })
			if (nowDt > lockExpiration) {
				await unlockBib(bibId)
				return 'unlocked'
			}
			if (timekeyDt != null) {
				return lockedAtDt.isValid && timekeyDt.isValid && lockedAtDt.toISO() === timekeyDt.toISO()
					? 'userlocked'
					: 'locked'
			}
			return 'locked'
		}
		// si non verouiller, check si deja vendu
		if (bib.status === 'sold') {
			return 'locked'
		}
		return 'unlocked'
	} catch (error: unknown) {
		console.error('Error checking if bib is locked: ', error)
		throw new Error('Error checking if bib is locked: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Unlocks all bibs whose lockedAt is older than 5 minutes ago.
 * Can be called by a scheduled job or marketplace trigger.
 */
export async function unlockExpiredBibs(): Promise<number> {
	try {
		const now = new Date()
		const expiredDate = new Date(now.getTime() - 5 * 60 * 1000)
		const pad = (n: number, width = 2) => n.toString().padStart(width, '0')
		const padMs = (n: number) => n.toString().padStart(3, '0')
		const expiredIso = `${expiredDate.getUTCFullYear()}-${pad(expiredDate.getUTCMonth() + 1)}-${pad(expiredDate.getUTCDate())} ${pad(expiredDate.getUTCHours())}:${pad(expiredDate.getUTCMinutes())}:${pad(expiredDate.getUTCSeconds())}.${padMs(expiredDate.getUTCMilliseconds())}Z`
		console.info(`Unlocking expired bibs older than ${expiredIso}`)
		const records = await pb.collection('bibs').getFullList<Bib>({
			filter: `lockedAt != null && lockedAt < '${expiredIso}'`,
		})
		let count = 0
		for (const bib of records) {
			await pb.collection('bibs').update<Bib>(bib.id, { lockedAt: null })
			count++
		}
		return count
	} catch (error: unknown) {
		throw new Error('Error unlocking expired bibs: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Automatically updates bibs to 'withdrawn' status when their events have expired.
 * This function checks for bibs that are still marked as 'available' but belong to events
 * that have passed their transfer deadline or event date.
 * @param sellerUserId Optional parameter to limit the check to a specific seller
 * @returns Number of bibs that were updated to withdrawn status
 */
export async function updateExpiredBibsToWithdrawn(sellerUserId?: string): Promise<number> {
	try {
		const nowIso = formatDateToPbIso(new Date())

		// Build filter to find available bibs with expired events
		let filter = `status = 'available' && ((eventId.transferDeadline != null && eventId.transferDeadline < '${nowIso}') || (eventId.transferDeadline = null && eventId.eventDate < '${nowIso}'))`

		// If sellerUserId is provided, limit to that seller's bibs
		if (sellerUserId != null && sellerUserId !== '') {
			filter += ` && sellerUserId = '${sellerUserId}'`
		}

		console.info(`Checking for expired bibs to withdraw${sellerUserId != null ? ` for seller ${sellerUserId}` : ''}...`)

		const expiredBibs = await pb.collection('bibs').getFullList<Bib & { expand?: { eventId: Event } }>({
			filter,
			expand: 'eventId',
		})

		let count = 0
		for (const bib of expiredBibs) {
			try {
				await pb.collection('bibs').update<Bib>(bib.id, {
					status: 'withdrawn',
					// Clear any lock and buyer info since it's being withdrawn
					lockedAt: null,
					buyerUserId: undefined,
				})
				count++
				console.info(
					`Updated expired bib ${bib.id} to withdrawn status (event: ${bib.expand?.eventId?.name ?? bib.eventId})`
				)
			} catch (updateError) {
				console.error(`Failed to update bib ${bib.id} to withdrawn:`, updateError)
			}
		}

		if (count > 0) {
			console.info(`Successfully updated ${count} expired bibs to withdrawn status`)
		}

		return count
	} catch (error: unknown) {
		console.error('Error updating expired bibs to withdrawn:', error)
		throw new Error(
			'Error updating expired bibs to withdrawn: ' + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Checks if a bib is private without revealing sensitive data.
 * @param bibId The ID of the bib to check.
 * @returns Object containing listing status and availability.
 */
export async function checkBibListingStatus(bibId: string): Promise<{
	listed: 'private' | 'public' | null
	exists: boolean
	available: boolean
} | null> {
	if (bibId === '') {
		console.error('Bib ID is required.')
		return null
	}
	try {
		const record = await pb.collection('bibs').getOne<Pick<Bib, 'id' | 'listed' | 'status'>>(bibId, {
			fields: 'id,listed,status',
		})

		return {
			listed: record.listed,
			exists: true,
			available: record.status === 'available',
		}
	} catch (error) {
		throw new Error(
			`Error checking bib listing status for bib ${bibId}: ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches a single bib by its ID for public display or pre-purchase.
 * @param bibId The ID of the bib to fetch.
 */
export async function fetchPublicBibById(bibId: string): Promise<
	| (Bib & {
			expand?: {
				eventId: Event & { expand?: { organizer: Organizer } }
				sellerUserId: User
			}
	  })
	| null
> {
	if (bibId === '') {
		console.error('Bib ID is required.')
		return null
	}
	try {
		const record = await fetchBibById(bibId)

		if (record == null) {
			return null
		}

		// Only return if it's a public listing
		if (record.listed !== 'public') {
			return null
		}

		return record
	} catch (error: unknown) {
		throw new Error(
			`Error fetching bib with ID "${bibId}": ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches a single bib by its ID for public display or pre-purchase.
 * @param bibId The ID of the bib to fetch.
 */
export async function fetchBibById(bibId: string): Promise<
	| (Bib & {
			expand?: {
				eventId: Event & { expand?: { organizer: Organizer } }
				sellerUserId: User
			}
	  })
	| null
> {
	if (bibId === '') {
		console.error('Bib ID is required.')
		return null
	}
	try {
		const record = await pb.collection('bibs').getOne<
			Bib & {
				expand?: {
					eventId: Event & { expand?: { organizer: Organizer } }
					sellerUserId: User
				}
			}
		>(bibId, {
			expand: 'eventId,sellerUserId,eventId.organizer',
		})

		return record
	} catch (error: unknown) {
		throw new Error(
			`Error fetching bib with ID "${bibId}": ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches a single bib by its ID for a specific seller, ensuring ownership.
 * @param bibId The ID of the bib to fetch.
 * @param sellerUserId The PocketBase ID of the seller claiming ownership.
 */
export async function fetchBibByIdForSeller(
	bibId: string,
	sellerUserId: string
): Promise<(Bib & { expand?: { eventId: Event } }) | null> {
	if (bibId === '' || sellerUserId === '') {
		console.error('Bib ID and Seller ID are required.')
		return null
	}
	try {
		const record = await pb.collection('bibs').getOne<Bib & { expand?: { eventId: Event } }>(bibId, {
			expand: 'eventId',
		})
		if (record.sellerUserId !== sellerUserId) {
			console.warn(`Seller ${sellerUserId} attempted to access bib ${bibId} owned by ${record.sellerUserId}.`)
			return null
		}
		return record
	} catch (error: unknown) {
		throw new Error(
			`Error fetching bib ${bibId} for seller ${sellerUserId}: ` +
				(error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches all bibs purchased by a specific buyer.
 * @param buyerUserId The PocketBase ID of the buyer whose purchased bibs are to be fetched.
 */
export async function fetchBibsByBuyer(buyerUserId: string): Promise<(Bib & { expand?: { eventId: Event } })[]> {
	if (buyerUserId === '') {
		console.error('Buyer User ID is required to fetch their purchased bibs.')
		return []
	}

	try {
		const records = await pb.collection('bibs').getFullList<Bib & { expand?: { eventId: Event } }>({
			sort: '-updated',
			filter: `buyerUserId = "${buyerUserId}" && status = 'sold'`,
			expand: 'eventId',
		})
		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching bibs for buyer ID "${buyerUserId}": ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches all bibs listed by a specific seller.
 * Optionally expands event details if your PocketBase setup allows and it's needed.
 * @param sellerUserId The PocketBase ID of the seller whose bibs are to be fetched.
 */
export async function fetchBibsBySeller(sellerUserId: string): Promise<
	(Bib & {
		expand?: { eventId: Event & { expand?: { organizer: Organizer } } }
	})[]
> {
	if (sellerUserId === '') {
		console.error('Seller ID is required to fetch their bibs.')
		return []
	}

	try {
		const records = await pb.collection('bibs').getFullList<
			Bib & {
				expand?: { eventId: Event & { expand?: { organizer: Organizer } } }
			}
		>({
			sort: '-created',
			filter: `sellerUserId = "${sellerUserId}"`,
			expand: 'eventId,eventId.organizer',
		})

		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching bibs for seller ID "${sellerUserId}": ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches a private bib by its ID and token for secure access.
 * @param bibId The ID of the bib to fetch.
 * @param token The private listing token.
 */
export async function fetchPrivateBibByToken(
	bibId: string,
	token: string
): Promise<(Bib & { expand?: { eventId: Event; sellerUserId: User } }) | null> {
	if (bibId === '' || token === '') {
		console.error('Bib ID and token are required.')
		return null
	}
	try {
		const record = await pb
			.collection('bibs')
			.getOne<Bib & { expand?: { eventId: Event; sellerUserId: User } }>(bibId, {
				expand: 'eventId,sellerUserId',
			})

		// Verify the token matches and this is a private listing ✅
		if (record.listed !== 'private' || record.privateListingToken !== token) {
			console.warn(`Invalid token access attempt for bib ${bibId}`)
			return null
		}

		return record
	} catch (error: unknown) {
		console.error('Error in fetchPrivateBibByToken:', error)
		throw new Error(
			`Error fetching private bib with ID "${bibId}": ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches all publicly listed bibs for a specific event.
 * @param eventId The ID of the event.
 */
export async function fetchPubliclyListedBibsForEvent(eventId: string): Promise<
	(Bib & {
		expand?: {
			eventId: Event & { expand?: { organizer: Organizer } }
			sellerUserId: User
		}
	})[]
> {
	if (eventId === '') {
		console.error('Event ID is required to fetch publicly listed bibs.')
		return []
	}
	try {
		const nowIso = formatDateToPbIso(new Date())
		const saleWindowFilter = `((eventId.transferDeadline != null && eventId.transferDeadline >= '${nowIso}') || (eventId.transferDeadline = null && eventId.eventDate >= '${nowIso}'))`
		const records = await pb.collection('bibs').getFullList<
			Bib & {
				expand?: {
					eventId: Event & { expand?: { organizer: Organizer } }
					sellerUserId: User
				}
			}
		>({
			sort: '-created',
			filter: `eventId = "${eventId}" && status = 'available' && listed = 'public' && lockedAt = null && ${saleWindowFilter}`,
			expand: 'eventId,sellerUserId,eventId.organizer',
		})
		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching publicly listed bibs for event ${eventId}: ` +
				(error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Updates a bib record.
 * @param bibId The ID of the bib to update.
 * @param data The data to update.
 */
export async function updateBib(bibId: string, data: Partial<Omit<Bib, 'id'>>): Promise<Bib | null> {
	if (bibId === '') {
		console.error('Bib ID is required to update a bib.')
		return null
	}

	try {
		const record = await pb.collection('bibs').update<Bib>(bibId, data)
		return record
	} catch (error: unknown) {
		throw new Error('Error updating bib: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Updates a bib listing by its seller.
 * @param bibId The ID of the bib to update.
 * @param dataToUpdate Data to update for the bib.
 * @param sellerUserId The PocketBase ID of the seller performing the update.
 */
export async function updateBibBySeller(
	bibId: string,
	dataToUpdate: Partial<Bib>, // Allow specific status updates or general data updates ✅
	_sellerUserId: string
): Promise<Bib | null> {
	if (bibId === '' || _sellerUserId === '') {
		console.error('Bib ID and Seller ID are required for update.')
		return null
	}

	try {
		const currentBib = await pb.collection('bibs').getOne<Bib>(bibId)
		if (currentBib.sellerUserId !== _sellerUserId) {
			console.warn(`Unauthorized attempt by seller ${_sellerUserId} to update bib ${bibId}.`)
			return null
		}

		// Prevent changing immutable fields with this function. 🚫
		// Certain status transitions might also be restricted (e.g., can't change sold bib). ⚠️
		if (currentBib.status === 'sold' || currentBib.status === 'expired') {
			console.warn(`Attempt to update a bib that is already ${currentBib.status} (Bib ID: ${bibId})`)
			throw new Error(`Bib is already ${currentBib.status} and cannot be updated.`)
		}

		// If 'status' is part of dataToUpdate, ensure it's a valid transition ✅
		if ('status' in dataToUpdate) {
			const newStatus = dataToUpdate.status
			const allowedStatusChanges: Record<Bib['status'], Bib['status'][]> = {
				withdrawn: ['available'],
				validation_failed: ['available'],
				sold: [], // Cannot be changed by seller 🚫
				expired: [], // Cannot be changed by seller 🚫
				available: ['sold', 'withdrawn', 'expired'],
			}

			if (newStatus != null) {
				const allowedChanges = allowedStatusChanges[currentBib.status]
				if (!allowedChanges?.includes(newStatus)) {
					console.warn(`Invalid status transition from ${currentBib.status} to ${newStatus} for bib ${bibId}.`)
					throw new Error(`Invalid status transition from ${currentBib.status} to ${newStatus} for bib ${bibId}.`)
				}
			}
		}

		// Sanitize payload: disallow registrationNumber, eventId, sellerUserId modifications by seller
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { sellerUserId, registrationNumber, eventId, ...payload } = dataToUpdate

		const updatedRecord = await pb.collection('bibs').update<Bib>(bibId, payload)
		return updatedRecord
	} catch (error: unknown) {
		throw new Error(`Error updating bib ${bibId}: ` + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Updates a bib's status and optionally adds admin notes.
 * This function is intended for admin use and bypasses seller ownership checks.
 * @param bibId The ID of the bib to update.
 * @param newStatus The new status to set for the bib.
 * @param adminNotes Optional notes from the admin regarding the status change.
 */
export async function updateBibStatusByAdmin(bibId: string, newStatus: Bib['status']): Promise<Bib | null> {
	if (bibId === '' || !newStatus) {
		console.error('Bib ID and new status are required for admin update.')
		return null
	}

	try {
		const dataToUpdate: Partial<Bib> = {
			status: newStatus,
		}

		const updatedRecord = await pb.collection('bibs').update<Bib>(bibId, dataToUpdate)

		return updatedRecord
	} catch (error: unknown) {
		if (
			error != null &&
			typeof error === 'object' &&
			'message' in error &&
			typeof (error as { message: unknown }).message === 'string'
		) {
			const errorMessage = (error as { message: string }).message
			console.error('PocketBase error details:', errorMessage)
		}
		throw new Error(
			`Error updating bib ${bibId} status by admin: ` + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Generates a cryptographically secure random token for private listings 🤫
 * @returns A 32-character random string 🎲
 */
export async function generatePrivateListingToken(): Promise<string> {
	return new Promise((resolve, reject) => {
		const cryptoObj: Crypto | undefined = (globalThis as unknown as { crypto?: Crypto }).crypto
		if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
			throw new Error('Secure random generator is unavailable')
		}

		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		const alphabetLen = alphabet.length // 62
		const resultLength = 32
		const resultChars: string[] = []

		// Rejection sampling to avoid modulo bias
		const maxByte = 256
		const acceptableRange = Math.floor(maxByte / alphabetLen) * alphabetLen // 248

		while (resultChars.length < resultLength) {
			const buf = new Uint8Array(16)
			cryptoObj.getRandomValues(buf)
			for (let i = 0; i < buf.length && resultChars.length < resultLength; i++) {
				const v = buf[i]
				if (v < acceptableRange) {
					const idx = v % alphabetLen
					resultChars.push(alphabet.charAt(idx))
				}
			}
		}

		resolve(resultChars.join(''))
		reject(new Error('Secure random generator is unavailable'))
	})
}

/**
 * Formats a Date object to PocketBase compatible ISO string: YYYY-MM-DD HH:mm:ss.mmmZ (UTC)
 */
function formatDateToPbIso(date: Date): string {
	const d = new Date(date.getTime())
	const pad = (n: number, width = 2) => n.toString().padStart(width, '0')
	const padMs = (n: number) => n.toString().padStart(3, '0')
	return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(
		d.getUTCMinutes()
	)}:${pad(d.getUTCSeconds())}.${padMs(d.getUTCMilliseconds())}Z`
}
