'use client'

import { useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import {
	Facts,
	Lead,
	MinemoriesLink,
	PixelIcon,
	stagger,
	Title,
	type VariantProps,
} from '@/components/minemories/parts'
import styles from '@/components/minemories/promo.module.css'

const SLOT_ICONS = ['mod', 'clock', 'album'] as const
const CYCLE_MS = 2600

/**
 * 3. "In game": strictly Minemories' charter, level 2 of its closeness slider. The mod speaks in the chat,
 * the three steps sit in a hotbar whose tooltip (aqua name, purple lore, ember border) tells each one,
 * and the buttons stack like a game menu. The hotbar walks through the steps on its own until the
 * visitor points at a slot.
 */
export function GameVariant(props: Readonly<VariantProps>) {
	const { t, locale, variant, onConvert } = props
	const reducedMotion = useReducedMotion()
	const [selected, setSelected] = useState(0)
	const [touched, setTouched] = useState(false)

	useEffect(() => {
		if (touched || reducedMotion) return
		const timer = window.setInterval(() => setSelected(current => (current + 1) % SLOT_ICONS.length), CYCLE_MS)
		return () => window.clearInterval(timer)
	}, [touched, reducedMotion])

	const pick = (index: number) => {
		setTouched(true)
		setSelected(index)
	}

	const slot = t.game.slots[selected]

	return (
		<div className={styles.game}>
			<div className={`${styles.gameHead} ${styles.reveal}`} style={stagger(0)}>
				<Image src="/minemories/minemories-mark.svg" alt="" width={40} height={40} unoptimized />
				<span className={styles.wordmark}>Minemories</span>
				<span className={styles.facts}>{t.game.kicker}</span>
			</div>

			<div className={styles.chat} aria-hidden="true">
				<p style={stagger(0)}>
					&lt;<span className={styles.chatName}>{t.game.you}</span>&gt; {t.game.chatQuestion}
				</p>
				<p style={stagger(1)}>
					<span className={styles.chatMod}>Minemories:</span> {t.game.chatDone}
				</p>
				<p style={stagger(2)}>
					<span className={styles.chatMod}>Minemories:</span> {t.game.chatGallery}
				</p>
			</div>

			<Title index={1}>{t.game.title}</Title>
			<Lead index={2}>{t.game.lead}</Lead>

			<div className={`${styles.hotbar} ${styles.reveal}`} style={stagger(3)}>
				{/* biome-ignore lint/a11y/useSemanticElements: a row of toggle buttons, labelled as one group */}
				<div className={styles.hotbarSlots} role="group" aria-label={t.game.hotbarLabel}>
					{SLOT_ICONS.map((icon, index) => (
						<button
							key={icon}
							type="button"
							className={styles.slotButton}
							aria-pressed={selected === index}
							aria-label={t.game.slots[index].name}
							onClick={() => pick(index)}
							onMouseEnter={() => pick(index)}
							onFocus={() => pick(index)}
						>
							<PixelIcon name={icon} />
							<span className={styles.slotKey} aria-hidden="true">
								{index + 1}
							</span>
						</button>
					))}
				</div>
				<div className={styles.tooltip} aria-live="polite">
					<p className={styles.tooltipName}>{slot.name}</p>
					<p className={styles.tooltipLore}>{slot.lore}</p>
				</div>
			</div>

			<div className={`${styles.gameButtons} ${styles.reveal}`} style={stagger(4)}>
				<MinemoriesLink page="install" primary block locale={locale} variant={variant} onConvert={onConvert}>
					{t.install}
				</MinemoriesLink>
				<MinemoriesLink page="home" block locale={locale} variant={variant} onConvert={onConvert}>
					{t.visit}
				</MinemoriesLink>
			</div>

			<Facts t={t} />
		</div>
	)
}
