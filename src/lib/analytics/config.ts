import { i18n } from '@/lib/i18n/config'

// Static configuration of the Umami integration. No secret lives here: the website id is public
// (it is printed in the page source) and both variables below are optional verification knobs.

const DEFAULT_UMAMI_HOST = 'https://umami.wadefade.fr'
const DEFAULT_UMAMI_DOMAINS = 'beswib.com'

function envOr(value: string | undefined, fallback: string): string {
	const trimmed = (value ?? '').trim()
	return trimmed === '' ? fallback : trimmed
}

function withoutTrailingSlashes(value: string): string {
	let end = value.length
	while (end > 0 && value[end - 1] === '/') end--
	return value.slice(0, end)
}

/** Origin of the Umami instance: serves /script.js and receives /api/send. No trailing slash. */
export const UMAMI_HOST = withoutTrailingSlashes(envOr(process.env.NEXT_PUBLIC_UMAMI_HOST, DEFAULT_UMAMI_HOST))

/** Value of data-domains: the tracker stays inert on any other hostname (exact match, comma separated). */
export const UMAMI_DOMAINS = envOr(process.env.NEXT_PUBLIC_UMAMI_DOMAINS, DEFAULT_UMAMI_DOMAINS)

export const UMAMI_WEBSITE_ID = 'e9168017-b73b-491b-b7b0-fee64f07c847'

export const UMAMI_SCRIPT_URL = `${UMAMI_HOST}/script.js`
export const UMAMI_SEND_URL = `${UMAMI_HOST}/api/send`

/** Name of the global function the tracker looks up at every send (data-before-send). */
export const BEFORE_SEND_GLOBAL = 'beswibBeforeSend'

/** The only query parameters that may leave the browser. Everything else is dropped. */
export const QUERY_ALLOW_LIST = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/** A campaign value longer than this is not a campaign name. */
export const UTM_VALUE_MAX_LENGTH = 80

/** The locales of the app: the only path segments treated as a locale prefix. */
export const LOCALES = i18n.locales

/** Server events are sent only when NEXT_PUBLIC_BASE_URL points at one of these hostnames. */
export const PRODUCTION_HOSTNAMES: readonly string[] = ['beswib.com', 'www.beswib.com']

/** Hostname and URL recorded with server events (they belong to no visitor and no page). */
export const SERVER_EVENT_HOSTNAME = 'beswib.com'
export const SERVER_EVENT_URL = '/_server'

/** Server events never wait longer than this for Umami. */
export const SERVER_SEND_TIMEOUT_MS = 2000

/** Events tracked before the tracker has loaded wait in a queue of this size, for this long. */
export const CLIENT_QUEUE_LIMIT = 30
export const CLIENT_QUEUE_POLL_MS = 250
export const CLIENT_QUEUE_MAX_WAIT_MS = 10_000

/** trackView() sends the same view (name + props + pathname) once within this window. */
export const VIEW_DEDUPE_WINDOW_MS = 2000
