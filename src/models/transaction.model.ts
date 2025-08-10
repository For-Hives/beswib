import type { User } from './user.model'
import type { Bib } from './bib.model'

export interface Transaction {
	id: string
	amount: number
	bibId: Bib['id']

	paymentIntentId?: string
	platformFee: number
	status: 'claimed' | 'failed' | 'pending' | 'refunded' | 'succeeded'

	transactionDate: Date

	buyerUserId: User['id']
	sellerUserId: User['id']

	// PayPal-specific fields for webhook capture
	paypal_order_id: string
	paypal_capture_id: string
	payer_email: string
	payer_id?: string
	currency: string
	payment_status: string
	capture_time: string
	raw_webhook_payload: string
}
