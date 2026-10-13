import { describe, expect, it } from 'vitest'

import { sanitizeEvent } from '@/lib/analytics/sanitize'

const BIB_ID = 'abcdefghij12345'
const EVENT_ID = 'zyxwvutsrq09876'

const bibCardClick = {
	where: 'marketplace',
	target: 'bib',
	position: 3,
	bib_id: BIB_ID,
	event_id: EVENT_ID,
	price_bucket: '50_99',
}

describe('sanitizeEvent', () => {
	it('accepts a valid event and returns its side', () => {
		expect(sanitizeEvent('cta_click', { cta: 'sell_bib', where: 'hero' })).toEqual({
			name: 'cta_click',
			side: 'client',
			data: { cta: 'sell_bib', where: 'hero' },
		})
		expect(sanitizeEvent('paypal_webhook_error', { kind: 'exception' })?.side).toBe('server')
	})

	it('accepts an event without properties, with or without a bag', () => {
		expect(sanitizeEvent('show_special_tooltip')).toEqual({ name: 'show_special_tooltip', side: 'client', data: {} })
		expect(sanitizeEvent('show_special_tooltip', { anything: 'x' })?.data).toEqual({})
		expect(sanitizeEvent('show_special_tooltip', 'not an object')?.data).toEqual({})
	})

	it.each([
		'unknown_event',
		'toString',
		'__proto__',
		'constructor',
		'',
		'CTA_CLICK',
		42,
		null,
		undefined,
		{ name: 'cta_click' },
	])('drops the unknown name %j', name => {
		expect(sanitizeEvent(name, { cta: 'sell_bib', where: 'hero' })).toBeNull()
	})

	it('removes undeclared properties, locale included', () => {
		const event = sanitizeEvent('cta_click', {
			cta: 'sell_bib',
			where: 'hero',
			email: 'runner@example.com',
			locale: 'fr',
			href: '/fr/marketplace?tkn=secret',
		})
		expect(event?.data).toEqual({ cta: 'sell_bib', where: 'hero' })
	})

	it('ignores properties inherited from a prototype', () => {
		const inherited = Object.create({ cta: 'sell_bib', where: 'hero' }) as Record<string, unknown>
		expect(sanitizeEvent('cta_click', inherited)).toBeNull()
	})

	describe('enum and bucket', () => {
		it('drops the event when a value is outside its closed list', () => {
			expect(sanitizeEvent('cta_click', { cta: 'sell_bib', where: 'somewhere_else' })).toBeNull()
			expect(sanitizeEvent('cta_click', { cta: 'runner@example.com', where: 'hero' })).toBeNull()
			expect(sanitizeEvent('bib_card_click', { ...bibCardClick, price_bucket: '73.50' })).toBeNull()
		})

		it('does not accept a non-string as a member', () => {
			expect(sanitizeEvent('cta_click', { cta: ['sell_bib'], where: 'hero' })).toBeNull()
			expect(sanitizeEvent('search_submit', { where: 'marketplace', result_count: 1, has_filters: false })).toBeNull()
		})

		it('keeps a bucket whose token looks like a number', () => {
			const event = sanitizeEvent('search_submit', { where: 'marketplace', result_count: '1', has_filters: false })
			expect(event?.data.result_count).toBe('1')
		})
	})

	describe('boolean', () => {
		it('accepts booleans and coerces attribute strings', () => {
			expect(sanitizeEvent('contact_form_start', { prefilled: true })?.data).toEqual({ prefilled: true })
			expect(sanitizeEvent('contact_form_start', { prefilled: false })?.data).toEqual({ prefilled: false })
			expect(sanitizeEvent('contact_form_start', { prefilled: 'true' })?.data).toEqual({ prefilled: true })
			expect(sanitizeEvent('contact_form_start', { prefilled: 'false' })?.data).toEqual({ prefilled: false })
		})

		it.each(['yes', '1', 1, 0, 'TRUE', {}, ''])('drops the event for %j', value => {
			expect(sanitizeEvent('contact_form_start', { prefilled: value })).toBeNull()
		})
	})

	describe('int', () => {
		it('accepts a number and coerces an attribute string', () => {
			expect(sanitizeEvent('bib_card_click', bibCardClick)?.data.position).toBe(3)
			expect(sanitizeEvent('bib_card_click', { ...bibCardClick, position: '7' })?.data.position).toBe(7)
		})

		it('truncates and clamps to 0..max', () => {
			expect(sanitizeEvent('bib_card_click', { ...bibCardClick, position: 3.9 })?.data.position).toBe(3)
			expect(sanitizeEvent('bib_card_click', { ...bibCardClick, position: 400 })?.data.position).toBe(50)
			expect(sanitizeEvent('bib_card_click', { ...bibCardClick, position: '999999' })?.data.position).toBe(50)
			expect(sanitizeEvent('bib_card_click', { ...bibCardClick, position: -4 })?.data.position).toBe(0)
		})

		it.each(['three', '3.5', '-1', '1234567', '', ' 3', Number.NaN, Number.POSITIVE_INFINITY, true, null])(
			'drops the event for %j',
			value => {
				expect(sanitizeEvent('bib_card_click', { ...bibCardClick, position: value })).toBeNull()
			}
		)
	})

	describe('id', () => {
		it('accepts a PocketBase id', () => {
			expect(
				sanitizeEvent('event_view', { event_id: EVENT_ID, sport: 'trail', bib_count: '2_5', days_to_event: '8_30' })
			).not.toBeNull()
		})

		it.each([
			['a Clerk user id', 'user_2abcDEFghiJKLmnoPQRstuVWX'],
			['an e-mail', 'runner@example.com'],
			['a 32-character token', 'a'.repeat(32)],
			['a short id', 'abc123'],
			['an upper-case id', 'ABCDEFGHIJ12345'],
			['a path', '/marketplace/abc'],
			['a number', 123456789012345],
			['an empty string', ''],
		])('drops the event for %s', (_label, value) => {
			expect(
				sanitizeEvent('event_view', { event_id: value, sport: 'trail', bib_count: '2_5', days_to_event: '8_30' })
			).toBeNull()
		})
	})

	describe('required and optional properties', () => {
		it('drops the event when a required property is missing, null or undefined', () => {
			expect(sanitizeEvent('cta_click', { cta: 'sell_bib' })).toBeNull()
			expect(sanitizeEvent('cta_click', { cta: 'sell_bib', where: undefined })).toBeNull()
			expect(sanitizeEvent('cta_click', { cta: 'sell_bib', where: null })).toBeNull()
			expect(sanitizeEvent('cta_click')).toBeNull()
			expect(sanitizeEvent('cta_click', ['sell_bib', 'hero'])).toBeNull()
		})

		it('leaves an absent optional property out', () => {
			const event = sanitizeEvent('bib_view', { state: 'token_required', listing: 'unknown', viewer: 'unknown' })
			expect(event?.data).toEqual({ state: 'token_required', listing: 'unknown', viewer: 'unknown' })
			expect(
				sanitizeEvent('bib_view', { state: 'token_required', listing: 'unknown', viewer: 'unknown', bib_id: undefined })
					?.data
			).not.toHaveProperty('bib_id')
		})

		it('drops the event when an optional property is present but invalid', () => {
			expect(
				sanitizeEvent('bib_view', {
					state: 'token_required',
					listing: 'unknown',
					viewer: 'unknown',
					bib_id: 'user_2abc',
				})
			).toBeNull()
		})
	})
})
