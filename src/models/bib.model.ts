import type { Event } from './event.model'
import type { User } from './user.model'
import type { VerifiedEmail } from './verifiedEmail.model'

export interface Bib {
	id: string
	eventId: Event['id']

	buyerUserId?: User['id']

	originalPrice?: number
	price: number

	privateListingToken?: string
	registrationNumber: string

	sellerUserId: User['id']
	linkedEmailId?: VerifiedEmail['id'] // Email used for registration on event website
	status: 'available' | 'expired' | 'sold' | 'validation_failed' | 'withdrawn'

	listed: 'private' | 'public' | null
	validated: boolean
	optionValues: Record<string, string>

	lockedAt?: Date | string | null // RFC3399 Date format
}
