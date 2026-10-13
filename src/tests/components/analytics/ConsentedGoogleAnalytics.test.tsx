import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const GA_ID = 'G-TEST0000000'
const DISABLE_FLAG = `ga-disable-${GA_ID}`

const { useConsent, queueSeenByTag } = vi.hoisted(() => ({
	useConsent: vi.fn(),
	// What gtag's queue held each time the Google Analytics tag was rendered
	queueSeenByTag: [] as (unknown[][] | null)[],
}))

function queuedCommands(): unknown[][] | null {
	return window.dataLayer ? window.dataLayer.map(entry => Array.from(entry as ArrayLike<unknown>)) : null
}

// The consent state is the only thing the gate reads from c15t: the hook is driven by each test
vi.mock('@c15t/nextjs', () => ({ useConsent }))
// The real component injects two script tags through next/script and would call Google. Here it
// is a plain element carrying its props: whether it is in the tree is what the gate decides.
vi.mock('@next/third-parties/google', () => ({
	GoogleAnalytics: ({ gaId }: { gaId: string }) => {
		queueSeenByTag.push(queuedCommands())
		return <span data-mock="google-analytics" data-ga-id={gaId} />
	},
}))

type GateModule = typeof import('@/components/analytics/ConsentedGoogleAnalytics')

const CONSENT_DEFAULTS = [
	'consent',
	'default',
	{ analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' },
]

let container: HTMLDivElement
let root: Root

// The gate remembers, per document, that the Consent Mode defaults are queued: a fresh module per test
async function loadComponent(): Promise<GateModule['ConsentedGoogleAnalytics']> {
	vi.resetModules()
	return (await import('@/components/analytics/ConsentedGoogleAnalytics')).ConsentedGoogleAnalytics
}

function tag(): HTMLElement | null {
	return container.querySelector<HTMLElement>('[data-mock="google-analytics"]')
}

beforeEach(() => {
	Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
	useConsent.mockReset()
	queueSeenByTag.length = 0
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	Reflect.deleteProperty(window, 'dataLayer')
	Reflect.deleteProperty(window, DISABLE_FLAG)
})

describe('ConsentedGoogleAnalytics', () => {
	it('renders nothing on the server, whatever the consent: the tag is never in the HTML', async () => {
		useConsent.mockReturnValue(true)
		const ConsentedGoogleAnalytics = await loadComponent()
		expect(renderToString(<ConsentedGoogleAnalytics gaId={GA_ID} />)).toBe('')
	})

	it('reads the measurement category, and only that one', async () => {
		useConsent.mockReturnValue(false)
		const ConsentedGoogleAnalytics = await loadComponent()
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
		expect(useConsent).toHaveBeenCalled()
		expect(useConsent.mock.calls.every(([category]) => category === 'measurement')).toBe(true)
	})

	it('does not render Google Analytics without consent, and leaves the page untouched', async () => {
		useConsent.mockReturnValue(false)
		const ConsentedGoogleAnalytics = await loadComponent()
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

		expect(tag()).toBeNull()
		expect(container.innerHTML).toBe('')
		expect(window.dataLayer).toBeUndefined()
		expect(DISABLE_FLAG in window).toBe(false)
	})

	it('renders Google Analytics with consent, for the measurement id it was given', async () => {
		useConsent.mockReturnValue(true)
		const ConsentedGoogleAnalytics = await loadComponent()
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

		expect(tag()?.getAttribute('data-ga-id')).toBe(GA_ID)
		expect(window[DISABLE_FLAG]).toBe(false)
	})

	it('queues the Consent Mode defaults before the tag exists: analytics granted, advertising denied', async () => {
		useConsent.mockReturnValue(true)
		const ConsentedGoogleAnalytics = await loadComponent()
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

		expect(queuedCommands()).toEqual([CONSENT_DEFAULTS])
		// gtag.js ignores plain arrays: the command must be an `arguments` object
		expect(Object.prototype.toString.call(window.dataLayer?.[0])).toBe('[object Arguments]')
		// The tag queues its own commands (js, config) when it mounts: the defaults must already be
		// waiting every time it is rendered, or Google would process `config` first
		expect(queueSeenByTag.length).toBeGreaterThan(0)
		for (const queue of queueSeenByTag) expect(queue).toEqual([CONSENT_DEFAULTS])
	})

	it('mounts Google Analytics in place when the consent arrives after the first render', async () => {
		useConsent.mockReturnValue(false)
		const ConsentedGoogleAnalytics = await loadComponent()
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
		expect(tag()).toBeNull()

		useConsent.mockReturnValue(true)
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
		expect(tag()).not.toBeNull()
		expect(queuedCommands()).toEqual([CONSENT_DEFAULTS])
		expect(window[DISABLE_FLAG]).toBe(false)
	})

	it('removes the tag and switches Google Analytics off when the consent is withdrawn', async () => {
		useConsent.mockReturnValue(true)
		const ConsentedGoogleAnalytics = await loadComponent()
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
		expect(tag()).not.toBeNull()

		useConsent.mockReturnValue(false)
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
		expect(tag()).toBeNull()
		// Google's documented opt-out: the script already on the page sends nothing more
		expect(window[DISABLE_FLAG]).toBe(true)
	})

	it('switches Google Analytics back on when consent is given again, without queuing the defaults twice', async () => {
		useConsent.mockReturnValue(true)
		const ConsentedGoogleAnalytics = await loadComponent()
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
		useConsent.mockReturnValue(false)
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
		useConsent.mockReturnValue(true)
		act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

		expect(tag()).not.toBeNull()
		expect(window[DISABLE_FLAG]).toBe(false)
		expect(queuedCommands()).toEqual([CONSENT_DEFAULTS])
	})

	it('survives a remount of the layout (language switch): no second defaults, and no switch-off', async () => {
		useConsent.mockReturnValue(true)
		const ConsentedGoogleAnalytics = await loadComponent()
		act(() => root.render(<ConsentedGoogleAnalytics key="en" gaId={GA_ID} />))

		// The remounted consent root starts without the stored choice, then reads it
		useConsent.mockReturnValue(false)
		act(() => root.render(<ConsentedGoogleAnalytics key="fr" gaId={GA_ID} />))
		// A new instance that never saw the consent is not a withdrawal
		expect(window[DISABLE_FLAG]).toBe(false)
		useConsent.mockReturnValue(true)
		act(() => root.render(<ConsentedGoogleAnalytics key="fr" gaId={GA_ID} />))

		expect(tag()).not.toBeNull()
		expect(queuedCommands()).toEqual([CONSENT_DEFAULTS])
		expect(window[DISABLE_FLAG]).toBe(false)
	})
})
