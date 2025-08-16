/**
 * Google Analytics Consent Mode debugging utilities
 * Based on: https://developers.google.com/tag-platform/security/guides/consent-debugging
 */

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
	const gtag = (window as any)?.gtag
	if (gtag) {
		gtag('config', 'G-PGSND15ZCT', {
			debug_mode: true,
		})
	}

	console.info('🐛 Google Consent Debug Mode enabled')
	console.info('📍 Check Network tab for:')
	console.info('  - /gtag/debug calls')
	console.info('  - /collect calls with consent parameters')
	console.info('📊 Use getConsentState() to check current consent status')
}

/**
 * Get current consent state from Google Analytics
 */
export function getConsentState(): Promise<ConsentState | null> {
	return new Promise(resolve => {
		const gtag = (window as any)?.gtag
		if (typeof window === 'undefined' || !gtag) {
			resolve(null)
			return
		}

		gtag('get', 'G-PGSND15ZCT', 'consent', (consentState: ConsentState) => {
			console.info('🔍 Current Google Consent State:', consentState)
			resolve(consentState)
		})
	})
}

/**
 * Test consent update with different scenarios
 */
export function testConsentScenarios() {
	const gtag = (window as any)?.gtag
	if (typeof window === 'undefined' || !gtag) return

	console.info('🧪 Testing consent scenarios...')

	// Scenario 1: All denied
	console.info('1. All denied')
	gtag('consent', 'update', {
		personalization_storage: 'denied',
		functionality_storage: 'denied',
		analytics_storage: 'denied',
		ad_user_data: 'denied',
		ad_storage: 'denied',
		ad_personalization: 'denied',
	})

	setTimeout(() => {
		// Scenario 2: Analytics only
		console.info('2. Analytics only')
		gtag('consent', 'update', {
			analytics_storage: 'granted',
		})
	}, 2000)

	setTimeout(() => {
		// Scenario 3: All granted
		console.info('3. All granted')
		gtag('consent', 'update', {
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

	const dataLayer = (window as any)?.dataLayer
	if (!dataLayer?.push) return

	const originalPush = dataLayer.push.bind(dataLayer)

	dataLayer.push = (...args: unknown[]) => {
		// Log consent-related events
		args.forEach(item => {
			if (item !== null && typeof item === 'object') {
				const objItem = item as Record<string, unknown>
				const isConsentEvent =
					objItem[0] === 'consent' || (typeof objItem.event === 'string' && objItem.event.includes('consent'))
				if (isConsentEvent) {
					console.info('🍪 Consent Event:', item)
				}
			}
		})

		return originalPush(...args)
	}

	console.info('👂 Monitoring dataLayer for consent events')
}

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
	interface GlobalWindow extends Window {
		enableGoogleConsentDebug: typeof enableGoogleConsentDebug
		getConsentState: typeof getConsentState
		testConsentScenarios: typeof testConsentScenarios
		monitorConsentEvents: typeof monitorConsentEvents
	}

	;(window as unknown as GlobalWindow).enableGoogleConsentDebug = enableGoogleConsentDebug
	;(window as unknown as GlobalWindow).getConsentState = getConsentState
	;(window as unknown as GlobalWindow).testConsentScenarios = testConsentScenarios
	;(window as unknown as GlobalWindow).monitorConsentEvents = monitorConsentEvents
}
