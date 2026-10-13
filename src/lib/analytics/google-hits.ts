import { cleanQuery, maskPath, stripLocale } from './url'

// What leaves the browser for Google Analytics, once a visitor has allowed it.
//
// gtag.js has no before-send hook (Umami's tracker has one, see before-send.ts) and reads the
// address bar itself: every hit carries the page URL (dl) and the previous one (dr) with their query
// string, and the GA4 stream adds page views of its own at each history change, built from the
// same raw URLs. A private-listing token (?tkn=), a name or a Clerk ticket would leave with them.
// The stream's redaction settings live in the Google Analytics admin, not in this repository, so
// the hits are cleaned where they leave the page: fetch() and navigator.sendBeacon(), the two
// transports gtag.js uses in a browser that has fetch.
//
// Rules applied here:
//  1. Only requests to Google's measurement endpoints are looked at. Any other request goes
//     through with the arguments it came with.
//  2. In a hit, every parameter whose value is an http(s) URL is rewritten, in the query string
//     and in each line of the body (batched events). A URL of this site keeps its path and its
//     utm_* parameters (same rules as url.ts, except that the locale stays: Google Analytics
//     reports the address the visitor sees). A URL of another site keeps its origin only.
//     What the stream copies out of the query string (the term of a site search) is removed.
//     Every other parameter is passed byte for byte.
//  3. Never throw, and fail closed: a hit that cannot be read is not sent. It is reported as sent,
//     because gtag.js retries a refused hit through an image request, which nothing here sees.

/** Hosts that only receive measurement hits. */
const HIT_HOST = /(^|\.)(google-analytics\.com|analytics\.google\.com|doubleclick\.net|googlesyndication\.com)$/
/** google.com and its country domains serve much more than hits: only their collection paths count. */
const GOOGLE_HOST = /(^|\.)google\.(com?\.)?[a-z]{2,3}$/
const GOOGLE_HIT_PATH = /^\/(g\/collect|ccm\/|ads\/ga-audiences|pagead\/)/

const ABSOLUTE_URL = /^https?:\/\//i
/**
 * Parameters the GA4 stream fills from the query string on its own: its site search copies
 * ?search=, ?q= and the like into search_term (and extra ones into q_<name>).
 */
const QUERY_COPY = /^ep\.(search_term$|q_)/
const LINE_BREAK = /(\r?\n)/

/** True when a request URL is a hit for Google Analytics (or for the Google products it feeds). */
export function isGoogleHit(url: string, base: string): boolean {
	let parsed: URL
	try {
		parsed = new URL(url, base)
	} catch {
		return false
	}
	if (HIT_HOST.test(parsed.hostname)) return true
	return GOOGLE_HOST.test(parsed.hostname) && GOOGLE_HIT_PATH.test(parsed.pathname)
}

/**
 * A URL as Google may receive it. `hostname` is the site's own: its URLs keep their path (ids
 * masked) and utm_*, the others their origin. Returns null when the value is not an http(s) URL.
 */
export function cleanGoogleUrl(raw: string, hostname: string): string | null {
	let parsed: URL
	try {
		parsed = new URL(raw)
	} catch {
		return null
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
	if (parsed.hostname !== hostname) return parsed.origin

	const { path, locale } = stripLocale(parsed.pathname)
	const masked = maskPath(path)
	const pathname = locale == null ? masked : `/${locale}${masked === '/' ? '' : masked}`
	return `${parsed.origin}${pathname}${cleanQuery(parsed.searchParams)}`
}

/**
 * Cleans the URL-valued parameters of one urlencoded string: the query string of a hit, or one
 * line of its body. The other parameters keep the exact encoding gtag.js gave them.
 */
export function cleanHitParams(encoded: string, hostname: string): string {
	return encoded
		.split('&')
		.flatMap(pair => {
			const separator = pair.indexOf('=')
			if (separator === -1) return pair
			if (QUERY_COPY.test(pair.slice(0, separator))) return []
			const rawValue = pair.slice(separator + 1)
			let value = rawValue
			try {
				value = decodeURIComponent(rawValue)
			} catch {
				// Malformed escape: judged as it is written
			}
			if (!ABSOLUTE_URL.test(value)) return pair
			// What looks like a URL and cannot be read as one leaves empty
			return `${pair.slice(0, separator)}=${encodeURIComponent(cleanGoogleUrl(value, hostname) ?? '')}`
		})
		.join('&')
}

export interface CleanedHit {
	url: string
	/** Present only when the hit had a body. */
	body?: string
}

/**
 * Cleans one hit: the request URL and, for batched events, its body. Returns null when the hit
 * cannot be read (gtag.js only ever sends text): the caller must then send nothing.
 */
export function cleanGoogleHit(url: string, body: unknown, hostname: string): CleanedHit | null {
	try {
		if (body != null && typeof body !== 'string') return null
		const query = url.indexOf('?')
		const cleanedUrl =
			query === -1 ? url : `${url.slice(0, query + 1)}${cleanHitParams(url.slice(query + 1), hostname)}`
		if (body == null) return { url: cleanedUrl }
		// One event per line; the line breaks are kept as gtag.js wrote them
		const lines = body.split(LINE_BREAK).map(part => (LINE_BREAK.test(part) ? part : cleanHitParams(part, hostname)))
		return { url: cleanedUrl, body: lines.join('') }
	} catch {
		return null
	}
}

function requestUrl(input: RequestInfo | URL): string | null {
	if (typeof input === 'string') return input
	if (input instanceof URL) return input.href
	return typeof input?.url === 'string' ? input.url : null
}

function install(): boolean {
	if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
	try {
		const nativeFetch = window.fetch
		const nativeSendBeacon = navigator.sendBeacon
		if (typeof nativeFetch !== 'function') return false

		const guardedFetch: typeof window.fetch = (...args) => {
			const [input, init] = args
			const url = requestUrl(input)
			if (url == null || !isGoogleHit(url, window.location.href)) return nativeFetch.apply(window, args)
			// A Request object carries its own body and cannot be rewritten: gtag.js never builds one
			const hit =
				typeof input === 'string' || input instanceof URL
					? cleanGoogleHit(url, init?.body, window.location.hostname)
					: null
			if (hit == null) return Promise.resolve(new Response(null, { status: 204 }))
			return nativeFetch.call(window, hit.url, hit.body === undefined ? init : { ...init, body: hit.body })
		}
		window.fetch = guardedFetch
		if (window.fetch !== guardedFetch) return false

		// A browser without sendBeacon gives gtag.js nothing else to send with than fetch
		if (typeof nativeSendBeacon !== 'function') return true
		const guardedSendBeacon: typeof navigator.sendBeacon = (url, data) => {
			const target = requestUrl(url)
			if (target == null || !isGoogleHit(target, window.location.href))
				return nativeSendBeacon.call(navigator, url, data)
			const hit = cleanGoogleHit(target, data, window.location.hostname)
			if (hit == null) return true
			return nativeSendBeacon.call(navigator, hit.url, hit.body)
		}
		navigator.sendBeacon = guardedSendBeacon
		return navigator.sendBeacon === guardedSendBeacon
	} catch {
		return false
	}
}

let installed: boolean | null = null

/**
 * Puts the cleaning in front of fetch() and navigator.sendBeacon(), once per document. Returns
 * true when it is in place: <ConsentedGoogleAnalytics> mounts the Google tag only then.
 */
export function installGoogleHitGuard(): boolean {
	installed ??= install()
	return installed
}
