'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useConsent } from '@c15t/nextjs'

declare global {
	interface Window {
		gtag?: (command: string, ...args: any[]) => void
		dataLayer?: any[]
	}
}

interface GoogleAnalyticsProps {
	measurementId: string
	enableDebugMode?: boolean
}

export function GoogleAnalytics({ measurementId, enableDebugMode = false }: GoogleAnalyticsProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const { consent, hasConsented } = useConsent()

	// Initialize Google Consent Mode
	useEffect(() => {
		if (typeof window === 'undefined') return

		// Initialize gtag with consent mode
		window.dataLayer = window.dataLayer || []
		function gtag(...args: any[]) {
			window.dataLayer?.push(args)
		}
		window.gtag = gtag

		// Set default consent state (denied) before any scripts load
		gtag('consent', 'default', {
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: 'denied',
			functionality_storage: 'denied',
			personalization_storage: 'denied',
			security_storage: 'granted', // Always allow security cookies
			wait_for_update: 500, // Wait up to 500ms for consent update
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
		if (!window.gtag || !hasConsented) return

		const consentUpdate: Record<string, string> = {
			analytics_storage: consent?.analytics ? 'granted' : 'denied',
			ad_storage: consent?.marketing ? 'granted' : 'denied',
			ad_user_data: consent?.marketing ? 'granted' : 'denied',
			ad_personalization: consent?.marketing ? 'granted' : 'denied',
			functionality_storage: consent?.functional ? 'granted' : 'denied',
			personalization_storage: consent?.functional ? 'granted' : 'denied',
		}

		window.gtag('consent', 'update', consentUpdate)

		// Debug consent state
		if (enableDebugMode) {
			console.log('🍪 Google Consent Mode Updated:', consentUpdate)
		}
	}, [consent, hasConsented, enableDebugMode])

	// Track page views when consent is granted and route changes
	useEffect(() => {
		if (!measurementId || !window.gtag || !consent?.analytics) return

		const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

		window.gtag('config', measurementId, {
			page_path: url,
			cookie_flags: 'SameSite=None;Secure',
		})

		window.gtag('event', 'page_view', {
			page_path: url,
			page_title: document.title,
		})

		if (enableDebugMode) {
			console.log('📊 GA Page View:', url)
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
			event_category: category,
			event_label: label,
			value: value,
		})
	}
}

// Consent debugging utilities
export function getConsentState() {
	if (typeof window === 'undefined' || !window.gtag) return null

	window.gtag('get', 'G-PGSND15ZCT', 'consent', (consentState: any) => {
		console.log('🔍 Current Consent State:', consentState)
	})
}

export function enableConsentDebugMode() {
	if (typeof window === 'undefined') return

	// Add consent debug URL parameter
	const url = new URL(window.location.href)
	url.searchParams.set('gtag_debug', '1')
	window.history.replaceState({}, '', url.toString())

	console.log('🐛 Google Consent Debug Mode enabled. Check Network tab for gtag/debug calls.')
}
