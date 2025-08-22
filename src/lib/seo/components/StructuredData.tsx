import type { Locale } from '@/lib/i18n/config'
import type { Event } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'

import { generateEventStructuredData } from '../utils/seo-generators'

// Organization schema for Beswib
export function OrganizationSchema() {
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Beswib',
		url: 'https://beswib.com',
		logo: {
			'@type': 'ImageObject',
			url: 'https://beswib.com/beswib.svg',
			width: 200,
			height: 50,
		},
		description: 'Safe and secure race bib transfer marketplace for running, trail, triathlon and cycling events.',
		foundingDate: '2023',
		founder: {
			'@type': 'Organization',
			name: 'Beswib Team',
		},
		address: {
			'@type': 'PostalAddress',
			addressCountry: 'FR',
		},
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'customer service',
			email: 'support@beswib.com',
			availableLanguage: ['en', 'fr', 'es', 'it', 'de', 'ro', 'pt', 'nl', 'ko'],
		},
		sameAs: [
			'https://twitter.com/beswib',
			'https://instagram.com/beswib',
			'https://linkedin.com/company/beswib',
		],
		serviceType: 'Race Bib Transfer Marketplace',
		areaServed: {
			'@type': 'Country',
			name: 'Worldwide',
		},
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Website schema
export function WebsiteSchema({ locale }: { locale: Locale }) {
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Beswib',
		url: `https://beswib.com${locale === 'en' ? '' : `/${locale}`}`,
		description: 'Transfer race bibs safely. Buy and sell running, trail, triathlon and cycling race bibs.',
		inLanguage: locale,
		publisher: {
			'@type': 'Organization',
			name: 'Beswib',
		},
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `https://beswib.com${locale === 'en' ? '' : `/${locale}`}/events?search={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Event schema
export function EventSchema({
	locale,
	event,
	organizer,
}: {
	locale: Locale
	event: Event
	organizer?: Organizer
}) {
	const schema = generateEventStructuredData(locale, event)

	// Add organizer information if available
	if (organizer) {
		schema.organizer = {
			'@type': 'Organization',
			name: organizer.name,
			url: organizer.website || undefined,
		}
	}

	// Add offer information for bib transfer
	schema.offers = {
		'@type': 'Offer',
		description: 'Race bib transfer service',
		priceCurrency: 'EUR',
		availability: 'https://schema.org/InStock',
		validFrom: new Date().toISOString(),
		...(event.transferDeadline && {
			validThrough: new Date(event.transferDeadline).toISOString(),
		}),
		...(event.officialStandardPrice &&
			event.officialStandardPrice > 0 && {
				price: event.officialStandardPrice,
			}),
		seller: {
			'@type': 'Organization',
			name: 'Beswib',
		},
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Breadcrumb schema
export function BreadcrumbSchema({
	locale,
	items,
}: {
	locale: Locale
	items: Array<{ name: string; item: string }>
}) {
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((breadcrumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: breadcrumb.name,
			item: `https://beswib.com${locale === 'en' ? '' : `/${locale}`}${breadcrumb.item}`,
		})),
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// FAQ schema
export function FAQSchema({
	faqs,
}: {
	faqs: Array<{ question: string; answer: string }>
}) {
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map(faq => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer,
			},
		})),
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Service schema for race bib transfer marketplace
export function ServiceSchema({ locale }: { locale: Locale }) {
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: 'Race Bib Transfer Service',
		description: 'Safe and secure transfer of race bibs for running, trail, triathlon and cycling events.',
		provider: {
			'@type': 'Organization',
			name: 'Beswib',
			url: 'https://beswib.com',
		},
		serviceType: 'Race Bib Transfer',
		category: 'Sports & Recreation',
		areaServed: {
			'@type': 'Country',
			name: 'Worldwide',
		},
		availableChannel: {
			'@type': 'ServiceChannel',
			availableLanguage: ['en', 'fr', 'es', 'it', 'de', 'ro', 'pt', 'nl', 'ko'],
			processingTime: 'P1D', // 1 day processing time
			serviceUrl: `https://beswib.com${locale === 'en' ? '' : `/${locale}`}`,
		},
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Race Bib Marketplace',
			itemListElement: {
				'@type': 'Offer',
				itemOffered: {
					'@type': 'Service',
					name: 'Race Bib Transfer',
				},
			},
		},
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Combined structured data component for easy usage
export function StructuredData({
	locale,
	type,
	event,
	organizer,
	breadcrumbs,
	faqs,
}: {
	locale: Locale
	type: 'home' | 'events' | 'event' | 'marketplace' | 'faq' | 'legal'
	event?: Event
	organizer?: Organizer
	breadcrumbs?: Array<{ name: string; item: string }>
	faqs?: Array<{ question: string; answer: string }>
}) {
	return (
		<>
			{/* Always include organization and website schemas */}
			<OrganizationSchema />
			<WebsiteSchema locale={locale} />

			{/* Type-specific schemas */}
			{type === 'home' && <ServiceSchema locale={locale} />}

			{type === 'event' && event && (
				<EventSchema locale={locale} event={event} organizer={organizer} />
			)}

			{type === 'faq' && faqs && <FAQSchema faqs={faqs} />}

			{/* Breadcrumbs if provided */}
			{breadcrumbs && breadcrumbs.length > 0 && (
				<BreadcrumbSchema locale={locale} items={breadcrumbs} />
			)}
		</>
	)
}
