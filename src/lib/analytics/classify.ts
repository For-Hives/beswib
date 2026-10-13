import type {
	ArticleLinkTarget,
	AuthErrorKind,
	FundingSource,
	PurchaseErrorKind,
	ReferrerSource,
	Section,
	SignInIntent,
	Sport,
	VerifiedEmailKind,
	WizardStep,
} from './catalog'
import { SPORTS } from './catalog'
import { PRODUCTION_HOSTNAMES } from './config'
import { stripLocale } from './url'

// Pure mappers from an open value (an error CODE, a pathname, an href, an SDK constant) to a
// closed list of the catalogue. Each one has a default branch. None of them accepts an Error or a
// message, and none of them returns its input: what comes out is always a literal written here.

function currentOrigin(): string {
	return typeof window === 'undefined' ? '' : window.location.origin
}

/** A Clerk error code (err.errors[0].code). Never pass the message. */
export function clerkErrorKind(code: string | undefined): AuthErrorKind {
	switch (code) {
		case 'form_password_incorrect':
			return 'wrong_password'
		case 'form_identifier_not_found':
			return 'account_not_found'
		case 'form_identifier_exists':
			return 'account_exists'
		case 'form_code_incorrect':
			return 'code_incorrect'
		case 'verification_expired':
			return 'code_expired'
		case 'verification_failed':
			return 'verification_failed'
		case 'form_password_pwned':
		case 'form_password_length_too_short':
		case 'form_password_length_too_long':
		case 'form_password_not_strong_enough':
		case 'form_password_validation_failed':
		case 'form_password_size_in_bytes_exceeded':
			return 'password_rejected'
		case 'captcha_invalid':
		case 'captcha_unavailable':
		case 'captcha_missing_token':
			return 'captcha'
		case 'too_many_requests':
		case 'user_locked':
			return 'rate_limited'
		case 'form_param_unknown':
		case 'form_param_format_invalid':
		case 'form_param_missing':
		case 'form_param_nil':
		case 'form_param_value_invalid':
			return 'invalid_param'
		case 'session_exists':
			return 'session_exists'
		case 'network_error':
			return 'network'
		default:
			if (code?.startsWith('oauth_') === true || code?.startsWith('external_account_') === true) return 'oauth'
			return 'unknown'
	}
}

/** The `error` code returned by the verified e-mail service. Free-text reasons map to a closed kind too. */
export function verifiedEmailKind(code: string | undefined): VerifiedEmailKind {
	switch (code) {
		case 'RATE_LIMIT_EXCEEDED':
			return 'rate_limited'
		case 'EMAIL_ALREADY_VERIFIED':
			return 'already_verified'
		case 'VERIFICATION_CODE_EXPIRED':
			return 'code_expired'
		case 'INVALID_VERIFICATION_CODE':
			return 'code_incorrect'
		case 'EMAIL_SEND_FAILED':
			return 'send_failed'
		case 'CREATE_EMAIL_FAILED':
		case 'VERIFY_EMAIL_FAILED':
		case 'FETCH_EMAILS_FAILED':
		case 'DELETE_EMAIL_FAILED':
		case 'RESEND_CODE_FAILED':
			return 'failed'
		default:
			// The spam protection answers with a sentence instead of a code
			if (code?.startsWith('Please wait') === true || code?.startsWith('Maximum daily') === true) return 'rate_limited'
			return 'unknown'
	}
}

/** A PayPal issue code (res.errorCode of captureOrder). */
export function paypalCodeKind(code: string | undefined): PurchaseErrorKind {
	switch (code) {
		case 'INSTRUMENT_DECLINED':
			return 'instrument_declined'
		case 'INSUFFICIENT_FUNDS':
			return 'insufficient_funds'
		case 'PAYER_ACCOUNT_RESTRICTED':
			return 'payer_restricted'
		default:
			return 'paypal_error'
	}
}

/** The fundingSource given by the PayPal SDK to onClick. Use the literal 'na' when no button is involved. */
export function fundingSource(sdkValue: string | undefined): FundingSource {
	switch (sdkValue) {
		case 'paypal':
			return 'paypal'
		case 'card':
			return 'card'
		case 'paylater':
		case 'credit':
			return 'paylater'
		case 'sepa':
			return 'sepa'
		default:
			return 'other'
	}
}

/** The part of the product a pathname belongs to (with or without its locale prefix). */
export function sectionOf(pathname: string | undefined): Section {
	const first = stripLocale(pathname ?? '/').path.split('/')[1] ?? ''
	switch (first) {
		case '':
			return 'home'
		case 'marketplace':
			return 'marketplace'
		case 'events':
			return 'events'
		case 'blog':
			return 'blog'
		case 'faq':
			return 'faq'
		case 'contact':
			return 'contact'
		case 'legals':
			return 'legals'
		case 'auth':
		case 'sign-in':
		case 'sign-up':
			return 'auth'
		case 'dashboard':
			return 'dashboard'
		case 'profile':
			return 'profile'
		case 'purchase':
			return 'purchase'
		default:
			return 'other'
	}
}

/** Where the visitor came from, as three cases. Reads document.referrer unless a value is given. */
export function referrerSource(referrer?: string, origin: string = currentOrigin()): ReferrerSource {
	const value = referrer ?? (typeof document === 'undefined' ? '' : document.referrer)
	if (value === '') return 'direct'
	try {
		return new URL(value).origin === origin ? 'internal' : 'external'
	} catch {
		return 'direct'
	}
}

/** What a sign-in is for, read from the redirect_url parameter of location.search. The path itself is never returned. */
export function signInIntent(search: string | undefined): SignInIntent {
	let target = ''
	try {
		const params = new URLSearchParams(search ?? '')
		target = params.get('redirect_url') ?? params.get('redirectUrl') ?? ''
	} catch {
		return 'none'
	}
	if (target.includes('/dashboard/seller')) return 'sell'
	if (target.includes('/marketplace') || target.includes('/purchase')) return 'purchase'
	return 'none'
}

/** Where a link inside an article leads. The href and the hostname are never returned. */
export function articleLinkTarget(href: string | undefined, origin: string = currentOrigin()): ArticleLinkTarget {
	const value = (href ?? '').trim()
	if (/^mailto:/i.test(value)) return 'mailto'
	// Without a browser origin (server render) a relative href is still an internal link
	const base = origin === '' ? `https://${PRODUCTION_HOSTNAMES[0]}` : origin
	let parsed: URL
	try {
		parsed = new URL(value, base)
	} catch {
		return 'external'
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return 'external'
	if (parsed.origin !== base && !PRODUCTION_HOSTNAMES.includes(parsed.hostname)) return 'external'

	const { path } = stripLocale(parsed.pathname)
	if (path.startsWith('/dashboard/seller/sell-bib')) return 'sell_bib'
	switch (path.split('/')[1] ?? '') {
		case '':
			return 'home'
		case 'marketplace':
			return 'marketplace'
		case 'events':
			return 'events'
		case 'blog':
			return 'blog'
		case 'faq':
			return 'faq'
		case 'contact':
			return 'contact'
		case 'auth':
		case 'sign-in':
		case 'sign-up':
			return 'auth'
		default:
			return 'internal_other'
	}
}

/** A step of the sell wizard, from its camelCase name in SellBibClient (STEPS). Unknown input is the first step. */
export function wizardStep(step: string | undefined): WizardStep {
	switch (step) {
		case 'emailVerification':
			return 'email_verification'
		case 'bibDetails':
			return 'bib_details'
		case 'pricing':
			return 'pricing'
		case 'confirmation':
			return 'confirmation'
		default:
			return 'event_selection'
	}
}

/** The sport of an event, from event.typeCourse (or BibSale.event.type). */
export function sportOf(typeCourse: string | null | undefined): Sport {
	return SPORTS.find(sport => sport === typeCourse) ?? 'other'
}
