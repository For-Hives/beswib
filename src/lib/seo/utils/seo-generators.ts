import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { SEO_TITLES, SEO_KEYWORDS } from '../constants/seo-translations'

// Generate SEO keywords for events
export function generateEventKeywords(locale: Locale, event: Event): string {
	const localKeywords = SEO_KEYWORDS[locale]
	const baseKeywords = [...localKeywords.global] as string[]

	// Add event-specific keywords
	if (event.name) {
		baseKeywords.push(event.name.toLowerCase())
	}

	if (event.location) {
		baseKeywords.push(event.location.toLowerCase())
	}

	// Add race type specific keywords
	const raceTypeKeyword = localKeywords.raceTypes[event.typeCourse]
	if (raceTypeKeyword) {
		baseKeywords.push(raceTypeKeyword)
	}

	// Add distance-based keywords
	if (event.distanceKm != null && event.distanceKm !== undefined && event.distanceKm > 0) {
		baseKeywords.push(`${event.distanceKm}km`)
		if (event.distanceKm <= 10) {
			baseKeywords.push('short distance')
		} else if (event.distanceKm >= 42) {
			baseKeywords.push('marathon')
		}
	}

	// Add elevation-based keywords
	if (event.elevationGainM != null && event.elevationGainM !== undefined && event.elevationGainM > 0) {
		if (event.elevationGainM > 1000) {
			baseKeywords.push('mountain')
		}
	}

	return baseKeywords.join(', ')
}

// Generate SEO title for events
export function generateEventTitle(locale: Locale, event: Event): string {
	const titles = SEO_TITLES[locale]

	if (event.location) {
		return typeof titles.eventWithLocation === 'function'
			? titles.eventWithLocation(event.name, event.location)
			: `${event.name} in ${event.location} | ${typeof titles.event === 'function' ? titles.event(event.name) : titles.event}`
	}

	return typeof titles.event === 'function' ? titles.event(event.name) : `${event.name} | ${titles.site}`
}

// Generate SEO description for events
export function generateEventDescription(locale: Locale, event: Event): string {
	const keywords = SEO_KEYWORDS[locale]
	const raceType = keywords.raceTypes[event.typeCourse] ?? event.typeCourse

	let description = `${event.name} - ${raceType}`

	// Add location (only city name, not full address)
	if (event.location) {
		const cityName = event.location.split(',')[0]
		description += ` in ${cityName}`
	}

	// Add distance and elevation in compact format
	const details = []
	if (event.distanceKm != null && event.distanceKm !== undefined && event.distanceKm > 0) {
		details.push(`${event.distanceKm}km`)
	}
	if (event.elevationGainM != null && event.elevationGainM !== undefined && event.elevationGainM > 0) {
		details.push(`${event.elevationGainM}m elevation`)
	}
	if (details.length > 0) {
		description += `. ${details.join(', ')}`
	}

	// Add call-to-action
	const buyAction = keywords.actions.buy
	const sellAction = keywords.actions.sell
	description += `. ${buyAction} or ${sellAction} race bibs on Beswib.`

	// Ensure description stays under 160 characters
	if (description.length > 160) {
		description = description.substring(0, 157) + '...'
	}

	return description
}

// Generate Open Graph images configuration
export function generateOGImageConfig(
	event?: Event,
	customImage?: string
): {
	url: string
	width: number
	height: number
	alt: string
	type?: string
} {
	// TODO: OG IMAGE - Replace with actual event-specific image generation
	return {
		width: 1200,
		url: customImage ?? '/placeholder-og-image.jpg',
		type: 'image/jpeg',
		height: 630,
		alt: event ? `${event.name} - Race Bib Transfer` : 'Beswib - Race Bib Transfer',
	}
}

// Generate canonical URL - always include locale in path for consistency
export function generateCanonicalUrl(locale: Locale, path: string): string {
	const baseUrl = 'https://beswib.com'
	const localePath = `/${locale}`
	// Ensure path starts with / if not empty
	const cleanPath = path.startsWith('/') ? path : `/${path}`
	const fullPath = `${localePath}${cleanPath}`
	// Ensure trailing slash for consistency with Next.js routing
	const normalizedPath = fullPath.endsWith('/') ? fullPath : `${fullPath}/`
	return `${baseUrl}${normalizedPath}`
}

// Generate alternate language links with proper URLs and locale codes
export function generateAlternateLanguages(path: string): Record<string, string> {
	const baseUrl = 'https://beswib.com'
	const languages = [
		{ path: '/en', locale: 'en-US', code: 'en' },
		{ path: '/fr', locale: 'fr-FR', code: 'fr' },
		{ path: '/es', locale: 'es-ES', code: 'es' },
		{ path: '/it', locale: 'it-IT', code: 'it' },
		{ path: '/de', locale: 'de-DE', code: 'de' },
		{ path: '/ro', locale: 'ro-RO', code: 'ro' },
		{ path: '/pt', locale: 'pt-PT', code: 'pt' },
		{ path: '/nl', locale: 'nl-NL', code: 'nl' },
		{ path: '/ko', locale: 'ko-KR', code: 'ko' },
	] as const

	// Ensure path starts with / if not empty
	const cleanPath = path.startsWith('/') ? path : `/${path}`
	const alternates: Record<string, string> = {}

	// Add all language versions with proper trailing slashes
	languages.forEach(({ path: langPath, locale }) => {
		const fullPath = `${langPath}${cleanPath}`
		// Ensure trailing slash for consistency with Next.js routing
		const normalizedPath = fullPath.endsWith('/') ? fullPath : `${fullPath}/`
		alternates[locale] = `${baseUrl}${normalizedPath}`
	})

	// Add x-default pointing to English version for fallback
	const englishPath = `/en${cleanPath}`
	const normalizedEnglishPath = englishPath.endsWith('/') ? englishPath : `${englishPath}/`
	alternates['x-default'] = `${baseUrl}${normalizedEnglishPath}`

	return alternates
}
