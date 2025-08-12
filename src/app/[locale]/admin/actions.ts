'use server'

import { checkAdminAccess } from '@/guard/adminGuard'

import { createOrganizer, fetchAllOrganizersWithEventsCount } from '@/services/organizer.services'
import { getDashboardStats, getRecentActivity } from '@/services/dashboard.services'
import { createEvent, deleteEventById, getAllEvents } from '@/services/event.services'
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
export async function createOrganizerAction(
	organizerData: Omit<Organizer, 'created' | 'id' | 'updated'> & { logoFile?: File }
): Promise<{
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

		// Validate required fields
		if (!organizerData.name || !organizerData.email) {
			return {
				success: false,
				error: 'Name and email are required',
			}
		}

		// Prepare organizer data for creation
		const { logoFile, ...baseOrganizerData } = organizerData

		// Create the organizer with PocketBase service
		const result = await createOrganizer({
			...baseOrganizerData,
			logoFile: logoFile, // PocketBase service will handle the file upload
		})

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
