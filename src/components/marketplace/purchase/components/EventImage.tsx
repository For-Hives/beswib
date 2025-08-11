'use client'

import React from 'react'

import Image from 'next/image'

import type { BibSale } from '@/models/marketplace.model'
import type { Event } from '@/models/event.model'

import marketplaceTranslations from '@/components/marketplace/locales.json'
import { getTranslations } from '@/lib/getDictionary'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n-config'
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
export default function EventImage({ locale, eventData, bib }: EventImageProps) {
	const t = getTranslations(locale ?? ('en' as Locale), marketplaceTranslations)
	/**
	 * Get background styling based on event type
	 * @param type - The type of sporting event
	 * @returns CSS classes for the badge styling
	 */
	function bgFromType(type: BibSale['event']['type']) {
		switch (type) {
			case 'cycling':
				return 'bg-cyan-100/40 border-cyan-500/60 dark:bg-cyan-500/15 dark:border-cyan-500/50'
			case 'other':
				return 'bg-gray-100/40 border-gray-500/60 dark:bg-gray-500/15 dark:border-gray-500/50'
			case 'running':
				return 'bg-green-100/40 border-green-500/60 dark:bg-green-500/15 dark:border-green-500/50'
			case 'swimming':
				return 'bg-blue-100/40 border-blue-500/60 dark:bg-blue-500/15 dark:border-blue-500/50'
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
	const referencePrice =
		officialPrice > 0 && originalPrice > 0
			? Math.min(officialPrice, originalPrice)
			: officialPrice > 0
				? officialPrice
				: originalPrice > 0
					? originalPrice
					: 0

	// Calculate discount percentage based on the lowest reference price
	const discountPercentage =
		referencePrice > 0 && referencePrice > bib.price
			? Math.round(((referencePrice - bib.price) / referencePrice) * 100)
			: 0

	return (
		<div className="relative">
			<Image
				alt={bib.event.name}
				src={bib.event.image}
				className="bg-card/80 aspect-[4/3] w-full rounded-lg object-cover"
				width={800}
				height={600}
			/>

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
							case 'running':
								return t.road ?? 'Road'
							case 'triathlon':
								return t.triathlon ?? 'Triathlon'
							case 'cycling':
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
						-{discountPercentage}% OFF
					</Badge>
				</div>
			)}
		</div>
	)
}
