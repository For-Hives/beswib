import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import seoLocales from '../constants/seo-locales.json'

// Generate SEO keywords for events
export function generateEventKeywords(locale: Locale, event: Event): string {
	const localKeywords = seoLocales[locale].seo.keywords
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
	if (event.distanceKm !== null && event.distanceKm !== undefined && event.distanceKm > 0) {
		baseKeywords.push(`${event.distanceKm}km`)
		if (event.distanceKm <= 10) {
			baseKeywords.push('short distance')
		} else if (event.distanceKm >= 42) {
			baseKeywords.push('marathon')
		}
	}

	// Add elevation-based keywords
	if (event.elevationGainM !== null && event.elevationGainM !== undefined && event.elevationGainM > 0) {
		if (event.elevationGainM > 1000) {
			baseKeywords.push('mountain')
		}
	}

	return baseKeywords.join(', ')
}

// Generate SEO title for events
export function generateEventTitle(locale: Locale, event: Event): string {
	const titles = seoLocales[locale].seo.titles

	if (event.location) {
		return `${event.name} ${titles.eventWithLocation} ${event.location} | ${titles.event}`
	}

	return `${event.name} | ${titles.event}`
}

// Generate SEO description for events
export function generateEventDescription(locale: Locale, event: Event): string {
	const keywords = seoLocales[locale].seo.keywords
	const generators = seoLocales[locale].seo.generators
	const raceType = keywords.raceTypes[event.typeCourse] ?? event.typeCourse

	let description = `${event.name} - ${raceType}`

	if (event.location) {
		description += ` ${generators.prepositions.in} ${event.location}`
	}

	// Add event date
	if (event.eventDate !== null && event.eventDate !== undefined) {
		const eventDate = new Date(event.eventDate)
		const formattedDate = eventDate.toLocaleDateString(locale, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
		description += ` ${generators.prepositions.on} ${formattedDate}`
	}

	// Add distance if available
	if (event.distanceKm !== null && event.distanceKm !== undefined && event.distanceKm > 0) {
		description += `. ${event.distanceKm}km ${generators.course}`
	}

	// Add elevation if available
	if (event.elevationGainM !== null && event.elevationGainM !== undefined && event.elevationGainM > 0) {
		description += `. ${event.elevationGainM}m ${generators.elevation}`
	}

	// Add event description if available
	if (event.description) {
		description += `. ${event.description}`
	}

	// Add call-to-action
	const buyAction = keywords.actions.buy
	const sellAction = keywords.actions.sell
	description += `. ${buyAction} ${generators.or} ${sellAction} ${generators.raceBibs} ${generators.onBeswib}.`

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

// Generate canonical URL
export function generateCanonicalUrl(locale: Locale, path: string): string {
	const baseUrl = 'https://beswib.com'
	const localePath = locale === 'en' ? '' : `/${locale}`
	return `${baseUrl}${localePath}${path}`
}

// Generate alternate language links
export function generateAlternateLanguages(path: string): Record<string, string> {
	const languages = ['en', 'fr', 'es', 'it', 'de', 'ro', 'pt', 'nl', 'ko'] as const
	const alternates: Record<string, string> = {}

	languages.forEach(lang => {
		if (lang === 'en') {
			alternates[lang] = path
		} else {
			alternates[lang] = `/${lang}${path}`
		}
	})

	return alternates
}
