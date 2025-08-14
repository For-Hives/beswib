import { getTranslations } from '@/lib/getDictionary'
import mainLocales from '@/app/[locale]/locales.json'
import { Locale } from '@/lib/i18n-config'

export interface ClerkErrorTranslations {
	form_identifier_not_found: string
	form_password_incorrect: string
	form_identifier_exists: string
	session_exists: string
	clerk_js_error: string

	form_code_incorrect: string
	verification_expired: string
	verification_failed: string

	form_param_nil: string
	form_password_pwned: string
	form_password_too_common: string

	oauth_access_denied: string
	oauth_email_domain_reserved_by_saml: string

	network_error: string
	unexpected_error: string

	too_many_requests: string

	signin_failed: string
	signup_failed: string
	default_error: string
}

function getClerkTranslationsFromLocales(locale: Locale): ClerkErrorTranslations | null {
	try {
		const t = getTranslations(locale, mainLocales) as { clerkErrors?: ClerkErrorTranslations }
		return t.clerkErrors ?? null
	} catch {
		return null
	}
}

function getClerkTranslations(locale: Locale): ClerkErrorTranslations {
	const jsonBased = getClerkTranslationsFromLocales(locale)
	if (jsonBased) return jsonBased

	const en = getClerkTranslationsFromLocales('en' as Locale)
	if (en) return en

	return {
		verification_failed: 'Verification failed. Please try again.',
		verification_expired: 'The verification code has expired. Request a new code.',
		unexpected_error: 'An unexpected error occurred. Please try again.',
		too_many_requests: 'Too many attempts. Please wait before trying again.',
		signup_failed: 'Sign up failed. Please try again.',
		signin_failed: 'Sign in failed. Check your credentials.',
		session_exists: 'You are already signed in.',
		oauth_email_domain_reserved_by_saml: 'This email address is reserved for SAML login.',
		oauth_access_denied: 'Access was denied. Please try again.',
		network_error: 'Connection error. Check your internet connection.',
		form_password_too_common: 'This password is too common. Please choose a more secure one.',
		form_password_pwned: 'This password has been compromised in a security breach. Please choose another one.',
		form_password_incorrect: 'Incorrect password.',
		form_param_nil: 'All fields are required.',
		form_identifier_not_found: 'No account found with this email address.',
		form_identifier_exists: 'An account already exists with this email address.',
		form_code_incorrect: 'Incorrect verification code.',
		default_error: 'An error occurred. Please try again.',
		clerk_js_error: 'A technical error occurred. Please try again.',
	}
}

export function translateClerkError(error: unknown, locale: Locale = 'fr'): string {
	const translations = getClerkTranslations(locale)
	if (!error) return translations.default_error

	type ClerkUnknownError = Partial<{
		code: string
		message: string
		errors: Array<Partial<{ code: string; message: string; longMessage: string }>>
	}>
	const e = (error ?? {}) as ClerkUnknownError

	const errorCode = e.code ?? e.errors?.[0]?.code
	const errorMessage = e.message ?? e.errors?.[0]?.message ?? e.errors?.[0]?.longMessage

	if (typeof errorCode === 'string' && (translations as unknown as Record<string, string>)[errorCode]) {
		return (translations as unknown as Record<string, string>)[errorCode]
	}

	if (typeof errorMessage === 'string') {
		const lowerMessage = errorMessage.toLowerCase()

		if (lowerMessage.includes('password') && lowerMessage.includes('incorrect')) {
			return translations.form_password_incorrect
		}

		if (lowerMessage.includes('email') && lowerMessage.includes('not found')) {
			return translations.form_identifier_not_found
		}

		if (lowerMessage.includes('already exists') || lowerMessage.includes('already taken')) {
			return translations.form_identifier_exists
		}

		if (lowerMessage.includes('verification') && lowerMessage.includes('code')) {
			return translations.form_code_incorrect
		}

		if (lowerMessage.includes('expired')) {
			return translations.verification_expired
		}

		if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
			return translations.too_many_requests
		}
	}

	if (typeof errorMessage === 'string') {
		return errorMessage
	}
	return translations.default_error
}
