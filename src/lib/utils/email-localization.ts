import { getTranslations } from '@/lib/i18n/dictionary'
import locales from '@/constants/locales.json'

// Type definitions for locales structure
type LocaleData = typeof locales
export type EmailTemplateKey = keyof LocaleData[keyof LocaleData]['emails']

/**
 * Get localized email subject with parameter substitution using the same system as the rest of the app
 * Uses the proven pattern from HeroAlternative.tsx and other components
 */
export function getLocalizedEmailSubject(
	template: EmailTemplateKey | 'verifiedEmail',
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	// Use the exact same pattern as HeroAlternative.tsx
	const translations = getTranslations(locale, locales)

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
	params: Record<string, string | number | undefined> = {}
): string {
	// Use the exact same pattern as HeroAlternative.tsx
	const translations = getTranslations(locale, locales)

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
