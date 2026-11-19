// @vitest-environment node
import { describe, expect, it } from 'vitest'

import translations from '@/components/minemories/locales.json'
import {
	isEnabled,
	isHiddenPath,
	isPreviewRequested,
	isSnoozed,
	minemoriesUrl,
	readSnoozedUntil,
	SNOOZE_DAYS,
	snoozeValue,
} from '@/components/minemories/promo-logic'
import { i18n } from '@/lib/i18n/config'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 10, 20)

describe('whether the promotion may open', () => {
	it('is on unless the deployment says off', () => {
		expect(isEnabled(undefined)).toBe(true)
		expect(isEnabled('')).toBe(true)
		expect(isEnabled('on')).toBe(true)
		expect(isEnabled('off')).toBe(false)
		expect(isEnabled(' OFF ')).toBe(false)
	})

	it('opens at once for a review link', () => {
		expect(isPreviewRequested('?minemories')).toBe(true)
		expect(isPreviewRequested('?a=1&minemories=1')).toBe(true)
		expect(isPreviewRequested('?minemoriesx=1')).toBe(false)
		expect(isPreviewRequested('')).toBe(false)
	})

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
		const closed = readSnoozedUntil(snoozeValue('dismiss', NOW))
		expect(isSnoozed(closed, NOW + (SNOOZE_DAYS.dismiss - 1) * DAY)).toBe(true)
		expect(isSnoozed(closed, NOW + SNOOZE_DAYS.dismiss * DAY + 1)).toBe(false)

		const clicked = readSnoozedUntil(snoozeValue('convert', NOW))
		expect(isSnoozed(clicked, NOW + 300 * DAY)).toBe(true)
		expect(isSnoozed(clicked, NOW + SNOOZE_DAYS.convert * DAY + 1)).toBe(false)
	})

	it('reads back what it wrote and nothing else', () => {
		expect(readSnoozedUntil(snoozeValue('dismiss', NOW))).toBe(NOW + SNOOZE_DAYS.dismiss * DAY)
		expect(readSnoozedUntil(null)).toBeNull()
		expect(readSnoozedUntil('not json')).toBeNull()
		expect(readSnoozedUntil('null')).toBeNull()
		expect(readSnoozedUntil(JSON.stringify({ until: 'tomorrow' }))).toBeNull()
		expect(isSnoozed(null, NOW)).toBe(false)
	})
})

describe('the link to Minemories', () => {
	it('lands on the page in the visitor language when Minemories has one', () => {
		expect(minemoriesUrl('fr')).toMatch(/^https:\/\/minemories\.net\/fr\?/)
		expect(minemoriesUrl('pt')).toMatch(/^https:\/\/minemories\.net\/pt-br\?/)
		expect(minemoriesUrl('ko')).toMatch(/^https:\/\/minemories\.net\/ko\?/)
	})

	it('falls back to the English site otherwise', () => {
		expect(minemoriesUrl('es')).toMatch(/^https:\/\/minemories\.net\/\?/)
		expect(minemoriesUrl('nl')).toMatch(/^https:\/\/minemories\.net\/\?/)
	})

	it('says it comes from Beswib', () => {
		const url = new URL(minemoriesUrl('en'))
		expect(Object.fromEntries(url.searchParams)).toEqual({
			utm_source: 'beswib',
			utm_medium: 'modal',
			utm_campaign: 'beswib_archive',
		})
	})
})

describe('the copy', () => {
	it.each(i18n.locales)('has every string in %s', locale => {
		const copy = translations[locale].minemoriesPromo
		expect(Object.keys(copy)).toEqual(Object.keys(translations.en.minemoriesPromo))
		for (const value of Object.values(copy)) expect(value.trim()).not.toBe('')
	})
})
