import { beforeEach, describe, expect, it, vi } from 'vitest'

type BeforeSend = typeof import('@/lib/analytics/before-send')

const ORIGIN = window.location.origin
const BIB_ID = 'abcdefghij12345'
const EVENT_ID = 'zyxwvutsrq09876'

let hook: BeforeSend['beswibBeforeSend']
let registerBeforeSend: BeforeSend['registerBeforeSend']

// What the deployed tracker builds before every send (see its C() function)
function envelope(url: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		website: 'e9168017-b73b-491b-b7b0-fee64f07c847',
		screen: '1920x1080',
		language: 'fr-FR',
		title: 'Beswib',
		hostname: 'beswib.com',
		url: `${ORIGIN}${url}`,
		referrer: '',
		tag: 'v1.2.3',
		id: undefined,
		...extra,
	}
}

function namedEvent(url: string, name: unknown, data?: unknown, extra: Record<string, unknown> = {}) {
	return envelope(url, { name, data, ...extra })
}

beforeEach(async () => {
	// The hook remembers the last page view: start every test from a fresh module
	vi.resetModules()
	const module = await import('@/lib/analytics/before-send')
	hook = module.beswibBeforeSend
	registerBeforeSend = module.registerBeforeSend
	document.documentElement.lang = ''
	Reflect.deleteProperty(window, 'beswibBeforeSend')
})

describe('beswibBeforeSend, every payload', () => {
	it('removes payload.id from a page view, a named event and a performance payload', () => {
		const id = 'user_2abcDEFghiJKLmnoPQRstuVWX'
		const pageView = hook('event', envelope('/fr/events', { id }))
		const event = hook('event', namedEvent('/fr/events', 'show_special_tooltip', undefined, { id }))
		const performance = hook('performance', envelope('/fr/events', { id, lcp: 1200 }))
		for (const result of [pageView, event, performance]) {
			expect(result).not.toBe(false)
			expect(result).not.toHaveProperty('id')
			expect(JSON.stringify(result)).not.toContain(id)
		}
	})

	it('rebuilds the payload from known keys only', () => {
		const result = hook(
			'event',
			envelope('/fr/events', { email: 'runner@example.com', ip: '203.0.113.7', userAgent: 'x', timestamp: 1 })
		)
		expect(result).toEqual({
			website: 'e9168017-b73b-491b-b7b0-fee64f07c847',
			screen: '1920x1080',
			language: 'fr-FR',
			title: 'Beswib',
			hostname: 'beswib.com',
			url: `${ORIGIN}/events`,
			referrer: '',
			tag: 'v1.2.3',
			data: { locale: 'fr' },
		})
	})

	it('does not mutate the payload it receives', () => {
		const payload = envelope('/fr/events?search=paris', { id: 'user_2abc' })
		const copy = { ...payload }
		hook('event', payload)
		expect(payload).toEqual(copy)
	})

	it('leaves the title as the tracker sends it', () => {
		const result = hook('event', envelope('/fr/marketplace/abc', { title: 'Marathon de Paris - 85 EUR | Beswib' }))
		expect(result).toHaveProperty('title', 'Marathon de Paris - 85 EUR | Beswib')
	})

	it('cleans the URL: locale, query, hash and edit-bib id', () => {
		const result = hook(
			'event',
			envelope('/fr/dashboard/seller/edit-bib/abcdefghij12345?tkn=secret&utm_source=mail&email=a%40b.fr#price')
		)
		expect(result).toHaveProperty('url', `${ORIGIN}/dashboard/seller/edit-bib/:id?utm_source=mail`)
	})

	it('keeps only the origin of an external referrer', () => {
		const result = hook('event', envelope('/fr', { referrer: 'https://www.google.com/search?q=dossard+paris' }))
		expect(result).toHaveProperty('referrer', 'https://www.google.com')
	})

	it('cleans a same-origin referrer like the URL', () => {
		const result = hook(
			'event',
			envelope('/fr/events', { referrer: `${ORIGIN}/fr/marketplace/abcdefghij12345?tkn=secret&lockedAt=1#x` })
		)
		expect(result).toHaveProperty('referrer', `${ORIGIN}/marketplace/abcdefghij12345`)
	})

	it('never sends the page a sign-in comes back to: redirect_url can hold a private listing token', () => {
		const bib = '/fr/marketplace/abcdefghij12345?tkn=s3cr3t-Token'
		const signIn = `/fr/auth/sign-in?redirect_url=${encodeURIComponent(bib)}`
		const written = `/fr/auth/sign-in?redirect_url=${encodeURIComponent(`https://beswib.com${bib}`)}`

		const results = [
			// The sign-in page itself, a probe sent from it, and the page the visitor lands on afterwards
			hook('event', envelope(signIn)),
			hook('event', namedEvent(signIn, 'sign_in_start', { method: 'google', intent: 'purchase' })),
			hook('event', envelope(bib, { referrer: `${ORIGIN}${signIn}` })),
			// The same with the address Clerk writes in full
			hook('event', namedEvent(written, 'sign_in_success', { method: 'password', intent: 'purchase' })),
		]

		expect(results[0]).toHaveProperty('url', `${ORIGIN}/auth/sign-in`)
		expect(results[1]).toHaveProperty('url', `${ORIGIN}/auth/sign-in`)
		expect(results[2]).toHaveProperty('url', `${ORIGIN}/marketplace/abcdefghij12345`)
		expect(results[2]).toHaveProperty('referrer', `${ORIGIN}/auth/sign-in`)
		expect(results[3]).toHaveProperty('url', `${ORIGIN}/auth/sign-in`)
		expect(JSON.stringify(results)).not.toMatch(/redirect_url|tkn|s3cr3t/)
	})

	it.each([
		['identify', envelope('/fr', { data: { email: 'runner@example.com', name: 'Jane Runner' } })],
		['identify', envelope('/fr', { id: 'user_2abc' })],
	])('drops an %s payload', (type, payload) => {
		expect(hook(type, payload)).toBe(false)
	})

	it.each([null, undefined, 'payload', 42, [], {}, { url: 42 }, { url: '' }, { name: 'cta_click' }])(
		'drops the unusable payload %j',
		payload => {
			expect(hook('event', payload)).toBe(false)
		}
	)

	it('drops a payload whose URL cannot be read, rather than sending it raw', () => {
		expect(hook('event', envelope('', { url: 'http://[bad?email=runner@example.com' }))).toBe(false)
		expect(hook('event', envelope('', { url: 'data:text/html,hello' }))).toBe(false)
		// umami.track({ ... }) sends an object as it is, without a URL
		expect(hook('event', { website: 'x', name: 'cta_click', data: { email: 'runner@example.com' } })).toBe(false)
	})

	it('gives an unknown type the cleaned envelope and nothing else', () => {
		const result = hook(
			'something_new',
			envelope('/fr/events?search=paris', { id: 'user_2abc', secret: 'x', data: { a: 1 } })
		)
		expect(result).toEqual({
			website: 'e9168017-b73b-491b-b7b0-fee64f07c847',
			screen: '1920x1080',
			language: 'fr-FR',
			title: 'Beswib',
			hostname: 'beswib.com',
			url: `${ORIGIN}/events`,
			referrer: '',
			tag: 'v1.2.3',
		})
	})
})

describe('beswibBeforeSend, page views', () => {
	it('adds the locale taken from the path', () => {
		expect(hook('event', envelope('/ko/blog'))).toHaveProperty('data', { locale: 'ko' })
	})

	it('falls back to the lang of the document when the path has no locale', () => {
		document.documentElement.lang = 'de'
		expect(hook('event', envelope('/events'))).toHaveProperty('data', { locale: 'de' })
	})

	it('sends no locale when neither the path nor the document gives a known one', () => {
		document.documentElement.lang = 'xx'
		expect(hook('event', envelope('/events'))).toHaveProperty('data', {})
	})

	it('drops a page view whose cleaned URL equals the previous one sent', () => {
		expect(hook('event', envelope('/fr/marketplace'))).not.toBe(false)
		// The list filters push a history entry on every change
		expect(hook('event', envelope('/fr/marketplace?search=p'))).toBe(false)
		expect(hook('event', envelope('/fr/marketplace?search=pa&sport=trail'))).toBe(false)
		expect(hook('event', envelope('/fr/marketplace#top'))).toBe(false)
		// A real navigation is sent, and coming back afterwards too
		expect(hook('event', envelope('/fr/events'))).not.toBe(false)
		expect(hook('event', envelope('/fr/marketplace'))).not.toBe(false)
	})

	it('counts a new campaign as a new page view', () => {
		expect(hook('event', envelope('/fr/marketplace'))).not.toBe(false)
		expect(hook('event', envelope('/fr/marketplace?utm_source=newsletter'))).not.toBe(false)
	})

	it('does not let named events or performance payloads disturb the page view memory', () => {
		expect(hook('event', envelope('/fr/marketplace'))).not.toBe(false)
		expect(hook('event', namedEvent('/fr/marketplace', 'show_special_tooltip'))).not.toBe(false)
		expect(hook('performance', envelope('/fr/marketplace', { lcp: 900 }))).not.toBe(false)
		expect(hook('event', envelope('/fr/marketplace?search=x'))).toBe(false)
	})

	it('keeps the page views of the back-office, with a cleaned URL', () => {
		expect(hook('event', envelope('/fr/admin/event?search=x'))).toHaveProperty('url', `${ORIGIN}/admin/event`)
	})
})

describe('beswibBeforeSend, named events', () => {
	it('passes a catalogue event with its properties and the locale', () => {
		const result = hook('event', namedEvent('/fr/events?search=x', 'cta_click', { cta: 'sell_bib', where: 'hero' }))
		expect(result).toMatchObject({
			name: 'cta_click',
			url: `${ORIGIN}/events`,
			data: { cta: 'sell_bib', where: 'hero', locale: 'fr' },
		})
	})

	it('passes an event without properties', () => {
		const result = hook('event', namedEvent('/it', 'show_special_tooltip'))
		expect(result).toMatchObject({ name: 'show_special_tooltip', data: { locale: 'it' } })
	})

	it('coerces the strings of data-umami-event attributes', () => {
		const result = hook(
			'event',
			namedEvent('/fr/marketplace', 'bib_card_click', {
				where: 'marketplace',
				target: 'bib',
				position: '12',
				bib_id: BIB_ID,
				event_id: EVENT_ID,
				price_bucket: '50_99',
			})
		)
		expect(result).toHaveProperty('data.position', 12)
		const withBoolean = hook('event', namedEvent('/fr/contact', 'contact_form_start', { prefilled: 'false' }))
		expect(withBoolean).toHaveProperty('data.prefilled', false)
	})

	it('removes undeclared properties and never trusts a locale given by the caller', () => {
		const result = hook(
			'event',
			namedEvent('/fr', 'cta_click', { cta: 'sell_bib', where: 'hero', email: 'runner@example.com', locale: 'zz' })
		)
		expect(result).toHaveProperty('data', { cta: 'sell_bib', where: 'hero', locale: 'fr' })
	})

	it.each([
		['an unknown name', 'unknown_event', {}],
		['the old free-form usage', 'Signup', { email: 'runner@example.com' }],
		['a prototype key', 'toString', {}],
		['a value outside its list', 'cta_click', { cta: 'sell_bib', where: 'runner@example.com' }],
		['a missing property', 'cta_click', { cta: 'sell_bib' }],
		['an id that is not a PocketBase id', 'waitlist_leave_start', { event_id: 'user_2abcDEFghiJKLmno' }],
		['a server event', 'sale_success', { bib_id: BIB_ID, price_bucket: '50_99' }],
		['a name that is not a string', 42, {}],
		['a null name', null, {}],
	])('drops %s', (_label, name, data) => {
		expect(hook('event', namedEvent('/fr', name, data))).toBe(false)
	})

	it('drops a named event sent from the back-office', () => {
		const data = { item: 'logo', where: 'header' }
		expect(hook('event', namedEvent('/fr/admin', 'nav_click', data))).toBe(false)
		expect(hook('event', namedEvent('/fr/admin/', 'nav_click', data))).toBe(false)
		expect(hook('event', namedEvent('/fr/admin/event/create?x=1', 'nav_click', data))).toBe(false)
		expect(hook('event', namedEvent('/admin/event', 'nav_click', data))).toBe(false)
	})

	it('drops a named event when the page really is the back-office, whatever URL the tracker believes', () => {
		// The tracker only follows client navigations once the window has loaded: until then it
		// still reports the URL of the first page. Queued events are flushed with the current URL too.
		const data = { item: 'logo', where: 'header' }
		window.history.replaceState({}, '', '/fr/admin/event')
		try {
			expect(hook('event', namedEvent('/fr', 'nav_click', data))).toBe(false)
			expect(hook('event', namedEvent('/fr/events', 'show_special_tooltip'))).toBe(false)
			// Page views are kept there
			expect(hook('event', envelope('/fr/admin/event'))).toHaveProperty('url', `${ORIGIN}/admin/event`)
		} finally {
			window.history.replaceState({}, '', '/')
		}
	})

	it.each(['/fr/%61dmin/event', '/fr/Admin/event', '/fr/ADMIN', '/%61dmin', '/fr/admin%2Fevent'])(
		'drops a named event of the back-office written as %s',
		path => {
			expect(hook('event', namedEvent(path, 'nav_click', { item: 'logo', where: 'header' }))).toBe(false)
			expect(hook('event', namedEvent(path, 'show_special_tooltip'))).toBe(false)
		}
	)

	it('keeps a named event of a path that only starts like the back-office', () => {
		const data = { item: 'logo', where: 'header' }
		expect(hook('event', namedEvent('/fr/administration', 'nav_click', data))).toMatchObject({ name: 'nav_click' })
		expect(hook('event', namedEvent('/fr/blog/admin', 'nav_click', data))).toMatchObject({ name: 'nav_click' })
	})
})

describe('beswibBeforeSend, performance payloads', () => {
	it('keeps the cleaned envelope and the numeric metrics only', () => {
		const result = hook(
			'performance',
			envelope('/fr/marketplace/abcdefghij12345?tkn=secret#x', {
				id: 'user_2abc',
				referrer: 'https://www.google.com/search?q=x',
				ttfb: 120.5,
				fcp: 800,
				lcp: 1500,
				cls: 0.02,
				inp: 96,
				duration: 4200,
				extra: 'nope',
			})
		)
		expect(result).toEqual({
			website: 'e9168017-b73b-491b-b7b0-fee64f07c847',
			screen: '1920x1080',
			language: 'fr-FR',
			title: 'Beswib',
			hostname: 'beswib.com',
			url: `${ORIGIN}/marketplace/abcdefghij12345`,
			referrer: 'https://www.google.com',
			tag: 'v1.2.3',
			ttfb: 120.5,
			fcp: 800,
			lcp: 1500,
			cls: 0.02,
			inp: 96,
			duration: 4200,
		})
	})

	it('ignores a metric that is not a finite number', () => {
		const result = hook('performance', envelope('/fr', { lcp: 'slow', cls: Number.NaN, inp: 80 }))
		expect(result).not.toHaveProperty('lcp')
		expect(result).not.toHaveProperty('cls')
		expect(result).toHaveProperty('inp', 80)
	})

	it('is not subject to the duplicate page view rule', () => {
		expect(hook('performance', envelope('/fr', { lcp: 1 }))).not.toBe(false)
		expect(hook('performance', envelope('/fr', { lcp: 2 }))).not.toBe(false)
	})
})

describe('beswibBeforeSend never throws', () => {
	it('returns false when reading the payload throws', () => {
		const hostile = new Proxy(
			{},
			{
				get() {
					throw new Error('boom')
				},
			}
		)
		expect(() => hook('event', hostile)).not.toThrow()
		expect(hook('event', hostile)).toBe(false)
	})

	it('returns false when a property getter throws', () => {
		const payload = envelope('/fr')
		Object.defineProperty(payload, 'referrer', {
			get() {
				throw new Error('boom')
			},
		})
		expect(hook('event', payload)).toBe(false)
	})

	it.each([undefined, null, 42, {}, Symbol('type')])('survives the type %s', type => {
		expect(() => hook(type, envelope('/fr'))).not.toThrow()
		expect(() => hook(type, null)).not.toThrow()
	})
})

describe('registerBeforeSend', () => {
	it('publishes the hook under the name read by the tracker', () => {
		expect(window.beswibBeforeSend).toBeUndefined()
		expect(registerBeforeSend()).toBe(true)
		expect(window.beswibBeforeSend).toBe(hook)
	})

	it('reports a failure when the global cannot be set', () => {
		Object.defineProperty(window, 'beswibBeforeSend', {
			configurable: true,
			get: () => undefined,
			set: () => {
				throw new Error('frozen')
			},
		})
		expect(registerBeforeSend()).toBe(false)
	})
})
