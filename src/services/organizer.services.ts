import 'server-only'

import { pb } from '@/lib/services/pocketbase'
import type { Organizer } from '@/models/organizer.model'

/**
 * Create a new organizer
 * Uses multipart/form-data for file upload as per PocketBase documentation
 */
export async function createOrganizer(
	organizerData: Omit<Organizer, 'created' | 'id' | 'updated'> & { logoFile?: unknown }
): Promise<null | Organizer> {
	try {
		// Prepare form data for PocketBase (multipart/form-data) 📄
		const formData = new FormData()

		// Add required text fields ✅
		formData.append('name', organizerData.name)
		formData.append('email', organizerData.email)
		formData.append('isPartnered', String(organizerData.isPartnered))

		// Add optional fields only if they exist 🤔
		if (organizerData.website != null && organizerData.website !== undefined && organizerData.website.trim() !== '') {
			formData.append('website', organizerData.website.trim())
		}

		// Handle logo file upload - server-safe check
		if (organizerData.logoFile != null) {
			// COMPLETELY avoid using instanceof File - use only string checks
			const hasFileConstructorName =
				organizerData.logoFile != null &&
				typeof organizerData.logoFile === 'object' &&
				(organizerData.logoFile as Record<string, unknown>).constructor?.name === 'File'

			const hasStreamProperty =
				organizerData.logoFile != null &&
				typeof organizerData.logoFile === 'object' &&
				Object.hasOwn(organizerData.logoFile, 'stream')

			if (hasFileConstructorName || hasStreamProperty) {
				formData.append('logo', organizerData.logoFile as Blob)
			} else {
				console.warn('⚠️ [SERVICE] logoFile is not a proper File object, skipping file upload')
			}
		}

		// Create record using multipart/form-data 💾
		const record = await pb.collection('organizer').create(formData)

		const result = {
			website: (record.website as string) ?? null,
			updated: new Date(record.updated as string),
			name: record.name as string,
			logo: (record.logo as string) ?? null,
			isPartnered: record.isPartnered as boolean,
			id: record.id,
			email: record.email as string,
			created: new Date(record.created as string),
		}

		return result
	} catch (error) {
		console.error('💥 [SERVICE] Error creating organizer:', error)
		console.error('📍 [SERVICE] Stack trace:', error instanceof Error ? error.stack : 'No stack available')
		return null
	}
}

/**
 * Delete organizer
 */
export async function deleteOrganizer(id: string): Promise<boolean> {
	try {
		await pb.collection('organizer').delete(id)
		return true
	} catch (error) {
		console.error('Error deleting organizer:', error)
		return false
	}
}

/**
 * Delete logo file from an organizer
 * @param id - The organizer ID
 * @returns Success status
 */
export async function deleteOrganizerLogo(id: string): Promise<boolean> {
	try {
		// Set logo field to empty array to delete the file 🗑️
		await pb.collection('organizer').update(id, {
			logo: [],
		})
		return true
	} catch (error) {
		console.error('Error deleting organizer logo:', error)
		return false
	}
}

/**
 * Fetch all organizers
 */
export async function fetchAllOrganizers(): Promise<Organizer[]> {
	try {
		const records = await pb.collection('organizer').getFullList({
			sort: 'name',
		})

		return records.map(record => ({
			website: (record.website as string) ?? null,
			updated: new Date(record.updated as string),
			name: record.name as string,
			logo: (record.logo as string) ?? null,
			isPartnered: record.isPartnered as boolean,
			id: record.id,
			email: record.email as string,
			created: new Date(record.created as string),
		}))
	} catch (error) {
		console.error('Error fetching organizers:', error)
		return []
	}
}

/**
 * Fetch all organizers with their events count
 */
export async function fetchAllOrganizersWithEventsCount(): Promise<(Organizer & { eventsCount: number })[]> {
	try {
		const records = await pb.collection('organizer').getFullList({
			sort: 'name',
			expand: 'events_via_organizer',
		})

		return records.map(record => ({
			website: (record.website as string) ?? null,
			updated: new Date(record.updated as string),
			name: record.name as string,
			logo: (record.logo as string) ?? null,
			isPartnered: record.isPartnered as boolean,
			id: record.id,
			eventsCount:
				record.expand?.events_via_organizer != null &&
				record.expand?.events_via_organizer !== undefined &&
				Array.isArray(record.expand.events_via_organizer)
					? record.expand.events_via_organizer.length
					: 0,
			email: record.email as string,
			created: new Date(record.created as string),
		}))
	} catch (error) {
		console.error('Error fetching organizers with events count:', error)
		return []
	}
}

/**
 * Fetch organizer by ID
 */
export async function fetchOrganizerById(id: string): Promise<null | Organizer> {
	try {
		if (!id || id === '') {
			return null
		}

		const record = await pb.collection('organizer').getOne(id)

		return {
			website: (record.website as string) ?? null,
			updated: new Date(record.updated as string),
			name: record.name as string,
			logo: (record.logo as string) ?? null,
			isPartnered: record.isPartnered as boolean,
			id: record.id,
			email: record.email as string,
			created: new Date(record.created as string),
		}
	} catch (error) {
		// Only log error if it's not a "not found" error
		if (
			error != null &&
			error !== undefined &&
			typeof error === 'object' &&
			'status' in error &&
			(error as { status?: number }).status !== 404
		) {
			console.error('Error fetching organizer by ID:', error)
		}
		return null
	}
}

/**
 * Fetch partnered organizers only
 */
export async function fetchPartneredOrganizers(): Promise<Organizer[]> {
	try {
		const records = await pb.collection('organizer').getFullList({
			sort: 'name',
			filter: 'isPartnered = true',
		})

		return records.map(record => ({
			website: (record.website as string) ?? null,
			updated: new Date(record.updated as string),
			name: record.name as string,
			logo: (record.logo as string) ?? null,
			isPartnered: record.isPartnered as boolean,
			id: record.id,
			email: record.email as string,
			created: new Date(record.created as string),
		}))
	} catch (error) {
		console.error('Error fetching partnered organizers:', error)
		return []
	}
}

/**
 * Update organizer
 */
export async function updateOrganizer(
	id: string,
	organizerData: Partial<Omit<Organizer, 'created' | 'id' | 'updated'>> & { logoFile?: unknown }
): Promise<null | Organizer> {
	try {
		// Check if we have a file to upload - server-safe check (NO instanceof File)
		const hasFile =
			organizerData.logoFile != null &&
			typeof organizerData.logoFile === 'object' &&
			(Object.hasOwn(organizerData.logoFile, 'stream') ||
				(organizerData.logoFile as Record<string, unknown>).constructor?.name === 'File')

		if (hasFile) {
			const formData = new FormData()

			// Add text fields if provided ✅
			if (organizerData.name != null && organizerData.name !== undefined) {
				formData.append('name', organizerData.name)
			}
			if (organizerData.email != null && organizerData.email !== undefined) {
				formData.append('email', organizerData.email)
			}
			if (organizerData.isPartnered !== undefined) {
				formData.append('isPartnered', String(organizerData.isPartnered))
			}
			if (organizerData.website != null && organizerData.website !== undefined && organizerData.website.trim() !== '') {
				formData.append('website', organizerData.website.trim())
			}

			// Add logo file 🖼️
			formData.append('logo', organizerData.logoFile as Blob)

			const record = await pb.collection('organizer').update(id, formData)

			return {
				website: (record.website as string) ?? null,
				updated: new Date(record.updated as string),
				name: record.name as string,
				logo: (record.logo as string) ?? null,
				isPartnered: record.isPartnered as boolean,
				id: record.id,
				email: record.email as string,
				created: new Date(record.created as string),
			}
		} else {
			// For updates without files, use regular JSON 📄
			const dataForUpdate = { ...organizerData }
			delete dataForUpdate.logoFile
			const record = await pb.collection('organizer').update(id, dataForUpdate)

			return {
				website: (record.website as string) ?? null,
				updated: new Date(record.updated as string),
				name: record.name as string,
				logo: (record.logo as string) ?? null,
				isPartnered: record.isPartnered as boolean,
				id: record.id,
				email: record.email as string,
				created: new Date(record.created as string),
			}
		}
	} catch (error) {
		console.error('Error updating organizer:', error)
		return null
	}
}
