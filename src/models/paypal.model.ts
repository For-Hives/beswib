// Centralized PayPal-related types used across services and webhooks

export type PayPalWebhookEvent = {
	create_time: string
	event_type: string
	resource: unknown
	resource_type: string
	summary: string
}

export type PayPalPaymentCaptureResource = {
	supplementary_data?: { related_ids?: { order_id?: string; bib_id?: string } }
	id?: string
	payee?: { email_address?: string }
	amount?: { value?: string; currency_code?: string }
	status?: string
}

export interface PayPalAccessToken {
	access_token: string
	expires_in: number
	token_type: string
}

export interface PayPalCaptureResponse {
	id: string
	status: string
}

export interface PayPalLink {
	href: string
	method?: string
	rel: string
}

export interface PayPalOperation {
	api_integration_preference?: {
		rest_api_integration?: {
			third_party_details?: {
				merchant_id?: string
			}
		}
	}
	operation: string
}

export interface PayPalOrderResponse {
	id: string
	status: string
}

export interface PayPalPartnerReferralResponse {
	collected_consents: unknown[]
	id: string
	legal_consents: unknown[]
	links: PayPalLink[]
	operations: PayPalOperation[]
	partner_client_id: string
	preferred_language_code: string
	products: string[]
	technical_phone_contacts: unknown[]
}

export interface PayPalWebhook {
	event_types: { name: string }[]
	id: string
	url: string
}

// Merchant integration status (GET /v1/customer/partners/{partner_id}/merchant-integrations/{merchant_id})
export interface PayPalMerchantProduct {
	name?: string
	vetting_status?: string
}

export interface PayPalMerchantIntegrationStatus {
	merchant_id?: string
	payments_receivable?: boolean
	primary_email_confirmed?: boolean
	products?: PayPalMerchantProduct[]
}
