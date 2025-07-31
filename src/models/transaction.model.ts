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

	createdAt: Date
	updatedAt: Date
}
