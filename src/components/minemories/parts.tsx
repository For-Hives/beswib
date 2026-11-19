'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'

import type translations from '@/components/minemories/locales.json'
import styles from '@/components/minemories/promo.module.css'
import { type MinemoriesPage, minemoriesUrl, type PromoVariant } from '@/components/minemories/promo-logic'
import { umamiAttrs } from '@/lib/analytics/attrs'
import type { Locale } from '@/lib/i18n/config'

export type PromoCopy = (typeof translations)['en']['minemoriesPromo']

/** A visitor's way out of the promotion towards Minemories (the dialog then closes for 90 days). */
export type ConvertAction = 'install' | 'visit'

export interface VariantProps {
	t: PromoCopy
	locale: Locale
	variant: PromoVariant
	/** Called when the visitor follows a link to Minemories. */
	onConvert: (action: ConvertAction) => void
	/** Called when the visitor passes the link on (share sheet or copy), which keeps the dialog open. */
	onShare: (action: 'share' | 'copy_link') => void
}

/** Stagger index of an entering block (60 ms per step, see .reveal). */
export function stagger(index: number): CSSProperties {
	return { '--i': index } as CSSProperties
}

export function PixelIcon({ name, className }: Readonly<{ name: string; className?: string }>) {
	return (
		<span
			aria-hidden="true"
			className={className == null ? styles.icon : `${styles.icon} ${className}`}
			style={{ '--icon': `url(/minemories/icons/${name}.svg)` } as CSSProperties}
		/>
	)
}

export function Kicker({ children, index = 0 }: Readonly<{ children: ReactNode; index?: number }>) {
	return (
		<p className={`${styles.kicker} ${styles.reveal}`} style={stagger(index)}>
			{children}
		</p>
	)
}

export function Title({
	children,
	index = 1,
	small = false,
}: Readonly<{ children: ReactNode; index?: number; small?: boolean }>) {
	return (
		<DialogPrimitive.Title
			className={`${styles.title} ${small ? styles.titleSmall : ''} ${styles.reveal}`}
			style={stagger(index)}
		>
			{children}
		</DialogPrimitive.Title>
	)
}

export function Lead({ children, index = 2 }: Readonly<{ children: ReactNode; index?: number }>) {
	return (
		<DialogPrimitive.Description className={`${styles.lead} ${styles.reveal}`} style={stagger(index)}>
			{children}
		</DialogPrimitive.Description>
	)
}

/** A link to minemories.net, opened in a new tab so that Beswib stays where the visitor left it. */
export function MinemoriesLink({
	page,
	primary = false,
	block = false,
	children,
	locale,
	variant,
	onConvert,
}: Readonly<{
	page: MinemoriesPage
	primary?: boolean
	block?: boolean
	children: ReactNode
	locale: Locale
	variant: PromoVariant
	onConvert: (action: ConvertAction) => void
}>) {
	const action: ConvertAction = page === 'install' ? 'install' : 'visit'
	const classes = [styles.btn, primary ? styles.btnPrimary : '', block ? styles.btnBlock : ''].join(' ')

	return (
		<a
			href={minemoriesUrl(locale, variant, page)}
			target="_blank"
			rel="noopener"
			className={classes}
			onClick={() => onConvert(action)}
			{...umamiAttrs('minemories_promo_click', { variant, action })}
		>
			{primary && (
				<Image
					src="/minemories/icons/ember.svg"
					alt=""
					width={16}
					height={16}
					unoptimized
					className={`${styles.btnIcon} ${styles.pixelated}`}
				/>
			)}
			{children}
		</a>
	)
}

/** The two links every design ends on: install (primary, copper) and discover. */
export function CtaPair({ t, locale, variant, onConvert, index = 4 }: Readonly<VariantProps & { index?: number }>) {
	return (
		<div className={`${styles.actions} ${styles.reveal}`} style={stagger(index)}>
			<MinemoriesLink page="install" primary locale={locale} variant={variant} onConvert={onConvert}>
				{t.install}
			</MinemoriesLink>
			<MinemoriesLink page="home" locale={locale} variant={variant} onConvert={onConvert}>
				{t.visit}
			</MinemoriesLink>
		</div>
	)
}

/** Supported versions, then the notice Minecraft's usage guidelines ask for on every material. */
export function Facts({ t, index = 5 }: Readonly<{ t: PromoCopy; index?: number }>) {
	return (
		<div className={styles.reveal} style={{ ...stagger(index), display: 'grid', gap: 6 }}>
			<p className={styles.facts}>{t.facts}</p>
			<p className={styles.notice}>{t.notice}</p>
		</div>
	)
}
