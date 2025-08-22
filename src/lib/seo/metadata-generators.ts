import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n/config'
import type { Event } from '@/models/event.model'

import { SEO_TITLES, SEO_DESCRIPTIONS, SEO_KEYWORDS } from './constants/seo-translations'
import {
	generateEventKeywords,
	generateEventTitle,
	generateEventDescription,
	generateOGImageConfig,
	generateCanonicalUrl,
	generateAlternateLanguages,
} from './utils/seo-generators'

// Base metadata configuration for all pages
export function generateBaseMetadata(locale: Locale): Metadata {
	const titles = SEO_TITLES[locale]
	const descriptions = SEO_DESCRIPTIONS[locale]
	const keywords = SEO_KEYWORDS[locale]

	return {
		metadataBase: new URL('https://beswib.com'),
		title: {
			template: `%s | ${titles.site}`,
			default: titles.home,
		},
		description: descriptions.home,
		keywords: keywords.global.join(', '),
		authors: [{ name: 'Beswib Team' }],
		creator: 'Beswib',
		publisher: 'Beswib',
		category: 'Sports & Recreation',
		classification: 'Race Bib Marketplace',
		referrer: 'origin-when-cross-origin',
		colorScheme: 'light dark',
		themeColor: [
			{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
			{ media: '(prefers-color-scheme: dark)', color: '#000000' },
		],
		verification: {
			google: 'your-google-verification-code',
			yandex: 'your-yandex-verification-code',
			yahoo: 'your-yahoo-verification-code',
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1,
			},
		},
		formatDetection: {
			telephone: false,
			email: false,
			address: false,
		},
		alternates: {
			canonical: generateCanonicalUrl(locale, '/'),
			languages: generateAlternateLanguages('/'),
		},
		openGraph: {
			type: 'website',
			locale: locale.replace('-', '_'),
			url: generateCanonicalUrl(locale, '/'),
			title: titles.home,
			description: descriptions.home,
			siteName: titles.site,
			images: [generateOGImageConfig()],
		},
		twitter: {
			card: 'summary_large_image',
			site: '@beswib',
			creator: '@beswib',
			title: titles.home,
			description: descriptions.home,
			images: [generateOGImageConfig()],
		},
	}
}

// Home page metadata
export function generateHomeMetadata(locale: Locale): Metadata {
	const baseMetadata = generateBaseMetadata(locale)
	const titles = SEO_TITLES[locale]
	const descriptions = SEO_DESCRIPTIONS[locale]

	return {
		...baseMetadata,
		title: titles.home,
		description: descriptions.home,
		alternates: {
			...baseMetadata.alternates,
			canonical: generateCanonicalUrl(locale, '/'),
			languages: generateAlternateLanguages('/'),
		},
		openGraph: {
			...baseMetadata.openGraph,
			title: titles.home,
			description: descriptions.home,
			url: generateCanonicalUrl(locale, '/'),
		},
		twitter: {
			...baseMetadata.twitter,
			title: titles.home,
			description: descriptions.home,
		},
	}
}

// Events listing page metadata
export function generateEventsMetadata(locale: Locale): Metadata {
	const baseMetadata = generateBaseMetadata(locale)
	const titles = SEO_TITLES[locale]
	const descriptions = SEO_DESCRIPTIONS[locale]

	return {
		...baseMetadata,
		title: titles.events,
		description: descriptions.events,
		alternates: {
			...baseMetadata.alternates,
			canonical: generateCanonicalUrl(locale, '/events'),
			languages: generateAlternateLanguages('/events'),
		},
		openGraph: {
			...baseMetadata.openGraph,
			title: titles.events,
			description: descriptions.events,
			url: generateCanonicalUrl(locale, '/events'),
		},
		twitter: {
			...baseMetadata.twitter,
			title: titles.events,
			description: descriptions.events,
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
		title: eventTitle,
		description: eventDescription,
		keywords: eventKeywords,
		alternates: {
			...baseMetadata.alternates,
			canonical: generateCanonicalUrl(locale, eventPath),
			languages: generateAlternateLanguages(eventPath),
		},
		openGraph: {
			...baseMetadata.openGraph,
			type: 'article',
			title: eventTitle,
			description: eventDescription,
			url: generateCanonicalUrl(locale, eventPath),
			images: [generateOGImageConfig(event)],
			article: {
				publishedTime: new Date(event.eventDate).toISOString(),
				section: 'Sports Events',
				tags: eventKeywords.split(', '),
			},
		},
		twitter: {
			...baseMetadata.twitter,
			title: eventTitle,
			description: eventDescription,
			images: [generateOGImageConfig(event)],
		},
		other: {
			'event:type': 'sports_event',
			'event:start_time': new Date(event.eventDate).toISOString(),
			'event:end_time': new Date(event.eventDate).toISOString(),
			'event:location': event.location,
			...(event.distanceKm &&
				event.distanceKm > 0 && {
					'event:distance': `${event.distanceKm}km`,
				}),
			...(event.elevationGainM &&
				event.elevationGainM > 0 && {
					'event:elevation': `${event.elevationGainM}m`,
				}),
			...(event.participants &&
				event.participants > 0 && {
					'event:capacity': event.participants.toString(),
				}),
		},
	}
}

// Marketplace page metadata
export function generateMarketplaceMetadata(locale: Locale): Metadata {
	const baseMetadata = generateBaseMetadata(locale)
	const titles = SEO_TITLES[locale]
	const descriptions = SEO_DESCRIPTIONS[locale]

	return {
		...baseMetadata,
		title: titles.marketplace,
		description: descriptions.marketplace,
		alternates: {
			...baseMetadata.alternates,
			canonical: generateCanonicalUrl(locale, '/marketplace'),
			languages: generateAlternateLanguages('/marketplace'),
		},
		openGraph: {
			...baseMetadata.openGraph,
			title: titles.marketplace,
			description: descriptions.marketplace,
			url: generateCanonicalUrl(locale, '/marketplace'),
		},
		twitter: {
			...baseMetadata.twitter,
			title: titles.marketplace,
			description: descriptions.marketplace,
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
		title: pageTitle,
		description: descriptions.legal,
		alternates: {
			...baseMetadata.alternates,
			canonical: generateCanonicalUrl(locale, legalPath),
			languages: generateAlternateLanguages(legalPath),
		},
		openGraph: {
			...baseMetadata.openGraph,
			title: pageTitle,
			description: descriptions.legal,
			url: generateCanonicalUrl(locale, legalPath),
		},
		twitter: {
			...baseMetadata.twitter,
			title: pageTitle,
			description: descriptions.legal,
		},
		robots: {
			index: true,
			follow: true,
		},
	}
}

// FAQ page metadata
export function generateFAQMetadata(locale: Locale): Metadata {
	const baseMetadata = generateBaseMetadata(locale)
	const faqTitle = `FAQ | ${SEO_TITLES[locale].site}`
	const faqDescription = SEO_DESCRIPTIONS[locale].home

	return {
		...baseMetadata,
		title: faqTitle,
		description: faqDescription,
		alternates: {
			...baseMetadata.alternates,
			canonical: generateCanonicalUrl(locale, '/faq'),
			languages: generateAlternateLanguages('/faq'),
		},
		openGraph: {
			...baseMetadata.openGraph,
			title: faqTitle,
			description: faqDescription,
			url: generateCanonicalUrl(locale, '/faq'),
		},
		twitter: {
			...baseMetadata.twitter,
			title: faqTitle,
			description: faqDescription,
		},
	}
}

// Error page metadata
export function generateErrorMetadata(locale: Locale, errorType: '404' | '500' | 'error'): Metadata {
	const baseMetadata = generateBaseMetadata(locale)
	const errorTitles = {
		'404': 'Page Not Found',
		'500': 'Server Error',
		error: 'Error',
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
