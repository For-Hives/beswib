import { Locale } from '@/lib/i18n/config'

interface OrganizationSchemaProps {
	locale: Locale
}

export default function OrganizationSchema({ locale }: OrganizationSchemaProps) {
	// Organization schema for better SEO recognition
	const organizationSchema = {
		url: 'https://beswib.com',
		serviceType: 'Race Bib Transfer Service',
		sameAs: ['https://twitter.com/beswib', 'https://instagram.com/beswib', 'https://linkedin.com/company/beswib'],
		name: 'Beswib',
		logo: {
			width: 200,
			url: 'https://beswib.com/beswib.svg',
			height: 200,
			'@type': 'ImageObject',
		},
		keywords: 'race bibs, running, trail, triathlon, cycling, marketplace, transfer',
		image: {
			width: 1200,
			url: 'https://beswib.com/og-image.jpg',
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
		url: 'https://beswib.com',
		publisher: {
			'@type': 'Organization',
			'@id': 'https://beswib.com#organization',
		},
		potentialAction: {
			target: {
				urlTemplate: `https://beswib.com/${locale}/marketplace?search={search_term_string}`,
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
