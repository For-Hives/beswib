import type { ClientEventName, EventData, PropsArg } from './catalog'
import { CLIENT_QUEUE_LIMIT, CLIENT_QUEUE_MAX_WAIT_MS, CLIENT_QUEUE_POLL_MS, VIEW_DEDUPE_WINDOW_MS } from './config'
import { sanitizeEvent } from './sanitize'
import { isBackOfficePath } from './url'

// Browser-side sending. Nothing else in the app calls window.umami.
//
// The tracker creates window.umami as soon as its script runs, and umami.track(name, data) builds
// the payload from the URL the tracker currently knows, then goes through the before-send hook.
// Until the script has loaded (it is rendered after hydration, see <UmamiScript>) events wait in
// a small queue; when the tracker never comes (ad-blocker) the queue is dropped.

interface QueuedEvent {
	name: string
	data: EventData
}

let queue: QueuedEvent[] = []
let pollTimer: ReturnType<typeof setInterval> | null = null
let pollStartedAt = 0
const recentViews = new Map<string, number>()

function getTracker(): ((name: string, data: EventData) => unknown) | null {
	const tracker = window.umami
	if (tracker == null || typeof tracker.track !== 'function') return null
	return (name, data) => tracker.track(name, data)
}

function send(trackerSend: (name: string, data: EventData) => unknown, event: QueuedEvent): void {
	try {
		const result = trackerSend(event.name, event.data)
		// The tracker returns a promise: a rejection must not surface as an unhandled one
		if (result instanceof Promise) result.catch(() => undefined)
	} catch {
		// Analytics never breaks the page
	}
}

function stopPolling(): void {
	if (pollTimer != null) clearInterval(pollTimer)
	pollTimer = null
}

function startPolling(): void {
	if (pollTimer != null) return
	pollStartedAt = Date.now()
	pollTimer = setInterval(() => {
		flushQueue()
		if (queue.length > 0 && Date.now() - pollStartedAt >= CLIENT_QUEUE_MAX_WAIT_MS) {
			// The tracker never loaded: forget what was waiting
			queue = []
		}
		if (queue.length === 0) stopPolling()
	}, CLIENT_QUEUE_POLL_MS)
}

/** Sends what is waiting, when the tracker is there. Called by <UmamiScript> once the script has loaded. */
export function flushQueue(): void {
	try {
		if (typeof window === 'undefined' || queue.length === 0) return
		const trackerSend = getTracker()
		if (trackerSend == null) return
		const pending = queue
		queue = []
		stopPolling()
		for (const event of pending) send(trackerSend, event)
	} catch {
		// Analytics never breaks the page
	}
}

function dispatch(name: string, props: unknown, dedupe: boolean): void {
	try {
		if (typeof window === 'undefined') return

		const event = sanitizeEvent(name, props)
		if (event == null || event.side !== 'client') {
			if (process.env.NODE_ENV !== 'production') {
				console.warn(`[analytics] "${name}" was dropped: not a client event of the catalogue, or invalid properties`)
			}
			return
		}

		// Nothing is recorded from the back-office, and nothing tracked there may wait in the queue
		// for the next page. (The before-send hook applies the same rule on the way out.)
		if (isBackOfficePath(window.location.pathname)) return

		if (dedupe) {
			const now = Date.now()
			const sortedKeys = Object.keys(event.data).sort()
			const key = `${event.name}|${JSON.stringify(sortedKeys.map(k => [k, event.data[k]]))}|${window.location.pathname}`
			const last = recentViews.get(key)
			if (last != null && now - last < VIEW_DEDUPE_WINDOW_MS) return
			for (const [seenKey, seenAt] of recentViews) {
				if (now - seenAt >= VIEW_DEDUPE_WINDOW_MS) recentViews.delete(seenKey)
			}
			recentViews.set(key, now)
		}

		const queued: QueuedEvent = { name: event.name, data: event.data }
		const trackerSend = getTracker()
		if (trackerSend != null) {
			flushQueue()
			send(trackerSend, queued)
			return
		}
		if (queue.length < CLIENT_QUEUE_LIMIT) queue.push(queued)
		startPolling()
	} catch {
		// Analytics never breaks the page
	}
}

/**
 * Sends one catalogue event from the browser: a user action or the outcome of one.
 * Never throws, does nothing on the server, and waits for the tracker when it has not loaded yet.
 */
export function track<N extends ClientEventName>(name: N, ...args: PropsArg<N>): void {
	dispatch(name, args[0], false)
}

/**
 * Same as track(), for anything sent when a component mounts. The page transition can mount a
 * page twice on a client navigation, so the same view (name + properties + pathname) is sent
 * once within 2 seconds. No useRef guard is needed around it.
 */
export function trackView<N extends ClientEventName>(name: N, ...args: PropsArg<N>): void {
	dispatch(name, args[0], true)
}
