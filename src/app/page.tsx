import type { Metadata } from 'next'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// Generate SEO metadata with hreflang alternates for all languages
export function generateMetadata(): Metadata {
	const baseUrl = 'https://beswib.com'
	const supportedLocales = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'ro', 'ko']

	return {
		title: 'Beswib - Transfer Race Bibs Safely',
		robots: {
			'max-video-preview': -1,
			'max-snippet': -1,
			'max-image-preview': 'large',
			index: true,
			follow: true,
		},
		description:
			'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
		alternates: {
			languages: Object.fromEntries(supportedLocales.map(locale => [locale, `${baseUrl}/${locale}`])),
		},
	}
}

export default async function RootPage() {
	const headersList = await headers()
	const acceptLanguage = headersList.get('accept-language') ?? 'en'

	// Extract preferred language from Accept-Language header
	const preferredLanguage = acceptLanguage.split(',')[0].split('-')[0]

	// Map browser languages to our supported locales
	const languageMap: Record<string, string> = {
		ro: 'ro',
		pt: 'pt',
		nl: 'nl',
		ko: 'ko',
		it: 'it',
		fr: 'fr',
		es: 'es',
		en: 'en',
		de: 'de',
		// Add more mappings as needed
	}

	// Use preferred language if supported, otherwise default to English
	const targetLocale = languageMap[preferredLanguage] || 'en'

	redirect(`/${targetLocale}`)
}
