import { afterEach, describe, expect, it, vi } from 'vitest'

import { umamiAttrs } from '@/lib/analytics/attrs'
import { articleIdOf, bibIdOf, eventIdOf } from '@/lib/analytics/ids'

const bibId = bibIdOf({ id: 'abcdefghij12345', eventId: 'zyxwvutsrq09876' })
const eventId = eventIdOf({ id: 'zyxwvutsrq09876', typeCourse: 'trail' })
const articleId = articleIdOf({ id: 'a1b2c3d4e5f6g7h', slug: 'how-to-resell-a-bib' })

// The expression the deployed tracker uses to read property attributes
const TRACKER_ATTRIBUTE_PATTERN = /data-umami-event-([\w-_]+)/

const anyAttrs = umamiAttrs as (name: string, props?: unknown) => Record<string, string>

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllEnvs()
})

describe('umamiAttrs', () => {
	it('builds the event attribute and one attribute per property', () => {
		expect(umamiAttrs('cta_click', { cta: 'sell_bib', where: 'hero' })).toEqual({
			'data-umami-event': 'cta_click',
			'data-umami-event-cta': 'sell_bib',
			'data-umami-event-where': 'hero',
		})
	})

	it('builds the event attribute alone for an event without properties', () => {
		expect(umamiAttrs('show_special_tooltip')).toEqual({ 'data-umami-event': 'show_special_tooltip' })
	})

	it('serialises integers, booleans and ids as strings', () => {
		expect(
			umamiAttrs('bib_card_click', {
				where: 'marketplace',
				target: 'bib',
				position: 3,
				bib_id: bibId,
				event_id: eventId,
				price_bucket: '50_99',
			})
		).toEqual({
			'data-umami-event': 'bib_card_click',
			'data-umami-event-where': 'marketplace',
			'data-umami-event-target': 'bib',
			'data-umami-event-position': '3',
			'data-umami-event-bib_id': 'abcdefghij12345',
			'data-umami-event-event_id': 'zyxwvutsrq09876',
			'data-umami-event-price_bucket': '50_99',
		})
		expect(umamiAttrs('paypal_onboarding_open', { via: 'popup', popup_blocked: false })).toEqual({
			'data-umami-event': 'paypal_onboarding_open',
			'data-umami-event-via': 'popup',
			'data-umami-event-popup_blocked': 'false',
		})
	})

	it('clamps an integer before writing it', () => {
		const attrs = umamiAttrs('article_click', { position: 400, article_id: articleId })
		expect(attrs['data-umami-event-position']).toBe('50')
	})

	it('omits an optional property that is undefined', () => {
		const attrs = umamiAttrs('outbound_click', { target: 'strava', where: 'footer', event_id: undefined })
		expect(attrs).toEqual({
			'data-umami-event': 'outbound_click',
			'data-umami-event-target': 'strava',
			'data-umami-event-where': 'footer',
		})
	})

	it('uses attribute names the tracker reads back as the property keys', () => {
		const attrs = umamiAttrs('outbound_click', { target: 'course_map', where: 'event_page', event_id: eventId })
		const keys = Object.keys(attrs)
			.map(attribute => attribute.match(TRACKER_ATTRIBUTE_PATTERN)?.[1])
			.filter(key => key !== undefined)
		expect(keys).toEqual(['target', 'where', 'event_id'])
		// HTML lower-cases attribute names: a key must survive that
		for (const attribute of Object.keys(attrs)) expect(attribute).toBe(attribute.toLowerCase())
	})

	it('yields no attribute at all for an invalid event, never a partial one', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		expect(anyAttrs('unknown_event', { a: 'b' })).toEqual({})
		expect(anyAttrs('cta_click', { cta: 'sell_bib', where: 'nowhere' })).toEqual({})
		expect(anyAttrs('cta_click', { cta: 'sell_bib' })).toEqual({})
		expect(anyAttrs('waitlist_leave_start', { event_id: 'user_2abcDEFghiJKL' })).toEqual({})
		// A server event has no attribute form
		expect(anyAttrs('paypal_webhook_error', { kind: 'exception' })).toEqual({})
		expect(warn).toHaveBeenCalledTimes(5)
	})

	it('warns outside production when an event gets no attributes, naming the event and never its properties', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		anyAttrs('cta_click', { cta: 'runner@example.com', where: 'hero' })
		expect(warn).toHaveBeenCalledOnce()
		expect(String(warn.mock.calls[0][0])).toContain('cta_click')
		expect(JSON.stringify(warn.mock.calls)).not.toContain('runner@example.com')

		vi.stubEnv('NODE_ENV', 'production')
		anyAttrs('cta_click', { cta: 'sell_bib', where: 'nowhere' })
		expect(warn).toHaveBeenCalledOnce()
		// A valid event never warns
		vi.stubEnv('NODE_ENV', 'test')
		anyAttrs('cta_click', { cta: 'sell_bib', where: 'hero' })
		expect(warn).toHaveBeenCalledOnce()
	})

	it('drops undeclared properties', () => {
		expect(anyAttrs('cta_click', { cta: 'sell_bib', where: 'hero', href: '/fr/sell?tkn=x' })).toEqual({
			'data-umami-event': 'cta_click',
			'data-umami-event-cta': 'sell_bib',
			'data-umami-event-where': 'hero',
		})
	})
})
