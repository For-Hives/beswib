// @vitest-environment node
import { describe, expect, it } from 'vitest'

import translations from '@/components/minemories/locales.json'
import {
	isHiddenPath,
	isSnoozed,
	minemoriesUrl,
	PROMO_VARIANTS,
	parseMode,
	pickVariant,
	readState,
	SNOOZE_DAYS,
	snoozeState,
	variantFromParam,
} from '@/components/minemories/promo-logic'
import { MINEMORIES_PROMO_VARIANTS } from '@/lib/analytics/catalog'
import { i18n } from '@/lib/i18n/config'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 10, 19)

describe('the design a visitor sees', () => {
	it('is the one the review link names, by number or by name', () => {
		expect(variantFromParam('1')).toBe('relay')
		expect(variantFromParam('5')).toBe('postcard')
		expect(variantFromParam('6')).toBe('team')
		expect(variantFromParam(' Time ')).toBe('time')
		expect(variantFromParam('0')).toBeNull()
		expect(variantFromParam('7')).toBeNull()
		expect(variantFromParam('2x')).toBeNull()
		expect(variantFromParam(null)).toBeNull()
	})

	it('is the "same team" design unless the deployment turns it off, rotates or picks another', () => {
		expect(parseMode(undefined)).toBe('team')
		expect(parseMode('')).toBe('team')
		expect(parseMode('nonsense')).toBe('team')
		expect(parseMode('off')).toBe('off')
		expect(parseMode('rotate')).toBe('rotate')
		expect(parseMode('3')).toBe('game')
		expect(parseMode('cinema')).toBe('cinema')
	})

	it('stays the same for a browser that already drew one', () => {
		expect(pickVariant('rotate', 'time', () => 0)).toBe('time')
		expect(pickVariant('cinema', 'time', () => 0)).toBe('cinema')
	})

	it('is drawn evenly among the six when rotating', () => {
		expect(pickVariant('rotate', null, () => 0)).toBe('relay')
		expect(pickVariant('rotate', null, () => 0.5)).toBe('time')
		expect(pickVariant('rotate', null, () => 0.999_999)).toBe('team')
		expect(pickVariant('rotate', null, () => 1)).toBe('team')
	})

	it('matches the values the analytics catalogue accepts', () => {
		expect([...MINEMORIES_PROMO_VARIANTS]).toEqual([...PROMO_VARIANTS])
	})
})

describe('where the promotion may open', () => {
	it.each(['/fr', '/en/events', '/de/marketplace/abc', '/fr/blog/post', '/'])('opens on %s', path => {
		expect(isHiddenPath(path)).toBe(false)
	})

	it.each(['/fr/dashboard', '/en/dashboard/seller', '/fr/admin', '/es/auth/sign-in', '/en/profile'])(
		'never on %s',
		path => {
			expect(isHiddenPath(path)).toBe(true)
		}
	)

	it('waits for the pathname', () => {
		expect(isHiddenPath(null)).toBe(true)
	})
})

describe('how long a choice keeps it shut', () => {
	it('stays away three months after a close and a year after a click', () => {
		const closed = snoozeState('time', 'dismiss', NOW)
		expect(isSnoozed(closed, NOW + (SNOOZE_DAYS.dismiss - 1) * DAY)).toBe(true)
		expect(isSnoozed(closed, NOW + SNOOZE_DAYS.dismiss * DAY + 1)).toBe(false)

		const clicked = snoozeState('time', 'convert', NOW)
		expect(isSnoozed(clicked, NOW + 300 * DAY)).toBe(true)
		expect(isSnoozed(clicked, NOW + SNOOZE_DAYS.convert * DAY + 1)).toBe(false)
	})

	it('reads back what it wrote and nothing else', () => {
		const state = snoozeState('relay', 'dismiss', NOW)
		expect(readState(JSON.stringify(state))).toEqual(state)
		expect(readState(null)).toBeNull()
		expect(readState('not json')).toBeNull()
		expect(readState('null')).toBeNull()
		expect(readState(JSON.stringify({ until: NOW, variant: 'gone' }))).toBeNull()
		expect(readState(JSON.stringify({ variant: 'relay', until: 'tomorrow' }))).toBeNull()
		expect(isSnoozed(null, NOW)).toBe(false)
	})
})

describe('the links to Minemories', () => {
	it('land on the page in the visitor language when Minemories has one', () => {
		expect(minemoriesUrl('fr', 'time', 'home')).toMatch(/^https:\/\/minemories\.net\/fr\?/)
		expect(minemoriesUrl('pt', 'time', 'install')).toMatch(/^https:\/\/minemories\.net\/pt-br\/installation\?/)
		expect(minemoriesUrl('ko', 'time', 'install')).toMatch(/^https:\/\/minemories\.net\/ko\/installation\?/)
	})

	it('fall back to the English site otherwise', () => {
		expect(minemoriesUrl('es', 'time', 'home')).toMatch(/^https:\/\/minemories\.net\/\?/)
		expect(minemoriesUrl('nl', 'time', 'install')).toMatch(/^https:\/\/minemories\.net\/installation\?/)
	})

	it('say they come from Beswib, from which design and through which medium', () => {
		const url = new URL(minemoriesUrl('en', 'postcard', 'home', 'share'))
		expect(Object.fromEntries(url.searchParams)).toEqual({
			utm_source: 'beswib',
			utm_medium: 'share',
			utm_campaign: 'beswib_archive',
			utm_content: 'postcard',
		})
	})
})

describe('the copy', () => {
	const shape = (value: unknown): unknown => {
		if (Array.isArray(value)) return value.map(shape)
		if (value != null && typeof value === 'object') {
			return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)]))
		}
		return typeof value
	}

	it.each(i18n.locales)('has every string in %s', locale => {
		expect(shape(translations[locale])).toEqual(shape(translations.en))
	})

	it.each(i18n.locales)('carries the "not an official Minecraft product" notice in %s', locale => {
		expect(translations[locale].minemoriesPromo.notice).toMatch(/Mojang/)
	})
})
