import type { MetadataRoute } from 'next'

import { NextResponse } from 'next/server'

import type { Locale } from '@/lib/i18n/config'

import { getAllEvents } from '@/services/event.services'

// Supported locales
const supportedLocales: Locale[] = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'ro', 'ko']

// Main static pages
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

// Page priorities
const pagePriorities = {
	marketplace: 0.8, // Marketplace
	'legals/terms': 0.3, // Terms
	'legals/privacy': 0.3, // Privacy
	'legals/legal-notice': 0.3, // Legal notice
	'legals/cookies': 0.3, // Cookies
	faq: 0.6, // FAQ
	events: 0.9, // Events
	contact: 0.5, // Contact
	'': 1.0, // Home
}

// Change frequencies
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

// Generate sitemap XML
export async function GET() {
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

			// Dynamic events pages
			if (Array.isArray(allEvents) && allEvents.length > 0) {
				for (const event of allEvents) {
					const eventUrl = `${baseUrl}/${locale}/events/${event.id}`
					const eventLastModified =
						event.eventDate !== null && event.eventDate !== undefined ? new Date(event.eventDate) : new Date()

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

		// Add special pages
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
		console.error('Error generating sitemap:', error)

		// If error, generate at least static pages
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

	// Convert to XML
	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

	for (const entry of sitemap) {
		xml += '  <url>\n'
		xml += `    <loc>${entry.url}</loc>\n`
		xml += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`
		xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`
		xml += `    <priority>${entry.priority}</priority>\n`

		// Add alternates if available
		if (entry.alternates?.languages) {
			for (const [lang, href] of Object.entries(entry.alternates.languages)) {
				xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />\n`
			}
		}

		xml += '  </url>\n'
	}

	xml += '</urlset>'

	return new NextResponse(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400',
		},
	})
}
