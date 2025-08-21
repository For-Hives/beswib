import { describe, expect, it } from 'vitest'

import {
	convertPrice,
	formatPrice,
	getCurrencyForLocale,
	getCurrencyName,
	getCurrencySymbol,
} from '@/lib/utils/currency'

describe('Currency Utils', () => {
	describe('getCurrencyForLocale', () => {
		it('should return correct currency for each locale', () => {
			expect(getCurrencyForLocale('en')).toBe('usd')
			expect(getCurrencyForLocale('fr')).toBe('eur')
			expect(getCurrencyForLocale('de')).toBe('eur')
			expect(getCurrencyForLocale('es')).toBe('eur')
			expect(getCurrencyForLocale('it')).toBe('eur')
			expect(getCurrencyForLocale('ro')).toBe('ron')
			expect(getCurrencyForLocale('pt')).toBe('eur')
			expect(getCurrencyForLocale('nl')).toBe('eur')
			expect(getCurrencyForLocale('ko')).toBe('krw')
		})

		it('should fallback to eur for unknown locale', () => {
			// @ts-expect-error Testing invalid locale
			expect(getCurrencyForLocale('unknown')).toBe('eur')
		})
	})

	describe('getCurrencySymbol', () => {
		it('should return correct symbols for known currencies', () => {
			expect(getCurrencySymbol('usd')).toBe('$')
			expect(getCurrencySymbol('eur')).toBe('€')
			expect(getCurrencySymbol('ron')).toBe('lei')
			expect(getCurrencySymbol('krw')).toBe('₩')
		})

		it('should return uppercase currency code for unknown currencies', () => {
			expect(getCurrencySymbol('unknown')).toBe('UNKNOWN')
		})
	})

	describe('getCurrencyName', () => {
		it('should return correct names for known currencies', () => {
			expect(getCurrencyName('usd')).toBe('USD')
			expect(getCurrencyName('eur')).toBe('EUR')
			expect(getCurrencyName('ron')).toBe('RON')
			expect(getCurrencyName('krw')).toBe('KRW')
		})

		it('should return uppercase currency code for unknown currencies', () => {
			expect(getCurrencyName('unknown')).toBe('UNKNOWN')
		})
	})

	describe('convertPrice', () => {
		const mockExchangeRates = {
			usd: 1.1,
			ron: 5.0,
			krw: 1500,
			eur: 1,
		}

		it('should convert EUR to other currencies correctly', () => {
			expect(convertPrice(100, 'usd', mockExchangeRates)).toBe(110)
			expect(convertPrice(100, 'krw', mockExchangeRates)).toBe(150000)
			expect(convertPrice(100, 'ron', mockExchangeRates)).toBe(500)
		})

		it('should return the same price for EUR conversion', () => {
			expect(convertPrice(100, 'eur', mockExchangeRates)).toBe(100)
		})

		it('should return null for unknown currency', () => {
			expect(convertPrice(100, 'unknown', mockExchangeRates)).toBeNull()
		})

		it('should return null for missing exchange rate', () => {
			expect(convertPrice(100, 'gbp', mockExchangeRates)).toBeNull()
		})
	})

	describe('formatPrice', () => {
		it('should format USD correctly', () => {
			expect(formatPrice(100.5, 'usd')).toBe('$100.50')
		})

		it('should format EUR correctly', () => {
			expect(formatPrice(100.5, 'eur')).toBe('€100.50')
		})

		it('should format KRW correctly (no decimals)', () => {
			expect(formatPrice(150000.75, 'krw')).toBe('₩150,001')
		})

		it('should format RON correctly', () => {
			expect(formatPrice(500.25, 'ron')).toBe('500.25 lei')
		})

		it('should format unknown currency with default pattern', () => {
			expect(formatPrice(100.5, 'unknown')).toBe('UNKNOWN100.50')
		})
	})
})
