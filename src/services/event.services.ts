'use server'

import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'
import type { User } from '@/models/user.model'

import { pb } from '@/lib/services/pocketbase'
import { dateToPbDateString } from '@/lib/utils/date'

/**
 * Creates a new event. This function is intended for use by organizers.
 * @param eventData Partial data for the new event. Fields like name, date, location, description are expected.
 */
export async function createEvent(eventData: Omit<Event, 'id'>): Promise<Event | null> {
	if (!eventData.name || isNaN(eventData.eventDate.getTime()) || !eventData.location || !eventData.organizer) {
		console.error('Event name, date, location, and organizer are required.')
		return null
	}

	try {
		const dataToCreate = {
			typeCourse: eventData.typeCourse ?? 'route',
			transferDeadline: eventData.transferDeadline,
			registrationUrl: eventData.registrationUrl,
			participants: eventData.participants ?? 0,
			parcoursUrl: eventData.parcoursUrl,
			organizer: eventData.organizer,
			options: eventData.options && eventData.options.length > 0 ? JSON.stringify(eventData.options) : null,
			officialStandardPrice: eventData.officialStandardPrice,
			name: eventData.name,
			location: eventData.location,
			eventDate: eventData.eventDate,
			elevationGainM: eventData.elevationGainM,
			distanceKm: eventData.distanceKm,
			description: eventData.description ?? '',
			bibPickupWindowEndDate: eventData.bibPickupWindowEndDate,
			bibPickupWindowBeginDate: eventData.bibPickupWindowBeginDate,
			bibPickupLocation: eventData.bibPickupLocation,
		}

		const record = await pb.collection('events').create<Event>(dataToCreate)

		console.info('Event created successfully:', record.id)
		return record
	} catch (error: unknown) {
		console.error('PocketBase error details:', error)
		throw new Error('Error creating event: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Fetches all events that are approved and public.
 * @param expandOrganizer Whether to expand organizer data
 */
export async function fetchApprovedPublicEvents(
	expandOrganizer = false
): Promise<(Event & { expand?: { organizer?: Organizer } })[]> {
	try {
		const records = await pb.collection('events').getFullList<Event & { expand?: { organizer?: Organizer } }>({
			sort: 'eventDate',
			expand: expandOrganizer ? 'organizer' : undefined,
		})

		return records
	} catch (error: unknown) {
		throw new Error(
			'Error fetching approved public events: ' + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches all approved public events with their available bibs in a single optimized call.
 * Uses PocketBase back-relations to avoid multiple API calls.
 * @param expandOrganizer Whether to expand organizer data
 */
export async function fetchApprovedPublicEventsWithBibs(
	expandOrganizer = false
): Promise<(Event & { 
	expand?: { 
		organizer?: Organizer
		'bibs_via_eventId'?: (Bib & { expand?: { sellerUserId: User } })[]
	} 
})[]> {
	try {
		const nowIso = dateToPbDateString(new Date())
		const saleWindowFilter = `((transferDeadline != null && transferDeadline >= '${nowIso}') || (transferDeadline = null && eventDate >= '${nowIso}'))`
		
		// Use back-relations to get events with their available bibs
		const expandFields = ['bibs_via_eventId(status="available" && listed="public" && lockedAt=null).sellerUserId']
		if (expandOrganizer) {
			expandFields.push('organizer')
		}

		const records = await pb.collection('events').getFullList<Event & { 
			expand?: { 
				organizer?: Organizer
				'bibs_via_eventId'?: (Bib & { expand?: { sellerUserId: User } })[]
			} 
		}>({
			sort: 'eventDate',
			filter: saleWindowFilter,
			expand: expandFields.join(','),
		})

		return records
	} catch (error: unknown) {
		throw new Error(
			'Error fetching approved public events with bibs: ' + (error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches a single event by its ID.
 * @param id The ID of the event to fetch.
 * @param expandOrganizer Whether to expand organizer data
 */
export async function fetchEventById(
	id: string,
	expandOrganizer = false
): Promise<(Event & { expand?: { organizer?: Organizer } }) | null> {
	try {
		const record = await pb.collection('events').getOne<Event & { expand?: { organizer?: Organizer } }>(id, {
			expand: expandOrganizer ? 'organizer' : undefined,
		})
		return record
	} catch (error: unknown) {
		console.error(`Error fetching event with ID "${id}":`, error)
		return null
	}
}

/**
 * Fetches all events submitted by a specific organizer.
 * @param organizerId The ID of the organizer whose events are to be fetched.
 * @param expandOrganizer Whether to expand organizer data
 */
export async function fetchEventsByOrganizer(
	organizerId: string,
	expandOrganizer = false
): Promise<(Event & { expand?: { organizer?: Organizer } })[]> {
	if (organizerId === '') {
		console.error('Organizer ID is required to fetch their events.')
		return []
	}
	try {
		const records = await pb.collection('events').getFullList<Event & { expand?: { organizer?: Organizer } }>({
			sort: '-created',
			filter: `organizer = "${organizerId}"`,
			expand: expandOrganizer ? 'organizer' : undefined,
		})
		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching events for organizer ID "${organizerId}": ` +
				(error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetches all events that are approved AND partnered.
 * These are typically events for which bibs can be listed by sellers.
 * @param expandOrganizer Whether to expand organizer data
 */
export async function fetchPartneredApprovedEvents(
	expandOrganizer = false
): Promise<(Event & { expand?: { organizer?: Organizer } })[]> {
	try {
		// For now, fetch all events since isPartnered field doesn't exist in the model 🤔
		// TODO: Add isPartnered field to Event model and database schema when partnership feature is implemented 🚧
		const records = await pb.collection('events').getFullList<Event & { expand?: { organizer?: Organizer } }>({
			sort: 'eventDate',
			expand: expandOrganizer ? 'organizer' : undefined,
		})
		return records
	} catch (error: unknown) {
		console.error('Error fetching partnered and approved events:', error)
		// Return empty array instead of throwing to prevent page crashes 😅
		return []
	}
}

/**
 * Fetches all events for admin purposes.
 * This function should only be used by admin users.
 * @param expandOrganizer Whether to expand organizer data
 */
export async function getAllEvents(
	expandOrganizer = false
): Promise<(Event & { expand?: { organizer?: Organizer } })[]> {
	try {
		const records = await pb.collection('events').getFullList<Event & { expand?: { organizer?: Organizer } }>({
			sort: '-created',
			expand: expandOrganizer ? 'organizer' : undefined,
		})
		return records
	} catch (error: unknown) {
		throw new Error('Error fetching all events: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Deletes an event by its ID.
 * This should only be called from trusted server actions (admin-only flows).
 * @param id The ID of the event to delete
 * @returns true if deletion succeeded, otherwise throws
 */
export async function deleteEventById(id: string): Promise<boolean> {
	if (!id || typeof id !== 'string') {
		throw new Error('Valid event ID is required to delete an event')
	}
	try {
		await pb.collection('events').delete(id)
		return true
	} catch (error: unknown) {
		throw new Error('Error deleting event: ' + (error instanceof Error ? error.message : String(error)))
	}
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
