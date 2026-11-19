'use client'

import { useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import {
	CtaPair,
	Facts,
	Kicker,
	Lead,
	PixelIcon,
	stagger,
	Title,
	type VariantProps,
} from '@/components/minemories/parts'
import styles from '@/components/minemories/promo.module.css'

const SCENES = ['chalet', 'chalet-overgrown', 'chalet-forgotten'] as const
const CYCLE_MS = 2400

/**
 * 4. "Time": the emotional hook of minemories.net ("your server is closing?"), which is also Beswib's own
 * story. One floating diorama, three ages of the same base; a stepped bar, like the XP bar, lets the
 * visitor move through the years. It plays on its own until touched.
 */
export function TimeVariant(props: Readonly<VariantProps>) {
	const { t } = props
	const reducedMotion = useReducedMotion()
	const [stage, setStage] = useState(0)
	const [touched, setTouched] = useState(false)

	useEffect(() => {
		if (touched || reducedMotion) return
		const timer = window.setInterval(() => setStage(current => (current + 1) % SCENES.length), CYCLE_MS)
		return () => window.clearInterval(timer)
	}, [touched, reducedMotion])

	return (
		<div className={styles.time}>
			<div className={styles.timeStage}>
				<div className={styles.timeScenes}>
					{SCENES.map((scene, index) => (
						<Image
							key={scene}
							src={`/minemories/scenes/${scene}.webp`}
							alt={index === stage ? t.time.stages[index] : ''}
							aria-hidden={index !== stage}
							width={894}
							height={720}
							unoptimized
							data-active={index === stage}
						/>
					))}
				</div>
				<p className={styles.timeCaption}>{t.time.caption}</p>
				{/* biome-ignore lint/a11y/useSemanticElements: three toggle buttons, labelled as one group */}
				<div className={styles.stages} role="group" aria-label={t.time.sliderLabel}>
					{t.time.stages.map((label, index) => (
						<button
							key={label}
							type="button"
							className={styles.stageButton}
							aria-pressed={stage === index}
							onClick={() => {
								setTouched(true)
								setStage(index)
							}}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			<div className={styles.timeCopy}>
				<Kicker>{t.time.kicker}</Kicker>
				<Title>{t.time.title}</Title>
				<Lead>{t.time.lead}</Lead>
				<p className={`${styles.timeNote} ${styles.reveal}`} style={stagger(3)}>
					<PixelIcon name="check" />
					{t.time.note}
				</p>
				<CtaPair {...props} />
				<Facts t={t} />
			</div>
		</div>
	)
}
