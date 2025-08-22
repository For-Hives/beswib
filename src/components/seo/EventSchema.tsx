import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'

interface EventSchemaProps {
	event: Event
	organizer?: Organizer
	locale: string
}

export default function EventSchema({ organizer, locale, event }: EventSchemaProps) {
	const eventDate = new Date(event.eventDate)
	const isoDate = eventDate.toISOString()

	// Traductions des types de course
	const courseTypeTranslations = {
		ro: {
			triathlon: 'Triatlon',
			trail: 'Alergare pe Trail',
			road: 'Alergare pe Șosea',
			cycle: 'Ciclism',
		},
		pt: {
			triathlon: 'Triatlo',
			trail: 'Corrida em Trilha',
			road: 'Corrida na Estrada',
			cycle: 'Ciclismo',
		},
		nl: {
			triathlon: 'Triatlon',
			trail: 'Traillopen',
			road: 'Weglopen',
			cycle: 'Wielrennen',
		},
		ko: {
			triathlon: '트라이애슬론',
			trail: '트레일 달리기',
			road: '도로 달리기',
			cycle: '사이클링',
		},
		it: {
			triathlon: 'Triathlon',
			trail: 'Corsa in Trail',
			road: 'Corsa su Strada',
			cycle: 'Ciclismo',
		},
		fr: {
			triathlon: 'Triathlon',
			trail: 'Course en Trail',
			road: 'Course sur Route',
			cycle: 'Cyclisme',
		},
		es: {
			triathlon: 'Triatlón',
			trail: 'Carrera en Trail',
			road: 'Carrera en Ruta',
			cycle: 'Ciclismo',
		},
		en: {
			triathlon: 'Triathlon',
			trail: 'Trail Running',
			road: 'Road Running',
			cycle: 'Cycling',
		},
		de: {
			triathlon: 'Triathlon',
			trail: 'Traillauf',
			road: 'Straßenlauf',
			cycle: 'Radfahren',
		},
	}

	const courseType =
		courseTypeTranslations[locale as keyof typeof courseTypeTranslations]?.[event.typeCourse] || event.typeCourse

	const schema = {
		startDate: isoDate,
		sport: courseType,
		potentialAction: {
			target: {
				urlTemplate: `https://beswib.com/${locale}/events/${event.id}`,
				inLanguage: locale,
				actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
				'@type': 'EntryPoint',
			},
			result: {
				reservationStatus: 'https://schema.org/Confirmed',
				'@type': 'EventReservation',
			},
			'@type': 'RegisterAction',
		},
		performer: {
			name: 'Participants',
			'@type': 'SportsTeam',
		},
		organizer: organizer
			? {
					url: organizer.website || undefined,
					name: organizer.name,
					'@type': 'Organization',
				}
			: undefined,
		offers: {
			validFrom: event.transferDeadline ? new Date(event.transferDeadline).toISOString() : undefined,
			priceCurrency: 'EUR',
			price: event.officialStandardPrice,
			availability: 'https://schema.org/InStock',
			'@type': 'Offer',
		},
		name: event.name,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': `https://beswib.com/${locale}/events/${event.id}`,
		},
		location: {
			name: event.location,
			address: {
				addressLocality: event.location,
				'@type': 'PostalAddress',
			},
			'@type': 'Place',
		},
		inLanguage: locale,
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		endDate: isoDate,
		description: event.description,
		category: 'Sports & Recreation',
		audience: {
			audienceType: 'Athletes and Sports Enthusiasts',
			'@type': 'Audience',
		},
		'@type': 'SportsEvent',
		'@context': 'https://schema.org',
	}

	// Add conditional properties
	if (event.distanceKm) {
		schema['distance'] = {
			value: event.distanceKm,
			unitCode: 'KMT',
			'@type': 'QuantitativeValue',
		}
	}

	if (event.elevationGainM) {
		schema['elevation'] = {
			value: event.elevationGainM,
			unitCode: 'MTR',
			'@type': 'QuantitativeValue',
		}
	}

	if (event.participants) {
		schema['maximumAttendeeCapacity'] = event.participants
	}

	if (event.parcoursUrl) {
		schema['courseMap'] = event.parcoursUrl
	}

	if (event.bibPickupLocation) {
		schema['location']['additionalProperty'] = {
			value: event.bibPickupLocation,
			name: 'Bib Pickup Location',
			'@type': 'PropertyValue',
		}
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
