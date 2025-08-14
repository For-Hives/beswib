// Centralized marketplace-related view models used by UI and services

export interface BibSale {
	id: string
	price: number
	originalPrice: number
	status: 'available' | 'sold'
	lockedAt: Date | string | null
	user: {
		id: string
		firstName: string
	}
	event: {
		id: string
		name: string
		image: string
		date: Date
		distance: number
		distanceUnit: 'km' | 'mi'
		location: string
		participantCount: number
		type: 'cycling' | 'other' | 'running' | 'swimming' | 'trail' | 'triathlon'
	}
}

export interface BibSaleSimplified {
	id: string
	price: number
	originalPrice: number
	event: {
		name: string
		image: string
		date: Date
		distance: number
		distanceUnit: string
		location: string
		participantCount: number
	}
}
