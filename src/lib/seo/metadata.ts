import type { Metadata } from 'next'

import type { Locale } from '@/lib/i18n/config'

import { generateBaseMetadata, generateEventMetadata, generateMarketplaceMetadata } from './metadata-generators'

// Legacy SEO configuration - DEPRECATED: Use metadata-generators.ts instead
// TODO: Remove this file after migration is complete
export const seoConfig = {
	ro: {
		locale: 'ro_RO',
		keywords:
			'numere de start, alergare, trail running, triatlon, ciclism, transfer număr, cumpără număr, vinde număr, maraton, ultra trail',
		defaultTitle: 'Beswib - Transfer Numere de Start | Cumpără și Vinde Numere de Cursă',
		defaultDescription:
			'Transferă-ți numerele de start în siguranță cu Beswib. Cumpără și vinde numere pentru alergare, trail, triatlon și ciclism.',
		alternateLanguages: {
			pt: '/pt',
			nl: '/nl',
			ko: '/ko',
			it: '/it',
			fr: '/fr',
			es: '/es',
			en: '/en',
			de: '/de',
		},
	},
	pt: {
		locale: 'pt_PT',
		keywords:
			'peitos, corrida, trail running, triatlo, ciclismo, transferência peito, comprar peito, vender peito, maratona, ultra trail',
		defaultTitle: 'Beswib - Transferência de Peitos | Comprar e Vender Peitos de Corrida',
		defaultDescription:
			'Transfira seus peitos de corrida com segurança com Beswib. Compre e venda peitos para running, trail, triatlo e ciclismo.',
		alternateLanguages: {
			ro: '/ro',
			nl: '/nl',
			ko: '/ko',
			it: '/it',
			fr: '/fr',
			es: '/es',
			en: '/en',
			de: '/de',
		},
	},
	nl: {
		locale: 'nl_NL',
		keywords:
			'startnummers, hardlopen, trail running, triatlon, wielrennen, startnummer overdracht, startnummer kopen, startnummer verkopen, marathon, ultra trail',
		defaultTitle: 'Beswib - Startnummer Overdracht | Koop en Verkoop Hardloop-, Trail- en Triatlon Startnummers',
		defaultDescription:
			'Draag je startnummers veilig over met Beswib. Koop en verkoop startnummers voor hardlopen, trail, triatlon en wielrennen.',
		alternateLanguages: {
			ro: '/ro',
			pt: '/pt',
			ko: '/ko',
			it: '/it',
			fr: '/fr',
			es: '/es',
			en: '/en',
			de: '/de',
		},
	},
	ko: {
		locale: 'ko_KR',
		keywords:
			'경주 번호, 러닝, 트레일 러닝, 트라이애슬론, 사이클링, 번호 이전, 번호 구매, 번호 판매, 마라톤, 울트라 트레일',
		defaultTitle: 'Beswib - 경주 번호 이전 | 러닝, 트레일, 트라이애슬론 번호 구매 및 판매',
		defaultDescription:
			'Beswib으로 경주 번호를 안전하게 이전하세요. 러닝, 트레일, 트라이애슬론, 사이클링 경주 번호를 구매하고 판매하세요.',
		alternateLanguages: {
			ro: '/ro',
			pt: '/pt',
			nl: '/nl',
			it: '/it',
			fr: '/fr',
			es: '/es',
			en: '/en',
			de: '/de',
		},
	},
	it: {
		locale: 'it_IT',
		keywords:
			'pettorali, corsa, trail running, triathlon, ciclismo, trasferimento pettorale, comprare pettorale, vendere pettorale, maratona, ultra trail',
		defaultTitle: 'Beswib - Trasferimento Petti | Compra e Vendi Pettorali di Gara',
		defaultDescription:
			'Trasferisci i tuoi pettorali di gara in sicurezza con Beswib. Compra e vendi pettorali per running, trail, triathlon e ciclismo.',
		alternateLanguages: {
			ro: '/ro',
			pt: '/pt',
			nl: '/nl',
			ko: '/ko',
			fr: '/fr',
			es: '/es',
			en: '/en',
			de: '/de',
		},
	},
	fr: {
		locale: 'fr_FR',
		keywords:
			'dossards, course à pied, trail running, triathlon, cyclisme, transfert dossard, acheter dossard, vendre dossard, marathon, ultra trail',
		defaultTitle: 'Beswib - Transfert de Dossards | Acheter & Vendre des Dossards de Course',
		defaultDescription:
			'Transférez vos dossards de course en toute sécurité avec Beswib. Achetez et vendez des dossards de running, trail, triathlon et cyclisme.',
		alternateLanguages: {
			ro: '/ro',
			pt: '/pt',
			nl: '/nl',
			ko: '/ko',
			it: '/it',
			es: '/es',
			en: '/en',
			de: '/de',
		},
	},
	es: {
		locale: 'es_ES',
		keywords:
			'dorsales, carrera a pie, trail running, triatlón, ciclismo, transferencia dorsal, comprar dorsal, vender dorsal, maratón, ultra trail',
		defaultTitle: 'Beswib - Transferencia de Dorsales | Comprar y Vender Dorsales de Carrera',
		defaultDescription:
			'Transfiere tus dorsales de carrera de forma segura con Beswib. Compra y vende dorsales de running, trail, triatlón y ciclismo.',
		alternateLanguages: {
			ro: '/ro',
			pt: '/pt',
			nl: '/nl',
			ko: '/ko',
			it: '/it',
			fr: '/fr',
			en: '/en',
			de: '/de',
		},
	},
	en: {
		locale: 'en_US',
		keywords:
			'race bibs, running bibs, trail running, triathlon, cycling, race transfer, buy bibs, sell bibs, marathon, ultra trail',
		defaultTitle: 'Beswib - Transfer Race Bibs | Buy & Sell Running, Trail, Triathlon Bibs',
		defaultDescription:
			'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
		alternateLanguages: {
			ro: '/ro',
			pt: '/pt',
			nl: '/nl',
			ko: '/ko',
			it: '/it',
			fr: '/fr',
			es: '/es',
			de: '/de',
		},
	},
	de: {
		locale: 'de_DE',
		keywords:
			'startnummern, laufen, trail running, triathlon, radfahren, startnummer transfer, startnummer kaufen, startnummer verkaufen, marathon, ultra trail',
		defaultTitle: 'Beswib - Startnummern Transfer | Kaufen & Verkaufen von Lauf-, Trail- und Triathlon-Startnummern',
		defaultDescription:
			'Übertragen Sie Ihre Startnummern sicher mit Beswib. Kaufen und verkaufen Sie Startnummern für Laufen, Trail, Triathlon und Radfahren.',
		alternateLanguages: {
			ro: '/ro',
			pt: '/pt',
			nl: '/nl',
			ko: '/ko',
			it: '/it',
			fr: '/fr',
			es: '/es',
			en: '/en',
		},
	},
}

// Event interface for proper typing
// DEPRECATED: This interface is for backward compatibility only
// Use Event from @/models/event.model instead
interface LegacyEvent {
	id: string
	name: string
	description?: string
	imageUrl?: string
	eventDate: string
	location: string
}

// DEPRECATED: Use generateBaseMetadata from metadata-generators.ts
// This function is kept for backward compatibility
export function getBaseMetadata(locale: Locale): Metadata {
	return generateBaseMetadata(locale)
}

// DEPRECATED: Use generateBaseMetadata from metadata-generators.ts
// Base metadata for all pages
export function getBaseMetadataLegacy(locale: Locale): Metadata {
	const config = seoConfig[locale]

	return {
		verification: {
			yandex: 'your-yandex-verification-code',
			yahoo: 'your-yahoo-verification-code',
			google: 'your-google-verification-code',
		},
		twitter: {
			title: config.defaultTitle,
			site: '@beswib',
			// TODO: OG IMAGE - Replace with actual event-specific image
			images: ['/placeholder-og-image.jpg'],
			description: config.defaultDescription,
			creator: '@beswib',
			card: 'summary_large_image',
		},
		title: {
			template: '%s | Beswib',
			default: config.defaultTitle,
		},
		robots: {
			index: true,
			googleBot: {
				'max-video-preview': -1,
				'max-snippet': -1,
				'max-image-preview': 'large',
				index: true,
				follow: true,
			},
			follow: true,
		},
		referrer: 'origin-when-cross-origin',
		publisher: 'Beswib',
		openGraph: {
			url: `https://beswib.com/${locale}`,
			type: 'website',
			title: config.defaultTitle,
			siteName: 'Beswib',
			locale: config.locale,
			// TODO: OG IMAGE - Replace with actual event-specific image
			images: [
				{
					width: 1200,
					url: '/placeholder-og-image.jpg',
					height: 630,
					alt: 'Beswib - Transfer Race Bibs',
				},
			],
			description: config.defaultDescription,
			alternateLocale: Object.keys(config.alternateLanguages).map(lang => seoConfig[lang as Locale].locale),
		},
		metadataBase: new URL('https://beswib.com'),
		keywords: config.keywords,
		formatDetection: {
			telephone: false,
			email: false,
			address: false,
		},
		description: config.defaultDescription,
		creator: 'Beswib',
		classification: 'Race Bib Marketplace',
		category: 'Sports & Recreation',
		authors: [{ name: 'Beswib Team' }],
		alternates: {
			languages: config.alternateLanguages,
			canonical: `https://beswib.com/${locale}`,
		},
	}
}

// Helper function to convert legacy event format to new Event model
function convertLegacyEventToEventModel(legacyEvent: LegacyEvent): import('@/models/event.model').Event {
	return {
		typeCourse: 'road' as const,
		organizer: 'default-organizer-id',
		options: null,
		name: legacyEvent.name,
		location: legacyEvent.location,
		id: legacyEvent.id,
		eventDate: new Date(legacyEvent.eventDate),
		description: legacyEvent.description ?? '',
		bibPickupWindowEndDate: new Date(legacyEvent.eventDate),
		bibPickupWindowBeginDate: new Date(legacyEvent.eventDate),
	}
}

// DEPRECATED: Use generateEventMetadata from metadata-generators.ts
export function getEventMetadata(locale: Locale, event: LegacyEvent | import('@/models/event.model').Event): Metadata {
	// Check if it's a legacy event format
	if ('eventDate' in event && typeof event.eventDate === 'string') {
		const convertedEvent = convertLegacyEventToEventModel(event as LegacyEvent)
		return generateEventMetadata(locale, convertedEvent)
	}
	return generateEventMetadata(locale, event as import('@/models/event.model').Event)
}

// DEPRECATED: Use generateEventMetadata from metadata-generators.ts
// Event-specific metadata
export function getEventMetadataLegacy(locale: Locale, event: LegacyEvent): Metadata {
	const baseMetadata = getBaseMetadata(locale)
	const config = seoConfig[locale]

	const eventTitle = `${event.name} | ${config.defaultTitle.split(' - ')[1]}`
	const eventDescription = event.description ?? `${event.name} - ${config.defaultDescription}`

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: eventTitle,
			// TODO: OG IMAGE - Replace with actual event image
			images: [event.imageUrl ?? '/placeholder-og-image.jpg'],
			description: eventDescription,
		},
		title: eventTitle,
		other: {
			'event:type': 'sports_event',
			'event:start_time': event.eventDate,
			'event:location': event.location,
			'event:end_time': event.eventDate,
		},
		openGraph: {
			...baseMetadata.openGraph,
			url: `https://beswib.com/${locale}/events/${event.id}`,
			type: 'article',
			title: eventTitle,
			// TODO: OG IMAGE - Replace with actual event image
			images: [
				{
					width: 1200,
					url: '/placeholder-og-image.jpg',
					height: 630,
					alt: event.name,
				},
			],
			description: eventDescription,
		},
		description: eventDescription,
		alternates: {
			languages: config.alternateLanguages,
			canonical: `https://beswib.com/${locale}/events/${event.id}`,
		},
	}
}

// DEPRECATED: Use generateMarketplaceMetadata from metadata-generators.ts
export function getMarketplaceMetadata(locale: Locale): Metadata {
	return generateMarketplaceMetadata(locale)
}

// DEPRECATED: Use generateMarketplaceMetadata from metadata-generators.ts
// Marketplace page metadata
export function getMarketplaceMetadataLegacy(locale: Locale): Metadata {
	const baseMetadata = getBaseMetadata(locale)
	const config = seoConfig[locale]

	const marketplaceTitle = `Marketplace - ${config.defaultTitle}`
	const marketplaceDescription = config.defaultDescription

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: marketplaceTitle,
			description: marketplaceDescription,
		},
		title: marketplaceTitle,
		openGraph: {
			...baseMetadata.openGraph,
			url: `https://beswib.com/${locale}/marketplace`,
			title: marketplaceTitle,
			description: marketplaceDescription,
		},
		description: marketplaceDescription,
		alternates: {
			languages: config.alternateLanguages,
			canonical: `https://beswib.com/${locale}/marketplace`,
		},
	}
}
