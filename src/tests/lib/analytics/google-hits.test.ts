import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LOCALES } from '@/lib/analytics/config'
import { cleanGoogleHit, cleanGoogleUrl, cleanHitParams, isGoogleHit } from '@/lib/analytics/google-hits'

const HOSTNAME = 'beswib.com'
const ORIGIN = `https://${HOSTNAME}`
const COLLECT = 'https://region1.google-analytics.com/g/collect'

// Every parameter the app or its providers put in a URL today (same list as url.test.ts): none may
// reach Google
const SENSITIVE_PARAMS: Record<string, string> = {
	tkn: 'privatelistingtoken0123456789abcd',
	lockedAt: '2026-10-13T10:00:00.000Z',
	email: 'runner@example.com',
	waitlist_success: 'true',
	waitlist_error: 'already_added_email',
	name: 'Jane Runner',
	message: 'Please delete my account user_2abc',
	search: 'marathon de paris',
	geography: 'paris',
	location: 'Lyon',
	sport: 'trail',
	redirect_url: 'https://beswib.com/fr/marketplace/abcdefghij12345?tkn=secret',
	redirectUrl: '/fr/dashboard',
	token: 'EC-1AB23456CD789012E',
	PayerID: 'ABCDEFGHIJKLM',
	trackingId: 'user_2abcDEF',
	merchantIdInPayPal: 'MERCHANT456',
	__clerk_status: 'verified',
	__clerk_ticket: 'ticket',
	__clerk_db_jwt: 'jwt',
	gclid: 'gclid-value',
	fbclid: 'fbclid-value',
}

/** A hit parameter as gtag.js writes it. */
function param(key: string, value: string): string {
	return `${key}=${encodeURIComponent(value)}`
}

function decoded(encoded: string): Record<string, string> {
	return Object.fromEntries(encoded.split('&').map(pair => pair.split('=').map(decodeURIComponent) as [string, string]))
}

describe('isGoogleHit', () => {
	it.each([
		['https://region1.google-analytics.com/g/collect?v=2&tid=G-TEST0000000'],
		['https://www.google-analytics.com/g/collect?v=2'],
		['https://analytics.google.com/g/collect?v=2'],
		['https://stats.g.doubleclick.net/g/collect?v=2'],
		['https://pagead2.googlesyndication.com/ccm/collect?en=page_view'],
		['https://www.google.com/ccm/collect?en=page_view'],
		['https://www.google.fr/ads/ga-audiences?v=1'],
		['https://www.google.co.uk/ads/ga-audiences?v=1'],
	])('recognises %s', url => {
		expect(isGoogleHit(url, `${ORIGIN}/fr`)).toBe(true)
	})

	it.each([
		['/api/waitlist/status?eventId=abc', 'a request of the app'],
		['https://beswib.com/monitoring?o=1', 'the Sentry tunnel'],
		['https://umami.wadefade.fr/api/send', 'Umami'],
		['https://accounts.google.com/gsi/status?client_id=abc', 'Google sign-in'],
		['https://www.google.com/recaptcha/api2/reload?k=abc', 'reCAPTCHA'],
		['https://maps.googleapis.com/maps/api/js', 'a Google API'],
		['https://www.paypal.com/xoplatform/logger/api/logger', 'PayPal'],
		['https://clerk.beswib.com/v1/client?redirect_url=https%3A%2F%2Fbeswib.com', 'Clerk'],
		['https://evilgoogle-analytics.com/g/collect', 'a host that only ends like Google Analytics'],
		['https://google-analytics.com.example.test/g/collect', 'a host that only starts like it'],
		['http://[', 'something that is not a URL'],
	])('leaves %s alone (%s)', url => {
		expect(isGoogleHit(url, `${ORIGIN}/fr`)).toBe(false)
	})
})

describe('cleanGoogleUrl', () => {
	it.each(Object.entries(SENSITIVE_PARAMS))('drops ?%s', (key, value) => {
		const url = `${ORIGIN}/fr/marketplace/abcdefghij12345?${new URLSearchParams({ [key]: value }).toString()}`
		expect(cleanGoogleUrl(url, HOSTNAME)).toBe(`${ORIGIN}/fr/marketplace/abcdefghij12345`)
	})

	it('drops them all together, and the hash with them', () => {
		const url = `${ORIGIN}/en/contact?${new URLSearchParams(SENSITIVE_PARAMS).toString()}#frag-secret`
		const cleaned = cleanGoogleUrl(url, HOSTNAME)
		expect(cleaned).toBe(`${ORIGIN}/en/contact`)
		for (const value of Object.values(SENSITIVE_PARAMS)) expect(cleaned).not.toContain(encodeURIComponent(value))
	})

	it('keeps the campaign parameters, which Google Analytics reads from the page URL', () => {
		const url = `${ORIGIN}/fr/events?utm_source=newsletter&tkn=secret&utm_medium=email&utm_campaign=autumn`
		expect(cleanGoogleUrl(url, HOSTNAME)).toBe(
			`${ORIGIN}/fr/events?utm_source=newsletter&utm_medium=email&utm_campaign=autumn`
		)
	})

	it('does not let an address through as a campaign name', () => {
		expect(cleanGoogleUrl(`${ORIGIN}/fr?utm_source=runner%40example.com`, HOSTNAME)).toBe(`${ORIGIN}/fr`)
	})

	it.each(LOCALES.map(locale => [locale]))(
		'keeps the locale %s: the address stays the one the visitor sees',
		locale => {
			expect(cleanGoogleUrl(`${ORIGIN}/${locale}`, HOSTNAME)).toBe(`${ORIGIN}/${locale}`)
			expect(cleanGoogleUrl(`${ORIGIN}/${locale}/`, HOSTNAME)).toBe(`${ORIGIN}/${locale}`)
			expect(cleanGoogleUrl(`${ORIGIN}/${locale}/events/abc?search=x`, HOSTNAME)).toBe(`${ORIGIN}/${locale}/events/abc`)
		}
	)

	it('masks the id of the edit page of a listing, with or without a locale', () => {
		expect(cleanGoogleUrl(`${ORIGIN}/fr/dashboard/seller/edit-bib/abcdefghij12345`, HOSTNAME)).toBe(
			`${ORIGIN}/fr/dashboard/seller/edit-bib/:id`
		)
		expect(cleanGoogleUrl(`${ORIGIN}/dashboard/seller/edit-bib/abcdefghij12345`, HOSTNAME)).toBe(
			`${ORIGIN}/dashboard/seller/edit-bib/:id`
		)
	})

	it('keeps the origin as gtag.js wrote it (it leaves the port out of the first page view)', () => {
		expect(cleanGoogleUrl('http://localhost/en/contact?name=Jane', 'localhost')).toBe('http://localhost/en/contact')
		expect(cleanGoogleUrl('http://localhost:3000/en/contact?name=Jane', 'localhost')).toBe(
			'http://localhost:3000/en/contact'
		)
	})

	it('reduces a URL of another site to its origin: a referrer, an outbound link', () => {
		expect(cleanGoogleUrl('https://www.google.com/search?q=dossard+marathon', HOSTNAME)).toBe('https://www.google.com')
		expect(cleanGoogleUrl('https://www.paypal.com/checkoutnow?token=EC-1AB', HOSTNAME)).toBe('https://www.paypal.com')
		// Another host of the same domain is another site here: nothing of its path is known to be safe
		expect(cleanGoogleUrl('https://staging.beswib.com/fr/marketplace/abc?tkn=secret', HOSTNAME)).toBe(
			'https://staging.beswib.com'
		)
	})

	it.each([['javascript:alert(1)'], ['mailto:runner@example.com'], ['/fr/contact?name=Jane'], ['not a url'], ['']])(
		'returns null for %s',
		raw => {
			expect(cleanGoogleUrl(raw, HOSTNAME)).toBeNull()
		}
	)
})

describe('cleanHitParams', () => {
	const SECRET_PAGE = `${ORIGIN}/fr/marketplace/abcdefghij12345?tkn=privatelistingtoken0123456789abcd&utm_source=newsletter`
	const SECRET_REFERRER = `${ORIGIN}/en/contact?name=Jane%20Runner&email=runner%40example.com`

	it('cleans the page URL and the referrer of a hit', () => {
		const cleaned = decoded(
			cleanHitParams(`v=2&tid=G-TEST0000000&${param('dl', SECRET_PAGE)}&${param('dr', SECRET_REFERRER)}`, HOSTNAME)
		)
		expect(cleaned.dl).toBe(`${ORIGIN}/fr/marketplace/abcdefghij12345?utm_source=newsletter`)
		expect(cleaned.dr).toBe(`${ORIGIN}/en/contact`)
	})

	it('cleans a URL whatever the parameter that carries it', () => {
		// Enhanced measurement: outbound clicks, form submissions, videos
		const cleaned = decoded(
			cleanHitParams(
				[
					'en=form_submit',
					param('ep.form_destination', SECRET_PAGE),
					param('ep.link_url', 'https://www.paypal.com/checkoutnow?token=EC-1AB'),
					param('ep.video_url', 'https://www.youtube.com/watch?v=abc'),
					param('ep.anything_else', SECRET_REFERRER),
				].join('&'),
				HOSTNAME
			)
		)
		expect(cleaned['ep.form_destination']).toBe(`${ORIGIN}/fr/marketplace/abcdefghij12345?utm_source=newsletter`)
		expect(cleaned['ep.link_url']).toBe('https://www.paypal.com')
		expect(cleaned['ep.video_url']).toBe('https://www.youtube.com')
		expect(cleaned['ep.anything_else']).toBe(`${ORIGIN}/en/contact`)
	})

	it('passes every other parameter byte for byte', () => {
		// As captured from gtag.js: its own escapes (%20, %7C), a title with an ampersand, a bare flag
		const others =
			'v=2&tid=G-TEST0000000&gtm=45je5a80v9&_p=1760390000000&gcs=G101&ul=fr-fr&sr=1280x900&uaa=x86&dt=Buy%20%26%20Sell%20Race%20Bibs%20%7C%20Beswib&en=page_view&_ss=1&epn.percent_scrolled=90&flag'
		expect(cleanHitParams(others, HOSTNAME)).toBe(others)
		expect(cleanHitParams(`${others}&${param('dl', SECRET_PAGE)}`, HOSTNAME).startsWith(`${others}&dl=`)).toBe(true)
	})

	it('removes what the stream copies out of the query string: the term of its site search', () => {
		// Enhanced measurement turns /fr/events?search=... into a view_search_results event
		const cleaned = cleanHitParams(
			`en=view_search_results&${param('ep.search_term', 'marathon Jane Runner')}&${param('ep.q_location', 'Lyon')}&${param('dl', `${ORIGIN}/fr/events?search=marathon%20Jane%20Runner`)}&_et=12`,
			HOSTNAME
		)
		expect(cleaned).toBe(`en=view_search_results&${param('dl', `${ORIGIN}/fr/events`)}&_et=12`)
	})

	it('leaves a clean URL as it was', () => {
		const query = `v=2&${param('dl', `${ORIGIN}/fr/events`)}&en=page_view`
		expect(cleanHitParams(query, HOSTNAME)).toBe(query)
	})

	it('empties a value that looks like a URL and cannot be read as one', () => {
		expect(cleanHitParams('dl=http%3A%2F%2F%5B&en=page_view', HOSTNAME)).toBe('dl=&en=page_view')
	})

	it('does not throw on a malformed escape', () => {
		expect(cleanHitParams('dt=100%&en=page_view', HOSTNAME)).toBe('dt=100%&en=page_view')
		expect(cleanHitParams('', HOSTNAME)).toBe('')
	})
})

describe('cleanGoogleHit', () => {
	const RAW = `${ORIGIN}/en/contact?name=Jane%20Runner&email=runner%40example.com`

	it('cleans the request URL of a single event', () => {
		const hit = cleanGoogleHit(`${COLLECT}?v=2&${param('dl', RAW)}&en=page_view`, undefined, HOSTNAME)
		expect(hit).toEqual({ url: `${COLLECT}?v=2&${param('dl', `${ORIGIN}/en/contact`)}&en=page_view` })
	})

	it('cleans each event of a batch: one line of the body per event', () => {
		const body = [
			`en=page_view&${param('dl', RAW)}&${param('dr', `${ORIGIN}/fr/marketplace/abc?tkn=secret`)}`,
			'en=scroll&epn.percent_scrolled=90',
		].join('\r\n')
		const hit = cleanGoogleHit(`${COLLECT}?v=2&tid=G-TEST0000000&${param('dl', RAW)}`, body, HOSTNAME)

		expect(hit?.url).toBe(`${COLLECT}?v=2&tid=G-TEST0000000&${param('dl', `${ORIGIN}/en/contact`)}`)
		expect(hit?.body).toBe(
			[
				`en=page_view&${param('dl', `${ORIGIN}/en/contact`)}&${param('dr', `${ORIGIN}/fr/marketplace/abc`)}`,
				'en=scroll&epn.percent_scrolled=90',
			].join('\r\n')
		)
		expect(JSON.stringify(hit)).not.toMatch(/Jane|runner|secret/)
	})

	it('keeps an empty body empty', () => {
		expect(cleanGoogleHit(`${COLLECT}?v=2`, '', HOSTNAME)).toEqual({ url: `${COLLECT}?v=2`, body: '' })
	})

	it.each([
		['a Blob', new Blob(['en=page_view'])],
		['form data', new FormData()],
		['URL parameters', new URLSearchParams('en=page_view')],
		['a buffer', new ArrayBuffer(8)],
	])('refuses a body it cannot read: %s', (_label, body) => {
		expect(cleanGoogleHit(`${COLLECT}?v=2`, body, HOSTNAME)).toBeNull()
	})
})

describe('installGoogleHitGuard', () => {
	type GuardModule = typeof import('@/lib/analytics/google-hits')

	const RAW = 'http://localhost:3000/fr/marketplace/abcdefghij12345?tkn=privatelistingtoken0123456789abcd'
	const CLEAN = 'http://localhost:3000/fr/marketplace/abcdefghij12345'

	const originalFetch = window.fetch
	const originalSendBeacon = navigator.sendBeacon
	let nativeFetch: ReturnType<typeof vi.fn>
	let nativeSendBeacon: ReturnType<typeof vi.fn>

	// The guard is installed once per document: a fresh module per test
	async function load(): Promise<GuardModule['installGoogleHitGuard']> {
		vi.resetModules()
		return (await import('@/lib/analytics/google-hits')).installGoogleHitGuard
	}

	beforeEach(() => {
		nativeFetch = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })))
		nativeSendBeacon = vi.fn(() => true)
		window.fetch = nativeFetch as unknown as typeof window.fetch
		Object.defineProperty(navigator, 'sendBeacon', { value: nativeSendBeacon, configurable: true, writable: true })
	})

	afterEach(() => {
		window.fetch = originalFetch
		Object.defineProperty(navigator, 'sendBeacon', { value: originalSendBeacon, configurable: true, writable: true })
	})

	it('reports that the cleaning is in place', async () => {
		const install = await load()
		expect(install()).toBe(true)
		expect(window.fetch).not.toBe(nativeFetch)
		expect(navigator.sendBeacon).not.toBe(nativeSendBeacon)
	})

	it('wraps once: a second call changes nothing', async () => {
		const install = await load()
		install()
		const guardedFetch = window.fetch
		const guardedSendBeacon = navigator.sendBeacon
		expect(install()).toBe(true)
		expect(window.fetch).toBe(guardedFetch)
		expect(navigator.sendBeacon).toBe(guardedSendBeacon)
	})

	it('passes any other request through with the arguments it came with', async () => {
		const install = await load()
		install()
		const init = { method: 'POST', body: JSON.stringify({ url: RAW }) }
		const response = await window.fetch(`/api/waitlist/status?redirect_url=${encodeURIComponent(RAW)}`, init)

		expect(response.status).toBe(204)
		expect(nativeFetch).toHaveBeenCalledTimes(1)
		expect(nativeFetch.mock.calls[0][0]).toBe(`/api/waitlist/status?redirect_url=${encodeURIComponent(RAW)}`)
		expect(nativeFetch.mock.calls[0][1]).toBe(init)

		const request = new Request(
			'https://clerk.beswib.com/v1/client?redirect_url=https%3A%2F%2Fbeswib.com%2Ffr%3Ftkn%3Dx'
		)
		await window.fetch(request)
		expect(nativeFetch.mock.calls[1][0]).toBe(request)

		navigator.sendBeacon('https://umami.wadefade.fr/api/send', `url=${encodeURIComponent(RAW)}`)
		expect(nativeSendBeacon).toHaveBeenCalledWith(
			'https://umami.wadefade.fr/api/send',
			`url=${encodeURIComponent(RAW)}`
		)
	})

	it('cleans a hit sent with fetch, and keeps the options gtag.js gave', async () => {
		const install = await load()
		install()
		const init: RequestInit = {
			method: 'POST',
			mode: 'no-cors',
			credentials: 'include',
			keepalive: true,
			cache: 'no-store',
		}
		await window.fetch(`${COLLECT}?v=2&${param('dl', RAW)}&en=page_view`, init)

		expect(nativeFetch).toHaveBeenCalledTimes(1)
		expect(nativeFetch.mock.calls[0][0]).toBe(`${COLLECT}?v=2&${param('dl', CLEAN)}&en=page_view`)
		expect(nativeFetch.mock.calls[0][1]).toBe(init)
	})

	it('cleans the body of a batch sent with fetch', async () => {
		const install = await load()
		install()
		const body = [`en=page_view&${param('dl', RAW)}`, `en=scroll&${param('dr', RAW)}`].join('\r\n')
		await window.fetch(new URL(`${COLLECT}?v=2&tid=G-TEST0000000`), { method: 'POST', keepalive: true, body })

		expect(nativeFetch.mock.calls[0][0]).toBe(`${COLLECT}?v=2&tid=G-TEST0000000`)
		expect(nativeFetch.mock.calls[0][1]).toEqual({
			method: 'POST',
			keepalive: true,
			body: [`en=page_view&${param('dl', CLEAN)}`, `en=scroll&${param('dr', CLEAN)}`].join('\r\n'),
		})
	})

	it('cleans a hit sent with sendBeacon', async () => {
		const install = await load()
		install()
		expect(navigator.sendBeacon(`${COLLECT}?v=2&${param('dl', RAW)}`, `en=page_view&${param('dr', RAW)}`)).toBe(true)
		expect(nativeSendBeacon).toHaveBeenCalledWith(
			`${COLLECT}?v=2&${param('dl', CLEAN)}`,
			`en=page_view&${param('dr', CLEAN)}`
		)

		navigator.sendBeacon(`${COLLECT}?v=2&${param('dl', RAW)}`)
		expect(nativeSendBeacon).toHaveBeenLastCalledWith(`${COLLECT}?v=2&${param('dl', CLEAN)}`, undefined)
	})

	it('does not send a hit it cannot read, and reports it as sent so that gtag.js does not retry it elsewhere', async () => {
		const install = await load()
		install()

		const viaFetch = await window.fetch(`${COLLECT}?v=2&${param('dl', RAW)}`, { method: 'POST', body: new Blob(['x']) })
		expect(viaFetch.ok).toBe(true)
		const viaRequest = await window.fetch(
			new Request(`${COLLECT}?v=2&${param('dl', RAW)}`, { method: 'POST', body: 'en=page_view' })
		)
		expect(viaRequest.ok).toBe(true)
		expect(nativeFetch).not.toHaveBeenCalled()

		expect(navigator.sendBeacon(`${COLLECT}?v=2&${param('dl', RAW)}`, new Blob(['x']))).toBe(true)
		expect(nativeSendBeacon).not.toHaveBeenCalled()
	})

	it('never throws from fetch: a failure of the browser stays a rejected promise', async () => {
		const install = await load()
		install()
		nativeFetch.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')))
		await expect(window.fetch(`${COLLECT}?v=2&${param('dl', RAW)}`)).rejects.toThrow('Failed to fetch')
	})

	it('works without sendBeacon: fetch is then all gtag.js can send with', async () => {
		Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true, writable: true })
		const install = await load()
		expect(install()).toBe(true)
		expect(navigator.sendBeacon).toBeUndefined()
	})

	it('reports a failure when fetch cannot be wrapped: the tag is then not mounted', async () => {
		Object.defineProperty(window, 'fetch', { value: nativeFetch, configurable: true, writable: false })
		const install = await load()
		expect(install()).toBe(false)
		Object.defineProperty(window, 'fetch', { value: originalFetch, configurable: true, writable: true })
	})
})
