/**
 * Image URL utilities for PocketBase files
 * Generates absolute URLs based on environment (staging vs production)
 */

import type { ImageWithAlt } from '@/models/imageWithAlt.model'

/**
 * Get the base URL for PocketBase API based on environment
 * Uses NEXT_PUBLIC_POCKETBASE_URL to determine staging vs production
 */
export function getPocketBaseUrl(): string {
	const url = process.env.NEXT_PUBLIC_POCKETBASE_URL

	// If URL is provided, use it
	if (url) {
		return url
	}

	// Fallback to staging (this should never happen in production)
	console.warn('NEXT_PUBLIC_POCKETBASE_URL not set, defaulting to staging')
	return 'https://api.staging.beswib.com'
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
	const url = process.env.NEXT_PUBLIC_POCKETBASE_URL
	return url?.includes('api.beswib.com') === true && !url?.includes('staging')
}

/**
 * Generate absolute URL for a PocketBase file
 * @param record The PocketBase record containing the file
 * @param filename The filename from the record
 * @returns Absolute URL to the file
 */
export function getImageUrl(
	record: { id: string; collectionId?: string; collectionName?: string },
	filename: string
): string {
	const baseUrl = getPocketBaseUrl()
	const collectionId = record.collectionId || record.collectionName || ''

	// PocketBase file URL format: {baseUrl}/api/files/{collectionId}/{recordId}/{filename}
	return `${baseUrl}/api/files/${collectionId}/${record.id}/${filename}`
}

/**
 * Generate absolute URL for an image with alt record
 * @param imageWithAlt The ImageWithAlt record
 * @returns Absolute URL to the image or null if no image exists
 */
export function getImageWithAltUrl(imageWithAlt: ImageWithAlt): string | null {
	if (!imageWithAlt.image) {
		return null
	}

	return getImageUrl(imageWithAlt, imageWithAlt.image)
}

/**
 * Generate absolute URL for an article's image
 * @param article Article with expanded image relation
 * @param convertForOG Whether to convert the image for OpenGraph compatibility (converts WebP to PNG)
 * @param host Optional host for absolute URL (required when convertForOG is true)
 * @param protocol Optional protocol for absolute URL (required when convertForOG is true)
 * @returns Absolute URL to the image or null if no image exists
 */
export function getArticleImageUrl(
	article: {
		expand?: {
			image?: ImageWithAlt
		}
	},
	convertForOG = false,
	host?: string,
	protocol?: string
): string | null {
	if (!article.expand?.image?.image) {
		return null
	}

	const imageUrl = getImageUrl(article.expand.image, article.expand.image.image)

	// If we need to convert for OpenGraph and the image is WebP, use our conversion API
	// This is because @vercel/og (Satori) doesn't support WebP format
	if (convertForOG && imageUrl.endsWith('.webp')) {
		if (!host || !protocol) {
			console.warn('Host and protocol are required for OG image conversion')
			return null
		}
		// Use our conversion API to convert WebP to PNG
		return `${protocol}://${host}/api/convert-image?url=${encodeURIComponent(imageUrl)}`
	}

	return imageUrl
}
