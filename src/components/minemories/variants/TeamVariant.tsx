'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import Image from 'next/image'
import type { CSSProperties } from 'react'

import { Lead, MinemoriesLink, stagger, Title, type VariantProps } from '@/components/minemories/parts'
import styles from '@/components/minemories/promo.module.css'

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

/**
 * 6. "Same team": the one-glance version. Beswib's smooth, light world on the left breaks into pixels
 * that become Minemories' night on the right; the two names below, one in Beswib's type and one in the
 * pixel font, say the rest. One sentence, one button, one way out.
 */
export function TeamVariant(props: Readonly<VariantProps>) {
	const { t, locale, variant, onConvert } = props

	return (
		<div className={styles.team}>
			<div className={styles.teamBand} role="img" aria-label={t.team.band}>
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
				<Title index={2}>{t.team.title}</Title>
				<Lead index={3}>{t.team.lead}</Lead>
				<p className={`${styles.teamSign} ${styles.reveal}`} style={stagger(4)}>
					Andy &amp; Bréval
				</p>
				<div className={`${styles.actions} ${styles.reveal}`} style={stagger(5)}>
					<MinemoriesLink page="home" primary locale={locale} variant={variant} onConvert={onConvert}>
						{t.team.cta}
					</MinemoriesLink>
					<DialogPrimitive.Close className={styles.link} type="button">
						{t.team.dismiss}
					</DialogPrimitive.Close>
				</div>
			</div>
		</div>
	)
}
