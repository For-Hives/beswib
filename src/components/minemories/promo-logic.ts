import type { Locale } from '@/lib/i18n/config'

/**
 * Everything the Minemories promotion decides without a browser: whether it may open, how long a
 * close or a click keeps it shut, and where its link goes.
 */

export const STORAGE_KEY = 'beswib.minemories-promo'

/** Never insistent: closed, it stays away for three months; clicked through, for a year. */
export const SNOOZE_DAYS = { dismiss: 90, convert: 365 } as const

/** Milliseconds of browsing on the site, all pages together, before the promotion opens. */
export const OPEN_DELAY_MS = 6000

/** Breathing room after the consent banner closes, so that one dialog never chains straight into another. */
export const AFTER_BANNER_MS = 1500

/**
 * How long to wait from now, given the time already spent on the site: what is left of the six
 * seconds, never less than the breathing room (the banner may just have closed).
 */
export function openDelay(elapsedMs: number): number {
	return Math.max(AFTER_BANNER_MS, OPEN_DELAY_MS - Math.max(0, elapsedMs))
}

/** Where the promotion never opens: account, admin and sign-in pages are for something else. */
const HIDDEN_SECTIONS = new Set(['admin', 'auth', 'dashboard', 'profile', 'sign-in', 'sign-up'])

const DAY_MS = 24 * 60 * 60 * 1000

/** NEXT_PUBLIC_MINEMORIES_PROMO=off turns the promotion off; anything else leaves it on. */
export function isEnabled(value: string | undefined): boolean {
	return value?.trim().toLowerCase() !== 'off'
}

/** `?minemories` (with any value) opens the promotion at once, for review. */
export function isPreviewRequested(search: string): boolean {
	return new URLSearchParams(search).has('minemories')
}

/** `/fr/dashboard/seller` → hidden. The first segment is the locale. */
export function isHiddenPath(pathname: string | null): boolean {
	if (pathname == null) return true
	const section = pathname.split('/').filter(Boolean)[1]
	return section != null && HIDDEN_SECTIONS.has(section)
}

/** Reads the epoch milliseconds stored in localStorage; anything unexpected counts as nothing stored. */
export function readSnoozedUntil(raw: string | null): number | null {
	if (raw == null) return null
	try {
		const parsed: unknown = JSON.parse(raw)
		if (typeof parsed !== 'object' || parsed == null) return null
		const { until } = parsed as Record<string, unknown>
		return typeof until === 'number' && Number.isFinite(until) ? until : null
	} catch {
		return null
	}
}

export function isSnoozed(until: number | null, now: number): boolean {
	return until != null && until > now
}

/** What localStorage keeps once the visitor has left the promotion, by closing it or by clicking. */
export function snoozeValue(reason: keyof typeof SNOOZE_DAYS, now: number): string {
	return JSON.stringify({ until: now + SNOOZE_DAYS[reason] * DAY_MS })
}

/** Minemories has a page in these languages; the others land on the English site. */
const MINEMORIES_PATHS: Record<Locale, string> = {
	ro: '/',
	pt: '/pt-br',
	nl: '/',
	ko: '/ko',
	it: '/',
	fr: '/fr',
	es: '/',
	en: '/',
	de: '/de',
}

/** The link to minemories.net in the visitor's language, tagged so that Minemories knows it came from here. */
export function minemoriesUrl(locale: Locale): string {
	const url = new URL(MINEMORIES_PATHS[locale] ?? '/', 'https://minemories.net')
	url.searchParams.set('utm_source', 'beswib')
	url.searchParams.set('utm_medium', 'modal')
	url.searchParams.set('utm_campaign', 'beswib_archive')
	return url.toString()
}
