import type { Metadata } from 'next'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import { generateHreflangMetadata } from './hreflang-utils'
import type { Locale } from '@/lib/i18n/config'

// Types pour les métadonnées SEO des annonces marketplace
export interface MarketplaceSEOData {
	title: string
	description: string
	keywords: string[]
	ogTitle?: string
	ogDescription?: string
	ogImage?: string
	canonical?: string
	structuredData?: object
}

// Données SEO par langue pour les annonces marketplace
const marketplaceSEOTranslations = {
	en: {
		disciplines: {
			road: 'running race',
			trail: 'trail running race',
			triathlon: 'triathlon event',
			cycle: 'cycling race'
		},
		templates: {
			title: 'Bib #{registrationNumber} for {eventName} - {price}€ | Buy Now',
			description: 'Buy race bib #{registrationNumber} for {eventName} ({discipline}) on {date} in {location}. Original price: {originalPrice}€, Sale price: {price}€. Secure purchase with PayPal.',
			keywords: [
				'bib for sale',
				'race bib transfer',
				'{eventName} bib',
				'{discipline} bib',
				'bib #{registrationNumber}',
				'{location} race',
				'buy race bib',
				'race registration transfer',
				'running bib marketplace',
				'{price}€ bib'
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
			title: 'Dossard #{registrationNumber} pour {eventName} - {price}€ | Acheter',
			description: 'Achetez le dossard #{registrationNumber} pour {eventName} ({discipline}) le {date} à {location}. Prix original: {originalPrice}€, Prix de vente: {price}€. Achat sécurisé avec PayPal.',
			keywords: [
				'dossard à vendre',
				'transfert de dossard',
				'dossard {eventName}',
				'dossard {discipline}',
				'dossard #{registrationNumber}',
				'course {location}',
				'achat dossard',
				'transfert d\'inscription',
				'marcheplace coureurs',
				'dossard {price}€'
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
			title: 'Startnummer #{registrationNumber} für {eventName} - {price}€ | Jetzt kaufen',
			description: 'Kaufen Sie Startnummer #{registrationNumber} für {eventName} ({discipline}) am {date} in {location}. Originalpreis: {originalPrice}€, Verkaufspreis: {price}€. Sicherer Kauf mit PayPal.',
			keywords: [
				'Startnummer zu verkaufen',
				'Startnummern-Transfer',
				'Startnummer {eventName}',
				'Startnummer {discipline}',
				'Startnummer #{registrationNumber}',
				'Veranstaltung {location}',
				'Startnummer kaufen',
				'Anmeldung übertragen',
				'Läufer-Marktplatz',
				'Startnummer {price}€'
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
			title: 'Dorsal #{registrationNumber} para {eventName} - {price}€ | Comprar',
			description: 'Compra el dorsal #{registrationNumber} para {eventName} ({discipline}) el {date} en {location}. Precio original: {originalPrice}€, Precio de venta: {price}€. Compra segura con PayPal.',
			keywords: [
				'dorsal en venta',
				'transferencia de dorsal',
				'dorsal {eventName}',
				'dorsal {discipline}',
				'dorsal #{registrationNumber}',
				'carrera {location}',
				'comprar dorsal',
				'transferencia de inscripción',
				'mercado de corredores',
				'dorsal {price}€'
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
			title: 'Pettorale #{registrationNumber} per {eventName} - {price}€ | Comprare',
			description: 'Compra il pettorale #{registrationNumber} per {eventName} ({discipline}) il {date} a {location}. Prezzo originale: {originalPrice}€, Prezzo di vendita: {price}€. Acquisto sicuro con PayPal.',
			keywords: [
				'pettorale in vendita',
				'trasferimento pettorale',
				'pettorale {eventName}',
				'pettorale {discipline}',
				'pettorale #{registrationNumber}',
				'gara {location}',
				'comprare pettorale',
				'trasferimento iscrizione',
				'mercato corridori',
				'pettorale {price}€'
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
			title: 'Startnummer #{registrationNumber} voor {eventName} - {price}€ | Kopen',
			description: 'Koop startnummer #{registrationNumber} voor {eventName} ({discipline}) op {date} in {location}. Originele prijs: {originalPrice}€, Verkoopprijs: {price}€. Veilige aankoop met PayPal.',
			keywords: [
				'startnummer te koop',
				'startnummer overdracht',
				'startnummer {eventName}',
				'startnummer {discipline}',
				'startnummer #{registrationNumber}',
				'wedstrijd {location}',
				'startnummer kopen',
				'inschrijving overdragen',
				'lopers marktplaats',
				'startnummer {price}€'
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
			title: 'Dorsal #{registrationNumber} para {eventName} - {price}€ | Comprar',
			description: 'Compre o dorsal #{registrationNumber} para {eventName} ({discipline}) em {date} em {location}. Preço original: {originalPrice}€, Preço de venda: {price}€. Compra segura com PayPal.',
			keywords: [
				'dorsal à venda',
				'transferência de dorsal',
				'dorsal {eventName}',
				'dorsal {discipline}',
				'dorsal #{registrationNumber}',
				'corrida {location}',
				'comprar dorsal',
				'transferência de inscrição',
				'mercado de corredores',
				'dorsal {price}€'
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
			title: 'Startnummer #{registrationNumber} til {eventName} - {price}€ | Køb',
			description: 'Køb startnummer #{registrationNumber} til {eventName} ({discipline}) d. {date} i {location}. Oprindelig pris: {originalPrice}€, Salgspris: {price}€. Sikker køb med PayPal.',
			keywords: [
				'startnummer til salg',
				'startnummer overførsel',
				'startnummer {eventName}',
				'startnummer {discipline}',
				'startnummer #{registrationNumber}',
				'konkurrence {location}',
				'købe startnummer',
				'overførsel af tilmelding',
				'løber marked',
				'startnummer {price}€'
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
			title: 'Startnummer #{registrationNumber} till {eventName} - {price}€ | Köp',
			description: 'Köp startnummer #{registrationNumber} till {eventName} ({discipline}) den {date} i {location}. Ursprungspris: {originalPrice}€, Försäljningspris: {price}€. Säker köp med PayPal.',
			keywords: [
				'startnummer till salu',
				'startnummer överföring',
				'startnummer {eventName}',
				'startnummer {discipline}',
				'startnummer #{registrationNumber}',
				'tävling {location}',
				'köpa startnummer',
				'överföring av anmälan',
				'löparmarknad',
				'startnummer {price}€'
			]
		}
	}
}

/**
 * Génère les métadonnées SEO optimisées pour une annonce marketplace
 */
export function generateMarketplaceSEO(
	bib: Bib & { expand?: { eventId: Event; sellerUserId: User } },
	locale: string
): MarketplaceSEOData {
	const lang = locale as keyof typeof marketplaceSEOTranslations
	const translations = marketplaceSEOTranslations[lang] || marketplaceSEOTranslations.en

	// Vérifier que les données nécessaires sont présentes
	if (!bib.expand?.eventId) {
		return {
			title: 'Race Bib for Sale | Beswib',
			description: 'Buy race bibs safely on Beswib marketplace.',
			keywords: ['race bib', 'bib for sale', 'running marketplace'],
			canonical: `https://beswib.com/${locale}/marketplace/${bib.id}`
		}
	}

	const event = bib.expand.eventId
	const seller = bib.expand.sellerUserId

	// Formater la date
	const eventDate = new Date(event.eventDate)
	const dateFormatter = new Intl.DateTimeFormat(lang, {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
	const formattedDate = dateFormatter.format(eventDate)

	// Obtenir le type de discipline
	const discipline = translations.disciplines[event.typeCourse] || event.typeCourse

	// Formater les prix
	const price = bib.price.toFixed(2)
	const originalPrice = (bib.originalPrice || bib.price).toFixed(2)

	// Générer le titre
	const title = translations.templates.title
		.replace('{registrationNumber}', bib.registrationNumber)
		.replace('{eventName}', event.name)
		.replace('{price}', price)

	// Générer la description
	const description = translations.templates.description
		.replace('{registrationNumber}', bib.registrationNumber)
		.replace('{eventName}', event.name)
		.replace('{discipline}', discipline)
		.replace('{date}', formattedDate)
		.replace('{location}', event.location)
		.replace('{originalPrice}', originalPrice)
		.replace('{price}', price)

	// Générer les mots-clés
	const keywords = translations.templates.keywords.map(keyword =>
		keyword
			.replace('{registrationNumber}', bib.registrationNumber)
			.replace('{eventName}', event.name)
			.replace('{discipline}', discipline)
			.replace('{location}', event.location)
			.replace('{price}', price)
	)

	// Générer l'URL canonique
	const canonical = `https://beswib.com/${locale}/marketplace/${bib.id}`

	// Générer les données structurées (JSON-LD)
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		'name': `Bib #${bib.registrationNumber} for ${event.name}`,
		'description': description,
		'image': '/beswib.png',
		'sku': bib.id,
		'brand': {
			'@type': 'Brand',
			'name': 'Beswib'
		},
		'offers': {
			'@type': 'Offer',
			'price': price,
			'priceCurrency': 'EUR',
			'availability': 'https://schema.org/InStock',
			'seller': {
				'@type': 'Person',
				'name': seller ? `${seller.firstName} ${seller.lastName}`.trim() : 'Anonymous Seller'
			},
			'url': canonical
		},
		'additionalProperty': [
			{
				'@type': 'PropertyValue',
				'name': 'Event',
				'value': event.name
			},
			{
				'@type': 'PropertyValue',
				'name': 'Event Date',
				'value': formattedDate
			},
			{
				'@type': 'PropertyValue',
				'name': 'Location',
				'value': event.location
			},
			{
				'@type': 'PropertyValue',
				'name': 'Sport',
				'value': discipline
			}
		]
	}

	return {
		title,
		description,
		keywords,
		ogTitle: title,
		ogDescription: description,
		ogImage: '/beswib.png',
		canonical,
		structuredData
	}
}

/**
 * Génère les métadonnées Next.js pour une annonce marketplace
 */
export function generateMarketplaceMetadata(
	bib: Bib & { expand?: { eventId: Event; sellerUserId: User } },
	locale: Locale
): Metadata {
	const seoData = generateMarketplaceSEO(bib, locale)

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
					alt: `Bib #${bib.registrationNumber} for ${bib.expand?.eventId?.name || 'Race Event'}`,
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
			index: bib.status === 'available' && bib.listed === 'public',
			follow: true,
			nocache: true,
			googleBot: {
				index: bib.status === 'available' && bib.listed === 'public',
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
	const path = `/marketplace/${bib.id}`
	return generateHreflangMetadata(baseMetadata, path, locale)
}