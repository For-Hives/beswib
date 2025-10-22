'use client'

import marketplaceTranslations from '@/components/marketplace/locales.json'
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import type { Event } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'

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

	// Helpers for translations with safe fallbacks
	const txt = {
		saveVs: t.saveVs ?? 'vs.',
		savePrefix: t.savePrefix ?? 'Save',
		price: t.price ?? 'price',
		originalSellerPrice: t.originalSellerPrice ?? 'Original seller price',
		originalPrice: t.originalPrice ?? 'Original price',
		original: t.original ?? 'original',
		officialPrice: t.officialPrice ?? 'Official price',
		officialEventPrice: t.officialEventPrice ?? 'Official event price',
		official: t.official ?? 'official',
		off: t.off ?? 'off',
		currencyEstimate: t.currencyEstimate ?? '~ {converted} ({currency})',
	}

	// Should show currency conversion if we have a converted price and it's not EUR (original currency)
	const shouldShowConversion = convertedFormatted != null && currencyName !== 'EUR'

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

	const referenceLabel = isComparingAgainstOfficial ? txt.officialPrice : txt.originalPrice

	const savingsAmount = hasValidReference ? referencePrice - bib.price : 0
	const savingsPercent = hasValidReference ? Math.round(((referencePrice - bib.price) / referencePrice) * 100) : 0

	return (
		<div className="mt-6">
			{/* Main Price Display */}
			<div className="flex items-baseline gap-3">
				<p className="text-foreground text-4xl font-bold">€{bib.price}</p>

				{/* Reference Price Display (lowest between original and official) */}
				{hasValidReference && (
					<div className="flex flex-col">
						<p className="text-muted-foreground text-sm">{referenceLabel}</p>
						<p className="text-muted-foreground text-lg line-through">€{referencePrice}</p>
					</div>
				)}
			</div>

			{/* Currency Conversion Display */}
			{shouldShowConversion && !isLoading && convertedFormatted && (
				<div className="mt-2">
					<p className="text-muted-foreground text-xl">
						{txt.currencyEstimate.replace('{converted}', convertedFormatted).replace('{currency}', currencyName)}
					</p>
				</div>
			)}

			{/* Savings Display */}
			{hasValidReference && (
				<div className="mt-2">
					<p className="text-sm font-medium text-green-400">
						{txt.savePrefix} €{savingsAmount.toFixed(2)} {txt.saveVs}{' '}
						{isComparingAgainstOfficial ? txt.official : txt.original} {txt.price} ({savingsPercent}% {txt.off})
					</p>
				</div>
			)}

			{/* Additional Savings Info - Show if we have both prices and they're different */}
			{officialPrice > 0 && originalPrice > 0 && officialPrice !== originalPrice && (
				<div className="mt-1">
					<p className="text-muted-foreground text-xs">
						{isComparingAgainstOfficial
							? `${txt.originalSellerPrice}: €${originalPrice}`
							: `${txt.officialEventPrice}: €${officialPrice}`}
					</p>
				</div>
			)}
		</div>
	)
}
