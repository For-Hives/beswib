import type { Locale } from '@/lib/i18n/config'

/**
 * Currency mapping for each locale
 * Maps locale to the primary currency code for that region
 */
export const LOCALE_TO_CURRENCY: Record<Locale, string> = {
	ro: 'ron', // Romanian Leu
	pt: 'eur', // Euro (Portugal uses EUR)
	nl: 'eur', // Euro (Netherlands uses EUR)
	ko: 'krw', // South Korean Won
	it: 'eur', // Euro (Italy uses EUR)
	fr: 'eur', // Euro (France uses EUR)
	es: 'eur', // Euro (Spain uses EUR)
	en: 'usd', // US Dollar
	de: 'eur', // Euro (Germany uses EUR)
}

/**
 * Currency symbols mapping
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
	usd: '$',
	ron: 'lei',
	krw: '₩',
	eur: '€',
}

/**
 * Currency names for display
 */
export const CURRENCY_NAMES: Record<string, string> = {
	usd: 'USD',
	ron: 'RON',
	krw: 'KRW',
	eur: 'EUR',
}

/**
 * Fetches current exchange rates from EUR to other currencies
 */
export async function fetchExchangeRates(): Promise<Record<string, number> | null> {
	try {
		const response = await fetch('https://latest.currency-api.pages.dev/v1/currencies/eur.json', {
			next: { revalidate: 3600 }, // Cache for 1 hour
		})

		if (!response.ok) {
			console.error('Failed to fetch exchange rates:', response.status)
			return null
		}

		const data = (await response.json()) as { eur: Record<string, number> }
		return data.eur
	} catch (error) {
		console.error('Error fetching exchange rates:', error)
		return null
	}
}

/**
 * Converts a price from EUR to the target currency
 * @param priceInEur - Price in EUR
 * @param targetCurrency - Target currency code
 * @param exchangeRates - Exchange rates from EUR
 * @returns Converted price or null if conversion fails
 */
export function convertPrice(
	priceInEur: number,
	targetCurrency: string,
	exchangeRates: Record<string, number>
): number | null {
	// If target currency is EUR, no conversion needed
	if (targetCurrency === 'eur') {
		return priceInEur
	}

	const rate = exchangeRates[targetCurrency]
	if (!rate || typeof rate !== 'number') {
		return null
	}

	return priceInEur * rate
}

/**
 * Gets the currency for a locale
 */
export function getCurrencyForLocale(locale: Locale): string {
	return LOCALE_TO_CURRENCY[locale] || 'eur'
}

/**
 * Gets the currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
	return CURRENCY_SYMBOLS[currencyCode] || currencyCode.toUpperCase()
}

/**
 * Gets the currency name for a currency code
 */
export function getCurrencyName(currencyCode: string): string {
	return CURRENCY_NAMES[currencyCode] || currencyCode.toUpperCase()
}

/**
 * Formats a price with proper currency symbol and decimal places
 */
export function formatPrice(price: number, currencyCode: string): string {
	const symbol = getCurrencySymbol(currencyCode)

	// Special formatting for different currencies
	switch (currencyCode) {
		case 'krw':
			// Korean Won doesn't use decimal places
			return `${symbol}${Math.round(price).toLocaleString()}`
		case 'ron':
			// Romanian Leu with 2 decimal places
			return `${price.toFixed(2)} ${symbol}`
		default:
			// Default format with 2 decimal places
			return `${symbol}${price.toFixed(2)}`
	}
}
