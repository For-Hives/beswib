'use client'

import { useConsent } from '@c15t/nextjs'
import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useRef, useState } from 'react'

import { ANALYTICS_CATEGORY } from '@/lib/consent/config'

interface ConsentedGoogleAnalyticsProps {
	/** GA4 measurement id (G-XXXXXXXXXX). */
	gaId: string
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
 * own commands.
 */
export function ConsentedGoogleAnalytics({ gaId }: Readonly<ConsentedGoogleAnalyticsProps>) {
	const allowed = useConsent(ANALYTICS_CATEGORY)
	const wasAllowed = useRef(false)
	const [queueReady, setQueueReady] = useState(false)

	useEffect(() => {
		// Google's opt-out switch for one measurement id. A script cannot be unloaded: after a
		// withdrawal the tag stays on the page until c15t reloads it, and must send nothing meanwhile.
		// Nothing is written for a visitor who never allowed the category.
		if (allowed || wasAllowed.current) window[`ga-disable-${gaId}`] = !allowed
		wasAllowed.current = allowed
		if (!allowed) return
		queueConsentDefaults()
		setQueueReady(true)
	}, [allowed, gaId])

	if (!allowed || !queueReady) return null

	return <GoogleAnalytics gaId={gaId} />
}
