'use server'

import { checkAdminAccess } from '@/guard/adminGuard'

import {
	createOrganizer,
	deleteOrganizer,
	fetchAllOrganizersWithEventsCount,
	updateOrganizer,
} from '@/services/organizer.services'
import { createEvent, deleteEventById, getAllEvents, fetchEventById, updateEventById } from '@/services/event.services'
import { getDashboardStats, getRecentActivity } from '@/services/dashboard.services'
import { fetchOrganizerById } from '@/services/organizer.services'
import { Organizer } from '@/models/organizer.model'
import { Event } from '@/models/event.model'

/**
 * Server action to create a new event (admin only)
 * Verifies authentication via Clerk, platform registration, and admin permissions
 */
export async function createEventAction(eventData: Omit<Event, 'id'>): Promise<{
	data?: Event
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access (checks Clerk auth, platform registration, and admin role)
		const adminUser = await checkAdminAccess()

		if (adminUser === null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		// Validate required fields
		if (!eventData.name || !eventData.location || !eventData.description || !eventData.organizer) {
			return {
				success: false,
				error: 'Name, location, description, and organizer are required',
			}
		}

		if (eventData.eventDate === null || eventData.eventDate === undefined || isNaN(eventData.eventDate.getTime())) {
			return {
				success: false,
				error: 'Valid event date is required',
			}
		}

		// Create the event with PocketBase service
		const result = await createEvent(eventData)

		if (result !== null) {
			console.info(`Admin ${adminUser.email} created event: ${result.name}`)
			return {
				success: true,
				data: result,
			}
		} else {
			throw new Error('Failed to create event')
		}
	} catch (error) {
		console.error('Error in createEventAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create event',
		}
	}
}

/**
 * Server action to create a new organizer (admin only)
 * Verifies authentication via Clerk, platform registration, and admin permissions
 */
export async function createOrganizerAction(formData: FormData): Promise<{
	data?: Organizer
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access (checks Clerk auth, platform registration, and admin role)
		const adminUser = await checkAdminAccess()

		if (adminUser === null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		// Extract data from FormData
		const name = formData.get('name') as string
		const email = formData.get('email') as string
		const website = formData.get('website') as string
		const isPartnered = formData.get('isPartnered') === 'true'
		const logoFile = formData.get('logoFile') as File | null

		// Validate required fields
		if (!name || !email) {
			return {
				success: false,
				error: 'Name and email are required',
			}
		}

		// Prepare organizer data for creation
		const organizerData = {
			email,
			isPartnered,
			logoFile: logoFile ?? undefined,
			name,
			website: website ?? undefined,
		}

		// Create the organizer with PocketBase service
		const result = await createOrganizer(organizerData)

		if (result !== null) {
			console.info(`Admin ${adminUser.email} created organizer: ${result.name}`)
			return {
				success: true,
				data: result,
			}
		} else {
			throw new Error('Failed to create organizer')
		}
	} catch (error) {
		console.error('Error in createOrganizerAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create organizer',
		}
	}
}

/**
 * Server action to get all events for admin
 */
export async function getAllEventsAction(expandOrganizer = true) {
	try {
		const events = await getAllEvents(expandOrganizer)
		return {
			success: true,
			data: events,
		}
	} catch (error) {
		console.error('Error fetching all events:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch events',
		}
	}
}

/**
 * Server action to get all organizers for admin
 */
export async function getAllOrganizersAction() {
	try {
		const organizers = await fetchAllOrganizersWithEventsCount()

		return {
			success: true,
			data: organizers,
		}
	} catch (error) {
		console.error('Error fetching all organizers:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch organizers',
		}
	}
}

/**
 * Server action to get dashboard statistics
 */
export async function getDashboardStatsAction() {
	try {
		const stats = await getDashboardStats()
		return {
			success: true,
			data: stats,
		}
	} catch (error) {
		console.error('Error fetching dashboard stats:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
		}
	}
}

/**
 * Server action to get recent activity
 */
export async function getRecentActivityAction() {
	try {
		const activity = await getRecentActivity()
		return {
			success: true,
			data: activity,
		}
	} catch (error) {
		console.error('Error fetching recent activity:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch recent activity',
		}
	}
}

/**
 * Server action to approve an organizer (set isPartnered = true)
 */
export async function approveOrganizerAction(
	id: string
): Promise<{ success: boolean; data?: Organizer; error?: string }> {
	try {
		const adminUser = await checkAdminAccess()
		if (adminUser === null) {
			return { success: false, error: 'Unauthorized: Admin access required' }
		}

		if (!id || typeof id !== 'string') {
			return { success: false, error: 'Valid organizer ID is required' }
		}

		const updated = await updateOrganizer(id, { isPartnered: true })
		if (updated) {
			console.info(`Admin ${adminUser.email} approved organizer: ${id}`)
			return { success: true, data: updated }
		}
		return { success: false, error: 'Failed to approve organizer' }
	} catch (error) {
		console.error('Error in approveOrganizerAction:', error)
		return { success: false, error: error instanceof Error ? error.message : 'Failed to approve organizer' }
	}
}

/**
 * Server action to reject an organizer (delete record)
 */
export async function rejectOrganizerAction(id: string): Promise<{ success: boolean; error?: string }> {
	try {
		const adminUser = await checkAdminAccess()
		if (adminUser === null) {
			return { success: false, error: 'Unauthorized: Admin access required' }
		}

		if (!id || typeof id !== 'string') {
			return { success: false, error: 'Valid organizer ID is required' }
		}

		const ok = await deleteOrganizer(id)
		if (ok) {
			console.info(`Admin ${adminUser.email} rejected organizer (deleted): ${id}`)
			return { success: true }
		}
		return { success: false, error: 'Failed to reject organizer' }
	} catch (error) {
		console.error('Error in rejectOrganizerAction:', error)
		return { success: false, error: error instanceof Error ? error.message : 'Failed to reject organizer' }
	}
}
/**
 * Server action to get an event by ID (admin only)
 */
export async function getEventByIdAction(id: string): Promise<{
	data?: Event
	error?: string
	success: boolean
}> {
	try {
		const adminUser = await checkAdminAccess()

		if (adminUser === null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		if (!id || typeof id !== 'string') {
			return {
				success: false,
				error: 'Valid event ID is required',
			}
		}

		const event = await fetchEventById(id, true) // Expand organizer data

		if (event) {
			return {
				success: true,
				data: event,
			}
		} else {
			return {
				success: false,
				error: 'Event not found',
			}
		}
	} catch (error) {
		console.error('Error in getEventByIdAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch event',
		}
	}
}

/**
 * Server action to update an event (admin only)
 */
export async function updateEventAction(
	id: string,
	eventData: Partial<Event>
): Promise<{
	data?: Event
	error?: string
	success: boolean
}> {
	try {
		const adminUser = await checkAdminAccess()

		if (adminUser === null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		if (!id || typeof id !== 'string') {
			return {
				success: false,
				error: 'Valid event ID is required',
			}
		}

		// Validate required fields if they are being updated
		if (eventData.name !== undefined && !eventData.name) {
			return {
				success: false,
				error: 'Event name is required',
			}
		}

		if (eventData.eventDate !== undefined && (eventData.eventDate === null || isNaN(eventData.eventDate.getTime()))) {
			return {
				success: false,
				error: 'Valid event date is required',
			}
		}

		// Update the event with PocketBase service
		const result = await updateEventById(id, eventData)

		if (result !== null) {
			console.info(`Admin ${adminUser.email} updated event: ${result.name} (${id})`)
			return {
				success: true,
				data: result,
			}
		} else {
			throw new Error('Failed to update event')
		}
	} catch (error) {
		console.error('Error in updateEventAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update event',
		}
	}
}

/**
 * Server action to get an organizer by ID (admin only)
 */
export async function getOrganizerByIdAction(id: string): Promise<{
	data?: Organizer
	error?: string
	success: boolean
}> {
	try {
		const adminUser = await checkAdminAccess()

		if (adminUser === null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		if (!id || typeof id !== 'string') {
			return {
				success: false,
				error: 'Valid organizer ID is required',
			}
		}

		const organizer = await fetchOrganizerById(id)

		if (organizer) {
			return {
				success: true,
				data: organizer,
			}
		} else {
			return {
				success: false,
				error: 'Organizer not found',
			}
		}
	} catch (error) {
		console.error('Error in getOrganizerByIdAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch organizer',
		}
	}
}

/**
 * Server action to update an organizer (admin only)
 */
export async function updateOrganizerAction(
	id: string,
	formData: FormData
): Promise<{
	data?: Organizer
	error?: string
	success: boolean
}> {
	try {
		const adminUser = await checkAdminAccess()

		if (adminUser === null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		if (!id || typeof id !== 'string') {
			return {
				success: false,
				error: 'Valid organizer ID is required',
			}
		}

		// Extract data from FormData
		const name = formData.get('name') as string
		const email = formData.get('email') as string
		const website = formData.get('website') as string
		const isPartnered = formData.get('isPartnered') === 'true'
		const logoFile = formData.get('logoFile') as File | null

		// Validate required fields
		if (!name || !email) {
			return {
				success: false,
				error: 'Name and email are required',
			}
		}

		// Prepare organizer data for update
		const organizerData = {
			email,
			isPartnered,
			logoFile: logoFile ?? undefined,
			name,
			website: website ?? undefined,
		}

		// Update the organizer with PocketBase service
		const result = await updateOrganizer(id, organizerData)

		if (result !== null) {
			console.info(`Admin ${adminUser.email} updated organizer: ${result.name} (${id})`)
			return {
				success: true,
				data: result,
			}
		} else {
			throw new Error('Failed to update organizer')
		}
	} catch (error) {
		console.error('Error in updateOrganizerAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update organizer',
		}
	}
}

/**
 * Server action to delete an event by ID (admin only)
 */
export async function deleteEventAction(id: string): Promise<{ success: boolean; error?: string }> {
	try {
		const adminUser = await checkAdminAccess()

		if (adminUser === null) {
			return { success: false, error: 'Unauthorized: Admin access required' }
		}

		if (!id || typeof id !== 'string') {
			return { success: false, error: 'Valid event ID is required' }
		}

		await deleteEventById(id)
		console.info(`Admin ${adminUser.email} deleted event: ${id}`)
		return { success: true }
	} catch (error) {
		console.error('Error in deleteEventAction:', error)
		return { success: false, error: error instanceof Error ? error.message : 'Failed to delete event' }
	}
}
