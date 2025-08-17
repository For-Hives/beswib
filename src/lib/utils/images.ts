/**
 * Utility functions for handling images with fallbacks
 */

import type { Organizer } from '@/models/organizer.model'

import { getOrganizerLogoUrl } from '@/services/organizer.services'

// Available placeholder bib images
const BIB_PLACEHOLDERS = [
	'/bib-blue.png',
	'/bib-green.png',
	'/bib-orange.png',
	'/bib-pink.png',
	'/bib-red.png',
] as const

/**
 * Gets a random bib placeholder image
 * @param seed Optional seed for consistent randomness (e.g., use bib.id)
 */
export function getRandomBibPlaceholder(seed?: string): string {
	if (seed) {
		// Use seed to get consistent random image for the same seed
		let hash = 0
		for (let i = 0; i < seed.length; i++) {
			const char = seed.charCodeAt(i)
			hash = (hash << 5) - hash + char
			hash = hash & hash // Convert to 32-bit integer
		}
		const index = Math.abs(hash) % BIB_PLACEHOLDERS.length
		return BIB_PLACEHOLDERS[index]
	}

	// True random selection
	const index = Math.floor(Math.random() * BIB_PLACEHOLDERS.length)
	return BIB_PLACEHOLDERS[index]
}

/**
 * Gets the organizer logo URL with fallback to bib placeholder
 * @param organizer The organizer object (must have id for proper URL generation)
 * @param seed Optional seed for consistent placeholder selection
 */
export function getOrganizerImageUrl(organizer?: Organizer | { logo?: string; id?: string }, seed?: string): string {
	// If organizer has logo and id, use the proper PocketBase URL function
	if (organizer?.logo && organizer.id) {
		try {
			const url = getOrganizerLogoUrl(organizer as Organizer)
			if (url) {
				return url
			}
		} catch (error) {
			console.warn('Failed to generate organizer logo URL:', error)
		}
	}

	// Fallback to random bib placeholder
	return getRandomBibPlaceholder(seed)
}

/**
 * Gets the event image URL with fallback to organizer logo or bib placeholder
 * @param event Event object with potential image and organizer
 * @param seed Optional seed for consistent placeholder selection
 */
export function getEventImageUrl(
	event?: {
		image?: string
		imageUrl?: string
		expand?: {
			organizer?: Organizer | { logo?: string; id?: string }
		}
	},
	seed?: string
): string {
	// Priority 1: Event has its own image
	if (event?.image) {
		return `/api/files/events/${event.image}`
	}

	// Priority 2: Event has imageUrl field
	if (event?.imageUrl) {
		return event.imageUrl
	}

	// Priority 3: Use organizer logo
	if (event?.expand?.organizer?.logo) {
		return getOrganizerImageUrl(event.expand.organizer, seed)
	}

	// Fallback: Random bib placeholder
	return getRandomBibPlaceholder(seed)
}

/**
 * Gets the bib image URL through its event's organizer with fallback
 * @param bib Bib object with expanded event data
 * @param seed Optional seed for consistent placeholder selection (defaults to bib.id)
 */
export function getBibImageUrl(bib?: {
	id?: string
	expand?: {
		eventId?: {
			image?: string
			imageUrl?: string
			expand?: {
				organizer?: Organizer | { logo?: string; id?: string }
			}
		}
	}
}): string {
	const seed = bib?.id || 'default'
	return getEventImageUrl(bib?.expand?.eventId, seed)
}
