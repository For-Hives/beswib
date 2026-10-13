'use client'

import { useConsent, useExplicitChoice } from '@c15t/nextjs'
import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useRef, useState } from 'react'

import { installGoogleHitGuard } from '@/lib/analytics/google-hits'
import { ANALYTICS_CATEGORY } from '@/lib/consent/config'

interface ConsentedGoogleAnalyticsProps {
	/** GA4 measurement id (G-XXXXXXXXXX). */
	gaId: string
}

/** Where the gate keeps the time (epoch milliseconds) of the newest refusal of analytics it has seen. */
export const ANALYTICS_REFUSED_AT_KEY = 'beswib-analytics-refused-at'

function readRefusedAt(): number {
	try {
		const stored = Number(window.localStorage.getItem(ANALYTICS_REFUSED_AT_KEY))
		return Number.isFinite(stored) ? stored : 0
	} catch {
		return 0
	}
}

function rememberRefusal(refusedAt: number): void {
	try {
		if (refusedAt > readRefusedAt()) window.localStorage.setItem(ANALYTICS_REFUSED_AT_KEY, String(refusedAt))
	} catch {
		// Storage blocked: c15t's own record is then the only one
	}
}

// Once per document: the root layout remounts when the visitor switches language, the tag does not
let consentDefaultsQueued = false

/**
 * Queues Google's Consent Mode defaults, as the gtag snippet would: analytics storage is what the
 * visitor has just allowed; the advertising signals are never asked for on this site and stay denied.
 */
function queueConsentDefaults(): void {
	if (consentDefaultsQueued) return
	consentDefaultsQueued = true

	window.dataLayer = window.dataLayer ?? []
	const queue = window.dataLayer
	function gtag(..._command: unknown[]): void {
		// biome-ignore lint/complexity/noArguments: gtag.js only acts on the `arguments` objects of its queue, an array is ignored
		queue.push(arguments)
	}
	gtag('consent', 'default', {
		analytics_storage: 'granted',
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
	})
}

/**
 * Google Analytics, only for a visitor who allows the measurement category. Must render inside
 * <ConsentRoot>.
 *
 * Nothing is rendered on the server, before the stored choice is read, or after a refusal: no tag,
 * so no request to Google and no _ga cookie. Once the category is allowed the tag is mounted in
 * place, without a reload, and only after the Consent Mode defaults sit in its queue, ahead of its
 * own commands, and after the cleaning of what it sends is in place (see google-hits.ts).
 *
 * What counts as allowed is stricter than c15t's permission:
 *  - the grant must have been given on this banner. One carried over from the previous consent
 *    manager does not count: its dialog never offered the category.
 *  - the grant must be newer than the last refusal seen here. c15t stores a choice from a chunk it
 *    loads on demand; when that chunk cannot be fetched (offline, a deployment that replaced it)
 *    a withdrawal never reaches storage and the old grant is read back on the next page. The gate
 *    therefore keeps the time of the refusal itself, written as soon as the visitor refuses.
 */
export function ConsentedGoogleAnalytics({ gaId }: Readonly<ConsentedGoogleAnalyticsProps>) {
	const allowed = useConsent(ANALYTICS_CATEGORY)
	const decision = useExplicitChoice()?.categories[ANALYTICS_CATEGORY]
	const grantedAt =
		allowed && decision?.value === true && decision.basis.kind === 'choice-v1' ? decision.confirmedAt : null
	const refusedAt = decision?.value === false ? decision.confirmedAt : null
	const wasGranted = useRef(false)
	const [prepared, setPrepared] = useState(false)

	useEffect(() => {
		if (refusedAt != null) rememberRefusal(refusedAt)
		const granted = grantedAt != null && grantedAt > readRefusedAt()
		// Google's opt-out switch for one measurement id. A script cannot be unloaded: after a
		// withdrawal the tag stays on the page until c15t reloads it, and must send nothing meanwhile.
		// Nothing is written for a visitor who never allowed the category.
		if (granted || wasGranted.current) window[`ga-disable-${gaId}`] = !granted
		wasGranted.current = granted
		// Without the cleaning of its hits the tag would send the raw page URL: it is not mounted
		const ready = granted && installGoogleHitGuard()
		if (ready) queueConsentDefaults()
		setPrepared(ready)
	}, [grantedAt, refusedAt, gaId])

	if (grantedAt == null || !prepared) return null

	return <GoogleAnalytics gaId={gaId} />
}
