import locales from '@/constants/locales.json'

// Type definitions for locales structure
type LocaleData = typeof locales
type LocaleKey = keyof LocaleData
type EmailTemplates = LocaleData[LocaleKey]['emails']

/**
 * Supported locales in the application
 */
export const SUPPORTED_LOCALES = ['en', 'fr', 'ko', 'es', 'it', 'de', 'ro', 'pt', 'nl'] as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

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
	template: keyof EmailTemplates,
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	const safeLocale = getSafeLocale(locale)
	
	try {
		const localeData = locales[safeLocale] as LocaleData[SupportedLocale]
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
	template: keyof EmailTemplates,
	textKey: string,
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	const safeLocale = getSafeLocale(locale)
	
	try {
		const localeData = locales[safeLocale] as LocaleData[SupportedLocale]
		const templateData = localeData?.emails?.[template] as Record<string, any>
		
		if (!templateData) {
			console.warn(`Missing email template: ${template} for locale: ${safeLocale}`)
			return getFallbackText(template, textKey, safeLocale, params)
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
			return getFallbackText(template, textKey, safeLocale, params)
		}
		
		return interpolateString(value, params)
	} catch (error) {
		console.error('Error getting localized email text:', error)
		return getFallbackText(template, textKey, safeLocale, params)
	}
}

/**
 * Interpolate parameters in a string template
 */
function interpolateString(
	template: string, 
	params: Record<string, string | number | undefined>
): string {
	return template.replace(/\{(\w+)\}/g, (match, key) => {
		const value = params[key]
		return value !== undefined ? String(value) : match
	})
}

/**
 * Fallback subject generation for when localization fails
 */
function getFallbackSubject(
	template: string,
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	switch (template) {
		case 'verifiedEmail':
			return locale === 'fr' ? '🔐 Confirmez votre adresse email - Beswib' : '🔐 Verify your email address - Beswib'
		case 'welcome':
			const firstName = params.firstName ?? ''
			return locale === 'fr'
				? `Bienvenue sur Beswib${firstName !== '' ? `, ${firstName}` : ''} ! 🏃‍♂️`
				: `Welcome to Beswib${firstName !== '' ? `, ${firstName}` : ''} ! 🏃‍♂️`
		case 'waitlistConfirmation':
			const eventName = params.eventName ?? (locale === 'fr' ? 'votre événement' : 'your event')
			return locale === 'fr'
				? `🎯 Inscription en liste d'attente confirmée - ${eventName}`
				: `🎯 Waitlist registration confirmed - ${eventName}`
		case 'saleConfirmation':
			return locale === 'fr'
				? 'Félicitations ! Votre dossard a été vendu 💰'
				: 'Congratulations! Your bib has been sold 💰'
		case 'purchaseConfirmation':
			return locale === 'fr'
				? 'Félicitations ! Votre achat a été confirmé 🏃‍♂️'
				: 'Congratulations! Your purchase has been confirmed 🏃‍♂️'
		case 'saleAlert':
			const eventNameAlert = params.eventName ?? 'Event'
			const bibPrice = params.bibPrice ?? 0
			return `🚨 ${locale === 'fr' ? 'Alerte Nouvelle Vente' : 'New Sale Alert'} - ${eventNameAlert} • ${bibPrice}€`
		case 'waitlistAlert':
			const eventNameWaitlist = params.eventName ?? (locale === 'fr' ? 'votre événement' : 'your event')
			return locale === 'fr'
				? `🎯 Dossard disponible pour ${eventNameWaitlist} !`
				: `🎯 Bib available for ${eventNameWaitlist}!`
		case 'bibApproval':
			return locale === 'fr'
				? 'Félicitations ! Votre dossard a été approuvé 🎉'
				: 'Congratulations! Your bib has been approved 🎉'
		case 'purchaseApproval':
			return locale === 'fr'
				? 'Tout est en ordre ! Votre achat a été validé 🎉'
				: 'All set! Your purchase has been validated 🎉'
		default:
			return 'Beswib Email'
	}
}

/**
 * Fallback text generation for when localization fails
 */
function getFallbackText(
	template: string,
	textKey: string,
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	// Basic fallback for common text keys
	switch (textKey) {
		case 'greeting':
			return locale === 'fr' ? 'Bonjour' : 'Hello'
		case 'team':
			return locale === 'fr' ? "L'équipe Beswib" : 'The Beswib Team'
		case 'footer.happyRunning':
			return locale === 'fr' ? 'Bonnes courses !' : 'Happy running!'
		default:
			return textKey // Return the key itself as last resort
	}
}
