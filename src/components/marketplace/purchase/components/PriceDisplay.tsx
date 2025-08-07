'use client'

import React from 'react'
import type { BibSale } from '@/components/marketplace/CardMarket'
import type { Event } from '@/models/event.model'

interface PriceDisplayProps {
	/** The bib sale data containing price information */
	bib: BibSale
	/** Optional event data for official price comparison */
	eventData?: Event
}

/**
 * Component that displays the price with discount calculations and savings information
 * Shows current price, original price, and savings compared to the lowest reference price
 * (either original seller price or official event price)
 */
export default function PriceDisplay({ bib, eventData }: PriceDisplayProps) {
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

	// Check if we have a valid reference price to compare against
	const hasValidReference = referencePrice > 0 && referencePrice !== bib.price && referencePrice > bib.price

	// Determine which price type we're comparing against for display
	const isComparingAgainstOfficial = officialPrice > 0 && (originalPrice === 0 || officialPrice <= originalPrice)

	return (
		<div className="mt-6">
			{/* Main Price Display */}
			<div className="flex items-baseline gap-3">
				<p className="text-foreground text-4xl font-bold">€{bib.price}</p>

				{/* Reference Price Display (lowest between original and official) */}
				{hasValidReference && (
					<div className="flex flex-col">
						<p className="text-muted-foreground text-sm">
							{isComparingAgainstOfficial ? 'Prix officiel' : 'Prix original'}
						</p>
						<p className="text-muted-foreground text-lg line-through">€{referencePrice}</p>
					</div>
				)}
			</div>

			{/* Savings Display */}
			{hasValidReference && (
				<div className="mt-2">
					<p className="text-sm font-medium text-green-400">
						Save €{(referencePrice - bib.price).toFixed(2)} vs. {isComparingAgainstOfficial ? 'official' : 'original'}{' '}
						price ({(((referencePrice - bib.price) / referencePrice) * 100).toFixed(0)}% off)
					</p>
				</div>
			)}

			{/* Additional Savings Info - Show if we have both prices and they're different */}
			{officialPrice > 0 && originalPrice > 0 && officialPrice !== originalPrice && (
				<div className="mt-1">
					<p className="text-muted-foreground text-xs">
						{isComparingAgainstOfficial
							? `Original seller price: €${originalPrice}`
							: `Official event price: €${officialPrice}`}
					</p>
				</div>
			)}
		</div>
	)
}
