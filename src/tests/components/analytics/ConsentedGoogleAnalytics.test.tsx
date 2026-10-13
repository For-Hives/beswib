import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const GA_ID = 'G-TEST0000000'
const DISABLE_FLAG = `ga-disable-${GA_ID}`

const REFUSED_AT_KEY = 'beswib-analytics-refused-at'

const { useConsent, useExplicitChoice, installGoogleHitGuard, queueSeenByTag, guardCallsSeenByTag } = vi.hoisted(
	() => ({
		useConsent: vi.fn(),
		useExplicitChoice: vi.fn(),
		installGoogleHitGuard: vi.fn(),
		// What gtag's queue held each time the Google Analytics tag was rendered
		queueSeenByTag: [] as (unknown[][] | null)[],
		// How many times the cleaning of the hits had been asked for by then
		guardCallsSeenByTag: [] as number[],
	})
)

function queuedCommands(): unknown[][] | null {
	return window.dataLayer ? window.dataLayer.map(entry => Array.from(entry as ArrayLike<unknown>)) : null
}

/** The recorded decision on the measurement category, as c15t exposes it. */
function choice(value: boolean, confirmedAt: number, kind: 'choice-v1' | 'legacy-v2' = 'choice-v1') {
	const basis = kind === 'choice-v1' ? { kind, fingerprint: 'test-policy' } : { kind }
	return { version: 3, categories: { measurement: { value, confirmedAt, basis } } }
}

// A "yes" given on the current banner: what the visitor of most tests below has stored
const GRANTED_AT = Date.UTC(2026, 9, 13, 20, 0, 0)

// The permission and the recorded decision are all the gate reads from c15t: each test drives them
vi.mock('@c15t/nextjs', () => ({ useConsent, useExplicitChoice }))
// The cleaning of the hits has its own tests (google-hits.test.ts): here it is in place or it is not
vi.mock('@/lib/analytics/google-hits', () => ({ installGoogleHitGuard }))
// The real component injects two script tags through next/script and would call Google. Here it
// is a plain element carrying its props: whether it is in the tree is what the gate decides.
vi.mock('@next/third-parties/google', () => ({
	GoogleAnalytics: ({ gaId }: { gaId: string }) => {
		queueSeenByTag.push(queuedCommands())
		guardCallsSeenByTag.push(installGoogleHitGuard.mock.calls.length)
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
	useExplicitChoice.mockReset()
	useExplicitChoice.mockReturnValue(choice(true, GRANTED_AT))
	installGoogleHitGuard.mockReset()
	installGoogleHitGuard.mockReturnValue(true)
	queueSeenByTag.length = 0
	guardCallsSeenByTag.length = 0
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	Reflect.deleteProperty(window, 'dataLayer')
	Reflect.deleteProperty(window, DISABLE_FLAG)
	localStorage.clear()
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

	describe('cleaning of what the tag sends', () => {
		it('is put in place before the tag exists', async () => {
			useConsent.mockReturnValue(true)
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(tag()).not.toBeNull()
			expect(guardCallsSeenByTag.length).toBeGreaterThan(0)
			for (const calls of guardCallsSeenByTag) expect(calls).toBeGreaterThan(0)
		})

		it('keeps Google Analytics out when it cannot be put in place: the raw page URL would leave', async () => {
			useConsent.mockReturnValue(true)
			installGoogleHitGuard.mockReturnValue(false)
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(tag()).toBeNull()
			expect(window.dataLayer).toBeUndefined()
		})

		it('is not installed for a visitor who has not consented: fetch stays as it was', async () => {
			useConsent.mockReturnValue(false)
			useExplicitChoice.mockReturnValue(null)
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(installGoogleHitGuard).not.toHaveBeenCalled()
		})
	})

	describe('what counts as consent', () => {
		it('needs a recorded choice: a permission alone does not load Google Analytics', async () => {
			useConsent.mockReturnValue(true)
			useExplicitChoice.mockReturnValue(null)
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(tag()).toBeNull()
			expect(window.dataLayer).toBeUndefined()
			expect(installGoogleHitGuard).not.toHaveBeenCalled()
		})

		it('does not count a grant carried over from the previous consent manager', async () => {
			// c15t 1.5 and 1.6 stored every category as granted on "Accept All", on a dialog that listed
			// necessary and marketing only. c15t 3 reads such a record back as a permission.
			useConsent.mockReturnValue(true)
			useExplicitChoice.mockReturnValue(choice(true, GRANTED_AT, 'legacy-v2'))
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(tag()).toBeNull()
			expect(window.dataLayer).toBeUndefined()
			expect(DISABLE_FLAG in window).toBe(false)

			// The same visitor then says yes on the current banner
			useExplicitChoice.mockReturnValue(choice(true, GRANTED_AT + 60_000))
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
			expect(tag()).not.toBeNull()
		})

		it('does not count a recorded refusal, whatever the permission says', async () => {
			useConsent.mockReturnValue(true)
			useExplicitChoice.mockReturnValue(choice(false, GRANTED_AT))
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(tag()).toBeNull()
		})
	})

	describe('a withdrawal c15t could not store', () => {
		it('keeps the time of a refusal as soon as it is seen', async () => {
			useConsent.mockReturnValue(true)
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
			expect(localStorage.getItem(REFUSED_AT_KEY)).toBeNull()

			// The visitor switches Analytics off and saves: the record is in memory, not yet in storage
			useConsent.mockReturnValue(false)
			useExplicitChoice.mockReturnValue(choice(false, GRANTED_AT + 5000))
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(tag()).toBeNull()
			expect(localStorage.getItem(REFUSED_AT_KEY)).toBe(String(GRANTED_AT + 5000))
		})

		it('does not load Google Analytics for a grant older than that refusal, read back on the next page', async () => {
			localStorage.setItem(REFUSED_AT_KEY, String(GRANTED_AT + 5000))
			useConsent.mockReturnValue(true)
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(tag()).toBeNull()
			expect(window.dataLayer).toBeUndefined()
			expect(DISABLE_FLAG in window).toBe(false)
			expect(installGoogleHitGuard).not.toHaveBeenCalled()
		})

		it('loads it again once the visitor consents after that refusal', async () => {
			localStorage.setItem(REFUSED_AT_KEY, String(GRANTED_AT + 5000))
			useConsent.mockReturnValue(true)
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))
			expect(tag()).toBeNull()

			useExplicitChoice.mockReturnValue(choice(true, GRANTED_AT + 60_000))
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(tag()).not.toBeNull()
			expect(window[DISABLE_FLAG]).toBe(false)
			// The refusal stays on record: only a newer grant passes it
			expect(localStorage.getItem(REFUSED_AT_KEY)).toBe(String(GRANTED_AT + 5000))
		})

		it('keeps the newest refusal: an older one read from storage does not replace it', async () => {
			localStorage.setItem(REFUSED_AT_KEY, String(GRANTED_AT + 5000))
			useConsent.mockReturnValue(false)
			useExplicitChoice.mockReturnValue(choice(false, GRANTED_AT - 5000, 'legacy-v2'))
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(localStorage.getItem(REFUSED_AT_KEY)).toBe(String(GRANTED_AT + 5000))
		})

		it('falls back on c15t alone when storage is blocked', async () => {
			const blocked = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
				throw new DOMException('blocked', 'SecurityError')
			})
			useConsent.mockReturnValue(true)
			const ConsentedGoogleAnalytics = await loadComponent()
			act(() => root.render(<ConsentedGoogleAnalytics gaId={GA_ID} />))

			expect(tag()).not.toBeNull()
			blocked.mockRestore()
		})
	})
})
