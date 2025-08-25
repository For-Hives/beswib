import { PLATFORM_FEE } from '@/constants/global.constant'

/**
 * Calculate PayPal fees based on transaction amount
 * PayPal charges 2.9% + €0.35 per transaction
 */
export const calculatePayPalFee = (amount: number): number => {
	if (amount <= 0) return 0

	const percentageFee = amount * 0.029 // 2.9%
	const fixedFee = 0.35 // €0.35
	return Math.round((percentageFee + fixedFee) * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate platform fee based on transaction amount
 * Uses the PLATFORM_FEE constant from global.constant.ts
 * Handles case where PLATFORM_FEE might be 0
 */
export const calculatePlatformFee = (amount: number): number => {
	if (amount <= 0 || PLATFORM_FEE <= 0) return 0

	return Math.round(amount * PLATFORM_FEE * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate net amount after all fees
 * Handles case where platform fees might be 0
 */
export const calculateNetAmount = (amount: number): number => {
	if (amount <= 0) return 0

	const platformFee = calculatePlatformFee(amount)
	const paypalFee = calculatePayPalFee(amount)
	return Math.round((amount - platformFee - paypalFee) * 100) / 100
}

/**
 * Get fee breakdown for a transaction
 * Handles case where platform fees might be 0
 */
export const getFeeBreakdown = (amount: number) => {
	if (amount <= 0) {
		return {
			totalFees: 0,
			platformFee: 0,
			paypalFee: 0,
			originalAmount: 0,
			netAmount: 0,
			hasPlatformFees: false,
			hasPayPalFees: false,
		}
	}

	const platformFee = calculatePlatformFee(amount)
	const paypalFee = calculatePayPalFee(amount)
	const netAmount = calculateNetAmount(amount)

	return {
		totalFees: platformFee + paypalFee,
		platformFee,
		paypalFee,
		originalAmount: amount,
		netAmount,
		hasPlatformFees: platformFee > 0,
		hasPayPalFees: paypalFee > 0,
	}
}

/**
 * Check if fees are applicable for a given amount
 */
export const areFeesApplicable = (amount: number): boolean => {
	if (amount <= 0) return false
	return PLATFORM_FEE > 0 || amount > 0 // Always true if amount > 0, but useful for future logic
}

/**
 * Get fee percentage breakdown for display purposes
 */
export const getFeePercentages = (amount: number) => {
	if (amount <= 0) {
		return {
			totalFeePercentage: 0,
			platformFeePercentage: 0,
			paypalFeePercentage: 0,
		}
	}

	const breakdown = getFeeBreakdown(amount)

	return {
		totalFeePercentage: (breakdown.totalFees / amount) * 100,
		platformFeePercentage: breakdown.hasPlatformFees ? (breakdown.platformFee / amount) * 100 : 0,
		paypalFeePercentage: breakdown.hasPayPalFees ? (breakdown.paypalFee / amount) * 100 : 0,
	}
}

/**
 * Format fee breakdown for display, handling zero fees gracefully
 */
export const formatFeeBreakdown = (amount: number) => {
	const breakdown = getFeeBreakdown(amount)
	const percentages = getFeePercentages(amount)

	return {
		...breakdown,
		...percentages,
		isFreeTransaction: breakdown.totalFees === 0,
		displayText: breakdown.hasPlatformFees
			? `Platform: ${breakdown.platformFee}€ (${percentages.platformFeePercentage.toFixed(1)}%), PayPal: ${breakdown.paypalFee}€`
			: `PayPal: ${breakdown.paypalFee}€`,
	}
}
