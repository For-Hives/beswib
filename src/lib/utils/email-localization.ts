import locales from '@/constants/locales.json'

// Type definitions for locales structure
type LocaleData = typeof locales
type LocaleKey = keyof LocaleData
type EmailTemplates = LocaleData[LocaleKey]['emails']
export type EmailTemplateKey = keyof EmailTemplates

/**
 * Supported locales in the application
 */
export const SUPPORTED_LOCALES = ['en', 'fr', 'ko', 'es', 'it', 'de', 'ro', 'pt', 'nl'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
	return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
}

/**
 * Get a safe locale, fallback to 'fr' if not supported
 */
export function getSafeLocale(locale: string | null | undefined): SupportedLocale {
	if (!locale) return 'fr'
	return isSupportedLocale(locale) ? locale : 'fr'
}

/**
 * Get localized email subject with parameter substitution
 */
export function getLocalizedEmailSubject(
	template: EmailTemplateKey | 'verifiedEmail',
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	const safeLocale = getSafeLocale(locale)

	try {
		const localeData = locales[safeLocale]

		// Special case for verifiedEmail which is at root level, not in emails
		if (template === 'verifiedEmail') {
			const subject = localeData?.verifiedEmail?.subject
			if (!subject) {
				console.warn(`Missing verifiedEmail subject for locale: ${safeLocale}`)
				return getFallbackSubject(template, safeLocale, params)
			}
			return interpolateString(subject, params)
		}

		if (!localeData?.emails?.[template]?.subject) {
			console.warn(`Missing email template subject: ${template} for locale: ${safeLocale}`)
			return getFallbackSubject(template, safeLocale, params)
		}

		return interpolateString(localeData.emails[template].subject, params)
	} catch (error) {
		console.error('Error getting localized email subject:', error)
		return getFallbackSubject(template, safeLocale, params)
	}
}

/**
 * Get localized email text/content with parameter substitution
 */
export function getLocalizedEmailText(
	template: EmailTemplateKey,
	textKey: string,
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	const safeLocale = getSafeLocale(locale)

	try {
		const localeData = locales[safeLocale]
		const templateData = localeData?.emails?.[template] as Record<string, any>

		if (!templateData) {
			console.warn(`Missing email template: ${template} for locale: ${safeLocale}`)
			throw new Error(`Missing email template: ${template} for locale: ${safeLocale}`)
		}

		// Navigate through nested keys (e.g., 'layout.footer.learnMore')
		const keys = textKey.split('.')
		let value: any = templateData

		for (const key of keys) {
			value = value?.[key]
			if (value === undefined) break
		}

		if (typeof value !== 'string') {
			console.warn(`Missing email text: ${template}.${textKey} for locale: ${safeLocale}`)
			throw new Error(`Missing email text: ${template}.${textKey} for locale: ${safeLocale}`)
		}

		return interpolateString(value, params)
	} catch (error) {
		console.error('Error getting localized email text:', error)
		throw error
	}
}

/**
 * Interpolate parameters in a string template
 */
function interpolateString(template: string, params: Record<string, string | number | undefined>): string {
	return template.replace(/\{(\w+)\}/g, (match, key) => {
		const value = params[key]
		return value !== undefined ? String(value) : match
	})
}
