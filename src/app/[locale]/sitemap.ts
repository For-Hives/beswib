import type { MetadataRoute } from 'next'

import type { Locale } from '@/lib/i18n/config'

import { getAllEvents } from '@/services/event.services'

// Configuration des langues supportées
const supportedLocales: Locale[] = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'ro', 'ko']

// Pages statiques principales
const staticPages = [
	'',
	'events',
	'marketplace',
	'faq',
	'contact',
	'legals/terms',
	'legals/privacy',
	'legals/cookies',
	'legals/legal-notice',
]

// Priorités SEO pour différentes pages
const pagePriorities = {
	marketplace: 0.8, // Marketplace
	'legals/terms': 0.3, // Conditions
	'legals/privacy': 0.3, // Confidentialité
	'legals/legal-notice': 0.3, // Mentions légales
	'legals/cookies': 0.3, // Cookies
	faq: 0.6, // FAQ
	events: 0.9, // Liste des événements
	contact: 0.5, // Contact
	'': 1.0, // Page d'accueil
}

// Fréquences de mise à jour
const changeFreq = {
	marketplace: 'hourly' as const,
	'legals/terms': 'monthly' as const,
	'legals/privacy': 'monthly' as const,
	'legals/legal-notice': 'monthly' as const,
	'legals/cookies': 'monthly' as const,
	faq: 'weekly' as const,
	events: 'hourly' as const,
	contact: 'monthly' as const,
	'': 'daily' as const,
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const sitemap: MetadataRoute.Sitemap = []
	const baseUrl = 'https://beswib.com'

	try {
		// Fetch all events
		const allEvents = await getAllEvents()

		// Generate entries for each language and page
		for (const locale of supportedLocales) {
			// Static pages
			for (const page of staticPages) {
				const url = page === '' ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}/${page}`
				const lastModified = new Date()

				sitemap.push({
					url,
					priority: pagePriorities[page as keyof typeof pagePriorities] || 0.5,
					lastModified,
					changeFrequency: changeFreq[page as keyof typeof changeFreq] ?? 'weekly',
					alternates: {
						languages: Object.fromEntries(
							supportedLocales.map(loc => [loc, page === '' ? `${baseUrl}/${loc}` : `${baseUrl}/${loc}/${page}`])
						),
					},
				})
			}

			// Pages d'événements dynamiques
			if (allEvents && allEvents.length > 0) {
				for (const event of allEvents) {
					const eventUrl = `${baseUrl}/${locale}/events/${event.id}`
					const eventLastModified = event.eventDate ? new Date(event.eventDate) : new Date()

					sitemap.push({
						url: eventUrl,
						priority: 0.7,
						lastModified: eventLastModified,
						changeFrequency: 'daily',
						alternates: {
							languages: Object.fromEntries(supportedLocales.map(loc => [loc, `${baseUrl}/${loc}/events/${event.id}`])),
						},
					})
				}
			}
		}

		// Ajouter des pages spéciales
		sitemap.push({
			url: `${baseUrl}/sitemap.xml`,
			priority: 0.1,
			lastModified: new Date(),
			changeFrequency: 'daily',
		})

		sitemap.push({
			url: `${baseUrl}/robots.txt`,
			priority: 0.1,
			lastModified: new Date(),
			changeFrequency: 'monthly',
		})
	} catch (error) {
		console.error('Erreur lors de la génération du sitemap:', error)

		// En cas d'erreur, générer au moins les pages statiques
		for (const locale of supportedLocales) {
			for (const page of staticPages) {
				const url = page === '' ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}/${page}`
				sitemap.push({
					url,
					priority: 0.5,
					lastModified: new Date(),
					changeFrequency: 'weekly',
				})
			}
		}
	}

	return sitemap
}
