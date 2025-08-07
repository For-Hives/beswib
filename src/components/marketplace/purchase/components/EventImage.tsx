'use client'

import React from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BibSale } from '@/components/marketplace/CardMarket'

interface EventImageProps {
	/** The bib sale data containing event information */
	bib: BibSale
}

/**
 * Component that displays the event image with type badge and discount badge
 * Handles the visual presentation of the event with proper styling and overlays
 */
export default function EventImage({ bib }: EventImageProps) {
	/**
	 * Get background styling based on event type
	 * @param type - The type of sporting event
	 * @returns CSS classes for the badge styling
	 */
	function bgFromType(type: BibSale['event']['type']) {
		switch (type) {
			case 'cycling':
				return 'bg-cyan-500/15 border-cyan-500/50'
			case 'other':
				return 'bg-gray-500/15 border-gray-500/50'
			case 'running':
				return 'bg-green-500/15 border-green-500/50'
			case 'swimming':
				return 'bg-blue-500/15 border-blue-500/50'
			case 'trail':
				return 'bg-yellow-500/15 border-yellow-500/50'
			case 'triathlon':
				return 'bg-purple-500/15 border-purple-500/50'
		}
	}

	// Calculate discount percentage for display
	const discountPercentage =
		bib.originalPrice && bib.originalPrice > bib.price
			? Math.round(((bib.originalPrice - bib.price) / bib.originalPrice) * 100)
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
						'inline-block rounded-full border px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md',
						bgFromType(bib.event.type)
					)}
				>
					{bib.event.type.charAt(0).toUpperCase() + bib.event.type.slice(1)}
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
