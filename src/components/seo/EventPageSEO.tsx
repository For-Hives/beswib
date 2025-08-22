import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { EventSocialMeta } from './SocialMeta'
import { EventSchema } from './EventSchema'

interface EventPageSEOProps {
	event: Event
	organizer?: Organizer
	locale: Locale
}

export default function EventPageSEO({ organizer, locale, event }: EventPageSEOProps) {
	const eventDate = new Date(event.eventDate)
	const formattedDate = eventDate.toLocaleDateString(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	// Race type translations by language
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

	const courseType = courseTypeTranslations[locale]?.[event.typeCourse] || event.typeCourse

	// Generate event-specific SEO keywords
	const generateEventKeywords = () => {
		const baseKeywords = [
			event.name.toLowerCase(),
			courseType.toLowerCase(),
			event.location.toLowerCase(),
			'race bib',
			'event registration',
			'running event',
			'trail running',
			'triathlon',
			'cycling event',
		]

		if (event.distanceKm) {
			baseKeywords.push(`${event.distanceKm}km`, 'distance running')
		}

		if (event.elevationGainM) {
			baseKeywords.push('elevation gain', 'mountain running')
		}

		if (event.participants) {
			baseKeywords.push('participants', 'race capacity')
		}

		return baseKeywords.join(', ')
	}

	// Generate optimized SEO description
	const generateEventDescription = () => {
		let description = `${event.name} - ${courseType} event in ${event.location} on ${formattedDate}.`

		if (event.description) {
			description += ` ${event.description}`
		}

		if (event.distanceKm) {
			description += ` ${event.distanceKm}km course.`
		}

		if (event.elevationGainM) {
			description += ` ${event.elevationGainM}m elevation gain.`
		}

		description += ` Buy or sell race bibs for this event on Beswib.`

		return description
	}

	// Generate optimized SEO title
	const generateEventTitle = () => {
		let title = `${event.name} - ${courseType}`

		if (event.location) {
			title += ` in ${event.location}`
		}

		if (event.distanceKm) {
			title += ` (${event.distanceKm}km)`
		}

		title += ` | Race Bibs - Beswib`

		return title
	}

	return (
		<>
			{/* Schema.org structuré pour l'événement */}
			<EventSchema event={event} organizer={organizer} locale={locale} />

			{/* Métadonnées pour les réseaux sociaux */}
			<EventSocialMeta
				eventName={event.name}
				eventDescription={generateEventDescription()}
				eventImage={event.imageUrl ?? '/og-image.jpg'}
				eventUrl={`https://beswib.com/${locale}/events/${event.id}`}
				locale={locale}
				eventDate={eventDate.toISOString()}
				eventLocation={event.location}
			/>

			{/* Métadonnées HTML supplémentaires pour le SEO */}
			<meta name="keywords" content={generateEventKeywords()} />
			<meta name="author" content="Beswib" />
			<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

			{/* Métadonnées spécifiques aux événements sportifs */}
			<meta name="event:start_time" content={eventDate.toISOString()} />
			<meta name="event:end_time" content={eventDate.toISOString()} />
			<meta name="event:location" content={event.location} />
			<meta name="event:type" content="sports_event" />

			{/* Métadonnées de localisation */}
			<meta name="geo.region" content="FR" />
			<meta name="geo.placename" content={event.location} />

			{/* Métadonnées de catégorisation */}
			<meta name="category" content="Sports & Recreation" />
			<meta name="subcategory" content={courseType} />

			{/* Métadonnées de prix (si disponible) */}
			{event.officialStandardPrice && (
				<>
					<meta name="product:price:amount" content={event.officialStandardPrice.toString()} />
					<meta name="product:price:currency" content="EUR" />
				</>
			)}

			{/* Métadonnées de distance et d'élévation */}
			{event.distanceKm && <meta name="distance" content={`${event.distanceKm}km`} />}

			{event.elevationGainM && <meta name="elevation" content={`${event.elevationGainM}m`} />}

			{/* Métadonnées de capacité */}
			{event.participants && <meta name="capacity" content={event.participants.toString()} />}

			{/* Métadonnées de deadline de transfert */}
			{event.transferDeadline && (
				<meta name="transfer_deadline" content={new Date(event.transferDeadline).toISOString()} />
			)}
		</>
	)
}
