import { describe, it, expect, vi } from 'vitest'

import {
	calculatePayPalFee,
	calculatePlatformFee,
	calculateNetAmount,
	getFeeBreakdown,
	getFeePercentages,
	formatFeeBreakdown,
} from '@/lib/utils/feeCalculations'

// Mock the PLATFORM_FEE constant to 0
vi.mock('@/constants/global.constant', () => ({
	PLATFORM_FEE: 0, // No platform fees
}))

describe('Fee Calculations with Zero Platform Fees', () => {
	describe('calculatePlatformFee', () => {
		it('should return 0 when PLATFORM_FEE is 0', () => {
			const amount = 100
			expect(calculatePlatformFee(amount)).toBe(0)
		})

		it('should return 0 for any amount when PLATFORM_FEE is 0', () => {
			expect(calculatePlatformFee(50)).toBe(0)
			expect(calculatePlatformFee(150)).toBe(0)
			expect(calculatePlatformFee(1000)).toBe(0)
		})
	})

	describe('calculateNetAmount', () => {
		it('should only deduct PayPal fees when platform fees are 0', () => {
			const amount = 100
			const paypalFee = calculatePayPalFee(amount) // Should be 3.25
			const expectedNet = amount - paypalFee // 100 - 3.25 = 96.75
			expect(calculateNetAmount(amount)).toBe(expectedNet)
		})

		it('should handle different amounts correctly', () => {
			expect(calculateNetAmount(50)).toBe(50 - calculatePayPalFee(50)) // 50 - 1.8 = 48.2
			expect(calculateNetAmount(150)).toBe(150 - calculatePayPalFee(150)) // 150 - 4.7 = 145.3
		})
	})

	describe('getFeeBreakdown', () => {
		it('should show platform fees as 0 and hasPlatformFees as false', () => {
			const amount = 100
			const breakdown = getFeeBreakdown(amount)

			expect(breakdown.platformFee).toBe(0)
			expect(breakdown.hasPlatformFees).toBe(false)
			expect(breakdown.hasPayPalFees).toBe(true)
			expect(breakdown.totalFees).toBe(breakdown.paypalFee)
		})

		it('should calculate correct net amount without platform fees', () => {
			const amount = 100
			const breakdown = getFeeBreakdown(amount)
			const paypalFee = calculatePayPalFee(amount)

			expect(breakdown.netAmount).toBe(amount - paypalFee)
			expect(breakdown.totalFees).toBe(paypalFee)
		})
	})

	describe('getFeePercentages', () => {
		it('should show 0% for platform fees', () => {
			const amount = 100
			const percentages = getFeePercentages(amount)

			expect(percentages.platformFeePercentage).toBe(0)
			expect(percentages.paypalFeePercentage).toBeGreaterThan(0)
			expect(percentages.totalFeePercentage).toBe(percentages.paypalFeePercentage)
		})
	})

	describe('formatFeeBreakdown', () => {
		it('should not mention platform fees in display text', () => {
			const amount = 100
			const formatted = formatFeeBreakdown(amount)

			expect(formatted.hasPlatformFees).toBe(false)
			expect(formatted.displayText).not.toContain('Platform:')
			expect(formatted.displayText).toContain('PayPal:')
		})

		it('should show correct fee breakdown for display', () => {
			const amount = 100
			const formatted = formatFeeBreakdown(amount)
			const paypalFee = calculatePayPalFee(amount)

			expect(formatted.displayText).toBe(`PayPal: ${paypalFee}€`)
		})
	})

	describe('Edge Cases', () => {
		it('should handle zero amounts correctly', () => {
			const breakdown = getFeeBreakdown(0)
			expect(breakdown.platformFee).toBe(0)
			expect(breakdown.paypalFee).toBe(0)
			expect(breakdown.hasPlatformFees).toBe(false)
			expect(breakdown.hasPayPalFees).toBe(false)
		})

		it('should handle very small amounts', () => {
			const amount = 0.01
			const breakdown = getFeeBreakdown(amount)

			// PayPal fee should still apply even for very small amounts
			expect(breakdown.paypalFee).toBeGreaterThan(0)
			expect(breakdown.platformFee).toBe(0)
		})
	})

	describe('Business Logic', () => {
		it('should still be profitable for PayPal even with 0 platform fees', () => {
			const amount = 100
			const breakdown = getFeeBreakdown(amount)

			// PayPal still gets their fees
			expect(breakdown.paypalFee).toBeGreaterThan(0)
			// Platform gets nothing
			expect(breakdown.platformFee).toBe(0)
			// Seller gets more money
			expect(breakdown.netAmount).toBeGreaterThan(amount - breakdown.paypalFee - 10) // More than if there were 10% platform fees
		})
	})
})
