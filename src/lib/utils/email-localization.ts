import { getTranslations } from '@/lib/i18n/dictionary'
import locales from '@/constants/locales.json'

// Type definitions for locales structure
type LocaleData = typeof locales
export type EmailTemplateKey = keyof LocaleData[keyof LocaleData]['emails']

// Supported locales - extracted from the locales.json file
export const SUPPORTED_LOCALES = Object.keys(locales) as (keyof typeof locales)[]

/**
 * Validates if a locale is supported by the application
 */
export function isValidLocale(locale: string | null | undefined): locale is keyof typeof locales {
	if (locale == null || typeof locale !== 'string') {
		return false
	}
	return SUPPORTED_LOCALES.includes(locale as keyof typeof locales)
}

/**
 * Gets a valid locale with fallback logic
 * 1. If locale is valid, return it
 * 2. If locale is invalid/null, try to detect from browser/user agent (future enhancement)
 * 3. Default to 'en' as the standard fallback locale
 */
export function getValidLocale(locale: string | null | undefined, email?: string): keyof typeof locales {
	// If locale is valid, use it
	if (isValidLocale(locale)) {
		return locale
	}

	// Default to 'en' as the standard fallback locale
	// In the future, we could add more sophisticated detection based on:
	// - Email domain (.fr, .com, etc.)
	// - IP geolocation
	// - User preferences stored elsewhere
	console.warn(`Invalid or missing locale "${locale}" for email ${email ?? 'unknown'}, falling back to 'en'`)
	return 'en'
}

/**
 * Get localized email subject with parameter substitution using the same system as the rest of the app
 * Uses the proven pattern from HeroAlternative.tsx and other components
 */
export function getLocalizedEmailSubject(
	template: EmailTemplateKey | 'verifiedEmail',
	locale: string,
	params: Record<string, string | number | undefined> = {},
	email?: string
): string {
	// Validate and normalize the locale to prevent inconsistent translations
	const validLocale = getValidLocale(locale, email)

	// Use the exact same pattern as HeroAlternative.tsx
	const translations = getTranslations(validLocale, locales)

	// Special case for verifiedEmail which is at root level, not in emails
	if (template === 'verifiedEmail') {
		// Safe access with proper type checking
		const verifiedEmailData = translations.verifiedEmail as Record<string, unknown> | undefined
		if (verifiedEmailData && 'subject' in verifiedEmailData) {
			const subject = verifiedEmailData.subject
			if (typeof subject === 'string') {
				return interpolateString(subject, params)
			}
		}
		throw new Error(`Missing verifiedEmail subject for locale: ${locale}`)
	}

	// For all other templates, they should be in emails section
	const emailsData = translations.emails as Record<string, unknown> | undefined
	if (emailsData && template in emailsData) {
		const templateData = emailsData[template] as Record<string, unknown> | undefined
		if (templateData && 'subject' in templateData) {
			const subject = templateData.subject
			if (typeof subject === 'string') {
				return interpolateString(subject, params)
			}
		}
	}

	throw new Error(`Missing email template subject: ${template} for locale: ${locale}`)
}

/**
 * Get localized email text/content with parameter substitution using the same system as the rest of the app
 * Uses the proven pattern from HeroAlternative.tsx and other components
 */
export function getLocalizedEmailText(
	template: EmailTemplateKey,
	textKey: string,
	locale: string,
	params: Record<string, string | number | undefined> = {},
	email?: string
): string {
	// Validate and normalize the locale to prevent inconsistent translations
	const validLocale = getValidLocale(locale, email)

	// Use the exact same pattern as HeroAlternative.tsx
	const translations = getTranslations(validLocale, locales)

	const emailsData = translations.emails as Record<string, unknown> | undefined
	if (!emailsData || !(template in emailsData)) {
		throw new Error(`Missing email template: ${template} for locale: ${locale}`)
	}

	const templateData = emailsData[template] as Record<string, unknown> | undefined
	if (!templateData) {
		throw new Error(`Missing email template: ${template} for locale: ${locale}`)
	}

	// Navigate through nested keys (e.g., 'layout.footer.learnMore')
	const keys = textKey.split('.')
	let value: unknown = templateData

	for (const key of keys) {
		if (value != null && typeof value === 'object' && key in value) {
			const valueObj = value as Record<string, unknown>
			value = valueObj[key]
		} else {
			value = undefined
			break
		}
	}

	if (typeof value !== 'string') {
		throw new Error(`Missing email text: ${template}.${textKey} for locale: ${locale}`)
	}

	return interpolateString(value, params)
}

/**
 * Interpolate parameters in a string template
 */
function interpolateString(template: string, params: Record<string, string | number | undefined>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) => {
		const value = params[key]
		return value !== undefined ? String(value) : match
	})
}
