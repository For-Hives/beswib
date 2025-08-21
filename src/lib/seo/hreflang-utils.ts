import type { Metadata } from 'next'
import { i18n, Locale } from '@/lib/i18n/config'
import { localeConfig } from './sitemap-generator'

// Configuration des langues avec leurs codes hreflang appropriés
export const hreflangLocales: Record<Locale, string> = {
	en: 'en',
	fr: 'fr',
	es: 'es',
	it: 'it',
	de: 'de',
	ro: 'ro',
	pt: 'pt',
	nl: 'nl',
	ko: 'ko'
}

/**
 * Génère les URLs alternatives pour une page donnée
 */
export function generateAlternateUrls(baseUrl: string, path: string, currentLocale: Locale): Record<string, string> {
	const alternateUrls: Record<string, string> = {}

	i18n.locales.forEach(locale => {
		const localePath = locale === 'en' ? path : `/${locale}${path}`

		alternateUrls[hreflangLocales[locale]] = `${baseUrl}${localePath}`
	})

	return alternateUrls
}

/**
 * Ajoute les liens hreflang aux métadonnées Next.js
 */
export function addHreflangLinks(metadata: Metadata, baseUrl: string, path: string, currentLocale: Locale): Metadata {
	const alternateUrls = generateAlternateUrls(baseUrl, path, currentLocale)

	// Créer les liens hreflang
	const hreflangLinks = Object.entries(alternateUrls).map(([lang, url]) => ({
		rel: 'alternate',
		hrefLang: lang,
		href: url
	}))

	// Ajouter le lien x-default (langue par défaut)
	const xDefaultUrl = currentLocale === 'en' ? `${baseUrl}${path}` : `${baseUrl}/en${path}`
	hreflangLinks.push({
		rel: 'alternate',
		hrefLang: 'x-default',
		href: xDefaultUrl
	})

	return {
		...metadata,
		alternates: {
			...metadata.alternates,
			languages: alternateUrls
		},
		other: {
			...metadata.other,
			// Ajouter les liens hreflang dans la balise head
			...Object.fromEntries(
				hreflangLinks.map((link, index) => [
					`hreflang-link-${index}`,
					`<link rel="${link.rel}" hreflang="${link.hrefLang}" href="${link.href}" />`
				])
			)
		}
	}
}

/**
 * Génère les métadonnées avec hreflang pour une page
 */
export function generateHreflangMetadata(
	originalMetadata: Metadata,
	path: string,
	currentLocale: Locale
): Metadata {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beswib.com'

	return addHreflangLinks(originalMetadata, baseUrl, path, currentLocale)
}