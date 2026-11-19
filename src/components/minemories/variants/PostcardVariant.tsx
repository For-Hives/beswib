'use client'

import Image from 'next/image'
import { useState } from 'react'

import {
	Facts,
	Kicker,
	Lead,
	MinemoriesLink,
	PixelIcon,
	stagger,
	Title,
	type VariantProps,
} from '@/components/minemories/parts'
import styles from '@/components/minemories/promo.module.css'
import { minemoriesUrl } from '@/components/minemories/promo-logic'
import { umamiAttrs } from '@/lib/analytics/attrs'

/**
 * 5. "Postcard": for the runner who does not play. Most Beswib visitors will never install a Minecraft
 * mod, but many know someone who would. A fanned stack of HD postcards (what Minemories exports for
 * Discord) and one primary action: pass the link on, through the share sheet or the clipboard.
 */
export function PostcardVariant(props: Readonly<VariantProps>) {
	const { t, locale, variant, onConvert, onShare } = props
	const [copied, setCopied] = useState(false)

	const share = async () => {
		const url = minemoriesUrl(locale, variant, 'home', 'share')
		const text = t.postcard.shareText
		if (typeof navigator.share === 'function') {
			try {
				await navigator.share({ title: 'Minemories', text, url })
				onShare('share')
			} catch {
				// The visitor closed the share sheet: nothing was passed on
			}
			return
		}
		try {
			await navigator.clipboard.writeText(`${text} ${url}`)
			setCopied(true)
			onShare('copy_link')
		} catch {
			// No clipboard access (insecure context, refused permission): the links below still work
		}
	}

	return (
		<div className={styles.postcard}>
			<div className={styles.postcardDesk} aria-hidden="true">
				<div className={`${styles.card} ${styles.cardBack1}`}>
					<Image src="/minemories/clips/game-browser.webp" alt="" width={540} height={676} unoptimized />
				</div>
				<div className={`${styles.card} ${styles.cardBack2}`}>
					<Image src="/minemories/clips/viewer-time.webp" alt="" width={720} height={550} unoptimized />
				</div>
				<div className={`${styles.card} ${styles.cardFront}`}>
					<Image src="/minemories/postcard-hd.webp" alt="" width={640} height={360} unoptimized />
					<span className={styles.cardCaption}>{t.postcard.caption}</span>
					<span className={styles.stamp}>
						<Image src="/minemories/minemories-logo.svg" alt="" width={36} height={55} unoptimized />
					</span>
				</div>
			</div>

			<div className={styles.postcardCopy}>
				<Kicker>{t.postcard.kicker}</Kicker>
				<Title>{t.postcard.title}</Title>
				<Lead>{t.postcard.lead}</Lead>
				<div className={`${styles.actions} ${styles.reveal}`} style={stagger(3)}>
					<button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={share}>
						<PixelIcon name="share" className={styles.btnIcon} />
						{t.postcard.share}
					</button>
					<MinemoriesLink page="home" locale={locale} variant={variant} onConvert={onConvert}>
						{t.visit}
					</MinemoriesLink>
					{copied && (
						<span className={styles.copied} role="status">
							<PixelIcon name="check" />
							{t.postcard.copied}
						</span>
					)}
				</div>
				<div className={styles.reveal} style={stagger(4)}>
					<a
						href={minemoriesUrl(locale, variant, 'install')}
						target="_blank"
						rel="noopener"
						className={styles.link}
						onClick={() => onConvert('install')}
						{...umamiAttrs('minemories_promo_click', { variant, action: 'install' })}
					>
						{t.postcard.self}
					</a>
				</div>
				<Facts t={t} />
			</div>
		</div>
	)
}
