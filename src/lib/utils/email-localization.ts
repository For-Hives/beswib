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
	if (!locale || locale.trim() === '') return 'fr'
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
	const localeData = locales[safeLocale]

	if (!localeData) {
		throw new Error(`Locale '${safeLocale}' not found in locales.json`)
	}

	// Special case for verifiedEmail which is at root level, not in emails
	if (template === 'verifiedEmail') {
		const subject = localeData.verifiedEmail?.subject
		if (!subject) {
			throw new Error(`Missing verifiedEmail subject for locale: ${safeLocale}`)
		}
		return interpolateString(subject, params)
	}

	// For all other templates, they should be in emails section
	const emailTemplate = localeData.emails?.[template]?.subject
	if (!emailTemplate) {
		throw new Error(`Missing email template subject: ${template} for locale: ${safeLocale}`)
	}

	return interpolateString(emailTemplate, params)
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
	const localeData = locales[safeLocale]

	if (!localeData) {
		throw new Error(`Locale '${safeLocale}' not found in locales.json`)
	}

	const templateData = localeData.emails?.[template]
	if (!templateData) {
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
		throw new Error(`Missing email text: ${template}.${textKey} for locale: ${safeLocale}`)
	}

	return interpolateString(value, params)
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
