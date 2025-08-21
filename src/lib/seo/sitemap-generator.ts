import { MetadataRoute } from 'next'
import { fetchApprovedPublicEvents } from '@/services/event.services'
import { fetchApprovedPublicEventsWithBibs } from '@/services/event.services'
import { Locale, i18n } from '@/lib/i18n/config'
import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'

// Configuration des langues avec leurs codes hreflang
export const localeConfig = {
	en: { hreflang: 'en', name: 'English' },
	fr: { hreflang: 'fr', name: 'Français' },
	es: { hreflang: 'es', name: 'Español' },
	it: { hreflang: 'it', name: 'Italiano' },
	de: { hreflang: 'de', name: 'Deutsch' },
	ro: { hreflang: 'ro', name: 'Română' },
	pt: { hreflang: 'pt', name: 'Português' },
	nl: { hreflang: 'nl', name: 'Nederlands' },
	ko: { hreflang: 'ko', name: '한국어' }
}

// Fonction pour générer les URLs alternatives
function generateAlternates(path: string, currentLocale: Locale) {
	const alternates: Record<string, string> = {}

	i18n.locales.forEach(locale => {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beswib.com'

		if (locale === 'en') {
			// Pour l'anglais, URL sans préfixe
			alternates[localeConfig[locale].hreflang] = `${baseUrl}${path}`
		} else {
			// Pour les autres langues, URL avec préfixe de langue
			alternates[localeConfig[locale].hreflang] = `${baseUrl}/${locale}${path}`
		}
	})

	return alternates
}

// Génère le sitemap principal
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beswib.com'
	const sitemapEntries: MetadataRoute.Sitemap = []

	try {
		// Récupérer les événements publics
		const events = await fetchApprovedPublicEvents()
		const eventsWithBibs = await fetchApprovedPublicEventsWithBibs()

		// Pages statiques principales pour chaque langue
		const staticPages = [
			'', // Page d'accueil
			'/events',
			'/marketplace',
			'/faq',
			'/contact',
			'/legals/legal-notice',
			'/legals/privacy-policy',
			'/legals/terms'
		]

		// Générer les entrées pour les pages statiques
		for (const locale of i18n.locales) {
			for (const page of staticPages) {
				const path = locale === 'en' ? page : `/${locale}${page}`
				const url = `${baseUrl}${path}`

				sitemapEntries.push({
					url,
					lastModified: new Date(),
					changeFrequency: page === '' ? 'daily' : 'weekly',
					priority: page === '' ? 1.0 : 0.8,
					alternates: generateAlternates(page, locale)
				})
			}
		}

		// Générer les entrées pour les pages d'événements
		for (const locale of i18n.locales) {
			for (const event of events) {
				const path = locale === 'en' ? `/events/${event.id}` : `/${locale}/events/${event.id}`
				const url = `${baseUrl}${path}`

				sitemapEntries.push({
					url,
					lastModified: new Date(event.eventDate), // Utiliser la date de l'événement
					changeFrequency: 'monthly',
					priority: 0.7,
					alternates: generateAlternates(`/events/${event.id}`, locale)
				})
			}
		}

		// Générer les entrées pour les annonces marketplace
		for (const locale of i18n.locales) {
			for (const event of eventsWithBibs) {
				if (event.expand?.bibs_via_eventId && event.expand.bibs_via_eventId.length > 0) {
					for (const bib of event.expand.bibs_via_eventId) {
						if (bib.status === 'available' && bib.listed === 'public') {
							const path = locale === 'en'
								? `/marketplace/${bib.id}`
								: `/${locale}/marketplace/${bib.id}`
							const url = `${baseUrl}${path}`

							sitemapEntries.push({
								url,
								lastModified: new Date(bib.created || new Date()),
								changeFrequency: 'daily',
								priority: 0.6,
								alternates: generateAlternates(`/marketplace/${bib.id}`, locale)
							})
						}
					}
				}
			}
		}

		return sitemapEntries
	} catch (error) {
		console.error('Erreur lors de la génération du sitemap:', error)

		// Retourner un sitemap minimal en cas d'erreur
		return [
			{
				url: baseUrl,
				lastModified: new Date(),
				changeFrequency: 'daily',
				priority: 1.0,
			}
		]
	}
}

// Génère un sitemap pour une langue spécifique
export async function generateLocaleSitemap(locale: Locale): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beswib.com'
	const sitemapEntries: MetadataRoute.Sitemap = []

	try {
		const events = await fetchApprovedPublicEvents()
		const eventsWithBibs = await fetchApprovedPublicEventsWithBibs()

		const staticPages = [
			'',
			'/events',
			'/marketplace',
			'/faq',
			'/contact',
			'/legals/legal-notice',
			'/legals/privacy-policy',
			'/legals/terms'
		]

		// Pages statiques pour cette langue
		for (const page of staticPages) {
			const path = locale === 'en' ? page : `/${locale}${page}`
			const url = `${baseUrl}${path}`

			sitemapEntries.push({
				url,
				lastModified: new Date(),
				changeFrequency: page === '' ? 'daily' : 'weekly',
				priority: page === '' ? 1.0 : 0.8
			})
		}

		// Pages d'événements pour cette langue
		for (const event of events) {
			const path = locale === 'en' ? `/events/${event.id}` : `/${locale}/events/${event.id}`
			const url = `${baseUrl}${path}`

			sitemapEntries.push({
				url,
				lastModified: new Date(event.eventDate),
				changeFrequency: 'monthly',
				priority: 0.7
			})
		}

		// Annonces marketplace pour cette langue
		for (const event of eventsWithBibs) {
			if (event.expand?.bibs_via_eventId && event.expand.bibs_via_eventId.length > 0) {
				for (const bib of event.expand.bibs_via_eventId) {
					if (bib.status === 'available' && bib.listed === 'public') {
						const path = locale === 'en'
							? `/marketplace/${bib.id}`
							: `/${locale}/marketplace/${bib.id}`
						const url = `${baseUrl}${path}`

						sitemapEntries.push({
							url,
							lastModified: new Date(bib.created || new Date()),
							changeFrequency: 'daily',
							priority: 0.6
						})
					}
				}
			}
		}

		return sitemapEntries
	} catch (error) {
		console.error(`Erreur lors de la génération du sitemap pour ${locale}:`, error)
		return []
	}
}