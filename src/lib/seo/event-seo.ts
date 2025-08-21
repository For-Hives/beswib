import type { Metadata } from 'next'
import type { Event } from '@/models/event.model'
import { generateHreflangMetadata } from './hreflang-utils'
import type { Locale } from '@/lib/i18n/config'

// Types pour les métadonnées SEO des événements
export interface EventSEOData {
	title: string
	description: string
	keywords: string[]
	ogTitle?: string
	ogDescription?: string
	ogImage?: string
	canonical?: string
	structuredData?: object
}

// Données SEO par langue pour les événements
const eventSEOTranslations = {
	en: {
		disciplines: {
			road: 'running race',
			trail: 'trail running race',
			triathlon: 'triathlon event',
			cycle: 'cycling race'
		},
		templates: {
			title: '{eventName} - {discipline} on {date} | Race Bib Transfer',
			description: 'Participate in {eventName}, a {discipline} in {location} on {date}. Distance: {distance}. Buy or sell race bibs safely on Beswib.',
			keywords: [
				'{eventName}',
				'{discipline}',
				'race bib transfer',
				'bib resale',
				'{location}',
				'{date}',
				'runners marketplace',
				'bib exchange'
			]
		}
	},
	fr: {
		disciplines: {
			road: 'course de running',
			trail: 'course de trail',
			triathlon: 'événement triathlon',
			cycle: 'course cycliste'
		},
		templates: {
			title: '{eventName} - {discipline} le {date} | Transfert de dossard',
			description: 'Participez à {eventName}, {discipline} à {location} le {date}. Distance: {distance}. Achetez ou vendez des dossards en toute sécurité sur Beswib.',
			keywords: [
				'{eventName}',
				'{discipline}',
				'transfert de dossard',
				'revente dossard',
				'{location}',
				'{date}',
				'marcheplace coureurs',
				'échange dossard'
			]
		}
	},
	de: {
		disciplines: {
			road: 'Laufveranstaltung',
			trail: 'Trailrunning-Rennen',
			triathlon: 'Triathlon-Veranstaltung',
			cycle: 'Radrennen'
		},
		templates: {
			title: '{eventName} - {discipline} am {date} | Startnummern-Transfer',
			description: 'Nehmen Sie an {eventName} teil, {discipline} in {location} am {date}. Distanz: {distance}. Kaufen oder verkaufen Sie Startnummern sicher auf Beswib.',
			keywords: [
				'{eventName}',
				'{discipline}',
				'Startnummern-Transfer',
				'Startnummern-Verkauf',
				'{location}',
				'{date}',
				'Läufer-Marktplatz',
				'Startnummern-Tausch'
			]
		}
	},
	es: {
		disciplines: {
			road: 'carrera de running',
			trail: 'carrera de trail',
			triathlon: 'evento de triatlón',
			cycle: 'carrera ciclista'
		},
		templates: {
			title: '{eventName} - {discipline} el {date} | Transferencia de dorsal',
			description: 'Participa en {eventName}, {discipline} en {location} el {date}. Distancia: {distance}. Compra o vende dorsales de forma segura en Beswib.',
			keywords: [
				'{eventName}',
				'{discipline}',
				'transferencia de dorsal',
				'reventa de dorsal',
				'{location}',
				'{date}',
				'mercado de corredores',
				'intercambio de dorsal'
			]
		}
	},
	it: {
		disciplines: {
			road: 'gara di corsa',
			trail: 'gara di trail running',
			triathlon: 'evento di triathlon',
			cycle: 'gara ciclistica'
		},
		templates: {
			title: '{eventName} - {discipline} il {date} | Trasferimento pettorale',
			description: 'Partecipa a {eventName}, {discipline} a {location} il {date}. Distanza: {distance}. Compra o vendi pettorali in sicurezza su Beswib.',
			keywords: [
				'{eventName}',
				'{discipline}',
				'trasferimento pettorale',
				'rivendita pettorale',
				'{location}',
				'{date}',
				'mercato corridori',
				'scambio pettorale'
			]
		}
	},
	nl: {
		disciplines: {
			road: 'hardloopwedstrijd',
			trail: 'trailrunning wedstrijd',
			triathlon: 'triathlon evenement',
			cycle: 'fietswedstrijd'
		},
		templates: {
			title: '{eventName} - {discipline} op {date} | Startnummer overdracht',
			description: 'Neem deel aan {eventName}, {discipline} in {location} op {date}. Afstand: {distance}. Koop of verkoop startnummers veilig op Beswib.',
			keywords: [
				'{eventName}',
				'{discipline}',
				'startnummer overdracht',
				'startnummer verkoop',
				'{location}',
				'{date}',
				'lopers marktplaats',
				'startnummer ruil'
			]
		}
	},
	pt: {
		disciplines: {
			road: 'corrida de rua',
			trail: 'corrida de trail',
			triathlon: 'evento de triatlo',
			cycle: 'corrida de ciclismo'
		},
		templates: {
			title: '{eventName} - {discipline} em {date} | Transferência de dorsal',
			description: 'Participe de {eventName}, {discipline} em {location} em {date}. Distância: {distance}. Compre ou venda dorsais com segurança na Beswib.',
			keywords: [
				'{eventName}',
				'{discipline}',
				'transferência de dorsal',
				'revenda de dorsal',
				'{location}',
				'{date}',
				'mercado de corredores',
				'troca de dorsal'
			]
		}
	},
	da: {
		disciplines: {
			road: 'løbeevent',
			trail: 'trailrunning løb',
			triathlon: 'triatlon event',
			cycle: 'cykelløb'
		},
		templates: {
			title: '{eventName} - {discipline} d. {date} | Startnummer overførsel',
			description: 'Deltag i {eventName}, {discipline} i {location} d. {date}. Distance: {distance}. Køb eller sælg startnumre sikkert på Beswib.',
			keywords: [
				'{eventName}',
				'{discipline}',
				'startnummer overførsel',
				'startnummer videresalg',
				'{location}',
				'{date}',
				'løber marked',
				'startnummer udveksling'
			]
		}
	},
	sv: {
		disciplines: {
			road: 'löpartävling',
			trail: 'trailrunning tävling',
			triathlon: 'triathlon event',
			cycle: 'cykeltävling'
		},
		templates: {
			title: '{eventName} - {discipline} den {date} | Startnummer överföring',
			description: 'Delta i {eventName}, {discipline} i {location} den {date}. Distans: {distance}. Köp eller sälj startnummer säkert på Beswib.',
			keywords: [
				'{eventName}',
				'{discipline}',
				'startnummer överföring',
				'startnummer återförsäljning',
				'{location}',
				'{date}',
				'löparmarknad',
				'startnummer utbyte'
			]
		}
	}
}

/**
 * Génère les métadonnées SEO optimisées pour un événement
 */
export function generateEventSEO(event: Event, locale: string): EventSEOData {
	const lang = locale as keyof typeof eventSEOTranslations
	const translations = eventSEOTranslations[lang] || eventSEOTranslations.en

	// Formater la date selon la locale
	const eventDate = new Date(event.eventDate)
	const dateFormatter = new Intl.DateTimeFormat(lang, {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
	const formattedDate = dateFormatter.format(eventDate)

	// Obtenir le type de discipline
	const discipline = translations.disciplines[event.typeCourse] || event.typeCourse

	// Formater la distance
	const distance = event.distanceKm
		? `${event.distanceKm}km`
		: 'variable distance'

	// Générer le titre
	const title = translations.templates.title
		.replace('{eventName}', event.name)
		.replace('{discipline}', discipline)
		.replace('{date}', formattedDate)

	// Générer la description
	const description = translations.templates.description
		.replace('{eventName}', event.name)
		.replace('{discipline}', discipline)
		.replace('{location}', event.location)
		.replace('{date}', formattedDate)
		.replace('{distance}', distance)

	// Générer les mots-clés
	const keywords = translations.templates.keywords.map(keyword =>
		keyword
			.replace('{eventName}', event.name)
			.replace('{discipline}', discipline)
			.replace('{location}', event.location)
			.replace('{date}', formattedDate)
	)

	// Générer l'URL canonique
	const canonical = `https://beswib.com/${locale}/events/${event.id}`

	// Générer les données structurées (JSON-LD)
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'SportsEvent',
		'name': event.name,
		'description': event.description,
		'startDate': event.eventDate.toISOString(),
		'location': {
			'@type': 'Place',
			'name': event.location,
			'address': event.location
		},
		'sport': discipline,
		...(event.distanceKm && {
			'distance': `${event.distanceKm} kilometers`
		}),
		...(event.participants && {
			'maximumAttendeeCapacity': event.participants
		}),
		...(event.officialStandardPrice && {
			'offers': {
				'@type': 'Offer',
				'price': event.officialStandardPrice,
				'priceCurrency': 'EUR',
				'url': event.registrationUrl || canonical
			}
		}),
		'url': canonical,
		'organizer': {
			'@type': 'Organization',
			'name': 'Beswib',
			'url': 'https://beswib.com'
		}
	}

	return {
		title,
		description,
		keywords,
		ogTitle: title,
		ogDescription: description,
		ogImage: '/public/beswib.png', // TODO: Générer des images dynamiques
		canonical,
		structuredData
	}
}

/**
 * Génère les métadonnées Next.js pour un événement
 */
export function generateEventMetadata(event: Event, locale: Locale): Metadata {
	const seoData = generateEventSEO(event, locale)

	const baseMetadata: Metadata = {
		title: seoData.title,
		description: seoData.description,
		keywords: seoData.keywords,
		authors: [{ name: 'Beswib Team' }],
		creator: 'Beswib',
		publisher: 'Beswib',
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		metadataBase: new URL('https://beswib.com'),
		alternates: {
			canonical: seoData.canonical,
		},
		openGraph: {
			title: seoData.ogTitle,
			description: seoData.ogDescription,
			url: seoData.canonical,
			siteName: 'Beswib',
			images: [
				{
					url: seoData.ogImage || '/beswib.png',
					width: 1200,
					height: 630,
					alt: `${event.name} - Beswib`,
				},
			],
			locale: locale,
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title: seoData.ogTitle,
			description: seoData.ogDescription,
			images: [seoData.ogImage || '/beswib.png'],
			creator: '@beswib',
			site: '@beswib',
		},
		robots: {
			index: true,
			follow: true,
			nocache: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1,
			},
		},
		other: {
			'schema:json-ld': JSON.stringify(seoData.structuredData),
		},
	}

	// Ajouter les liens hreflang
	const path = `/events/${event.id}`
	return generateHreflangMetadata(baseMetadata, path, locale)
}