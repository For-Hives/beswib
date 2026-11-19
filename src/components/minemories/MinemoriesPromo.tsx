'use client'

import { useActiveUI } from '@c15t/nextjs'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { usePathname } from 'next/navigation'
import { type ComponentType, type CSSProperties, useCallback, useEffect, useRef, useState } from 'react'

import { pixelFont, readingFont } from '@/components/minemories/fonts'
import translations from '@/components/minemories/locales.json'
import type { ConvertAction, VariantProps } from '@/components/minemories/parts'
import styles from '@/components/minemories/promo.module.css'
import {
	isHiddenPath,
	isSnoozed,
	OPEN_DELAY_MS,
	type PromoVariant,
	parseMode,
	pickVariant,
	readState,
	STORAGE_KEY,
	snoozeState,
	variantFromParam,
} from '@/components/minemories/promo-logic'
import { CinemaVariant } from '@/components/minemories/variants/CinemaVariant'
import { GameVariant } from '@/components/minemories/variants/GameVariant'
import { PostcardVariant } from '@/components/minemories/variants/PostcardVariant'
import { RelayVariant } from '@/components/minemories/variants/RelayVariant'
import { TeamVariant } from '@/components/minemories/variants/TeamVariant'
import { TimeVariant } from '@/components/minemories/variants/TimeVariant'
import { track, trackView } from '@/lib/analytics/client'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'

const VARIANTS: Record<PromoVariant, { component: ComponentType<VariantProps>; width: number }> = {
	time: { width: 920, component: TimeVariant },
	team: { width: 560, component: TeamVariant },
	relay: { width: 920, component: RelayVariant },
	postcard: { width: 640, component: PostcardVariant },
	game: { width: 600, component: GameVariant },
	cinema: { width: 900, component: CinemaVariant },
}

// Read once at build time, like every NEXT_PUBLIC_ variable
const MODE = parseMode(process.env.NEXT_PUBLIC_MINEMORIES_PROMO)

function readStored(): string | null {
	try {
		return window.localStorage.getItem(STORAGE_KEY)
	} catch {
		return null
	}
}

function writeStored(value: string): void {
	try {
		window.localStorage.setItem(STORAGE_KEY, value)
	} catch {
		// Storage unavailable: the promotion may come back on the next visit
	}
}

/**
 * The dialog that sends Beswib's visitors to Minemories, built by the same team. It waits for the
 * consent banner to be gone, then six seconds of browsing, never opens on account, admin or sign-in
 * pages, and stays shut for 90 days after a close (a year after a click through). It shows the "same
 * team" design unless NEXT_PUBLIC_MINEMORIES_PROMO says otherwise; with `rotate`, each browser draws one
 * of the six designs and keeps it, so Umami compares them (minemories_promo_view / _click by variant).
 *
 * `?minemories=1..6` (or a design name) opens a design at once on any page, for review; such a view is
 * sent with forced=true and writes nothing.
 */
export function MinemoriesPromo({ locale }: Readonly<{ locale: Locale }>) {
	const t = getTranslations(locale, translations).minemoriesPromo
	const pathname = usePathname()
	const activeUI = useActiveUI()
	const [variant, setVariant] = useState<PromoVariant | null>(null)
	const [open, setOpen] = useState(false)
	const forced = useRef(false)
	const shown = useRef(false)

	// Review link: opens at once, whatever the banner, the page or an earlier close
	useEffect(() => {
		const requested = variantFromParam(new URLSearchParams(window.location.search).get('minemories'))
		if (requested == null) return
		forced.current = true
		shown.current = true
		setVariant(requested)
		setOpen(true)
		trackView('minemories_promo_view', { variant: requested, forced: true })
	}, [])

	// Regular visit: once per page load at most, after the delay, when nothing else is on screen
	useEffect(() => {
		if (MODE === 'off' || shown.current || activeUI !== 'none' || isHiddenPath(pathname)) return
		const stored = readState(readStored())
		if (isSnoozed(stored, Date.now())) return

		const timer = window.setTimeout(() => {
			if (shown.current) return
			const drawn = pickVariant(MODE, stored?.variant ?? null, Math.random)
			shown.current = true
			setVariant(drawn)
			setOpen(true)
			trackView('minemories_promo_view', { variant: drawn, forced: false })
		}, OPEN_DELAY_MS)
		return () => window.clearTimeout(timer)
	}, [activeUI, pathname])

	const remember = useCallback(
		(reason: 'dismiss' | 'convert') => {
			if (variant == null || forced.current) return
			writeStored(JSON.stringify(snoozeState(variant, reason, Date.now())))
		},
		[variant]
	)

	// The cross, Escape and a click outside all land here
	const onOpenChange = (next: boolean) => {
		if (next || variant == null) return
		track('minemories_promo_click', { variant, action: 'close' })
		remember('dismiss')
		setOpen(false)
	}

	const onConvert = (_action: ConvertAction) => {
		// The click itself is counted by the link (umamiAttrs in parts.tsx)
		remember('convert')
		setOpen(false)
	}

	const onShare = (action: 'share' | 'copy_link') => {
		if (variant == null) return
		track('minemories_promo_click', { variant, action })
		remember('convert')
	}

	if (variant == null) return null

	const { component: Variant, width } = VARIANTS[variant]

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<div lang={locale} className={`${styles.root} ${pixelFont.variable} ${readingFont.variable}`}>
					<DialogPrimitive.Overlay className={styles.overlay} />
					<DialogPrimitive.Content
						className={styles.sheet}
						style={{ '--sheet-w': `${width}px` } as CSSProperties}
						data-variant={variant}
					>
						<Variant t={t} locale={locale} variant={variant} onConvert={onConvert} onShare={onShare} />
						<DialogPrimitive.Close className={styles.close} aria-label={t.close}>
							<span
								aria-hidden="true"
								className={styles.icon}
								style={{ '--icon': 'url(/minemories/icons/cross.svg)' } as CSSProperties}
							/>
						</DialogPrimitive.Close>
					</DialogPrimitive.Content>
				</div>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}
