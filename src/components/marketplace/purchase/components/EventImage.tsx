'use client'

import React from 'react'

import Image from 'next/image'

import type { BibSale } from '@/models/marketplace.model'
import type { Event } from '@/models/event.model'

import marketplaceTranslations from '@/components/marketplace/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

interface EventImageProps {
	/** The bib sale data containing event information */
	bib: BibSale
	/** Optional event data for official price comparison */
	eventData?: Event
	/** Locale for translations */
	locale?: Locale
}

/**
 * Component that displays the event image with type badge and discount badge
 * Handles the visual presentation of the event with proper styling and overlays
 */
export default function EventImage({ locale, eventData, bib }: Readonly<EventImageProps>) {
	const t = getTranslations(locale ?? ('en' as Locale), marketplaceTranslations)
	/**
	 * Get background styling based on event type
	 * @param type - The type of sporting event
	 * @returns CSS classes for the badge styling
	 */
	function bgFromType(type: BibSale['event']['type']) {
		switch (type) {
			case 'cycle':
				return 'bg-cyan-100/40 border-cyan-500/60 dark:bg-cyan-500/15 dark:border-cyan-500/50'
			case 'other':
				return 'bg-gray-100/40 border-gray-500/60 dark:bg-gray-500/15 dark:border-gray-500/50'
			case 'road':
				return 'bg-green-100/40 border-green-500/60 dark:bg-green-500/15 dark:border-green-500/50'
			case 'trail':
				return 'bg-yellow-100/40 border-yellow-500/60 dark:bg-yellow-500/15 dark:border-yellow-500/50'
			case 'triathlon':
				return 'bg-purple-100/40 border-purple-500/60 dark:bg-purple-500/15 dark:border-purple-500/50'
		}
	}

	// Calculate the lowest reference price between original and official
	const officialPrice = eventData?.officialStandardPrice ?? 0
	const originalPrice = bib.originalPrice ?? 0

	// Determine the reference price (lowest between original and official)
	let referencePrice = 0
	if (officialPrice > 0 && originalPrice > 0) {
		referencePrice = Math.min(officialPrice, originalPrice)
	} else if (officialPrice > 0) {
		referencePrice = officialPrice
	} else if (originalPrice > 0) {
		referencePrice = originalPrice
	}

	// Calculate discount percentage based on the lowest reference price
	const discountPercentage =
		referencePrice > 0 && referencePrice > bib.price
			? Math.round(((referencePrice - bib.price) / referencePrice) * 100)
			: 0

	return (
		<div className="relative">
			<div className="from-green/20 via-emerald/20 to-teal/20 before:from-green before:via-emerald before:to-teal before:to-ring relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br shadow-[inset_0_0_20px_hsl(var(--primary)/0.3),inset_0_0_40px_hsl(var(--accent)/0.2),0_0_30px_hsl(var(--primary)/0.4)] before:absolute before:inset-0 before:-z-10 before:m-[-1px] before:rounded-lg before:bg-gradient-to-br before:p-0.5">
				<Image
					src={bib.event.image}
					alt={bib.event.name}
					fill
					className="object-cover"
					sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
				/>
			</div>

			{/* Event Type Badge - Top Left */}
			<div className="absolute top-4 left-4 z-10">
				<span
					className={cn(
						'inline-block rounded-full border px-3 py-1 text-xs font-medium text-black/90 backdrop-blur-md dark:text-white/90',
						bgFromType(bib.event.type)
					)}
				>
					{(() => {
						switch (bib.event.type) {
							case 'trail':
								return t.trail ?? 'Trail'
							case 'road':
								return t.road ?? 'Road'
							case 'triathlon':
								return t.triathlon ?? 'Triathlon'
							case 'cycle':
								return typeof (t as { cycling?: unknown }).cycling === 'string'
									? (t as { cycling?: string }).cycling
									: 'Cycling'
							default:
								return t.other ?? 'Other'
						}
					})()}
				</span>
			</div>

			{/* Discount Badge - Top Right (only show if significant discount) */}
			{discountPercentage > 10 && (
				<div className="absolute top-4 right-4 z-10">
					<Badge variant="destructive" className="text-white">
						-{discountPercentage}% {t.discountOff ?? 'OFF'}
					</Badge>
				</div>
			)}
		</div>
	)
}
