import 'server-only'

import { after } from 'next/server'

import { getVersion } from '@/lib/utils/version'

import type { EventData, PropsArg, ServerEventName } from './catalog'
import {
	PRODUCTION_HOSTNAMES,
	SERVER_EVENT_HOSTNAME,
	SERVER_EVENT_URL,
	SERVER_SEND_TIMEOUT_MS,
	UMAMI_SEND_URL,
	UMAMI_WEBSITE_ID,
} from './config'
import { sanitizeEvent } from './sanitize'

// Server-side sending (server actions, route handlers, services).
//
// This module must never reach a browser: there, after() throws and the event would be POSTed
// straight from the visitor's browser, past the before-send hook and the data-domains gate. Three
// things prevent it: the 'server-only' import above (Next.js fails the build of any client bundle
// that reaches this file, directly or through another module), the absence of any barrel file
// re-exporting it, and a check of `window` at run time.
// It is NOT a 'use server' file: trackServer is a plain function, not a server action.
//
// Server events are counters of things that really happened (a capture, a sale, an account). They
// belong to no visitor: no ip, no user agent of the visitor and no user id is forwarded.

// Umami discards requests whose user agent looks like a bot (Node's default one does), answering
// 200 {"beep":"boop"}. A fixed desktop browser user agent keeps the events; it describes nobody.
const SERVER_USER_AGENT =
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

let warnedAboutBotFilter = false

/**
 * True only on the production site: a production build (NODE_ENV, so never `next dev` nor a test
 * run, whatever their environment holds) whose NEXT_PUBLIC_BASE_URL has the hostname beswib.com or
 * www.beswib.com. Never true in a browser.
 */
export function isServerTrackingEnabled(): boolean {
	try {
		if (typeof window !== 'undefined') return false
		if (process.env.NODE_ENV !== 'production') return false
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
		if (baseUrl == null || baseUrl === '') return false
		return PRODUCTION_HOSTNAMES.includes(new URL(baseUrl).hostname)
	} catch {
		return false
	}
}

async function send(name: string, data: EventData): Promise<void> {
	try {
		const response = await fetch(UMAMI_SEND_URL, {
			signal: AbortSignal.timeout(SERVER_SEND_TIMEOUT_MS),
			method: 'POST',
			headers: { 'User-Agent': SERVER_USER_AGENT, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'event',
				payload: {
					website: UMAMI_WEBSITE_ID,
					url: SERVER_EVENT_URL,
					tag: getVersion(),
					name,
					hostname: SERVER_EVENT_HOSTNAME,
					data,
				},
			}),
		})
		if (!warnedAboutBotFilter) {
			const body = await response.text()
			if (body.includes('beep')) {
				warnedAboutBotFilter = true
				console.warn('[analytics] Umami treated a server event as bot traffic: server events are not recorded')
			}
		}
	} catch {
		// Timeout, network error, Umami down: the event is lost, the request is not affected
	}
}

/**
 * Sends one server event of the catalogue. Returns at once and never throws: the request to Umami
 * runs after the response (next/server after()) when a request scope exists, as a detached promise
 * otherwise, and gives up after 2 seconds. Nothing is sent outside the production site.
 *
 * Call it as ONE statement where its data is already in scope: no await, no reordering.
 */
export function trackServer<N extends ServerEventName>(name: N, ...args: PropsArg<N>): void {
	try {
		if (!isServerTrackingEnabled()) return

		const event = sanitizeEvent(name, args[0])
		if (event == null || event.side !== 'server') return

		const run = () => send(event.name, event.data)
		try {
			after(run)
		} catch {
			// No request scope (script, test, background job)
			void run()
		}
	} catch {
		// Analytics never breaks a request
	}
}
