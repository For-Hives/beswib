import type { Locale } from '@/lib/i18n/config'

/**
 * Everything the Minemories promotion decides without a browser: which design a visitor sees, when
 * it may open, how long a close or a click keeps it shut, and where its links go.
 */

/** The six designs, in the order of the `?minemories=1..6` preview parameter. */
export const PROMO_VARIANTS = ['relay', 'cinema', 'game', 'time', 'postcard', 'team'] as const
export type PromoVariant = (typeof PROMO_VARIANTS)[number]

/** `off`, one design for everyone (`team` by default), or `rotate`: each browser draws one and keeps it (A/B test). */
export type PromoMode = 'off' | 'rotate' | PromoVariant

export const STORAGE_KEY = 'beswib.minemories-promo'

/** Never insistent: closed, it stays away for three months; clicked through, for a year. */
export const SNOOZE_DAYS = { dismiss: 90, convert: 365 } as const

/** Seconds of browsing, with no consent banner on screen, before the promotion opens. */
export const OPEN_DELAY_MS = 6000

/** Where the promotion never opens: account, admin and sign-in pages are for something else. */
const HIDDEN_SECTIONS = new Set(['admin', 'auth', 'dashboard', 'profile', 'sign-in', 'sign-up'])

const DAY_MS = 24 * 60 * 60 * 1000

export interface StoredPromoState {
	/** The design this browser drew, kept so that a visitor always sees the same one. */
	variant: PromoVariant
	/** Epoch milliseconds before which the promotion stays shut. */
	until: number
}

function isVariant(value: unknown): value is PromoVariant {
	return typeof value === 'string' && (PROMO_VARIANTS as readonly string[]).includes(value)
}

/** `?minemories=6` or `?minemories=team` opens that design at once, for review. */
export function variantFromParam(value: string | null | undefined): PromoVariant | null {
	if (value == null) return null
	const trimmed = value.trim().toLowerCase()
	const index = Number.parseInt(trimmed, 10)
	if (String(index) === trimmed) return PROMO_VARIANTS[index - 1] ?? null
	return isVariant(trimmed) ? trimmed : null
}

export const DEFAULT_MODE: PromoMode = 'team'

/** Reads NEXT_PUBLIC_MINEMORIES_PROMO: `off`, `rotate`, a number 1..6 or a design name; `team` when unset. */
export function parseMode(value: string | undefined): PromoMode {
	const trimmed = value?.trim().toLowerCase()
	if (trimmed == null || trimmed === '') return DEFAULT_MODE
	if (trimmed === 'off' || trimmed === 'rotate') return trimmed
	return variantFromParam(trimmed) ?? DEFAULT_MODE
}

/** The design to show: the forced one, else the one this browser already drew, else a new draw. */
export function pickVariant(mode: Exclude<PromoMode, 'off'>, stored: PromoVariant | null, random: () => number) {
	if (mode !== 'rotate') return mode
	if (stored != null) return stored
	const index = Math.min(PROMO_VARIANTS.length - 1, Math.floor(random() * PROMO_VARIANTS.length))
	return PROMO_VARIANTS[index]
}

/** `/fr/dashboard/seller` → hidden. The first segment is the locale. */
export function isHiddenPath(pathname: string | null): boolean {
	if (pathname == null) return true
	const section = pathname.split('/').filter(Boolean)[1]
	return section != null && HIDDEN_SECTIONS.has(section)
}

/** Parses what localStorage holds; anything unexpected counts as nothing stored. */
export function readState(raw: string | null): StoredPromoState | null {
	if (raw == null) return null
	try {
		const parsed: unknown = JSON.parse(raw)
		if (typeof parsed !== 'object' || parsed == null) return null
		const { variant, until } = parsed as Record<string, unknown>
		if (!isVariant(variant) || typeof until !== 'number' || !Number.isFinite(until)) return null
		return { variant, until }
	} catch {
		return null
	}
}

export function isSnoozed(state: StoredPromoState | null, now: number): boolean {
	return state != null && state.until > now
}

/** The state written once the visitor has seen the promotion and left it, by closing or by clicking. */
export function snoozeState(variant: PromoVariant, reason: keyof typeof SNOOZE_DAYS, now: number): StoredPromoState {
	return { variant, until: now + SNOOZE_DAYS[reason] * DAY_MS }
}

/** Minemories has a page in these languages; the others land on the English site. */
const MINEMORIES_PATHS: Record<Locale, string> = {
	ro: '',
	pt: '/pt-br',
	nl: '',
	ko: '/ko',
	it: '',
	fr: '/fr',
	es: '',
	en: '',
	de: '/de',
}

export type MinemoriesPage = 'home' | 'install'

/** A link to minemories.net in the visitor's language, tagged so that Minemories knows it came from here. */
export function minemoriesUrl(
	locale: Locale,
	variant: PromoVariant,
	page: MinemoriesPage,
	medium: 'modal' | 'share' = 'modal'
): string {
	const localePath = MINEMORIES_PATHS[locale] ?? ''
	const path = page === 'install' ? `${localePath}/installation` : localePath || '/'
	const url = new URL(path, 'https://minemories.net')
	url.searchParams.set('utm_source', 'beswib')
	url.searchParams.set('utm_medium', medium)
	url.searchParams.set('utm_campaign', 'beswib_archive')
	url.searchParams.set('utm_content', variant)
	return url.toString()
}
