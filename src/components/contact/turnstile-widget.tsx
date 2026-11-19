'use client'

import Script from 'next/script'
import { type RefObject, useEffect, useRef } from 'react'

/**
 * Public key of the Turnstile widget « beswib.com contact » (domains beswib.com and www.beswib.com).
 * Outside production: Cloudflare's test key, which always passes (the server then skips the check).
 */
const TURNSTILE_SITE_KEY =
	process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
	(process.env.NODE_ENV === 'production' ? '0x4AAAAAAGJBiioltDEhoQJy' : '1x00000000000000000000AA')

/** Site locales Turnstile translates (two-letter codes of its supported-languages list); anything else: 'auto'. */
const TURNSTILE_LANGUAGES = new Set(['en', 'fr', 'es', 'it', 'de', 'ro', 'pt', 'nl', 'ko'])

interface TurnstileApi {
	render: (
		element: HTMLElement,
		options: {
			sitekey: string
			callback: (token: string) => void
			'expired-callback': () => void
			'error-callback': () => void
			language?: string
			theme?: 'auto' | 'light' | 'dark'
		}
	) => string
	reset: (widgetId?: string) => void
	remove: (widgetId?: string) => void
}

declare global {
	interface Window {
		turnstile?: TurnstileApi
	}
}

interface TurnstileWidgetProps {
	locale?: string
	/** Receives each new token, and null when it expires or the challenge fails. */
	onToken: (token: string | null) => void
	/** Filled with a function that asks for a new token (a token is single-use). */
	resetRef: RefObject<(() => void) | null>
}

/** Cloudflare Turnstile, explicit rendering: mostly invisible, the server checks the token it produces. */
export default function TurnstileWidget({ resetRef, onToken, locale }: TurnstileWidgetProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const widgetIdRef = useRef<string | null>(null)
	const onTokenRef = useRef(onToken)
	onTokenRef.current = onToken

	/** Renders once the script is ready; onReady also runs on each mount after a client-side navigation. */
	function renderWidget() {
		const container = containerRef.current
		if (!window.turnstile || !container || widgetIdRef.current != null) return
		widgetIdRef.current = window.turnstile.render(container, {
			theme: 'auto',
			sitekey: TURNSTILE_SITE_KEY,
			language: locale != null && TURNSTILE_LANGUAGES.has(locale) ? locale : 'auto',
			'expired-callback': () => onTokenRef.current(null),
			'error-callback': () => onTokenRef.current(null),
			callback: token => onTokenRef.current(token),
		})
	}

	useEffect(() => {
		resetRef.current = () => {
			onTokenRef.current(null)
			if (widgetIdRef.current != null) window.turnstile?.reset(widgetIdRef.current)
		}
		// The script may already be there (another visit of the page): render without waiting for onReady
		renderWidget()
		return () => {
			resetRef.current = null
			if (widgetIdRef.current != null) window.turnstile?.remove(widgetIdRef.current)
			widgetIdRef.current = null
		}
	}, [])

	return (
		<>
			<Script
				onReady={renderWidget}
				src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
				strategy="afterInteractive"
			/>
			<div className="min-h-[65px]" ref={containerRef} />
		</>
	)
}
