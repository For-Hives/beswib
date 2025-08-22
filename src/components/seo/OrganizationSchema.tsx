export default function OrganizationSchema() {
	const schema = {
		vatID: 'FR12345678901',
		url: 'https://beswib.com',
		taxID: 'FR12345678901',
		subcategory: 'Event Services',
		serviceType: 'Race Bib Marketplace',
		sector: 'Technology',
		sameAs: [
			'https://twitter.com/beswib',
			'https://www.instagram.com/beswib_official',
			'https://www.linkedin.com/company/beswib',
			'https://www.strava.com/clubs/1590099?share_sig=EE3575891750401205',
		],
		name: 'Beswib',
		naics: '454390',
		makesOffer: [
			{
				itemOffered: {
					name: 'Secure Payment Processing',
					description: 'Safe and secure payment handling for bib transfers',
					'@type': 'Service',
				},
				'@type': 'Offer',
			},
			{
				itemOffered: {
					name: 'Multilingual Support',
					description: 'Customer support in 10 different languages',
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
		leiCode: '12345678901234567890',
		legalName: 'Beswib',
		knowsAbout: [
			'Race Bib Transfer',
			'Running Events',
			'Trail Running',
			'Triathlon',
			'Cycling Events',
			'Sports Marketplace',
			'Event Registration',
			'Athlete Services',
		],
		keywords: 'race bibs, running, trail, triathlon, cycling, marketplace, transfer, sports, events',
		isicV4: '47990',
		industry: 'Sports & Recreation',
		image: {
			width: 1200,
			url: 'https://beswib.com/og-image.jpg',
			height: 630,
			'@type': 'ImageObject',
		},
		hasOfferCatalog: {
			name: 'Race Bibs',
			itemListElement: [
				{
					itemOffered: {
						name: 'Race Bib Transfer Service',
						description: 'Secure transfer of race bibs between athletes',
						'@type': 'Service',
					},
					'@type': 'Offer',
				},
				{
					itemOffered: {
						name: 'Event Listing Service',
						description: 'Platform for organizers to list their events',
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
				'@type': 'Organization',
			},
			name: 'Beswib Team',
			jobTitle: 'Development Team',
			'@type': 'Person',
		},
		duns: '123456789',
		description: 'Marketplace de transfert de dossards de course (running, trail, triathlon, cyclisme)',
		department: [
			{
				name: 'Customer Support',
				description: 'Multilingual customer support team',
				'@type': 'Organization',
			},
			{
				name: 'Event Management',
				description: 'Event listing and management services',
				'@type': 'Organization',
			},
			{
				name: 'Payment Processing',
				description: 'Secure payment handling and verification',
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
		category: 'Sports & Recreation',
		brand: {
			slogan: 'Transfer Race Bibs Safely',
			name: 'Beswib',
			'@type': 'Brand',
		},
		audience: {
			geographicArea: {
				name: 'Europe and International',
				'@type': 'Place',
			},
			audienceType: 'Athletes and Sports Enthusiasts',
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
