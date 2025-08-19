import type { Event } from './event.model'
import type { User } from './user.model'
import type { Bib } from './bib.model'
import type { Organizer } from './organizer.model'

export interface Transaction {
	id: string
	amount: number
	bib_id: Bib['id']

	platform_fee: number
	status: 'claimed' | 'failed' | 'pending' | 'refunded' | 'succeeded'

	transactionDate: Date

	buyer_user_id: User['id']
	seller_user_id: User['id']

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

// Richer transaction type with PocketBase expand for bib and event
export type TransactionWithExpand = Transaction & {
	expand?: { bib_id?: Bib & { expand?: { eventId: Event & { expand?: { organizer: Organizer } } } } }
}
