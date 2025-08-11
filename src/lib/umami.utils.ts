// Utilities and typed helpers for interacting with the Umami tracker safely from TS/SSR

// Local minimal typings for the global `umami` object to avoid `any`/`unknown`.
type SafeScalar = string | number | boolean | null
type UmamiEventData = Record<string, SafeScalar>

type UmamiTrack = {
	(): Promise<string> | undefined
	(event_name: string, event_data?: UmamiEventData): Promise<string> | undefined
	(custom_payload: { website: string; [key: string]: SafeScalar }): Promise<string> | undefined
	(
		callback: (props: {
			hostname: string
			language: string
			referrer: string
			screen: string
			title: string
			url: string
			website: string
		}) => { website: string; [key: string]: SafeScalar }
	): Promise<string> | undefined
}

type UmamiIdentify = (
	userId: string,
	data?: Record<string, string | number | boolean | null>
) => Promise<string> | undefined

interface UmamiGlobal {
	track: UmamiTrack
	identify?: UmamiIdentify
}

export type UmamiPayload = {
	website?: string
	url?: string
	referrer?: string
	hostname?: string
	language?: string
	screen?: string
	title?: string
	event_name?: string
	event_data?: UmamiEventData
}

// Basic payload guard (kept strict to avoid `any`/`unknown`)
function isValidPayload(payload: UmamiPayload | false | null | undefined): payload is UmamiPayload {
	return payload !== null && payload !== undefined && typeof payload === 'object'
}

// Optional privacy filter: redacts common PII keys if present
function sanitizePayload(payload: UmamiPayload): UmamiPayload {
	if (payload.event_data) {
		const redactKeys = ['email', 'name'] as const
		for (const key of redactKeys) {
			if (key in payload.event_data) {
				// Redact the value but keep the key shape intact
				payload.event_data[key] = '[redacted]'
			}
		}
	}
	return payload
}

// Exposed beforeSend handler used by the <Script data-before-send="beforeSendHandler" /> hook
export function beforeSendHandler(_type: string, payload: UmamiPayload): UmamiPayload | false {
	if (!isValidPayload(payload)) return false
	return sanitizePayload(payload)
}

// Make sure the global hook exists when this module is executed in the browser and imported anywhere
if (typeof window !== 'undefined') {
	// Ensure the global hook exists for the Umami script's data-before-send lookup
	window.beforeSendHandler = beforeSendHandler
}

// SSR-safe accessor
function getClientUmami(): UmamiGlobal | undefined {
	if (typeof window === 'undefined') return undefined
	const w: Window & { umami?: UmamiGlobal } = window as Window & { umami?: UmamiGlobal }
	return w.umami
}

// Helper: track wrapper with typing and SSR guard
export function umamiTrack(): Promise<string> | undefined
export function umamiTrack(eventName: string, eventData?: UmamiEventData): Promise<string> | undefined
export function umamiTrack(custom: { website: string; [key: string]: SafeScalar }): Promise<string> | undefined
export function umamiTrack(
	arg1?: string | { website: string; [key: string]: SafeScalar },
	arg2?: UmamiEventData
): Promise<string> | undefined {
	const u = getClientUmami()
	if (u === undefined) return undefined
	if (typeof arg1 === 'undefined') return u.track()
	if (typeof arg1 === 'string') return u.track(arg1, arg2)
	return u.track(arg1)
}

// Helper: identify wrapper with typing and SSR guard
export function umamiIdentify(
	userId: string,
	data?: Record<string, string | number | boolean | null>
): Promise<string> | undefined {
	const u = getClientUmami()
	if (u === undefined || typeof u.identify !== 'function') return undefined
	return u.identify(userId, data)
}
