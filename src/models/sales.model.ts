import type { PayPalPaymentCaptureResource } from '@/models/paypal.model'

export type SalesCreateInput = {
	buyerUserId: string
	sellerMerchantId: string // PayPal merchant id
	bibId: string
	locale?: string // User locale for PayPal return URLs
}

export type SalesCreateOutput = {
	orderId: string
	transaction: { id: string }
}

export type SalesCompleteInput = {
	event: {
		resource: PayPalPaymentCaptureResource & {
			payer?: { payer_id?: string }
			update_time?: string
			create_time?: string
		}
	}
}

export type SalesCompleteOutput = {
	transactionId: string | null
	bibId: string | null
}
