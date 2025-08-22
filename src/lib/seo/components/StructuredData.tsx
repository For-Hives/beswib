import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { generateEventStructuredData } from '../utils/seo-generators'

// Organization schema for Beswib
export function OrganizationSchema() {
	const schema = {
		url: 'https://beswib.com',
		serviceType: 'Race Bib Transfer Marketplace',
		sameAs: ['https://twitter.com/beswib', 'https://instagram.com/beswib', 'https://linkedin.com/company/beswib'],
		name: 'Beswib',
		logo: {
			width: 200,
			url: 'https://beswib.com/beswib.svg',
			height: 50,
			'@type': 'ImageObject',
		},
		foundingDate: '2023',
		founder: {
			name: 'Beswib Team',
			'@type': 'Organization',
		},
		description: 'Safe and secure race bib transfer marketplace for running, trail, triathlon and cycling events.',
		contactPoint: {
			email: 'support@beswib.com',
			contactType: 'customer service',
			availableLanguage: ['en', 'fr', 'es', 'it', 'de', 'ro', 'pt', 'nl', 'ko'],
			'@type': 'ContactPoint',
		},
		areaServed: {
			name: 'Worldwide',
			'@type': 'Country',
		},
		address: {
			addressCountry: 'FR',
			'@type': 'PostalAddress',
		},
		'@type': 'Organization',
		'@context': 'https://schema.org',
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Website schema
export function WebsiteSchema({ locale }: { locale: Locale }) {
	const schema = {
		url: `https://beswib.com${locale === 'en' ? '' : `/${locale}`}`,
		publisher: {
			name: 'Beswib',
			'@type': 'Organization',
		},
		potentialAction: {
			target: {
				urlTemplate: `https://beswib.com${locale === 'en' ? '' : `/${locale}`}/events?search={search_term_string}`,
				'@type': 'EntryPoint',
			},
			'query-input': 'required name=search_term_string',
			'@type': 'SearchAction',
		},
		name: 'Beswib',
		inLanguage: locale,
		description: 'Transfer race bibs safely. Buy and sell running, trail, triathlon and cycling race bibs.',
		'@type': 'WebSite',
		'@context': 'https://schema.org',
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Event schema
export function EventSchema({ organizer, locale, event }: { locale: Locale; event: Event; organizer?: Organizer }) {
	const schema = generateEventStructuredData(locale, event)

	// Add organizer information if available
	if (organizer) {
		schema.organizer = {
			url: organizer.website || undefined,
			name: organizer.name,
			'@type': 'Organization',
		}
	}

	// Add offer information for bib transfer
	schema.offers = {
		validFrom: new Date().toISOString(),
		priceCurrency: 'EUR',
		description: 'Race bib transfer service',
		availability: 'https://schema.org/InStock',
		'@type': 'Offer',
		...(event.transferDeadline && {
			validThrough: new Date(event.transferDeadline).toISOString(),
		}),
		...(event.officialStandardPrice &&
			event.officialStandardPrice > 0 && {
				price: event.officialStandardPrice,
			}),
		seller: {
			name: 'Beswib',
			'@type': 'Organization',
		},
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Breadcrumb schema
export function BreadcrumbSchema({ locale, items }: { locale: Locale; items: Array<{ name: string; item: string }> }) {
	const schema = {
		itemListElement: items.map((breadcrumb, index) => ({
			position: index + 1,
			name: breadcrumb.name,
			item: `https://beswib.com${locale === 'en' ? '' : `/${locale}`}${breadcrumb.item}`,
			'@type': 'ListItem',
		})),
		'@type': 'BreadcrumbList',
		'@context': 'https://schema.org',
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// FAQ schema
export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
	const schema = {
		mainEntity: faqs.map(faq => ({
			name: faq.question,
			acceptedAnswer: {
				text: faq.answer,
				'@type': 'Answer',
			},
			'@type': 'Question',
		})),
		'@type': 'FAQPage',
		'@context': 'https://schema.org',
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Service schema for race bib transfer marketplace
export function ServiceSchema({ locale }: { locale: Locale }) {
	const schema = {
		serviceType: 'Race Bib Transfer',
		provider: {
			url: 'https://beswib.com',
			name: 'Beswib',
			'@type': 'Organization',
		},
		name: 'Race Bib Transfer Service',
		hasOfferCatalog: {
			name: 'Race Bib Marketplace',
			itemListElement: {
				itemOffered: {
					name: 'Race Bib Transfer',
					'@type': 'Service',
				},
				'@type': 'Offer',
			},
			'@type': 'OfferCatalog',
		},
		description: 'Safe and secure transfer of race bibs for running, trail, triathlon and cycling events.',
		category: 'Sports & Recreation',
		availableChannel: {
			serviceUrl: `https://beswib.com${locale === 'en' ? '' : `/${locale}`}`,
			processingTime: 'P1D', // 1 day processing time
			availableLanguage: ['en', 'fr', 'es', 'it', 'de', 'ro', 'pt', 'nl', 'ko'],
			'@type': 'ServiceChannel',
		},
		areaServed: {
			name: 'Worldwide',
			'@type': 'Country',
		},
		'@type': 'Service',
		'@context': 'https://schema.org',
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Combined structured data component for easy usage
export function StructuredData({
	type,
	organizer,
	locale,
	faqs,
	event,
	breadcrumbs,
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

			{type === 'event' && event && <EventSchema locale={locale} event={event} organizer={organizer} />}

			{type === 'faq' && faqs && <FAQSchema faqs={faqs} />}

			{/* Breadcrumbs if provided */}
			{breadcrumbs && breadcrumbs.length > 0 && <BreadcrumbSchema locale={locale} items={breadcrumbs} />}
		</>
	)
}
