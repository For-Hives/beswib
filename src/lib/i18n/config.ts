export const i18n = {
	locales: ['en', 'fr', 'es', 'it', 'de', 'ro', 'pt', 'nl', 'ko'],
	defaultLocale: 'en',
} as const

export type Locale = (typeof i18n.locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
	ro: 'Română',
	pt: 'Português',
	nl: 'Nederlands',
	ko: '한국어',
	it: 'Italiano',
	fr: 'Français',
	es: 'Español',
	en: 'English',
	de: 'Deutsch',
}

export const localeFlags: Record<Locale, string> = {
	ro: '🇷🇴',
	pt: '🇵🇹',
	nl: '🇳🇱',
	ko: '🇰🇷',
	it: '🇮🇹',
	fr: '🇫🇷',
	es: '🇪🇸',
	en: '🇺🇸',
	de: '🇩🇪',
}

export const localeISO: Record<Locale, string> = {
	ro: 'ro-RO',
	pt: 'pt-PT',
	nl: 'nl-NL',
	ko: 'ko-KR',
	it: 'it-IT',
	fr: 'fr-FR',
	es: 'es-ES',
	en: 'en-US',
	de: 'de-DE',
}
