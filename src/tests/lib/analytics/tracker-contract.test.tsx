import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { TrackClick } from '@/components/analytics/TrackClick'
import { umamiAttrs } from '@/lib/analytics/attrs'
import { registerBeforeSend } from '@/lib/analytics/before-send'
import { track } from '@/lib/analytics/client'
import { BEFORE_SEND_GLOBAL } from '@/lib/analytics/config'

// The whole design rests on how the DEPLOYED tracker behaves: where it reads the before-send hook,
// what it does on a click, what a payload holds. This file runs the real script against the real
// hook and helpers, so that an upgrade of the Umami instance which changes that behaviour fails
// here instead of leaking raw URLs in production.
//
// The fixture is a byte-for-byte copy of https://umami.wadefade.fr/script.js fetched on 2026-10-13.
// To refresh it: download the script again, replace the fixture, update the hash below, and read
// the diff of the script before trusting the tests.
const FIXTURE = resolve(process.cwd(), 'src/tests/lib/analytics/fixtures/umami-script.js.txt')
const FIXTURE_SHA256 = '1ad1145d19d4558c20f5469ca4a5fc50a1a46f860858c9c91bfcd56fd29a522a'

const ORIGIN = window.location.origin
const USER_ID = 'user_2abcDEFghiJKLmnoPQRstuVWX'
const EMAIL = 'runner@example.com'

interface Sent {
	type: string
	payload: Record<string, unknown>
}

let sent: Sent[] = []
const source = readFileSync(FIXTURE, 'utf8')

function wait(milliseconds: number): Promise<void> {
	return new Promise(done => setTimeout(done, milliseconds))
}

/** Runs the tracker the way the browser does for <script src data-...>: document.currentScript is the tag. */
function loadTracker(): void {
	const tag = document.createElement('script')
	tag.setAttribute('src', 'https://umami.wadefade.fr/script.js')
	tag.setAttribute('data-website-id', 'e9168017-b73b-491b-b7b0-fee64f07c847')
	tag.setAttribute('data-domains', window.location.hostname)
	tag.setAttribute('data-tag', 'v1.2.3')
	tag.setAttribute('data-before-send', BEFORE_SEND_GLOBAL)
	tag.setAttribute('data-exclude-hash', 'true')
	Object.defineProperty(document, 'currentScript', { get: () => tag, configurable: true })
	try {
		new Function(source)()
	} finally {
		Object.defineProperty(document, 'currentScript', { get: () => null, configurable: true })
	}
}

/** Clicks an element and reports whether the tracker cancelled the click. */
async function click(selector: string): Promise<{ cancelledByTracker: boolean }> {
	const element = document.querySelector(selector)
	if (element == null) throw new Error(`No element matches ${selector}`)
	let cancelledByTracker = false
	// The tracker listens on the document in the capture phase: by the time the click reaches its
	// target the decision is taken. The navigation itself is then cancelled (jsdom cannot navigate).
	const observe = (event: Event) => {
		cancelledByTracker = event.defaultPrevented
		event.preventDefault()
	}
	element.addEventListener('click', observe)
	element.dispatchEvent(new MouseEvent('click', { cancelable: true, bubbles: true }))
	element.removeEventListener('click', observe)
	await wait(20)
	return { cancelledByTracker }
}

function names(): unknown[] {
	return sent.map(item => item.payload.name)
}

const integerProps = { where: 'marketplace', has_query: true, filter_count: 3, catalogue_empty: false } as const

beforeAll(async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async (_url: string, init: { body: string }) => {
			sent.push(JSON.parse(init.body) as Sent)
			return { json: async () => ({}) }
		})
	)
	document.documentElement.lang = 'fr'
	window.history.replaceState({}, '', `/fr/marketplace?search=lyon&tkn=SECRET&email=${EMAIL}&utm_source=newsletter#top`)
	expect(registerBeforeSend()).toBe(true)
	loadTracker()
	await wait(20)
})

afterAll(() => {
	vi.unstubAllGlobals()
	Reflect.deleteProperty(window, 'umami')
	Reflect.deleteProperty(window, BEFORE_SEND_GLOBAL)
	document.body.innerHTML = ''
	window.history.replaceState({}, '', '/')
})

describe('the deployed Umami tracker, with the hook registered', () => {
	it('is the script this code was written against', () => {
		expect(createHash('sha256').update(source).digest('hex')).toBe(FIXTURE_SHA256)
	})

	it('starts on a loaded document and sends a cleaned first page view', () => {
		expect(typeof window.umami?.track).toBe('function')
		expect(sent).toHaveLength(1)
		expect(sent[0].type).toBe('event')
		expect(sent[0].payload).toEqual({
			website: 'e9168017-b73b-491b-b7b0-fee64f07c847',
			hostname: window.location.hostname,
			screen: expect.any(String),
			language: expect.any(String),
			title: expect.any(String),
			tag: 'v1.2.3',
			url: `${ORIGIN}/marketplace?utm_source=newsletter`,
			referrer: '',
			data: { locale: 'fr' },
		})
	})

	describe('once started', () => {
		beforeEach(() => {
			sent = []
		})

		it('follows a client navigation with a cleaned URL and a cleaned referrer', async () => {
			window.history.pushState({}, '', `/fr/events?search=paris&email=${EMAIL}&utm_campaign=spring#list`)
			await wait(400)
			expect(sent).toHaveLength(1)
			expect(sent[0].payload).toMatchObject({
				url: `${ORIGIN}/events?utm_campaign=spring`,
				referrer: `${ORIGIN}/marketplace?utm_source=newsletter`,
				data: { locale: 'fr' },
			})
			expect(sent[0].payload).not.toHaveProperty('name')
		})

		it('does not count a filter change as a new page view', async () => {
			window.history.pushState({}, '', '/fr/events?search=lyon&utm_campaign=spring')
			window.history.pushState({}, '', '/fr/events?search=lyon&distance=42&utm_campaign=spring')
			await wait(400)
			expect(sent).toEqual([])
		})

		it('sends a catalogue event through track(), with the locale and no id', async () => {
			track('cta_click', { cta: 'sell_bib', where: 'hero' })
			await wait(20)
			expect(sent).toHaveLength(1)
			expect(sent[0].payload).toMatchObject({
				name: 'cta_click',
				url: `${ORIGIN}/events?utm_campaign=spring`,
				data: { cta: 'sell_bib', where: 'hero', locale: 'fr' },
			})
			expect(sent[0].payload).not.toHaveProperty('id')
		})

		describe('clicks', () => {
			beforeAll(() => {
				document.body.innerHTML = renderToStaticMarkup(
					<div>
						<TrackClick name="nav_click" props={{ item: 'events', where: 'header' }}>
							<a id="wrapped" href="/fr/events?page=2">
								<b id="wrapped-inner">Events</b>
							</a>
						</TrackClick>
						<TrackClick name="cta_click" props={{ cta: 'sell_bib', where: 'hero' }}>
							<div>
								<TrackClick name="nav_click" props={{ item: 'events', where: 'footer' }}>
									<a id="nested" href="/fr/events">
										Nested
									</a>
								</TrackClick>
								<i id="bystander">Not a link</i>
							</div>
						</TrackClick>
						<a id="attribute-on-anchor" href="#same-tab" {...umamiAttrs('show_special_tooltip')}>
							Wrong usage
						</a>
						<a
							id="new-tab"
							href="https://example.org/"
							target="_blank"
							rel="noreferrer"
							{...umamiAttrs('show_special_tooltip')}
						>
							New tab
						</a>
						<button
							id="typed"
							type="button"
							{...umamiAttrs('paypal_onboarding_open', { via: 'popup', popup_blocked: false })}
						>
							Boolean
						</button>
						<button id="integer" type="button" {...umamiAttrs('empty_results_view', integerProps)}>
							Integer
						</button>
						<button id="hand-written" type="button" data-umami-event="Signup" data-umami-event-email={EMAIL}>
							Unknown event
						</button>
						<button
							id="hand-written-extra"
							type="button"
							data-umami-event="cta_click"
							data-umami-event-cta="sell_bib"
							data-umami-event-where="hero"
							data-umami-event-email={EMAIL}
						>
							Known event, extra attribute
						</button>
					</div>
				)
			})

			it('sends the event of a <TrackClick> around a same-tab link and leaves the navigation alone', async () => {
				const { cancelledByTracker } = await click('#wrapped-inner')
				expect(cancelledByTracker).toBe(false)
				expect(sent).toHaveLength(1)
				expect(sent[0].payload).toMatchObject({
					name: 'nav_click',
					data: { item: 'events', where: 'header', locale: 'fr' },
				})
			})

			it('cancels the click when the attributes sit on a same-tab anchor: the reason <TrackClick> exists', async () => {
				const { cancelledByTracker } = await click('#attribute-on-anchor')
				expect(cancelledByTracker).toBe(true)
				expect(names()).toEqual(['show_special_tooltip'])
			})

			it('leaves a new-tab anchor alone', async () => {
				const { cancelledByTracker } = await click('#new-tab')
				expect(cancelledByTracker).toBe(false)
				expect(names()).toEqual(['show_special_tooltip'])
			})

			it('sends only the innermost event of nested wrappers', async () => {
				await click('#nested')
				expect(sent).toHaveLength(1)
				expect(sent[0].payload).toMatchObject({ name: 'nav_click', data: { item: 'events', where: 'footer' } })
			})

			it('sends the event for ANY click inside a wrapper, not only on the link', async () => {
				await click('#bystander')
				expect(names()).toEqual(['cta_click'])
			})

			it('reads booleans and integers back from attribute strings', async () => {
				expect(document.querySelector('#typed')?.getAttribute('data-umami-event-popup_blocked')).toBe('false')
				await click('#typed')
				await click('#integer')
				expect(sent.map(item => item.payload.data)).toEqual([
					{ via: 'popup', popup_blocked: false, locale: 'fr' },
					{ where: 'marketplace', has_query: true, filter_count: 3, catalogue_empty: false, locale: 'fr' },
				])
			})

			it('drops a hand-written event the catalogue does not know', async () => {
				await click('#hand-written')
				expect(sent).toEqual([])
			})

			it('removes an undeclared attribute from a hand-written catalogue event', async () => {
				await click('#hand-written-extra')
				expect(sent).toHaveLength(1)
				expect(sent[0].payload.data).toEqual({ cta: 'sell_bib', where: 'hero', locale: 'fr' })
				expect(JSON.stringify(sent)).not.toContain(EMAIL)
			})
		})

		describe('direct calls to the tracker', () => {
			type RawTracker = { track: (...args: unknown[]) => unknown; identify: (...args: unknown[]) => unknown }
			const raw = () => window.umami as unknown as RawTracker

			it('sends nothing for identify, and no id afterwards', async () => {
				raw().identify(USER_ID, { email: EMAIL, name: 'Jo Runner' })
				await wait(20)
				expect(sent).toEqual([])

				// The tracker now keeps the id and puts it in every payload: the hook removes it
				track('show_special_tooltip')
				await wait(20)
				expect(sent).toHaveLength(1)
				expect(sent[0].payload).not.toHaveProperty('id')
				expect(JSON.stringify(sent)).not.toContain(USER_ID)
			})

			it('sends nothing personal for the object, function and free-name forms of track', async () => {
				const leakyUrl = `${ORIGIN}/fr/faq?email=${EMAIL}`
				raw().track({ website: 'x', name: 'signup', data: { email: EMAIL } })
				raw().track((payload: Record<string, unknown>) => ({ ...payload, name: 'signup', data: { email: EMAIL } }))
				raw().track((payload: Record<string, unknown>) => ({ ...payload, email: EMAIL, url: leakyUrl }))
				raw().track('free_text', { query: 'jean dupont' })
				await wait(20)
				const body = JSON.stringify(sent)
				expect(body).not.toContain(EMAIL)
				expect(body).not.toContain('jean dupont')
				expect(body).not.toContain('signup')
				expect(body).not.toContain(USER_ID)
			})
		})

		describe('without the hook', () => {
			it('sends the RAW payload: the reason <UmamiScript> registers the hook before rendering the tracker', async () => {
				const hook = window[BEFORE_SEND_GLOBAL]
				Reflect.deleteProperty(window, BEFORE_SEND_GLOBAL)
				try {
					window.history.replaceState({}, '', `/fr/contact?email=${EMAIL}`)
					track('show_special_tooltip')
					await wait(20)
					expect(sent).toHaveLength(1)
					// What would leave the browser: the full URL and the id given to identify
					expect(sent[0].payload.url).toBe(`${ORIGIN}/fr/contact?email=${EMAIL}`)
					expect(sent[0].payload.id).toBe(USER_ID)
				} finally {
					window[BEFORE_SEND_GLOBAL] = hook
				}

				sent = []
				track('show_special_tooltip')
				await wait(20)
				expect(sent[0].payload.url).toBe(`${ORIGIN}/contact`)
				expect(sent[0].payload).not.toHaveProperty('id')
			})
		})
	})
})
