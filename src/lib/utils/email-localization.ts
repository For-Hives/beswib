import { getTranslations } from '@/lib/i18n/dictionary'
import locales from '@/constants/locales.json'

// Type definitions for locales structure
type LocaleData = typeof locales
export type EmailTemplateKey = keyof LocaleData[keyof LocaleData]['emails']

/**
 * Get localized email subject with parameter substitution using the same system as the rest of the app
 */
export function getLocalizedEmailSubject(
	template: EmailTemplateKey | 'verifiedEmail',
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	const translations = getTranslations(locale, locales) as any

	// Special case for verifiedEmail which is at root level, not in emails
	if (template === 'verifiedEmail') {
		const subject = translations.verifiedEmail?.subject as string
		if (!subject) {
			throw new Error(`Missing verifiedEmail subject for locale: ${locale}`)
		}
		return interpolateString(subject, params)
	}

	// For all other templates, they should be in emails section
	const emailTemplate = translations.emails?.[template]?.subject as string
	if (!emailTemplate) {
		throw new Error(`Missing email template subject: ${template} for locale: ${locale}`)
	}

	return interpolateString(emailTemplate, params)
}

/**
 * Get localized email text/content with parameter substitution using the same system as the rest of the app
 */
export function getLocalizedEmailText(
	template: EmailTemplateKey,
	textKey: string,
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	const translations = getTranslations(locale, locales) as any

	const templateData = translations.emails?.[template]
	if (!templateData) {
		throw new Error(`Missing email template: ${template} for locale: ${locale}`)
	}

	// Navigate through nested keys (e.g., 'layout.footer.learnMore')
	const keys = textKey.split('.')
	let value: any = templateData

	for (const key of keys) {
		value = value?.[key]
		if (value === undefined) break
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
	return template.replace(/\{(\w+)\}/g, (match, key) => {
		const value = params[key]
		return value !== undefined ? String(value) : match
	})
}
