import { Organizer } from '@/models/organizer.model'
import { pb } from '@/lib/pocketbaseClient'

/**
 * Create a new organizer
 * Uses multipart/form-data for file upload as per PocketBase documentation
 */
export async function createOrganizer(
	organizerData: Omit<Organizer, 'created' | 'id' | 'updated'> & { logoFile?: File }
): Promise<null | Organizer> {
	try {
		// Prepare form data for PocketBase (multipart/form-data) 📄
		const formData = new FormData()

		// Add required text fields ✅
		formData.append('name', organizerData.name)
		formData.append('email', organizerData.email)
		formData.append('isPartnered', String(organizerData.isPartnered))

		// Add optional fields only if they exist 🤔
		if (organizerData.website !== null && organizerData.website !== undefined && organizerData.website.trim() !== '') {
			formData.append('website', organizerData.website.trim())
		}

		// Handle logo file upload - PocketBase expects File instance for new uploads 🖼️
		if (organizerData.logoFile instanceof File) {
			formData.append('logo', organizerData.logoFile)
		}

		// Create record using multipart/form-data 💾
		const record = await pb.collection('organizer').create(formData)

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
		console.error('Error creating organizer:', error)
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
				record.expand?.events_via_organizer !== null &&
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
		if (error && typeof error === 'object' && 'status' in error && (error as any).status !== 404) {
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
 * Get logo URL for an organizer according to PocketBase file handling
 * @param organizer - The organizer record
 * @param thumbSize - Optional thumbnail size (e.g., '100x100', '200x0')
 * @returns The full URL to the logo file
 */
export function getOrganizerLogoUrl(organizer: Organizer, thumbSize?: string): null | string {
	if (organizer.logo === null || organizer.logo === undefined || organizer.logo === '') {
		return null
	}

	// Generate file URL using PocketBase pattern: 🔗
	// http://127.0.0.1:8090/api/files/COLLECTION_ID_OR_NAME/RECORD_ID/FILENAME 🌐
	const baseUrl = pb.baseUrl
	let url = `${baseUrl}/api/files/organizer/${organizer.id}/${organizer.logo}`

	// Add thumbnail parameter if specified 👍
	if (thumbSize !== null && thumbSize !== undefined && thumbSize !== '') {
		url += `?thumb=${thumbSize}`
	}

	return url
}

/**
 * Update organizer
 */
export async function updateOrganizer(
	id: string,
	organizerData: Partial<Omit<Organizer, 'created' | 'id' | 'updated'>> & { logoFile?: File }
): Promise<null | Organizer> {
	try {
		// For updates with file uploads, use FormData 📄
		if (organizerData.logoFile instanceof File) {
			const formData = new FormData()

			// Add text fields if provided ✅
			if (organizerData.name !== null && organizerData.name !== undefined) {
				formData.append('name', organizerData.name)
			}
			if (organizerData.email !== null && organizerData.email !== undefined) {
				formData.append('email', organizerData.email)
			}
			if (organizerData.isPartnered !== undefined) {
				formData.append('isPartnered', String(organizerData.isPartnered))
			}
			if (
				organizerData.website !== null &&
				organizerData.website !== undefined &&
				organizerData.website.trim() !== ''
			) {
				formData.append('website', organizerData.website.trim())
			}

			// Add logo file 🖼️
			formData.append('logo', organizerData.logoFile)

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
