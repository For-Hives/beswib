'use server'

import { auth } from '@clerk/nextjs/server'

import type { EventCreationRequest } from '@/models/eventCreationRequest.model'

import { createEventCreationRequest } from '@/services/eventCreationRequest.services'
import { fetchUserByClerkId } from '@/services/user.services'

export async function handleCreateEventCreationRequest(formData: FormData): Promise<{
	data?: EventCreationRequest
	error?: string
	success: boolean
}> {
	try {
		const { userId: clerkId } = await auth()

		if (clerkId == null || clerkId === '') {
			return {
				success: false,
				error: 'Authentication required.',
			}
		}

		const user = await fetchUserByClerkId(clerkId)
		if (!user) {
			return {
				success: false,
				error: 'User not found.',
			}
		}

		// Extract form data
		const name = formData.get('name') as string
		const location = formData.get('location') as string
		const eventDate = formData.get('eventDate') as string
		const message = formData.get('message') as string

		// Validate required fields
		if (!name || name.trim() === '') {
			return {
				success: false,
				error: 'Event name is required.',
			}
		}

		if (!location || location.trim() === '') {
			return {
				success: false,
				error: 'Event location is required.',
			}
		}

		if (!eventDate || eventDate.trim() === '') {
			return {
				success: false,
				error: 'Event date is required.',
			}
		}

		// Validate date format and ensure it's not in the past
		const parsedDate = new Date(eventDate)
		if (Number.isNaN(parsedDate.getTime())) {
			return {
				success: false,
				error: 'Invalid date format.',
			}
		}

		const today = new Date()
		today.setHours(0, 0, 0, 0)
		if (parsedDate < today) {
			return {
				success: false,
				error: 'Event date cannot be in the past.',
			}
		}

		// Create the event creation request
		const eventCreationRequestData: Omit<EventCreationRequest, 'created' | 'id' | 'updated'> = {
			userId: user.id,
			status: 'waiting',
			name: name.trim(),
			message: message?.trim() || '',
			location: location.trim(),
			eventDate: parsedDate,
		}

		const result = await createEventCreationRequest(eventCreationRequestData)

		if (result) {
			return {
				success: true,
				data: result,
			}
		} else {
			return {
				success: false,
				error: 'Failed to create event creation request.',
			}
		}
	} catch (error) {
		console.error('Error in handleCreateEventCreationRequest:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred.',
		}
	}
}
