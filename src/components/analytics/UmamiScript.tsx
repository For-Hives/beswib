'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

import { registerBeforeSend } from '@/lib/analytics/before-send'
import { flushQueue } from '@/lib/analytics/client'
import { BEFORE_SEND_GLOBAL, UMAMI_DOMAINS, UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '@/lib/analytics/config'

interface UmamiScriptProps {
	/** App version, recorded as the Umami tag of every payload. */
	version: string
}

/**
 * Loads the Umami tracker, and only once the before-send hook exists on window: the tracker sends
 * the raw payload (full URL, query string included) when the hook is missing.
 */
export function UmamiScript({ version }: Readonly<UmamiScriptProps>) {
	const [hookReady, setHookReady] = useState(false)

	useEffect(() => {
		setHookReady(registerBeforeSend())
	}, [])

	if (!hookReady) return null

	return (
		<Script
			async
			id="umami-script"
			src={UMAMI_SCRIPT_URL}
			data-website-id={UMAMI_WEBSITE_ID}
			data-domains={UMAMI_DOMAINS}
			data-tag={version}
			data-before-send={BEFORE_SEND_GLOBAL}
			data-exclude-hash="true"
			strategy="afterInteractive"
			onLoad={flushQueue}
		/>
	)
}
