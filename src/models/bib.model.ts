import { Event } from './event.model'
import { User } from './user.model'

export interface Bib {
	id: string
	eventId: Event['id']

	buyerUserId?: User['id']

	originalPrice?: number
	price: number

	privateListingToken?: string
	registrationNumber: string

	sellerUserId: User['id']
	status: 'available' | 'expired' | 'sold' | 'validation_failed' | 'withdrawn'

	listed: 'private' | 'public' | null
	validated: boolean
	optionValues: Record<string, string>

	lockedAt?: Date | null // Timestamp when the bib was locked for purchase
}
