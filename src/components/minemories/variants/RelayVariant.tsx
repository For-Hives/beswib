'use client'

import Image from 'next/image'

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

/**
 * 1. "The relay": the story only Beswib can tell. Its race bib crosses the finish line and hands over to
 * a Minemories diorama: same team, new race. The bib keeps Beswib's own look (rounded, blue, Bowlby
 * numbers), the only part of the five designs that departs from Minemories' square charter, on purpose.
 */
export function RelayVariant(props: Readonly<VariantProps>) {
	const { t } = props

	return (
		<div className={styles.relay}>
			<div className={styles.relayCopy}>
				<Kicker>{t.relay.kicker}</Kicker>
				<Title>{t.relay.title}</Title>
				<Lead>{t.relay.lead}</Lead>
				<ul className={`${styles.points} ${styles.reveal}`} style={stagger(3)}>
					{t.relay.points.map(point => (
						<li key={point}>
							<PixelIcon name="check" />
							<span>{point}</span>
						</li>
					))}
				</ul>
				<CtaPair {...props} />
				<Facts t={t} />
			</div>

			<div className={styles.relayStage} aria-hidden="true">
				<div className={styles.relayFinish} />
				<Image
					src="/minemories/scenes/chalet.webp"
					alt=""
					width={894}
					height={720}
					unoptimized
					className={styles.relayDiorama}
				/>
				<div className={styles.bib}>
					<span className={styles.bibTop}>{t.relay.bibTop}</span>
					<span className={styles.bibNumber}>2026</span>
					<span className={styles.bibBottom}>{t.relay.bibBottom}</span>
				</div>
				<div className={styles.relayBaton}>
					<Image src="/minemories/minemories-mark.svg" alt="" width={22} height={22} unoptimized />
					Minemories
				</div>
			</div>
		</div>
	)
}
