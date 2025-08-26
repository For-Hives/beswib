import { describe, it, expect, vi } from 'vitest'

import {
	calculatePayPalFee,
	calculatePlatformFee,
	calculateNetAmount,
	getFeeBreakdown,
	areFeesApplicable,
	getFeePercentages,
	formatFeeBreakdown,
} from '@/lib/utils/feeCalculations'

// Mock the PLATFORM_FEE constant
vi.mock('@/constants/global.constant', () => ({
	PLATFORM_FEE: 0.1, // Default to 10%
}))

describe('Fee Calculations', () => {
	describe('calculatePayPalFee', () => {
		it('should calculate PayPal fee correctly for €100', () => {
			const amount = 100
			expect(calculatePayPalFee(amount)).toBe(3.88) // 3.49% of 100 = 3.49 + 0.39 = 3.88
		})

		it('should calculate PayPal fee correctly for €150', () => {
			const amount = 150
			expect(calculatePayPalFee(amount)).toBe(5.63) // 3.49% of 150 = 5.235 + 0.39 = 5.625, rounded to 5.63
		})

		it('should calculate PayPal fee correctly for €50', () => {
			const amount = 50
			expect(calculatePayPalFee(amount)).toBe(2.14) // 3.49% of 50 = 1.745 + 0.39 = 2.135, rounded to 2.14
		})

		it('should return 0 for negative or zero amounts', () => {
			expect(calculatePayPalFee(0)).toBe(0)
			expect(calculatePayPalFee(-100)).toBe(0)
		})
	})

	describe('calculatePlatformFee', () => {
		it('should calculate platform fee correctly for €100 (10%)', () => {
			const amount = 100
			expect(calculatePlatformFee(amount)).toBe(10) // 10% of 100 = 10
		})

		it('should calculate platform fee correctly for €150 (10%)', () => {
			const amount = 150
			expect(calculatePlatformFee(amount)).toBe(15) // 10% of 150 = 15
		})

		it('should calculate platform fee correctly for €75 (10%)', () => {
			const amount = 75
			expect(calculatePlatformFee(amount)).toBe(7.5) // 10% of 75 = 7.5
		})

		it('should return 0 for negative or zero amounts', () => {
			expect(calculatePlatformFee(0)).toBe(0)
			expect(calculatePlatformFee(-100)).toBe(0)
		})
	})

	describe('calculateNetAmount', () => {
		it('should calculate net amount correctly for €100', () => {
			const amount = 100
			const expectedNet = 86.12 // 100 - 10 - 3.88 = 86.12
			expect(calculateNetAmount(amount)).toBe(expectedNet)
		})

		it('should calculate net amount correctly for €150', () => {
			const amount = 150
			const expectedNet = 129.37 // 150 - 15 - 5.63 = 129.37
			expect(calculateNetAmount(amount)).toBe(expectedNet)
		})

		it('should return 0 for negative or zero amounts', () => {
			expect(calculateNetAmount(0)).toBe(0)
			expect(calculateNetAmount(-100)).toBe(0)
		})
	})

	describe('getFeeBreakdown', () => {
		it('should return complete fee breakdown for €100', () => {
			const amount = 100
			const breakdown = getFeeBreakdown(amount)

			expect(breakdown).toEqual({
				totalFees: 13.88,
				platformFee: 10,
				paypalFee: 3.88,
				originalAmount: 100,
				netAmount: 86.12,
				hasPlatformFees: true,
				hasPayPalFees: true,
			})
		})

		it('should return complete fee breakdown for €150', () => {
			const amount = 150
			const breakdown = getFeeBreakdown(amount)

			expect(breakdown).toEqual({
				totalFees: 20.63,
				platformFee: 15,
				paypalFee: 5.63,
				originalAmount: 150,
				netAmount: 129.37,
				hasPlatformFees: true,
				hasPayPalFees: true,
			})
		})

		it('should handle zero amounts correctly', () => {
			const breakdown = getFeeBreakdown(0)
			expect(breakdown).toEqual({
				totalFees: 0,
				platformFee: 0,
				paypalFee: 0,
				originalAmount: 0,
				netAmount: 0,
				hasPlatformFees: false,
				hasPayPalFees: false,
			})
		})

		it('should handle negative amounts correctly', () => {
			const breakdown = getFeeBreakdown(-100)
			expect(breakdown).toEqual({
				totalFees: 0,
				platformFee: 0,
				paypalFee: 0,
				originalAmount: 0,
				netAmount: 0,
				hasPlatformFees: false,
				hasPayPalFees: false,
			})
		})
	})

	describe('areFeesApplicable', () => {
		it('should return true for positive amounts', () => {
			expect(areFeesApplicable(100)).toBe(true)
			expect(areFeesApplicable(0.01)).toBe(true)
		})

		it('should return false for zero or negative amounts', () => {
			expect(areFeesApplicable(0)).toBe(false)
			expect(areFeesApplicable(-100)).toBe(false)
		})
	})

	describe('getFeePercentages', () => {
		it('should calculate fee percentages correctly for €100', () => {
			const percentages = getFeePercentages(100)
			expect(percentages.platformFeePercentage).toBe(10) // 10%
			expect(percentages.paypalFeePercentage).toBe(3.88) // 3.88%
			expect(percentages.totalFeePercentage).toBe(13.88) // 13.88%
		})

		it('should handle zero amounts correctly', () => {
			const percentages = getFeePercentages(0)
			expect(percentages.platformFeePercentage).toBe(0)
			expect(percentages.paypalFeePercentage).toBe(0)
			expect(percentages.totalFeePercentage).toBe(0)
		})
	})

	describe('formatFeeBreakdown', () => {
		it('should format fee breakdown correctly for €100', () => {
			const formatted = formatFeeBreakdown(100)
			expect(formatted.hasPlatformFees).toBe(true)
			expect(formatted.hasPayPalFees).toBe(true)
			expect(formatted.isFreeTransaction).toBe(false)
			expect(formatted.displayText).toContain('Platform: 10€ (10.0%)')
			expect(formatted.displayText).toContain('PayPal: 3.88€')
		})

		it('should handle zero amounts correctly', () => {
			const formatted = formatFeeBreakdown(0)
			expect(formatted.isFreeTransaction).toBe(true)
			expect(formatted.hasPlatformFees).toBe(false)
			expect(formatted.hasPayPalFees).toBe(false)
		})
	})

	describe('Rounding', () => {
		it('should round fees to 2 decimal places', () => {
			const amount = 33.33
			const paypalFee = calculatePayPalFee(amount)
			const platformFee = calculatePlatformFee(amount)

			// Check that fees are properly rounded
			expect(paypalFee.toString().split('.')[1]?.length).toBeLessThanOrEqual(2)
			expect(platformFee.toString().split('.')[1]?.length).toBeLessThanOrEqual(2)
		})
	})
})
