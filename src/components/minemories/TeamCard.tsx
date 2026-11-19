'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import Image from 'next/image'
import type { CSSProperties } from 'react'

import type translations from '@/components/minemories/locales.json'
import styles from '@/components/minemories/promo.module.css'
import { minemoriesUrl } from '@/components/minemories/promo-logic'
import { umamiAttrs } from '@/lib/analytics/attrs'
import type { Locale } from '@/lib/i18n/config'

type PromoCopy = (typeof translations)['en']['minemoriesPromo']

const CELL = 14
const COLUMNS = 10
const ROWS = 14

// An ordered (Bayer) dither: the classic pixel-art gradient, regular rather than random
const BAYER = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
] as const

/** Night pixels get denser column after column, from Beswib's side to Minemories'. */
function isNightCell(row: number, column: number): boolean {
	return (BAYER[row % 4][column % 4] + 0.5) / 16 < (column + 0.5) / COLUMNS
}

const CELLS = Array.from({ length: ROWS * COLUMNS }, (_, index) => {
	const row = Math.floor(index / COLUMNS)
	const column = index % COLUMNS
	return { row, column, night: isNightCell(row, column) }
})

/** Stagger index of an entering block (60 ms per step, see .reveal). */
function stagger(index: number): CSSProperties {
	return { '--i': index } as CSSProperties
}

/**
 * The promotion itself, readable at a glance: Beswib's smooth, light world on the left breaks into
 * pixels that become Minemories' night on the right, each name in its own type. Then one sentence,
 * one button, one way out.
 */
export function TeamCard({ t, locale, onConvert }: Readonly<{ t: PromoCopy; locale: Locale; onConvert: () => void }>) {
	return (
		<div className={styles.team}>
			<div className={styles.teamBand} role="img" aria-label={t.band}>
				<div className={styles.teamBeswib}>
					<Image src="/beswib.svg" alt="" width={80} height={80} unoptimized className={styles.teamLogo} />
					<span className={styles.teamNameBeswib}>Beswib</span>
				</div>

				<svg
					className={styles.teamDissolve}
					viewBox={`0 0 ${COLUMNS * CELL} ${ROWS * CELL}`}
					width={COLUMNS * CELL}
					height={ROWS * CELL}
					shapeRendering="crispEdges"
					aria-hidden="true"
				>
					{CELLS.map(({ row, column, night }) => (
						<rect
							key={`${row}-${column}`}
							x={column * CELL}
							y={row * CELL}
							width={CELL}
							height={CELL}
							className={night ? styles.teamPixelNight : styles.teamPixelDay}
							style={{ '--col': column, '--row': row % 3 } as CSSProperties}
						/>
					))}
				</svg>

				<div className={styles.teamMinemories}>
					<Image
						src="/minemories/minemories-mark.svg"
						alt=""
						width={80}
						height={80}
						unoptimized
						className={styles.teamLogo}
					/>
					<span className={styles.teamNameMinemories}>Minemories</span>
				</div>
			</div>

			<div className={styles.teamCopy}>
				<DialogPrimitive.Title className={`${styles.title} ${styles.reveal}`} style={stagger(2)}>
					{t.title}
				</DialogPrimitive.Title>
				<DialogPrimitive.Description className={`${styles.lead} ${styles.reveal}`} style={stagger(3)}>
					{t.lead}
				</DialogPrimitive.Description>
				<p className={`${styles.teamSign} ${styles.reveal}`} style={stagger(4)}>
					Andy &amp; Bréval
				</p>
				<div className={`${styles.actions} ${styles.reveal}`} style={stagger(5)}>
					{/* A new tab, so that Beswib stays where the visitor left it */}
					<a
						href={minemoriesUrl(locale)}
						target="_blank"
						rel="noopener"
						className={`${styles.btn} ${styles.btnPrimary}`}
						onClick={onConvert}
						{...umamiAttrs('minemories_promo_click', { action: 'visit' })}
					>
						<Image
							src="/minemories/icons/ember.svg"
							alt=""
							width={16}
							height={16}
							unoptimized
							className={styles.btnIcon}
						/>
						{t.cta}
					</a>
					<DialogPrimitive.Close className={styles.link} type="button">
						{t.dismiss}
					</DialogPrimitive.Close>
				</div>
			</div>
		</div>
	)
}
