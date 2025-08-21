'use client'

import React from 'react'

import { useCurrencyConversion } from '@/hooks/useCurrencyConversion'

import type { BibSale } from '@/models/marketplace.model'
import type { Event } from '@/models/event.model'

import marketplaceTranslations from '@/components/marketplace/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

interface PriceDisplayProps {
	/** The bib sale data containing price information */
	bib: BibSale
	/** Optional event data for official price comparison */
	eventData?: Event
	/** Locale for translations */
	locale: Locale
}

/**
 * Component that displays the price with discount calculations and savings information
 * Shows current price, original price, and savings compared to the lowest reference price
 * (either original seller price or official event price)
 */
export default function PriceDisplay({ locale, eventData, bib }: Readonly<PriceDisplayProps>) {
	const t = getTranslations(locale, marketplaceTranslations)

	// Currency conversion hook
	const { isLoading, currencyName, convertedFormatted } = useCurrencyConversion(bib.price, locale)
	console.log(isLoading, currencyName, convertedFormatted)

	// Should show currency conversion if we have a converted price and it's not EUR (original currency)
	const shouldShowConversion = convertedFormatted && currencyName !== 'EUR'
	console.log('shouldShowConversion', shouldShowConversion)

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
	let isComparingAgainstOfficial = false
	if (officialPrice > 0) {
		if (originalPrice === 0) {
			isComparingAgainstOfficial = true
		} else if (officialPrice <= originalPrice) {
			isComparingAgainstOfficial = true
		}
	}

	return (
		<div className="mt-6">
			{/* Main Price Display */}
			<div className="flex items-baseline gap-3">
				<p className="text-foreground text-4xl font-bold">€{bib.price}</p>

				{/* Reference Price Display (lowest between original and official) */}
				{hasValidReference && (
					<div className="flex flex-col">
						<p className="text-muted-foreground text-sm">
							{isComparingAgainstOfficial
								? (t.officialPrice ?? 'Official price')
								: (t.originalPrice ?? 'Original price')}
						</p>
						<p className="text-muted-foreground text-lg line-through">€{referencePrice}</p>
					</div>
				)}
			</div>

			{/* Currency Conversion Display */}
			{shouldShowConversion && !isLoading && (
				<div className="mt-2">
					<p className="text-muted-foreground text-xl">
						{t.currencyEstimate?.replace('{converted}', convertedFormatted).replace('{currency}', currencyName) ??
							`Approx. ${convertedFormatted} (${currencyName})`}
					</p>
				</div>
			)}

			{/* Savings Display */}
			{hasValidReference && (
				<div className="mt-2">
					<p className="text-sm font-medium text-green-400">
						{t.savePrefix ?? 'Save'} €{(referencePrice - bib.price).toFixed(2)} {t.saveVs ?? 'vs.'}{' '}
						{isComparingAgainstOfficial ? (t.official ?? 'official') : (t.original ?? 'original')} {t.price ?? 'price'}{' '}
						({(((referencePrice - bib.price) / referencePrice) * 100).toFixed(0)}% {t.off ?? 'off'})
					</p>
				</div>
			)}

			{/* Additional Savings Info - Show if we have both prices and they're different */}
			{officialPrice > 0 && originalPrice > 0 && officialPrice !== originalPrice && (
				<div className="mt-1">
					<p className="text-muted-foreground text-xs">
						{isComparingAgainstOfficial
							? `${t.originalSellerPrice ?? 'Original seller price'}: €${originalPrice}`
							: `${t.officialEventPrice ?? 'Official event price'}: €${officialPrice}`}
					</p>
				</div>
			)}
		</div>
	)
}
