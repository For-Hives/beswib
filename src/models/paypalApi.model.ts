/**
 * Log entries for PayPal API requests/responses.
 * Stored in PocketBase collection: "paypalAPI".
 * PII is sanitized before persisting.
 */
export type PayPalApiAction =
	| 'OAuthToken'
	| 'OrderCreate'
	| 'OrderCapture'
	| 'PartnerReferralCreate'
	| 'PartnerReferralGet'
	| 'WebhookList'
	| 'WebhookCreate'
	| 'MerchantIntegrationGet'

export interface PayPalApiLog {
	id?: string
	action: PayPalApiAction
	/** PayPal correlation ID header or response field (paypal-debug-id | debug_id | correlation-id) */
	debugId: string | null
	/** Raw JSON payload (sanitized of PII/secrets) */
	raw: unknown
	created?: string
	updated?: string
}
