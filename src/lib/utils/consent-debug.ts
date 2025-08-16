/**
 * Google Analytics Consent Mode debugging utilities
 * Based on: https://developers.google.com/tag-platform/security/guides/consent-debugging
 */

declare global {
	interface Window {
		gtag?: (...args: any[]) => void
		dataLayer?: any[]
	}
}

interface ConsentState {
	ad_storage: 'granted' | 'denied'
	ad_user_data: 'granted' | 'denied'
	ad_personalization: 'granted' | 'denied'
	analytics_storage: 'granted' | 'denied'
	functionality_storage: 'granted' | 'denied'
	personalization_storage: 'granted' | 'denied'
	security_storage: 'granted' | 'denied'
}

/**
 * Enable comprehensive consent debugging
 * Run this in browser console: window.enableGoogleConsentDebug()
 */
export function enableGoogleConsentDebug() {
	if (typeof window === 'undefined') return

	// Add debug parameters to URL
	const url = new URL(window.location.href)
	url.searchParams.set('gtag_debug', '1')
	url.searchParams.set('gtm_debug', '1')
	window.history.replaceState({}, '', url.toString())

	// Enable gtag debug mode
	if (window.gtag) {
		window.gtag('config', 'G-PGSND15ZCT', {
			debug_mode: true,
		})
	}

	console.log('🐛 Google Consent Debug Mode enabled')
	console.log('📍 Check Network tab for:')
	console.log('  - /gtag/debug calls')
	console.log('  - /collect calls with consent parameters')
	console.log('📊 Use getConsentState() to check current consent status')
}

/**
 * Get current consent state from Google Analytics
 */
export function getConsentState(): Promise<ConsentState | null> {
	return new Promise(resolve => {
		if (typeof window === 'undefined' || !window.gtag) {
			resolve(null)
			return
		}

		window.gtag('get', 'G-PGSND15ZCT', 'consent', (consentState: ConsentState) => {
			console.log('🔍 Current Google Consent State:', consentState)
			resolve(consentState)
		})
	})
}

/**
 * Test consent update with different scenarios
 */
export function testConsentScenarios() {
	if (typeof window === 'undefined' || !window.gtag) return

	console.log('🧪 Testing consent scenarios...')

	// Scenario 1: All denied
	console.log('1. All denied')
	window.gtag('consent', 'update', {
		personalization_storage: 'denied',
		functionality_storage: 'denied',
		analytics_storage: 'denied',
		ad_user_data: 'denied',
		ad_storage: 'denied',
		ad_personalization: 'denied',
	})

	setTimeout(() => {
		// Scenario 2: Analytics only
		console.log('2. Analytics only')
		window.gtag('consent', 'update', {
			analytics_storage: 'granted',
		})
	}, 2000)

	setTimeout(() => {
		// Scenario 3: All granted
		console.log('3. All granted')
		window.gtag('consent', 'update', {
			personalization_storage: 'granted',
			functionality_storage: 'granted',
			analytics_storage: 'granted',
			ad_user_data: 'granted',
			ad_storage: 'granted',
			ad_personalization: 'granted',
		})
	}, 4000)
}

/**
 * Monitor dataLayer for consent-related events
 */
export function monitorConsentEvents() {
	if (typeof window === 'undefined') return

	const originalPush = window.dataLayer?.push
	if (!originalPush) return

	window.dataLayer!.push = function (...args: any[]) {
		// Log consent-related events
		args.forEach(item => {
			if (item && typeof item === 'object') {
				if (item[0] === 'consent' || item.event?.includes('consent')) {
					console.log('🍪 Consent Event:', item)
				}
			}
		})

		return originalPush.apply(this, args)
	}

	console.log('👂 Monitoring dataLayer for consent events')
}

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
	;(window as any).enableGoogleConsentDebug = enableGoogleConsentDebug
	;(window as any).getConsentState = getConsentState
	;(window as any).testConsentScenarios = testConsentScenarios
	;(window as any).monitorConsentEvents = monitorConsentEvents
}
