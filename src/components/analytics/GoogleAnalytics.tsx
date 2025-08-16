'use client'

import { useEffect } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'
import { useConsent } from '@c15t/nextjs'

type UseConsentReturn = {
	hasConsented: boolean
	consent: {
		analytics?: boolean
		marketing?: boolean
		functional?: boolean
	} | null
}
import Script from 'next/script'

declare global {
	interface Window {
		gtag?: (command: string, ...args: unknown[]) => void
		dataLayer?: unknown[]
	}
}

interface GoogleAnalyticsProps {
	measurementId: string
	enableDebugMode?: boolean
}

export function GoogleAnalytics({ measurementId, enableDebugMode = false }: GoogleAnalyticsProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const consentResult = useConsent()
	// Type assertion needed due to library typing issues
	const { hasConsented, consent } = consentResult as UseConsentReturn

	// Initialize Google Consent Mode
	useEffect(() => {
		if (typeof window === 'undefined') return

		// Initialize gtag with consent mode
		window.dataLayer = window.dataLayer ?? []
		function gtag(...args: unknown[]) {
			window.dataLayer?.push(args)
		}
		window.gtag = gtag

		// Set default consent state (denied) before any scripts load
		gtag('consent', 'default', {
			wait_for_update: 500, // Wait up to 500ms for consent update
			security_storage: 'granted', // Always allow security cookies
			personalization_storage: 'denied',
			functionality_storage: 'denied',
			analytics_storage: 'denied',
			ad_user_data: 'denied',
			ad_storage: 'denied',
			ad_personalization: 'denied',
		})

		// Enable debug mode if requested
		if (enableDebugMode) {
			gtag('config', measurementId, {
				debug_mode: true,
			})
		}
	}, [measurementId, enableDebugMode])

	// Update consent when user preferences change
	useEffect(() => {
		if (!window.gtag || hasConsented !== true || !consent) return

		const consentUpdate: Record<string, string> = {
			personalization_storage: consent.functional === true ? 'granted' : 'denied',
			functionality_storage: consent.functional === true ? 'granted' : 'denied',
			analytics_storage: consent.analytics === true ? 'granted' : 'denied',
			ad_user_data: consent.marketing === true ? 'granted' : 'denied',
			ad_storage: consent.marketing === true ? 'granted' : 'denied',
			ad_personalization: consent.marketing === true ? 'granted' : 'denied',
		}

		window.gtag('consent', 'update', consentUpdate)

		// Debug consent state
		if (enableDebugMode) {
			console.info('🍪 Google Consent Mode Updated:', consentUpdate)
		}
	}, [consent, hasConsented, enableDebugMode])

	// Track page views when consent is granted and route changes
	useEffect(() => {
		if (!measurementId || !window.gtag || !consent || consent.analytics !== true) return

		const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

		window.gtag('config', measurementId, {
			page_path: url,
			cookie_flags: 'SameSite=None;Secure',
		})

		window.gtag('event', 'page_view', {
			page_title: document.title,
			page_path: url,
		})

		if (enableDebugMode) {
			console.info('📊 GA Page View:', url)
		}
	}, [pathname, searchParams, measurementId, consent?.analytics, enableDebugMode])

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
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', action, {
			value: value,
			event_label: label,
			event_category: category,
		})
	}
}

// Consent debugging utilities
export function getConsentState() {
	if (typeof window === 'undefined' || !window.gtag) return null

	window.gtag('get', 'G-PGSND15ZCT', 'consent', (consentState: unknown) => {
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
