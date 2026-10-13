import type { Locale } from '@/lib/i18n/config'
import { getPublicBaseUrl } from '@/lib/utils/url'

interface OrganizationSchemaProps {
	locale: Locale
}

export default function OrganizationSchema({ locale }: OrganizationSchemaProps) {
	const baseUrl = getPublicBaseUrl()

	// Organization schema for better SEO recognition
	const organizationSchema = {
		url: baseUrl,
		serviceType: 'Race Bib Transfer Service',
		sameAs: [
			'https://twitter.com/beswib',
			'https://instagram.com/beswib',
			'https://linkedin.com/company/beswib',
			'https://www.facebook.com/beswib_official',
		],
		name: 'Beswib',
		logo: {
			width: 200,
			url: `${baseUrl}/beswib.svg`,
			height: 200,
			'@type': 'ImageObject',
		},
		keywords: 'race bibs, running, trail, triathlon, cycling, marketplace, transfer',
		image: {
			width: 1200,
			url: `${baseUrl}/${locale}/opengraph-image`,
			height: 630,
			'@type': 'ImageObject',
		},
		founder: {
			name: 'Beswib Team',
			'@type': 'Person',
		},
		description: 'Legal and secure marketplace for race bib transfers between athletes',
		contactPoint: {
			email: 'hello@beswib.com',
			contactType: 'Customer Service',
			availableLanguage: ['en', 'fr', 'es', 'it', 'de', 'ro', 'pt', 'nl', 'ko'],
			'@type': 'ContactPoint',
		},
		category: 'Sports & Recreation',
		areaServed: 'Worldwide',
		alternateName: 'Beswib Marketplace',
		address: {
			addressCountry: 'FR',
			'@type': 'PostalAddress',
		},
		'@type': 'Organization',
		'@context': 'https://schema.org',
	}

	// Website schema for improved site understanding
	const websiteSchema = {
		url: baseUrl,
		publisher: {
			'@type': 'Organization',
			'@id': `${baseUrl}#organization`,
		},
		potentialAction: {
			target: {
				urlTemplate: `${baseUrl}/${locale}/marketplace?search={search_term_string}`,
				'@type': 'EntryPoint',
			},
			'query-input': 'required name=search_term_string',
			'@type': 'SearchAction',
		},
		name: 'Beswib',
		inLanguage: ['en-US', 'fr-FR', 'es-ES', 'it-IT', 'de-DE', 'ro-RO', 'pt-PT', 'nl-NL', 'ko-KR'],
		description: 'Legal and secure marketplace for race bib transfers',
		'@type': 'WebSite',
		'@context': 'https://schema.org',
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
			/>
		</>
	)
}
