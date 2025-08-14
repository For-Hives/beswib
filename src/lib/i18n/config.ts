export const i18n = {
	locales: ['en', 'fr', 'es', 'it', 'de', 'ro', 'pt', 'nl', 'ko'],
	defaultLocale: 'en',
} as const

export type Locale = (typeof i18n)['locales'][number]
