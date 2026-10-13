import type { Locale } from '@/lib/i18n/config'

import { LOCALES, QUERY_ALLOW_LIST, UTM_VALUE_MAX_LENGTH } from './config'

// URL cleaning shared by the before-send hook and the classifiers. Pure functions: they never read
// `window`, the caller passes the origin.

export interface CleanedUrl {
	/** Absolute URL, as the tracker sends it: origin + cleaned path + allow-listed query. No hash. */
	url: string
	/** Cleaned path alone: no locale prefix, ids masked. Always starts with '/'. */
	path: string
	/** Locale found (and removed) at the start of the path, when there was one. */
	locale: Locale | null
}

const EDIT_BIB_PATH = /^(\/dashboard\/seller\/edit-bib\/)[^/]+/

function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value)
}

/**
 * Removes the leading path segment only when it is exactly one of the app's locales, followed by
 * '/' or the end of the path: '/fr' and '/fr/events' are stripped, '/france' and '/xx/events' are not.
 */
export function stripLocale(pathname: string): { path: string; locale: Locale | null } {
	const segments = pathname.split('/')
	const first = segments[1] ?? ''
	if (segments[0] !== '' || !isLocale(first)) {
		return { path: pathname.startsWith('/') ? pathname : `/${pathname}`, locale: null }
	}
	const rest = segments.slice(2).join('/')
	return { path: `/${rest}`, locale: first }
}

/** Masks the ids that would make a path point at one person's record. */
export function maskPath(path: string): string {
	return path.replace(EDIT_BIB_PATH, '$1:id')
}

function isSafeCampaignValue(value: string): boolean {
	if (value === '' || value.length > UTM_VALUE_MAX_LENGTH) return false
	// An address or a sentence is not a campaign name
	return !/[@\s]/.test(value) && !/%40/i.test(value)
}

function cleanQuery(params: URLSearchParams): string {
	const kept = new URLSearchParams()
	for (const key of QUERY_ALLOW_LIST) {
		const value = params.get(key)
		if (value != null && isSafeCampaignValue(value)) kept.set(key, value)
	}
	const query = kept.toString()
	return query === '' ? '' : `?${query}`
}

/**
 * Cleans a page URL: locale prefix removed, every query parameter dropped except utm_*, hash
 * dropped, /dashboard/seller/edit-bib/<id> masked. Returns null when the value cannot be parsed
 * as an http(s) URL: the caller must then send nothing.
 */
export function cleanUrl(raw: unknown, origin: string): CleanedUrl | null {
	if (typeof raw !== 'string' || raw === '') return null
	let parsed: URL
	try {
		parsed = new URL(raw, origin)
	} catch {
		return null
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

	const { path: unprefixed, locale } = stripLocale(parsed.pathname)
	const path = maskPath(unprefixed)

	return { url: `${parsed.origin}${path}${cleanQuery(parsed.searchParams)}`, path, locale }
}

/**
 * Cleans a referrer. Same origin: cleaned exactly like a page URL. Another site: its origin only
 * (no path, no query, no hash). Anything unusable becomes ''.
 */
export function cleanReferrer(raw: unknown, origin: string): string {
	if (typeof raw !== 'string' || raw === '') return ''
	let parsed: URL
	try {
		parsed = new URL(raw, origin)
	} catch {
		return ''
	}
	if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
		if (parsed.origin === origin) return cleanUrl(raw, origin)?.url ?? ''
		return parsed.origin
	}
	// android-app://com.example and the like have no web origin: keep the scheme and the host
	return parsed.host === '' ? '' : `${parsed.protocol}//${parsed.host}`
}
