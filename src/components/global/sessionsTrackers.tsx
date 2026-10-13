'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

import { SIGN_IN_INTENTS, type SignInIntent } from '@/lib/analytics/catalog'
import { track } from '@/lib/analytics/client'

// An OAuth round trip leaves the page: the form that started it writes this marker and the page
// the visitor comes back to resolves it. It only ever holds the closed values below.
const OAUTH_MARKER_KEY = 'beswib.oauth'
const OAUTH_MARKER_MAX_AGE_MS = 10 * 60 * 1000
const NEW_ACCOUNT_MAX_AGE_MS = 2 * 60 * 1000

const OAUTH_FLOWS = ['sign_up', 'sign_in'] as const
const OAUTH_METHODS = ['google', 'facebook'] as const

type OAuthFlow = (typeof OAUTH_FLOWS)[number]
type OAuthMethod = (typeof OAUTH_METHODS)[number]

interface OAuthMarker {
	flow: OAuthFlow
	method: OAuthMethod
	intent: SignInIntent
}

export function writeOAuthMarker(flow: OAuthFlow, method: OAuthMethod, intent: SignInIntent): void {
	try {
		window.sessionStorage.setItem(OAUTH_MARKER_KEY, JSON.stringify({ flow, method, intent, t: Date.now() }))
	} catch {
		// Storage unavailable: the outcome of this round trip is simply not counted
	}
}

export function clearOAuthMarker(): void {
	try {
		window.sessionStorage.removeItem(OAUTH_MARKER_KEY)
	} catch {
		// Storage unavailable: nothing to clear
	}
}

/** Reads the marker and always removes it. Null when absent, malformed or too old. */
function takeOAuthMarker(): OAuthMarker | null {
	try {
		const raw = window.sessionStorage.getItem(OAUTH_MARKER_KEY)
		if (raw == null) return null
		window.sessionStorage.removeItem(OAUTH_MARKER_KEY)

		const parsed = JSON.parse(raw) as unknown
		if (typeof parsed !== 'object' || parsed == null) return null
		const { flow, method, intent, t } = parsed as Record<string, unknown>

		const knownFlow = OAUTH_FLOWS.find(value => value === flow)
		const knownMethod = OAUTH_METHODS.find(value => value === method)
		if (knownFlow === undefined || knownMethod === undefined) return null
		if (typeof t !== 'number' || !Number.isFinite(t)) return null
		const age = Date.now() - t
		if (age < 0 || age > OAUTH_MARKER_MAX_AGE_MS) return null

		return {
			flow: knownFlow,
			method: knownMethod,
			intent: SIGN_IN_INTENTS.find(value => value === intent) ?? 'none',
		}
	} catch {
		return null
	}
}

// Mounted once, in the root layout: an OAuth round trip lands on the page the visitor signed in
// for (a bib, an event, their dashboard: see afterAuthPath), on the sign-in form when there is no
// session (the middleware sends the visitor back there), or on the page it started from (Back from
// the provider). The marker is removed on first read, so a second mount would send nothing.
export function SessionsTracker() {
	const { user, isSignedIn, isLoaded } = useUser()
	const createdAt = user?.createdAt?.getTime()

	useEffect(() => {
		if (isLoaded !== true) return

		const resolveOAuthOutcome = () => {
			const marker = takeOAuthMarker()
			if (marker == null) return

			if (isSignedIn === true) {
				// Clerk turns an OAuth sign-in for an unknown account into a sign-up, and the reverse
				if (createdAt !== undefined && Date.now() - createdAt < NEW_ACCOUNT_MAX_AGE_MS) {
					track('sign_up_success', { method: marker.method })
				} else {
					track('sign_in_success', { method: marker.method, intent: marker.intent })
				}
			} else if (marker.flow === 'sign_up') {
				track('sign_up_error', { method: marker.method, step: 'oauth', kind: 'oauth_incomplete', field: 'none' })
			} else {
				track('sign_in_error', { method: marker.method, kind: 'oauth_incomplete', field: 'none' })
			}
		}

		resolveOAuthOutcome()

		// Back from the provider through the back-forward cache: the page is restored, not mounted
		const onPageShow = (event: PageTransitionEvent) => {
			if (event.persisted) resolveOAuthOutcome()
		}
		window.addEventListener('pageshow', onPageShow)
		return () => window.removeEventListener('pageshow', onPageShow)
	}, [isLoaded, isSignedIn, createdAt])

	return null
}
