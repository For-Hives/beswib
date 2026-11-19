'use client'

import { useActiveUI } from '@c15t/nextjs'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { usePathname } from 'next/navigation'
import { type CSSProperties, useEffect, useRef, useState } from 'react'

import { pixelFont, readingFont } from '@/components/minemories/fonts'
import translations from '@/components/minemories/locales.json'
import styles from '@/components/minemories/promo.module.css'
import {
	isEnabled,
	isHiddenPath,
	isPreviewRequested,
	isSnoozed,
	OPEN_DELAY_MS,
	readSnoozedUntil,
	STORAGE_KEY,
	snoozeValue,
} from '@/components/minemories/promo-logic'
import { TeamCard } from '@/components/minemories/TeamCard'
import { track, trackView } from '@/lib/analytics/client'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'

// Read once at build time, like every NEXT_PUBLIC_ variable
const ENABLED = isEnabled(process.env.NEXT_PUBLIC_MINEMORIES_PROMO)

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
 * The dialog that tells Beswib's visitors the same team now makes Minemories. It waits for the consent
 * banner to be gone, then six seconds of browsing, never opens on account, admin or sign-in pages, opens
 * once per page load at most, and stays shut for 90 days after a close (a year after a click through).
 * NEXT_PUBLIC_MINEMORIES_PROMO=off turns it off.
 *
 * `?minemories` opens it at once on any page, for review; such a view is sent with forced=true and
 * writes nothing.
 */
export function MinemoriesPromo({ locale }: Readonly<{ locale: Locale }>) {
	const t = getTranslations(locale, translations).minemoriesPromo
	const pathname = usePathname()
	const activeUI = useActiveUI()
	const [open, setOpen] = useState(false)
	const forced = useRef(false)
	const shown = useRef(false)

	// Review link: opens at once, whatever the banner, the page or an earlier close
	useEffect(() => {
		if (!isPreviewRequested(window.location.search)) return
		forced.current = true
		shown.current = true
		setOpen(true)
		trackView('minemories_promo_view', { forced: true })
	}, [])

	// Regular visit: after the delay, when nothing else is on screen
	useEffect(() => {
		if (!ENABLED || shown.current || activeUI !== 'none' || isHiddenPath(pathname)) return
		if (isSnoozed(readSnoozedUntil(readStored()), Date.now())) return

		const timer = window.setTimeout(() => {
			if (shown.current) return
			shown.current = true
			setOpen(true)
			trackView('minemories_promo_view', { forced: false })
		}, OPEN_DELAY_MS)
		return () => window.clearTimeout(timer)
	}, [activeUI, pathname])

	const remember = (reason: 'dismiss' | 'convert') => {
		if (!forced.current) writeStored(snoozeValue(reason, Date.now()))
	}

	// The cross, "No thanks", Escape and a click outside all land here
	const onOpenChange = (next: boolean) => {
		if (next) return
		track('minemories_promo_click', { action: 'close' })
		remember('dismiss')
		setOpen(false)
	}

	// The click itself is counted by the link (umamiAttrs in TeamCard)
	const onConvert = () => {
		remember('convert')
		setOpen(false)
	}

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<div lang={locale} className={`${styles.root} ${pixelFont.variable} ${readingFont.variable}`}>
					<DialogPrimitive.Overlay className={styles.overlay} />
					<DialogPrimitive.Content className={styles.sheet} style={{ '--sheet-w': '560px' } as CSSProperties}>
						<TeamCard t={t} locale={locale} onConvert={onConvert} />
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
