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
 * Shows current price, original price, and savings compared to official event price
 */
export default function PriceDisplay({ bib, eventData }: PriceDisplayProps) {
	return (
		<div className="mt-6">
			{/* Main Price Display */}
			<div className="flex items-baseline gap-3">
				<p className="text-foreground text-4xl font-bold">€{bib.price}</p>

				{/* Official Event Price Comparison */}
				{(eventData?.officialStandardPrice ?? 0) > 0 && (eventData?.officialStandardPrice ?? 0) !== bib.price && (
					<div className="flex flex-col">
						<p className="text-muted-foreground text-lg line-through">€{eventData?.officialStandardPrice ?? 0}</p>
					</div>
				)}
			</div>

			{/* Seller's Original Price Discount */}
			{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
				<div className="mt-2">
					<p className="text-sm font-medium text-green-400">
						Save €{(bib.originalPrice - bib.price).toFixed(2)} from seller (
						{(((bib.originalPrice - bib.price) / bib.originalPrice) * 100).toFixed(0)}% off)
					</p>
				</div>
			)}

			{/* Savings vs Official Price */}
			{(eventData?.officialStandardPrice ?? 0) > 0 &&
				eventData?.officialStandardPrice !== bib.price &&
				(eventData?.officialStandardPrice ?? 0) > bib.price && (
					<div className="mt-2">
						<p className="text-sm font-medium text-green-400">
							Save €{((eventData?.officialStandardPrice ?? 0) - bib.price).toFixed(2)} vs. official price (
							{(
								(((eventData?.officialStandardPrice ?? 0) - bib.price) / (eventData?.officialStandardPrice ?? 1)) *
								100
							).toFixed(0)}
							% off)
						</p>
					</div>
				)}
		</div>
	)
}
