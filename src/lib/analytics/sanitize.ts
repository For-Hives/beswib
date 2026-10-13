import { type EventData, type EventSpec, getEventSpec, type PropSpec } from './catalog'

// Runtime guard of the closed catalogue. TypeScript already refuses a wrong call; this is what
// protects against a cast, a stale bundle, a direct window.umami call or a hand-written
// data-umami-event attribute. It is run at call time (track, trackView, umamiAttrs, trackServer)
// and again by the before-send hook on everything that leaves the browser.

/** PocketBase record ids: 15 lower-case alphanumerics. A Clerk id, an e-mail or a token cannot match. */
const ID_PATTERN = /^[a-z0-9]{15}$/
const INT_STRING_PATTERN = /^\d{1,6}$/

export interface SanitizedEvent {
	name: string
	side: EventSpec['side']
	data: EventData
}

const INVALID = Symbol('invalid')

function sanitizeValue(spec: PropSpec, value: unknown): string | number | boolean | typeof INVALID {
	switch (spec.type) {
		case 'enum':
		case 'bucket':
			return typeof value === 'string' && spec.values.includes(value) ? value : INVALID
		case 'boolean':
			if (value === true || value === 'true') return true
			if (value === false || value === 'false') return false
			return INVALID
		case 'int': {
			// Data attributes carry strings: digits are read back as a number
			const parsed = typeof value === 'string' && INT_STRING_PATTERN.test(value) ? Number(value) : value
			if (typeof parsed !== 'number' || !Number.isFinite(parsed)) return INVALID
			return Math.min(Math.max(Math.trunc(parsed), 0), spec.max)
		}
		case 'id':
			return typeof value === 'string' && ID_PATTERN.test(value) ? value : INVALID
		default:
			return INVALID
	}
}

/**
 * Checks an event against the catalogue and returns what may be sent, or null when the event must
 * be dropped:
 *  - the name is not an event of the catalogue -> null
 *  - a declared property has a value outside its definition -> null (never a partial event)
 *  - a required property is missing -> null
 *  - a property that is not declared is removed (so is `locale`, which only the hook adds)
 * Strings coming from data attributes are coerced: 'true' / 'false' to booleans, digits to an
 * integer; integers are truncated and clamped to 0..max. A property set to undefined or null
 * counts as absent.
 */
export function sanitizeEvent(name: unknown, data?: unknown): SanitizedEvent | null {
	const spec = getEventSpec(name)
	if (spec == null || typeof name !== 'string') return null

	const input: Record<string, unknown> =
		data != null && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : {}
	const output: EventData = {}

	for (const key of Object.keys(spec.props)) {
		const propSpec = spec.props[key]
		const value = Object.hasOwn(input, key) ? input[key] : undefined
		if (value == null) {
			if (propSpec.optional === true) continue
			return null
		}
		const clean = sanitizeValue(propSpec, value)
		if (clean === INVALID) return null
		output[key] = clean
	}

	return { side: spec.side, name, data: output }
}
