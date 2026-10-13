import { describe, expect, it } from 'vitest'

import * as catalog from '@/lib/analytics/catalog'
import {
	EVENT_MAX_PROPS,
	EVENT_NAME_EXCEPTIONS,
	EVENT_NAME_MAX_LENGTH,
	EVENT_VERBS,
	EVENTS,
	type EventSpec,
	getEventSpec,
	LOCALES,
} from '@/lib/analytics/catalog'
import { i18n } from '@/lib/i18n/config'

import { EXPECTED_EVENTS } from './expected-events'

const entries = Object.entries(EVENTS) as [string, EventSpec][]

const NAME_PATTERN = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/
const KEY_PATTERN = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/
// Lower-case snake / kebab tokens: what a closed value may look like
const VALUE_PATTERN = /^[a-z0-9]+([_-][a-z0-9]+)*$/
// A property with one of these names would carry personal data or free text
const FORBIDDEN_KEYS = [
	'email',
	'name',
	'phone',
	'address',
	'query',
	'search',
	'token',
	'tkn',
	'user_id',
	'amount',
	'file',
	'url',
	'message',
	'locale',
	'id',
]

function signature(spec: EventSpec): string {
	return Object.entries(spec.props)
		.map(([key, prop]) => (prop.optional === true ? `${key}?` : key))
		.join(' ')
}

describe('analytics catalogue', () => {
	it('declares exactly the events of the final catalogue, in order, with their properties', () => {
		expect(entries.map(([name]) => name)).toEqual(Object.keys(EXPECTED_EVENTS))
		for (const [name, spec] of entries) {
			expect([spec.side, signature(spec)], name).toEqual(EXPECTED_EVENTS[name])
		}
	})

	it('holds 99 events, 7 of them sent by the server', () => {
		expect(entries).toHaveLength(99)
		const serverNames = entries.filter(([, spec]) => spec.side === 'server').map(([name]) => name)
		expect(serverNames).toEqual([
			'payment_capture_success',
			'sale_success',
			'paypal_webhook_error',
			'account_create_success',
			'account_create_error',
			'paypal_onboarding_success',
			'paypal_kyc_success',
		])
		for (const name of ['cta_click', 'bib_view', 'purchase_success', 'listing_success', 'show_special_tooltip']) {
			expect(getEventSpec(name)?.side, name).toBe('client')
		}
	})

	it('has no consent event', () => {
		expect(getEventSpec('cookie_banner_view')).toBeNull()
		expect(getEventSpec('cookie_consent_submit')).toBeNull()
	})

	it.each(entries)('%s has a valid name', name => {
		expect(name).toMatch(NAME_PATTERN)
		expect(name.length).toBeLessThanOrEqual(EVENT_NAME_MAX_LENGTH)
		if (!EVENT_NAME_EXCEPTIONS.includes(name)) {
			expect(EVENT_VERBS as readonly string[]).toContain(name.split('_').at(-1))
		}
	})

	it('only show_special_tooltip escapes the verb rule', () => {
		expect(EVENT_NAME_EXCEPTIONS).toEqual(['show_special_tooltip'])
		expect([...EVENT_VERBS]).toEqual([
			'view',
			'click',
			'open',
			'select',
			'change',
			'start',
			'step',
			'submit',
			'success',
			'error',
			'cancel',
			'expire',
			'read',
		])
	})

	it.each(entries)('%s has valid properties', (_name, spec) => {
		const props = Object.entries(spec.props)
		expect(props.length).toBeLessThanOrEqual(EVENT_MAX_PROPS)
		for (const [key, prop] of props) {
			expect(key).toMatch(KEY_PATTERN)
			expect(FORBIDDEN_KEYS).not.toContain(key)
			switch (prop.type) {
				case 'enum':
				case 'bucket':
					expect(prop.values.length, key).toBeGreaterThan(0)
					expect(new Set(prop.values).size, key).toBe(prop.values.length)
					for (const value of prop.values) expect(value, key).toMatch(VALUE_PATTERN)
					break
				case 'int':
					expect(Number.isInteger(prop.max) && prop.max > 0, key).toBe(true)
					break
				case 'id':
					expect(['bib', 'event', 'article']).toContain(prop.kind)
					// An id is always named after what it identifies
					expect(key).toBe(`${prop.kind}_id`)
					break
				case 'boolean':
					break
				default:
					throw new Error(`Unknown property type on ${key}`)
			}
		}
	})

	it('never gives a server event a user, a locale or a visitor property', () => {
		for (const [name, spec] of entries.filter(([, s]) => s.side === 'server')) {
			for (const key of Object.keys(spec.props)) {
				expect(key, name).not.toMatch(/user|buyer|seller|payer|merchant|locale/)
			}
		}
	})

	it('never sends bib_id from a seller-side event', () => {
		const sellerEvents = entries.filter(([name]) => name.startsWith('listing_'))
		expect(sellerEvents.length).toBeGreaterThan(5)
		for (const [name, spec] of sellerEvents) {
			expect(Object.keys(spec.props), name).not.toContain('bib_id')
		}
		// bib_view keeps it optional: it is left out when the viewer owns the bib
		expect(EVENTS.bib_view.props.bib_id.optional).toBe(true)
	})

	it('exports shared value tuples made of unique tokens', () => {
		const tuples = Object.entries(catalog).filter(
			(entry): entry is [string, readonly string[]] =>
				Array.isArray(entry[1]) && entry[0] !== 'EVENT_NAME_EXCEPTIONS' && entry[0] === entry[0].toUpperCase()
		)
		expect(tuples.length).toBeGreaterThan(25)
		for (const [name, values] of tuples) {
			expect(new Set(values).size, name).toBe(values.length)
			for (const value of values) expect(value, name).toMatch(VALUE_PATTERN)
		}
	})

	it('takes its locales from the i18n configuration', () => {
		expect(LOCALES).toBe(i18n.locales)
		expect([...EVENTS.locale_change.props.to.values]).toEqual([...i18n.locales])
	})

	it('looks names up among own keys only', () => {
		expect(getEventSpec('cta_click')).toBe(EVENTS.cta_click)
		for (const name of [
			'toString',
			'__proto__',
			'constructor',
			'hasOwnProperty',
			'',
			'CTA_CLICK',
			42,
			null,
			undefined,
		]) {
			expect(getEventSpec(name), String(name)).toBeNull()
		}
	})
})
