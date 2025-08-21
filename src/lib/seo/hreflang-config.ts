import { Locale } from '@/lib/i18n/config'

// Configuration des langues avec leurs codes hreflang appropriés
export const hreflangConfig: Record<Locale, string> = {
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

// Langues manquantes dans mes traductions SEO - je vais les ajouter
export const missingLocales: Locale[] = ['ro', 'ko']

// Fonction pour générer les URLs alternatives pour une page donnée
export function generateAlternateUrls(baseUrl: string, path: string, currentLocale: Locale): Record<string, string> {
	const alternateUrls: Record<string, string> = {}

	// Générer les URLs pour toutes les langues supportées
	Object.keys(hreflangConfig).forEach(locale => {
		// Pour la langue par défaut (en), l'URL peut être sans préfixe ou avec préfixe
		if (locale === 'en') {
			alternateUrls[hreflangConfig[locale]] = `${baseUrl}${path}`
		} else {
			alternateUrls[hreflangConfig[locale]] = `${baseUrl}/${locale}${path}`
		}
	})

	return alternateUrls
}

// Fonction pour générer les liens hreflang pour Next.js
export function generateHreflangLinks(baseUrl: string, path: string, currentLocale: Locale) {
	const alternateUrls = generateAlternateUrls(baseUrl, path, currentLocale)

	return Object.entries(alternateUrls).map(([lang, url]) => ({
		rel: 'alternate',
		hrefLang: lang,
		href: url
	}))
}