/**
 * Validates PayPal order ID format to prevent SSRF attacks
 * PayPal order IDs follow the pattern: ORDER-[17-30 alphanumeric chars]
 *
 * Kept outside the PayPal service: the capture action applies it too, before it looks an order up,
 * because the id it is given comes from the browser and ends up in a PocketBase filter.
 */
export function isValidPayPalOrderId(orderId: string): boolean {
	if (!orderId || typeof orderId !== 'string') {
		return false
	}

	// PayPal order IDs are typically 17 chars (old format) or ORDER-[alphanumeric] (new format)
	// This prevents path traversal and other SSRF attempts
	return /^[0-9A-Z]{17}$|^ORDER-[A-Z0-9]{10,30}$/i.test(orderId)
}
