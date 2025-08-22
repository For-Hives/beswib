import { Locale } from '@/lib/i18n/config'

import organizationTranslations from './organizationSchema.locales.json'

interface OrganizationSchemaProps {
	locale: Locale
}

export default function OrganizationSchema({ locale }: OrganizationSchemaProps) {
	const t = organizationTranslations[locale]?.organization ?? organizationTranslations.en.organization

	const schema = {
		vatID: 'FR12345678901',
		url: 'https://beswib.com',
		taxID: 'FR12345678901',
		subcategory: 'Event Services',
		serviceType: t.serviceType,
		sector: 'Technology',
		sameAs: [
			'https://www.instagram.com/beswib_official',
			'https://www.linkedin.com/company/beswib',
			'https://www.strava.com/clubs/1590099?share_sig=EE3575891750401205',
		],
		name: 'Beswib',
		naics: '454390',
		makesOffer: [
			{
				itemOffered: {
					name: t.services.securePayment.name,
					description: t.services.securePayment.description,
					'@type': 'Service',
				},
				'@type': 'Offer',
			},
			{
				itemOffered: {
					name: t.services.multilingualSupport.name,
					description: t.services.multilingualSupport.description,
					'@type': 'Service',
				},
				'@type': 'Offer',
			},
		],
		logo: {
			width: 512,
			url: 'https://beswib.com/logo.png',
			height: 512,
			'@type': 'ImageObject',
		},
		legalName: 'Beswib',
		knowsAbout: t.knowsAbout,
		keywords: t.keywords,
		industry: t.industry,
		image: {
			width: 1200,
			// todo: add og-image.jpg
			url: 'https://beswib.com/og-image.jpg',
			height: 630,
			'@type': 'ImageObject',
		},
		hasOfferCatalog: {
			name: 'Race Bibs',
			itemListElement: [
				{
					itemOffered: {
						name: t.services.bibTransfer.name,
						description: t.services.bibTransfer.description,
						'@type': 'Service',
					},
					'@type': 'Offer',
				},
				{
					itemOffered: {
						name: t.services.eventListing.name,
						description: t.services.eventListing.description,
						'@type': 'Service',
					},
					'@type': 'Offer',
				},
			],
			description: 'Available race bibs for various sporting events',
			'@type': 'OfferCatalog',
		},
		foundingDate: '2024',
		founder: {
			name: 'Beswib Team',
			'@type': 'Person',
		},
		employee: {
			worksFor: {
				name: 'Beswib',
				'@type': 'Person',
			},
			name: 'Beswib Team',
			jobTitle: 'Development Team',
			'@type': 'Person',
		},
		description: t.description,
		department: [
			{
				name: t.departments.customerSupport.name,
				description: t.departments.customerSupport.description,
				'@type': 'Organization',
			},
			{
				name: t.departments.eventManagement.name,
				description: t.departments.eventManagement.description,
				'@type': 'Organization',
			},
			{
				name: t.departments.paymentProcessing.name,
				description: t.departments.paymentProcessing.description,
				'@type': 'Organization',
			},
		],
		contactPoint: {
			email: 'contact@beswib.com',
			contactType: 'customer service',
			availableLanguage: [
				'English',
				'French',
				'German',
				'Spanish',
				'Italian',
				'Portuguese',
				'Dutch',
				'Romanian',
				'Korean',
			],
			'@type': 'ContactPoint',
		},
		category: t.category,
		brand: {
			slogan: t.slogan,
			name: 'Beswib',
			'@type': 'Brand',
		},
		audience: {
			geographicArea: {
				name: 'Europe and International',
				'@type': 'Place',
			},
			audienceType: t.audienceType,
			'@type': 'Audience',
		},
		areaServed: [
			{
				name: 'France',
				'@type': 'Country',
			},
			{
				name: 'Germany',
				'@type': 'Country',
			},
			{
				name: 'Spain',
				'@type': 'Country',
			},
			{
				name: 'Italy',
				'@type': 'Country',
			},
			{
				name: 'Portugal',
				'@type': 'Country',
			},
			{
				name: 'Netherlands',
				'@type': 'Country',
			},
			{
				name: 'Poland',
				'@type': 'Country',
			},
			{
				name: 'Sweden',
				'@type': 'Country',
			},
			{
				name: 'South Korea',
				'@type': 'Country',
			},
			{
				name: 'United States',
				'@type': 'Country',
			},
		],
		alternateName: ['BeSwib', 'BESWIB'],
		address: {
			addressLocality: 'France',
			addressCountry: 'FR',
			'@type': 'PostalAddress',
		},
		'@type': 'Organization',
		'@context': 'https://schema.org',
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
