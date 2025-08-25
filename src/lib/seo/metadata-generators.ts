import type { Metadata } from 'next'

import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import {
	generateEventKeywords,
	generateEventTitle,
	generateEventDescription,
	generateOGImageConfig,
	generateCanonicalUrl,
	generateAlternateLanguages,
} from './utils/seo-generators'
import { SEO_TITLES, SEO_DESCRIPTIONS, SEO_KEYWORDS } from './constants/seo-translations'

// Base metadata configuration for all pages
export function generateBaseMetadata(locale: Locale): Metadata {
	// Fallback to English if locale not found
	const safeLocale = locale in SEO_TITLES ? locale : 'en'
	const titles = SEO_TITLES[safeLocale]
	const descriptions = SEO_DESCRIPTIONS[safeLocale]
	const keywords = SEO_KEYWORDS[safeLocale]

	return {
		twitter: {
			title: titles.home,
			site: '@beswib',
			images: [generateOGImageConfig()],
			description: descriptions.home,
			creator: '@beswib',
			card: 'summary_large_image',
		},
		title: {
			template: `%s | ${titles.site}`,
			default: titles.home,
		},
		robots: {
			index: true,
			googleBot: {
				'max-video-preview': -1,
				'max-snippet': -1,
				'max-image-preview': 'large',
				index: true,
				follow: true,
			},
			follow: true,
		},
		referrer: 'origin-when-cross-origin',
		publisher: 'Beswib',
		openGraph: {
			url: generateCanonicalUrl(locale, '/'),
			type: 'website',
			title: titles.home,
			siteName: titles.site,
			locale: locale.replace('-', '_'),
			images: [generateOGImageConfig()],
			description: descriptions.home,
		},
		metadataBase: new URL('https://beswib.com'),
		manifest: '/site.webmanifest',
		keywords: keywords.global.join(', '),
		icons: {
			shortcut: '/favicon.ico',
			icon: [
				{ url: '/favicon.ico', sizes: 'any' },
				{ url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
				{ url: '/favicon.svg', type: 'image/svg+xml' },
			],
			apple: {
				url: '/apple-touch-icon.png',
				type: 'image/png',
				sizes: '180x180',
			},
		},
		formatDetection: {
			telephone: false,
			email: false,
			address: false,
		},
		description: descriptions.home,
		creator: 'Beswib',
		classification: 'Race Bib Marketplace',
		category: 'Sports & Recreation',
		authors: [{ name: 'Beswib Team' }],
		alternates: {
			languages: generateAlternateLanguages('/'),
			canonical: generateCanonicalUrl(locale, '/'),
		},
	}
}

// Home page metadata
export function generateHomeMetadata(locale: Locale): Metadata {
	const baseMetadata = generateBaseMetadata(locale)

	// Vérification de sécurité pour éviter l'erreur undefined
	if (!SEO_TITLES[locale]?.home || !SEO_DESCRIPTIONS[locale]?.home) {
		console.error(`Missing SEO data for locale: ${locale}, falling back to 'en'`)
		locale = 'en' as Locale
	}

	const titles = SEO_TITLES[locale]
	const descriptions = SEO_DESCRIPTIONS[locale]

	// Vérification supplémentaire des clés requises
	if (!titles.home || !descriptions.home) {
		console.error(`Missing 'home' key for locale: ${locale}, using fallback`)
		return {
			...baseMetadata,
			title: 'Beswib | Transfer Race Bibs Safely',
			openGraph: {
				...baseMetadata.openGraph,
				title: 'Beswib | Transfer Race Bibs Safely',
				description: 'Transfer race bibs safely with Beswib, the trusted marketplace for athletes.',
			},
			description: 'Transfer race bibs safely with Beswib, the trusted marketplace for athletes.',
		}
	}

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: titles.home,
			description: descriptions.home,
		},
		title: titles.home,

		openGraph: {
			...baseMetadata.openGraph,
			url: generateCanonicalUrl(locale, '/'),
			title: titles.home,
			description: descriptions.home,
		},
		description: descriptions.home,
		alternates: {
			...baseMetadata.alternates,
			languages: generateAlternateLanguages('/'),
			canonical: generateCanonicalUrl(locale, '/'),
		},
	}
}

// Events listing page metadata
export function generateEventsMetadata(locale: Locale): Metadata {
	const baseMetadata = generateBaseMetadata(locale)

	// Vérification de sécurité pour éviter l'erreur undefined
	if (!SEO_TITLES[locale]?.events || !SEO_DESCRIPTIONS[locale]?.events) {
		console.error(`Missing SEO data for locale: ${locale}, falling back to 'en'`)
		locale = 'en' as Locale
	}

	const titles = SEO_TITLES[locale]
	const descriptions = SEO_DESCRIPTIONS[locale]

	// Vérification supplémentaire des clés requises
	if (!titles.events || !descriptions.events) {
		console.error(`Missing 'events' key for locale: ${locale}, using fallback`)
		return {
			...baseMetadata,
			title: 'Browse Running Events | Find Race Bibs for Trail, Marathon, Triathlon | Beswib',
			openGraph: {
				...baseMetadata.openGraph,
				url: generateCanonicalUrl(locale, '/events'),
				title: 'Browse Running Events | Find Race Bibs for Trail, Marathon, Triathlon | Beswib',
				description:
					'Discover and purchase race bibs for upcoming running, trail, triathlon and cycling events worldwide.',
			},
			description:
				'Discover and purchase race bibs for upcoming running, trail, triathlon and cycling events worldwide.',
			alternates: {
				...baseMetadata.alternates,
				languages: generateAlternateLanguages('/events'),
				canonical: generateCanonicalUrl(locale, '/events'),
			},
		}
	}

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: titles.events,
			description: descriptions.events,
		},
		title: titles.events,
		openGraph: {
			...baseMetadata.openGraph,
			url: generateCanonicalUrl(locale, '/events'),
			title: titles.events,
			description: descriptions.events,
		},
		description: descriptions.events,
		alternates: {
			...baseMetadata.alternates,
			languages: generateAlternateLanguages('/events'),
			canonical: generateCanonicalUrl(locale, '/events'),
		},
	}
}

// Single event page metadata
export function generateEventMetadata(locale: Locale, event: Event): Metadata {
	const baseMetadata = generateBaseMetadata(locale)
	const eventTitle = generateEventTitle(locale, event)
	const eventDescription = generateEventDescription(locale, event)
	const eventKeywords = generateEventKeywords(locale, event)
	const eventPath = `/events/${event.id}`

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: eventTitle,
			images: [generateOGImageConfig(event)],
			description: eventDescription,
		},
		title: eventTitle,
		other: {
			'event:type': 'sports_event',
			'event:start_time': new Date(event.eventDate).toISOString(),
			'event:location': event.location,
			'event:end_time': new Date(event.eventDate).toISOString(),
			...(event.distanceKm != null &&
				event.distanceKm !== undefined &&
				event.distanceKm > 0 && {
					'event:distance': `${event.distanceKm}km`,
				}),
			...(event.elevationGainM != null &&
				event.elevationGainM !== undefined &&
				event.elevationGainM > 0 && {
					'event:elevation': `${event.elevationGainM}m`,
				}),
			...(event.participants != null &&
				event.participants !== undefined &&
				event.participants > 0 && {
					'event:capacity': event.participants.toString(),
				}),
		},
		openGraph: {
			...baseMetadata.openGraph,
			url: generateCanonicalUrl(locale, eventPath),
			type: 'website',
			title: eventTitle,
			images: [generateOGImageConfig(event)],
			description: eventDescription,
		},
		keywords: eventKeywords,
		description: eventDescription,
		alternates: {
			...baseMetadata.alternates,
			languages: generateAlternateLanguages(eventPath),
			canonical: generateCanonicalUrl(locale, eventPath),
		},
	}
}

// Marketplace page metadata
export function generateMarketplaceMetadata(locale: Locale): Metadata {
	const baseMetadata = generateBaseMetadata(locale)

	// Vérification de sécurité pour éviter l'erreur undefined
	if (!SEO_TITLES[locale]?.marketplace || !SEO_DESCRIPTIONS[locale]?.marketplace) {
		console.error(`Missing SEO data for locale: ${locale}, falling back to 'en'`)
		locale = 'en' as Locale
	}

	const titles = SEO_TITLES[locale]
	const descriptions = SEO_DESCRIPTIONS[locale]

	// Vérification supplémentaire des clés requises
	if (!titles.marketplace || !descriptions.marketplace) {
		console.error(`Missing 'marketplace' key for locale: ${locale}, using fallback`)
		return {
			...baseMetadata,
			title: 'Marketplace | Buy & Sell Race Bibs | Running, Trail, Triathlon',
			openGraph: {
				...baseMetadata.openGraph,
				url: generateCanonicalUrl(locale, '/marketplace'),
				title: 'Marketplace | Buy & Sell Race Bibs | Running, Trail, Triathlon',
				description: 'Browse thousands of available race bibs from verified sellers on Beswib marketplace.',
			},
			description: 'Browse thousands of available race bibs from verified sellers on Beswib marketplace.',
			alternates: {
				...baseMetadata.alternates,
				languages: generateAlternateLanguages('/marketplace'),
				canonical: generateCanonicalUrl(locale, '/marketplace'),
			},
		}
	}

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: titles.marketplace,
			description: descriptions.marketplace,
		},
		title: titles.marketplace,
		openGraph: {
			...baseMetadata.openGraph,
			url: generateCanonicalUrl(locale, '/marketplace'),
			title: titles.marketplace,
			description: descriptions.marketplace,
		},
		description: descriptions.marketplace,
		alternates: {
			...baseMetadata.alternates,
			languages: generateAlternateLanguages('/marketplace'),
			canonical: generateCanonicalUrl(locale, '/marketplace'),
		},
	}
}

// Legal pages metadata
export function generateLegalMetadata(
	locale: Locale,
	pageType: 'terms' | 'privacy' | 'cookies' | 'legal-notice' | 'data-deletion',
	pageName: string
): Metadata {
	const baseMetadata = generateBaseMetadata(locale)
	const titles = SEO_TITLES[locale]
	const descriptions = SEO_DESCRIPTIONS[locale]
	const pageTitle = titles.legal(pageName)
	const legalPath = `/legals/${pageType}`

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: pageTitle,
			description: descriptions.legal,
		},
		title: pageTitle,
		openGraph: {
			...baseMetadata.openGraph,
			url: generateCanonicalUrl(locale, legalPath),
			title: pageTitle,
			description: descriptions.legal,
		},
		description: descriptions.legal,
		alternates: {
			...baseMetadata.alternates,
			languages: generateAlternateLanguages(legalPath),
			canonical: generateCanonicalUrl(locale, legalPath),
		},
	}
}

// FAQ page metadata
export function generateFAQMetadata(locale: Locale): Metadata {
	const baseMetadata = generateBaseMetadata(locale)

	// Vérification de sécurité pour éviter l'erreur undefined
	if (!SEO_TITLES[locale]?.site || !SEO_DESCRIPTIONS[locale]?.home) {
		console.error(`Missing SEO data for locale: ${locale}, falling back to 'en'`)
		locale = 'en' as Locale
	}

	const faqTitle = `FAQ | ${SEO_TITLES[locale].site}`
	const faqDescription = SEO_DESCRIPTIONS[locale].home

	// Vérification supplémentaire des clés requises
	if (!SEO_TITLES[locale].site || !SEO_DESCRIPTIONS[locale].home) {
		console.error(`Missing 'site' or 'home' key for locale: ${locale}, using fallback`)
		return {
			...baseMetadata,
			title: 'FAQ | Beswib - Legal Race Bib Transfers',
			openGraph: {
				...baseMetadata.openGraph,
				url: generateCanonicalUrl(locale, '/faq'),
				title: 'FAQ | Beswib - Legal Race Bib Transfers',
				description: 'Frequently asked questions about Beswib race bib marketplace.',
			},
			description: 'Frequently asked questions about Beswib race bib marketplace.',
			alternates: {
				...baseMetadata.alternates,
				languages: generateAlternateLanguages('/faq'),
				canonical: generateCanonicalUrl(locale, '/faq'),
			},
		}
	}

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: faqTitle,
			description: faqDescription,
		},
		title: faqTitle,
		openGraph: {
			...baseMetadata.openGraph,
			url: generateCanonicalUrl(locale, '/faq'),
			title: faqTitle,
			description: faqDescription,
		},
		description: faqDescription,
		alternates: {
			...baseMetadata.alternates,
			languages: generateAlternateLanguages('/faq'),
			canonical: generateCanonicalUrl(locale, '/faq'),
		},
	}
}

// Simple page metadata (contact, etc.)
export function generateSimplePageMetadata(
	locale: Locale,
	title: string,
	description: string,
	path: string = '/'
): Metadata {
	const baseMetadata = generateBaseMetadata(locale)
	const safeLocale = locale in SEO_TITLES ? locale : 'en'
	const siteTitle = SEO_TITLES[safeLocale].site

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: `${title} | ${siteTitle}`,
			description,
		},
		title: `${title} | ${siteTitle}`,
		openGraph: {
			...baseMetadata.openGraph,
			url: generateCanonicalUrl(locale, path),
			title: `${title} | ${siteTitle}`,
			description,
		},
		description,
		alternates: {
			...baseMetadata.alternates,
			languages: generateAlternateLanguages(path),
			canonical: generateCanonicalUrl(locale, path),
		},
	}
}

// Error page metadata
export function generateErrorMetadata(locale: Locale, errorType: '404' | '500' | 'error'): Metadata {
	const baseMetadata = generateBaseMetadata(locale)
	const errorTitles = {
		error: 'Error',
		'500': 'Server Error',
		'404': 'Page Not Found',
	}

	const errorTitle = `${errorTitles[errorType]} | ${SEO_TITLES[locale].site}`

	return {
		...baseMetadata,
		title: errorTitle,
		robots: {
			index: false,
			follow: false,
		},
	}
}
