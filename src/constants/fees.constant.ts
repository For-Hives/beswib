import { PLATFORM_FEE } from './global.constant'

/**
 * Fee configuration constants
 * Centralized place for all fee-related settings
 */

// Platform fees
export const PLATFORM_FEE_PERCENTAGE = PLATFORM_FEE // 0.1 = 10%
export const PLATFORM_FEE_DESCRIPTION = 'Platform commission'

// PayPal fees (standard pricing)
export const PAYPAL_PERCENTAGE_FEE = 0.029 // 2.9%
export const PAYPAL_FIXED_FEE = 0.35 // €0.35
export const PAYPAL_FEE_DESCRIPTION = 'PayPal processing fee'

// Fee calculation precision
export const FEE_DECIMAL_PLACES = 2
export const FEE_ROUNDING_METHOD = 'round' // 'round', 'floor', 'ceil'

// Fee validation thresholds
export const MIN_TRANSACTION_AMOUNT = 0.01 // €0.01
export const MAX_FEE_PERCENTAGE = 0.25 // 25% - warning threshold
export const REASONABLE_FEE_PERCENTAGE = 0.15 // 15% - typical fee range

// Fee display options
export const SHOW_FEE_BREAKDOWN = true
export const SHOW_FEE_PERCENTAGES = true
export const CURRENCY_SYMBOL = '€'

// Fee calculation methods
export const FEE_CALCULATION_METHODS = {
	PLATFORM: 'percentage', // 'percentage' or 'fixed'
	PAYPAL: 'percentage_plus_fixed', // 'percentage_plus_fixed' or 'fixed'
} as const

// Fee rounding strategies
export const FEE_ROUNDING_STRATEGIES = {
	INDIVIDUAL: 'individual', // Round each fee separately
	TOTAL: 'total', // Round only the final total
	BOTH: 'both', // Round both individual and total
} as const

// Default fee calculation strategy
export const DEFAULT_FEE_STRATEGY = FEE_ROUNDING_STRATEGIES.INDIVIDUAL

// Fee calculation cache settings
export const FEE_CACHE_ENABLED = true
export const FEE_CACHE_TTL = 3600000 // 1 hour in milliseconds

// Fee reporting and analytics
export const FEE_ANALYTICS_ENABLED = true
export const FEE_REPORTING_INTERVAL = 'daily' // 'hourly', 'daily', 'weekly', 'monthly'

// Fee exemption rules (if any)
export const FEE_EXEMPTION_RULES = {
	MIN_AMOUNT_THRESHOLD: 10, // No fees for transactions under €10
	VIP_USERS: false, // VIP users get fee discounts
	PROMOTIONAL_PERIODS: false, // Fee-free promotional periods
} as const

// Fee calculation validation
export const FEE_VALIDATION_RULES = {
	REQUIRE_POSITIVE_AMOUNT: true,
	REQUIRE_MINIMUM_AMOUNT: true,
	VALIDATE_FEE_PERCENTAGES: true,
	CHECK_FEE_THRESHOLDS: true,
} as const
