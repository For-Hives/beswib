import { ConsentBanner, ConsentDialog, ConsentDialogLink, ConsentRoot } from '@c15t/nextjs'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ANALYTICS_REFUSED_AT_KEY, ConsentedGoogleAnalytics } from '@/components/analytics/ConsentedGoogleAnalytics'
import { getConsentRootProps } from '@/lib/consent/root-props'
import { i18n, type Locale } from '@/lib/i18n/config'

// The consent manager for real (c15t's own runtime, policy resolution and storage, in offline mode
// as in production), mounted the way the root layout mounts it. Only Google's tag is replaced: by a
// plain element, so that whether it is in the page is all there is to observe.
vi.mock('@next/third-parties/google', () => ({
	GoogleAnalytics: ({ gaId }: { gaId: string }) => <span data-mock="google-analytics" data-ga-id={gaId} />,
}))

const GA_ID = 'G-TEST0000000'
const SETTINGS_LINK = 'Cookie settings'
const DAY_MS = 86_400_000

let container: HTMLDivElement
let root: Root

function analyticsTag(): Element | null {
	return document.querySelector('[data-mock="google-analytics"]')
}

function button(label: string): HTMLButtonElement | undefined {
	return [...document.querySelectorAll('button')].find(element => element.textContent?.trim() === label)
}

function switches(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('[role="dialog"] [role="switch"]')]
}

async function waitFor(what: string, condition: () => boolean, timeoutMs = 8000): Promise<void> {
	const start = Date.now()
	while (!condition()) {
		if (Date.now() - start > timeoutMs) throw new Error(`timed out waiting for ${what}`)
		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 20))
		})
	}
}

/** Lets pending work finish before asserting that something did NOT happen. */
async function settle(ms = 150): Promise<void> {
	await act(async () => {
		await new Promise(resolve => setTimeout(resolve, ms))
	})
}

async function click(label: string): Promise<void> {
	const target = button(label)
	if (target === undefined) throw new Error(`no button "${label}"`)
	await act(async () => {
		target.click()
	})
}

/** One page load: a fresh consent root, as after a navigation with a reload. */
async function visit(locale: Locale = 'en'): Promise<void> {
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
	await act(async () => {
		root.render(
			<ConsentRoot {...getConsentRootProps(locale)}>
				<ConsentedGoogleAnalytics gaId={GA_ID} />
				<ConsentBanner hideBranding />
				<ConsentDialog />
				<ConsentDialogLink>{SETTINGS_LINK}</ConsentDialogLink>
			</ConsentRoot>
		)
	})
	// The preferences link only renders once c15t has resolved the policy and read the stored choice
	await waitFor('the consent policy', () => button(SETTINGS_LINK) !== undefined)
}

function leave(): void {
	act(() => root.unmount())
	container.remove()
}

function readCookie(name: string): string | undefined {
	return document.cookie
		.split('; ')
		.find(cookie => cookie.startsWith(`${name}=`))
		?.slice(name.length + 1)
}

/** Stores a choice the way c15t 1.8.6 wrote it: a compact cookie and a JSON record, both named c15t. */
function seedLegacyChoice(granted: readonly string[]): void {
	const time = Date.now() - 30 * DAY_MS
	const consents = { necessary: true, functionality: false, measurement: false, experience: false, marketing: false }
	for (const name of granted) Reflect.set(consents, name, true)
	const compact = ['necessary', ...granted].map(name => `c.${name}:1`).join(',')
	// biome-ignore lint/suspicious/noDocumentCookie: the test writes the cookie exactly as c15t 1.8.6 did
	document.cookie = `c15t=i.t:${time},${compact}; path=/`
	localStorage.setItem('c15t', JSON.stringify({ consentInfo: { time }, consents }))
}

beforeEach(() => {
	Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
	// jsdom has no matchMedia: c15t asks it for prefers-reduced-motion and prefers-color-scheme
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: false,
		media: query,
		addEventListener: () => {},
		removeEventListener: () => {},
	}))
})

afterEach(() => {
	leave()
	for (const cookie of document.cookie.split('; ')) {
		// biome-ignore lint/suspicious/noDocumentCookie: expires every cookie a test left behind
		document.cookie = `${cookie.split('=')[0]}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
	}
	localStorage.clear()
	Reflect.deleteProperty(window, 'dataLayer')
	vi.unstubAllGlobals()
})

// c15t loads its offline transport and its dialog on demand: generous timeouts for a busy CI runner
describe('consent gate on Google Analytics, with the real c15t runtime', { timeout: 30_000 }, () => {
	it('asks first: the banner is shown and Google Analytics is not in the page', async () => {
		await visit()

		expect(button('Accept All')).toBeDefined()
		expect(button('Reject All')).toBeDefined()
		expect(button('Customize')).toBeDefined()
		await settle()
		expect(analyticsTag()).toBeNull()
		expect(window.dataLayer).toBeUndefined()
	})

	it('keeps Google Analytics out after "Reject All", on that page and on the next visit', async () => {
		await visit()
		await click('Reject All')
		await waitFor('the banner to close', () => button('Reject All') === undefined)
		await settle()
		expect(analyticsTag()).toBeNull()
		expect(readCookie('c15t')).toBeDefined()

		leave()
		await visit()
		await settle()
		// The refusal is remembered: no banner, and still no tag
		expect(button('Accept All')).toBeUndefined()
		expect(analyticsTag()).toBeNull()
	})

	it('mounts Google Analytics after "Accept All" without a reload, and again on the next visit', async () => {
		await visit()
		expect(analyticsTag()).toBeNull()

		await click('Accept All')
		await waitFor('Google Analytics', () => analyticsTag() !== null)
		expect(analyticsTag()?.getAttribute('data-ga-id')).toBe(GA_ID)

		leave()
		await visit()
		await waitFor('Google Analytics on the next visit', () => analyticsTag() !== null)
		expect(button('Accept All')).toBeUndefined()
	})

	it('offers exactly two categories, and loads Google Analytics once Analytics is switched on and saved', async () => {
		await visit()
		await click('Customize')
		await waitFor('the preferences dialog', () => switches().length > 0)

		expect(switches().map(element => element.getAttribute('aria-label'))).toEqual(['Strictly Necessary', 'Analytics'])
		const [necessary, analytics] = switches()
		expect(necessary.getAttribute('aria-checked')).toBe('true')
		// Nothing optional is pre-selected
		expect(analytics.getAttribute('aria-checked')).toBe('false')
		expect(analyticsTag()).toBeNull()

		await act(async () => {
			analytics.click()
		})
		// Switching it on is not a choice yet: only saving is
		expect(analyticsTag()).toBeNull()
		await click('Save Settings')
		await waitFor('Google Analytics', () => analyticsTag() !== null)
	})

	it('saving the dialog untouched is a refusal', async () => {
		await visit()
		await click('Customize')
		await waitFor('the preferences dialog', () => switches().length > 0)
		await click('Save Settings')
		await waitFor('the dialog to close', () => switches().length === 0)
		await settle()

		expect(analyticsTag()).toBeNull()
		leave()
		await visit()
		await settle()
		expect(button('Accept All')).toBeUndefined()
		expect(analyticsTag()).toBeNull()
	})

	it('does not read an "Accept All" stored by c15t 1.8.6 as consent to analytics', async () => {
		// 1.8.6 only ever offered necessary + marketing: its "Accept All" never covered measurement
		seedLegacyChoice(['marketing'])
		await visit()
		await settle()

		// The stored answer is read back (the visitor is not asked again), as a refusal of analytics
		expect(button('Accept All')).toBeUndefined()
		expect(analyticsTag()).toBeNull()
		expect(window.dataLayer).toBeUndefined()
	})

	it('keeps a "Reject All" stored by c15t 1.8.6 as a refusal', async () => {
		seedLegacyChoice([])
		await visit()
		await settle()

		expect(button('Accept All')).toBeUndefined()
		expect(analyticsTag()).toBeNull()
	})

	it('does not read a grant of measurement stored before the upgrade as consent to analytics', async () => {
		// Such records exist: c15t 1.5 and 1.6 (production until 22 October 2025) stored every category
		// as granted on "Accept All", on a dialog that listed necessary and marketing only, and 1.8
		// copied the record as it was. c15t 3 reads it back as a permission for measurement.
		seedLegacyChoice(['functionality', 'experience', 'marketing', 'measurement'])
		await visit()
		await settle()

		// Read back (the visitor is not asked again), and still not a yes to Analytics
		expect(button('Accept All')).toBeUndefined()
		expect(analyticsTag()).toBeNull()
		expect(window.dataLayer).toBeUndefined()

		// Saying yes on the current dialog is what loads Google Analytics
		await click(SETTINGS_LINK)
		await waitFor('the preferences dialog', () => switches().length > 0)
		await click('Accept All')
		await waitFor('Google Analytics', () => analyticsTag() !== null)
	})

	it('does not read the record c15t 1.5 and 1.6 kept under their own key as consent to analytics either', async () => {
		const time = Date.now() - 360 * DAY_MS
		const consents = { necessary: true, functionality: true, measurement: true, experience: true, marketing: true }
		localStorage.setItem('privacy-consent-storage', JSON.stringify({ consentInfo: { time, type: 'all' }, consents }))
		await visit()
		await settle()

		expect(analyticsTag()).toBeNull()
		expect(window.dataLayer).toBeUndefined()
	})

	it('keeps Google Analytics out after a withdrawal, even when the withdrawal never reached storage', async () => {
		await visit()
		await click('Accept All')
		await waitFor('Google Analytics', () => analyticsTag() !== null)
		await waitFor('the stored grant', () => readCookie('c15t') !== undefined && localStorage.getItem('c15t') !== null)
		const storedGrant = { cookie: readCookie('c15t'), record: localStorage.getItem('c15t') }

		// The visitor switches Analytics off from the footer link
		await click(SETTINGS_LINK)
		await waitFor('the preferences dialog', () => switches().length > 0)
		const analytics = switches()[1]
		expect(analytics.getAttribute('aria-checked')).toBe('true')
		await act(async () => {
			analytics.click()
		})
		await click('Save Settings')
		await waitFor('Google Analytics to go', () => analyticsTag() === null)
		// Kept by the gate in the same task, without waiting for c15t's writer
		expect(Number(localStorage.getItem(ANALYTICS_REFUSED_AT_KEY))).toBeGreaterThan(0)

		// What a failed download of c15t's writer leaves behind: storage still holds the grant
		leave()
		// biome-ignore lint/suspicious/noDocumentCookie: puts the consent cookie back as it was before the withdrawal
		document.cookie = `c15t=${storedGrant.cookie}; path=/`
		localStorage.setItem('c15t', storedGrant.record ?? '')
		await visit()
		await settle()

		// c15t reads the grant back (no banner), the gate does not follow it
		expect(button('Accept All')).toBeUndefined()
		expect(analyticsTag()).toBeNull()

		// A new yes, given after the refusal, loads it again
		await click(SETTINGS_LINK)
		await waitFor('the preferences dialog', () => switches().length > 0)
		await click('Accept All')
		await waitFor('Google Analytics', () => analyticsTag() !== null)
	})

	it('deletes the _ga cookies the previous setup wrote, for a visitor who has not accepted', async () => {
		// biome-ignore lint/suspicious/noDocumentCookie: leftovers of the ungated tag, as found in production browsers
		document.cookie = '_ga=GA1.1.1489239637.1791910151; path=/'
		// biome-ignore lint/suspicious/noDocumentCookie: same
		document.cookie = '_ga_TEST0000000=GS2.1.s1791910150$o1$g0$t1791910150$j60$l0$h0; path=/'
		await visit()

		await waitFor('the cleanup', () => readCookie('_ga') === undefined && readCookie('_ga_TEST0000000') === undefined)
		expect(analyticsTag()).toBeNull()
	})

	// One label per locale, written here on purpose: read from the app's own copy, the test could not
	// tell French served on a Spanish page
	const ACCEPT_LABEL: Record<Locale, string> = {
		en: 'Accept All',
		fr: 'Tout accepter',
		es: 'Aceptar todo',
		it: 'Accetta tutto',
		de: 'Alle akzeptieren',
		ro: 'Acceptă toate',
		pt: 'Aceitar todos',
		nl: 'Alles accepteren',
		ko: '모두 수락',
	}

	it.each(i18n.locales)('shows the banner in the language of the page: %s', async locale => {
		const messages = getConsentRootProps(locale).options?.i18n?.messages?.[locale]
		const title = messages?.cookieBanner?.title ?? ''
		const reject = messages?.common?.rejectAll ?? ''
		const customize = messages?.common?.customize ?? ''
		for (const text of [title, reject, customize]) expect(text).not.toBe('')

		await visit(locale)
		await waitFor('the banner', () => button(ACCEPT_LABEL[locale]) !== undefined)
		expect(button(reject)).toBeDefined()
		expect(button(customize)).toBeDefined()
		expect(document.body.textContent).toContain(title)
		if (locale !== 'en') expect(button(ACCEPT_LABEL.en)).toBeUndefined()
	})
})
