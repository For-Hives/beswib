import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { SEO_KEYWORDS, SEO_TITLES } from '../constants/seo-translations'

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
	const titles = SEO_TITLES[locale]

	if (event.location) {
		return titles.eventWithLocation(event.name, event.location)
	}

	return titles.event(event.name)
}

// Generate SEO description for events
export function generateEventDescription(locale: Locale, event: Event): string {
	const keywords = SEO_KEYWORDS[locale]
	const raceType = keywords.raceTypes[event.typeCourse] ?? event.typeCourse

	let description = `${event.name} - ${raceType}`

	if (event.location) {
		description +=
			locale === 'ko'
				? ` ${event.location}에서`
				: ` ${locale === 'en' ? 'in' : locale === 'fr' ? 'à' : locale === 'es' ? 'en' : locale === 'it' ? 'a' : locale === 'de' ? 'in' : locale === 'ro' ? 'în' : locale === 'pt' ? 'em' : 'in'} ${event.location}`
	}

	// Add event date
	if (event.eventDate !== null && event.eventDate !== undefined) {
		const eventDate = new Date(event.eventDate)
		const formattedDate = eventDate.toLocaleDateString(locale, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
		description += ` ${locale === 'ko' ? '일시:' : locale === 'en' ? 'on' : locale === 'fr' ? 'le' : locale === 'es' ? 'el' : locale === 'it' ? 'il' : locale === 'de' ? 'am' : locale === 'ro' ? 'pe' : locale === 'pt' ? 'em' : locale === 'nl' ? 'op' : 'on'} ${formattedDate}`
	}

	// Add distance if available
	if (event.distanceKm !== null && event.distanceKm !== undefined && event.distanceKm > 0) {
		description += `. ${event.distanceKm}km ${locale === 'ko' ? '코스' : locale === 'en' ? 'course' : locale === 'fr' ? 'parcours' : locale === 'es' ? 'recorrido' : locale === 'it' ? 'percorso' : locale === 'de' ? 'Strecke' : locale === 'ro' ? 'traseu' : locale === 'pt' ? 'percurso' : locale === 'nl' ? 'parcours' : 'course'}`
	}

	// Add elevation if available
	if (event.elevationGainM !== null && event.elevationGainM !== undefined && event.elevationGainM > 0) {
		description += `. ${event.elevationGainM}m ${locale === 'ko' ? '고도 상승' : locale === 'en' ? 'elevation gain' : locale === 'fr' ? 'dénivelé' : locale === 'es' ? 'desnivel' : locale === 'it' ? 'dislivello' : locale === 'de' ? 'Höhenmeter' : locale === 'ro' ? 'denivelări' : locale === 'pt' ? 'desnível' : locale === 'nl' ? 'hoogteverschil' : 'elevation'}`
	}

	// Add event description if available
	if (event.description) {
		description += `. ${event.description}`
	}

	// Add call-to-action
	const buyAction = keywords.actions.buy
	const sellAction = keywords.actions.sell
	description += `. ${buyAction} ${locale === 'ko' ? '또는' : locale === 'en' ? 'or' : locale === 'fr' ? 'ou' : locale === 'es' ? 'o' : locale === 'it' ? 'o' : locale === 'de' ? 'oder' : locale === 'ro' ? 'sau' : locale === 'pt' ? 'ou' : locale === 'nl' ? 'of' : 'or'} ${sellAction} ${locale === 'ko' ? '빕을' : locale === 'en' ? 'race bibs' : locale === 'fr' ? 'dossards' : locale === 'es' ? 'dorsales' : locale === 'it' ? 'pettorali' : locale === 'de' ? 'Startnummern' : locale === 'ro' ? 'numere' : locale === 'pt' ? 'peitos' : locale === 'nl' ? 'startnummers' : 'bibs'} ${locale === 'ko' ? 'Beswib에서' : locale === 'en' ? 'on Beswib' : locale === 'fr' ? 'sur Beswib' : locale === 'es' ? 'en Beswib' : locale === 'it' ? 'su Beswib' : locale === 'de' ? 'bei Beswib' : locale === 'ro' ? 'pe Beswib' : locale === 'pt' ? 'no Beswib' : locale === 'nl' ? 'op Beswib' : 'on Beswib'}.`

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
