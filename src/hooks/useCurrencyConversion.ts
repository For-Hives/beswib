'use client'

import { useEffect, useState } from 'react'

import type { Locale } from '@/lib/i18n/config'

import {
	convertPrice,
	fetchExchangeRates,
	formatPrice,
	getCurrencyForLocale,
	getCurrencyName,
} from '@/lib/utils/currency'

interface UseCurrencyConversionResult {
	isLoading: boolean
	currencyName: string
	currencyCode: string
	convertedPrice: number | null
	convertedFormatted: string | null
}

/**
 * Hook to handle currency conversion based on locale
 * @param priceInEur - Price in EUR to convert
 * @param locale - Target locale
 * @returns Conversion result with formatted price and loading state
 */
export function useCurrencyConversion(priceInEur: number, locale: Locale): UseCurrencyConversionResult {
	const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	const targetCurrency = getCurrencyForLocale(locale)
	const currencyName = getCurrencyName(targetCurrency)

	useEffect(() => {
		// Don't fetch rates if we're already using EUR
		if (targetCurrency === 'eur') {
			setIsLoading(false)
			return
		}

		let isMounted = true

		async function fetchRates() {
			try {
				const rates = await fetchExchangeRates()

				if (isMounted) {
					setExchangeRates(rates)
					setIsLoading(false)
				}
			} catch (error) {
				console.error('Failed to fetch exchange rates:', error)
				if (isMounted) {
					setIsLoading(false)
				}
			}
		}

		void fetchRates()

		return () => {
			isMounted = false
		}
	}, [targetCurrency])

	// Calculate converted price
	const convertedPrice = exchangeRates
		? convertPrice(priceInEur, targetCurrency, exchangeRates)
		: targetCurrency === 'eur'
			? priceInEur
			: null

	// Format the converted price
	const convertedFormatted = convertedPrice !== null ? formatPrice(convertedPrice, targetCurrency) : null

	return {
		isLoading: targetCurrency !== 'eur' && isLoading,
		currencyName,
		currencyCode: targetCurrency,
		convertedPrice,
		convertedFormatted,
	}
}
