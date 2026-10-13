import type { Locale } from '@/lib/i18n/config'

import type { EventData } from './catalog'
import { BEFORE_SEND_GLOBAL, LOCALES } from './config'
import { sanitizeEvent } from './sanitize'
import { cleanReferrer, cleanUrl } from './url'

// The before-send hook of the Umami tracker (data-before-send="beswibBeforeSend").
//
// What the deployed tracker does (https://umami.wadefade.fr/script.js), and what this file relies on:
//  - at EVERY send it looks up window[<data-before-send>]; when that is a function it awaits
//    fn(type, payload) and sends the result, and a falsy result cancels the send. When the
//    function is missing the RAW payload is sent: hence the new global name and <UmamiScript>,
//    which only renders the tracker once the hook is registered.
//  - type is 'event' (page views have no `name`, named events have `name` and `data`),
//    'identify' or 'performance'.
//  - every payload is { website, screen, language, title, hostname, url, referrer, tag, id }
//    where `url` is the absolute current URL, `referrer` the previous one (or document.referrer
//    when it is another site) and `id` whatever was once given to umami.identify().
//  - data-umami-event-* attribute values arrive as strings in `data`.
//
// Rules applied here:
//  1. Never throw, and fail closed: on any doubt nothing is sent. A raw URL never leaves.
//  2. The payload is REBUILT from an allow-list of top-level keys; it is never passed through.
//     `id` is therefore never sent, nor any unknown key.
//  3. url and referrer are cleaned (see url.ts). title is left as the tracker sends it.
//  4. 'identify' is dropped: nothing identifies a visitor.
//  5. A page view whose cleaned URL equals the previous page view sent is dropped (list filters
//     push a history entry on every change; once cleaned they are all the same page).
//  6. A named event must be a client event of the catalogue with valid properties, otherwise it
//     is dropped. Named events are also dropped under /admin (page views are kept there).
//  7. data.locale is added to every browser event (page views included).

/** Top-level keys copied as they are, when they are strings. */
const ENVELOPE_KEYS = ['website', 'hostname', 'screen', 'language', 'title', 'tag'] as const
/** Web-vital metrics of a 'performance' payload: numbers only. */
const PERFORMANCE_KEYS = ['ttfb', 'fcp', 'lcp', 'cls', 'inp', 'duration'] as const
const ADMIN_PATH = /^\/admin(\/|$)/

export type BeforeSendResult = Record<string, unknown> | false

let lastPageViewUrl: string | null = null

function documentLocale(): Locale | null {
	if (typeof document === 'undefined') return null
	const lang = document.documentElement.lang
	return LOCALES.find(locale => locale === lang) ?? null
}

function clean(type: unknown, payload: unknown): BeforeSendResult {
	if (typeof window === 'undefined') return false
	if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) return false
	if (type === 'identify') return false

	const source = payload as Record<string, unknown>
	const origin = window.location.origin

	const cleaned = cleanUrl(source.url, origin)
	if (cleaned == null) return false

	const envelope: Record<string, unknown> = {}
	for (const key of ENVELOPE_KEYS) {
		if (typeof source[key] === 'string') envelope[key] = source[key]
	}
	envelope.url = cleaned.url
	envelope.referrer = cleanReferrer(source.referrer, origin)

	if (type === 'performance') {
		for (const key of PERFORMANCE_KEYS) {
			const value = source[key]
			if (typeof value === 'number' && Number.isFinite(value)) envelope[key] = value
		}
		return envelope
	}

	// Any type this file does not know gets the cleaned envelope and nothing else
	if (type !== 'event') return envelope

	const locale = cleaned.locale ?? documentLocale()
	const localeData: EventData = locale == null ? {} : { locale }

	if (source.name === undefined) {
		// Page view
		if (cleaned.url === lastPageViewUrl) return false
		lastPageViewUrl = cleaned.url
		return { ...envelope, data: localeData }
	}

	const event = sanitizeEvent(source.name, source.data)
	if (event == null || event.side !== 'client') return false
	if (ADMIN_PATH.test(cleaned.path)) return false

	return { ...envelope, name: event.name, data: { ...event.data, ...localeData } }
}

/** The hook itself. Returns the payload to send, or false to cancel the send. Never throws. */
export function beswibBeforeSend(type: unknown, payload: unknown): BeforeSendResult {
	try {
		return clean(type, payload)
	} catch {
		return false
	}
}

/**
 * Publishes the hook under the global name read by the tracker. Returns true when the hook is in
 * place: <UmamiScript> renders the tracker only then.
 */
export function registerBeforeSend(): boolean {
	if (typeof window === 'undefined') return false
	try {
		window[BEFORE_SEND_GLOBAL] = beswibBeforeSend
		return window[BEFORE_SEND_GLOBAL] === beswibBeforeSend
	} catch {
		return false
	}
}
