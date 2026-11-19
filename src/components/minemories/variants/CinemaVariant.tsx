'use client'

import { useReducedMotion } from 'motion/react'
import Image from 'next/image'

import { CtaPair, Facts, Kicker, Lead, stagger, Title, type VariantProps } from '@/components/minemories/parts'
import styles from '@/components/minemories/promo.module.css'

/**
 * 2. "Cinema": the product sells itself. A walk through a real capture in the Minemories viewer fills the
 * top of the dialog, the title sits on a flat plaque over it (the game's text background), and the three
 * steps read like a trailer's end card. The video only loads once the dialog is open, muted, never with
 * sound, and turns into its still image under reduced motion.
 */
export function CinemaVariant(props: Readonly<VariantProps>) {
	const { t } = props
	const reducedMotion = useReducedMotion()

	return (
		<div>
			<div className={styles.cinemaFrame}>
				<div className={styles.cinemaMedia}>
					{reducedMotion ? (
						<Image src="/minemories/clips/walk.webp" alt={t.cinema.videoLabel} width={640} height={512} unoptimized />
					) : (
						<video
							src="/minemories/clips/walk.mp4"
							poster="/minemories/clips/walk.webp"
							aria-label={t.cinema.videoLabel}
							autoPlay
							muted
							loop
							playsInline
							preload="none"
						/>
					)}
					<span className={styles.cinemaRec} aria-hidden="true">
						minemories.net
					</span>
				</div>
				<div className={styles.cinemaPlaque}>
					<Kicker>{t.cinema.kicker}</Kicker>
					<Title>{t.cinema.title}</Title>
				</div>
			</div>

			<div className={styles.cinemaBody}>
				<div style={{ display: 'grid', gap: 16 }}>
					<Lead>{t.cinema.lead}</Lead>
					<ol className={`${styles.cinemaSteps} ${styles.reveal}`} style={stagger(3)}>
						{t.cinema.steps.map((step, index) => (
							<li key={step}>
								<span className={styles.stepNumber}>{index + 1}</span>
								{step}
							</li>
						))}
					</ol>
				</div>
				<CtaPair {...props} />
			</div>

			<div className={styles.cinemaFoot}>
				<Facts t={t} />
			</div>
		</div>
	)
}
