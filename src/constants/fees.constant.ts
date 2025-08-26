import { PLATFORM_FEE } from './global.constant'

/**
 * Fee configuration constants
 * Centralized place for all fee-related settings
 */

// Platform fees
export const PLATFORM_FEE_PERCENTAGE = PLATFORM_FEE // 0.1 = 10%

// PayPal fees (updated to match French PayPal Business rates)
// Source: https://www.paypal.com/fr/webapps/mpp/merchant-fees
export const PAYPAL_PERCENTAGE_FEE = 0.0349 // 3.49% (standard rate for French transactions)
export const PAYPAL_FIXED_FEE = 0.39 // €0.39 (standard fixed fee for Euro transactions)
