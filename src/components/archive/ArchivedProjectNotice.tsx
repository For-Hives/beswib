'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import translations from '@/components/global/locales.json'
import { isDataFictional } from '@/lib/archive'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'

const DISMISSED_KEY = 'beswib.archive-notice-dismissed'

/**
 * The corner card that says the project is up for grabs. Closed once, it stays closed for this
 * browser: the badge of the header and the line of the footer still say the project is archived.
 */
export function ArchivedProjectNotice({ locale }: Readonly<{ locale: Locale }>) {
	const t = getTranslations(locale, translations).archive
	// Hidden until the browser has answered, so that a card closed earlier never flashes
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		try {
			setVisible(window.localStorage.getItem(DISMISSED_KEY) !== 'true')
		} catch {
			setVisible(true)
		}
	}, [])

	if (!visible) return null

	const dismiss = () => {
		setVisible(false)
		try {
			window.localStorage.setItem(DISMISSED_KEY, 'true')
		} catch {
			// Storage unavailable: the card comes back on the next page load
		}
	}

	return (
		<aside
			aria-label={t.badge}
			className="border-border/60 bg-background/95 dark:border-border/40 fixed right-4 bottom-20 left-4 z-40 rounded-2xl border p-4 shadow-lg backdrop-blur-md sm:bottom-4 sm:left-auto sm:w-80"
		>
			<button
				type="button"
				aria-label={t.dismiss}
				onClick={dismiss}
				className="text-muted-foreground hover:text-foreground focus-visible:ring-primary absolute top-3 right-3 cursor-pointer rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
			>
				<X className="h-4 w-4" />
			</button>
			<p className="text-foreground pr-6 text-sm font-semibold">{t.noticeTitle}</p>
			<p className="text-muted-foreground mt-1 text-sm">{t.noticeBody}</p>
			<div className="mt-3 flex items-center justify-between gap-3">
				<Link
					href={`/${locale}/contact`}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
				>
					{t.noticeCta}
				</Link>
				{isDataFictional() && <p className="text-muted-foreground/80 text-right text-xs">{t.fictional}</p>}
			</div>
		</aside>
	)
}
