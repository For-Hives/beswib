'use client'

import { useEffect, useState } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

// Type for gtag function
type GtagFunction = (...args: unknown[]) => void

interface GoogleAnalyticsProps {
	measurementId: string
	enableDebugMode?: boolean
}

export function GoogleAnalytics({ measurementId, enableDebugMode = false }: GoogleAnalyticsProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	// Update consent when user preferences change
	useEffect(() => {
		const gtag = (window as any).gtag as GtagFunction | undefined
		if (!gtag || !consentGranted) return

		const consentUpdate: Record<string, string> = {
			analytics_storage: 'granted',
		}

		gtag('consent', 'update', consentUpdate)

		// Debug consent state
		if (enableDebugMode) {
			console.info('🍪 Google Consent Mode Updated:', consentUpdate)
		}
	}, [consentGranted, enableDebugMode])

	// Track page views when consent is granted and route changes
	useEffect(() => {
		const gtag = (window as any).gtag as GtagFunction | undefined
		if (!measurementId || !gtag || !consentGranted) return

		const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

		gtag('config', measurementId, {
			page_path: url,
			cookie_flags: 'SameSite=None;Secure',
		})

		gtag('event', 'page_view', {
			page_title: document.title,
			page_path: url,
		})

		if (enableDebugMode) {
			console.info('📊 GA Page View:', url)
		}
	}, [pathname, searchParams, measurementId, consentGranted, enableDebugMode])

	if (!measurementId) return null

	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
				strategy="afterInteractive"
				id="gtag-base"
			/>
			<Script
				id="gtag-init"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', '${measurementId}', {
							page_path: window.location.pathname,
							send_page_view: false,
							cookie_flags: 'SameSite=None;Secure'
						});
					`,
				}}
			/>
		</>
	)
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
	const gtag = (window as any)?.gtag as GtagFunction | undefined
	if (typeof window !== 'undefined' && gtag) {
		gtag('event', action, {
			value: value,
			event_label: label,
			event_category: category,
		})
	}
}

// Consent debugging utilities
export function getConsentState() {
	const gtag = (window as any)?.gtag as GtagFunction | undefined
	if (typeof window === 'undefined' || !gtag) return null

	gtag('get', 'G-PGSND15ZCT', 'consent', (consentState: unknown) => {
		console.info('🔍 Current Consent State:', consentState)
	})
}

export function enableConsentDebugMode() {
	if (typeof window === 'undefined') return

	// Add consent debug URL parameter
	const url = new URL(window.location.href)
	url.searchParams.set('gtag_debug', '1')
	window.history.replaceState({}, '', url.toString())

	console.info('🐛 Google Consent Debug Mode enabled. Check Network tab for gtag/debug calls.')
}
