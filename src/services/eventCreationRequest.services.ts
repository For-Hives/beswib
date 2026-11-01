import 'server-only'

import { pb } from '@/lib/services/pocketbase'
import type { EventCreationRequest } from '@/models/eventCreationRequest.model'

/**
 * Fetches all event creation requests with optional filtering by status
 * @param status Optional status filter ('waiting', 'accepted', 'rejected')
 */
export async function fetchEventCreationRequests(
	status?: EventCreationRequest['status']
): Promise<EventCreationRequest[]> {
	try {
		const filter = status ? `status = "${status}"` : ''
		const records = await pb.collection('eventCreationRequests').getFullList<EventCreationRequest>({
			sort: '-created',
			filter: filter,
		})
		return records
	} catch (error: unknown) {
		throw new Error(`Error fetching event creation requests: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Gets the count of event creation requests by status
 */
export async function getEventCreationRequestsCount(): Promise<{
	accepted: number
	rejected: number
	total: number
	waiting: number
}> {
	try {
		// Get all requests 📥
		const allRequests = await pb.collection('eventCreationRequests').getFullList<EventCreationRequest>({
			fields: 'status',
		})

		const counts = {
			waiting: 0,
			total: allRequests.length,
			rejected: 0,
			accepted: 0,
		}

		// Count by status 📊
		allRequests.forEach(request => {
			counts[request.status]++
		})

		return counts
	} catch (error: unknown) {
		throw new Error(`Error counting event creation requests: ${error instanceof Error ? error.message : String(error)}`)
	}
}
