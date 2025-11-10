'use server'

import { pb } from '@/lib/services/pocketbase'
import type { SEO } from '@/models/seo.model'

/**
 * Creates a new SEO record.
 * @param seoData Data for the new SEO record.
 */
export async function createSEO(seoData: Omit<SEO, 'id' | 'created' | 'updated'>): Promise<SEO | null> {
	try {
		const dataToCreate = {
			title: seoData.title ?? '',
			description: seoData.description ?? '',
		}

		const record = await pb.collection('seo').create<SEO>(dataToCreate)

		console.info('SEO record created successfully:', record.id)
		return record
	} catch (error: unknown) {
		console.error('PocketBase error details:', error)
		throw new Error(`Error creating SEO record: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Fetches a SEO record by its ID.
 * @param id The ID of the SEO record to fetch.
 */
export async function fetchSEOById(id: string): Promise<SEO | null> {
	try {
		const record = await pb.collection('seo').getOne<SEO>(id)
		return record
	} catch (error: unknown) {
		console.error('Error fetching SEO record with ID "%s":', id, error)
		return null
	}
}

/**
 * Updates a SEO record by its ID.
 * @param id The ID of the SEO record to update
 * @param seoData Partial data to update the SEO record with
 * @returns Updated SEO record if successful, null otherwise
 */
export async function updateSEOById(id: string, seoData: Partial<SEO>): Promise<SEO | null> {
	if (!id || typeof id !== 'string') {
		throw new Error('Valid SEO ID is required to update a SEO record')
	}

	try {
		const dataToUpdate: Record<string, unknown> = {}

		if (seoData.title !== undefined) dataToUpdate.title = seoData.title
		if (seoData.description !== undefined) dataToUpdate.description = seoData.description

		const record = await pb.collection('seo').update<SEO>(id, dataToUpdate)

		console.info('SEO record updated successfully:', record.id)
		return record
	} catch (error: unknown) {
		console.error('PocketBase error details:', error)
		throw new Error(`Error updating SEO record: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Deletes a SEO record by its ID.
 * @param id The ID of the SEO record to delete
 * @returns true if deletion succeeded, otherwise throws
 */
export async function deleteSEOById(id: string): Promise<boolean> {
	if (!id || typeof id !== 'string') {
		throw new Error('Valid SEO ID is required to delete a SEO record')
	}
	try {
		await pb.collection('seo').delete(id)
		return true
	} catch (error: unknown) {
		throw new Error(`Error deleting SEO record: ${error instanceof Error ? error.message : String(error)}`)
	}
}
