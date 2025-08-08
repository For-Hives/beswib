import type { BibSale } from '@/components/marketplace/CardMarket'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'

/**
 * Maps database event type to BibSale event type
 */
export function mapEventTypeToBibSaleType(
	eventType: 'road' | 'trail' | 'triathlon' | 'cycle' | undefined
): 'cycling' | 'other' | 'running' | 'swimming' | 'trail' | 'triathlon' {
	if (!eventType) return 'other'

	const typeMap: Record<string, 'cycling' | 'other' | 'running' | 'swimming' | 'trail' | 'triathlon'> = {
		cycle: 'cycling',
		triathlon: 'triathlon',
		trail: 'trail',
		road: 'running',
	}

	return typeMap[eventType] ?? 'other'
}

/**
 * Transforms an array of bibs to BibSale format, filtering out any that can't be transformed
 */
export function transformBibsToBibSales(
	bibs: (Bib & { expand?: { eventId: Event; sellerUserId: User } })[]
): BibSale[] {
	return bibs.map(bib => transformBibToBibSale(bib)).filter((bibSale): bibSale is BibSale => bibSale !== null)
}

/**
 * Transforms a database Bib with expanded relations into a BibSale format for the marketplace
 */
export function transformBibToBibSale(bib: Bib & { expand?: { eventId: Event; sellerUserId: User } }): BibSale | null {
	// Check if we have the required expanded data
	if (bib.expand?.eventId == null || bib.expand?.sellerUserId == null) {
		console.warn(`Bib ${bib.id} missing required expanded data`)
		return null
	}

	const event = bib.expand.eventId
	const seller = bib.expand.sellerUserId

	// Transform event type to match BibSale interface
	const eventType = mapEventTypeToBibSaleType(event.typeCourse)

	// Calculate distance in km (assuming distanceKm is already in km)
	const distance = event.distanceKm ?? 0
	const distanceUnit: 'km' | 'mi' = 'km'

	// Map bib status to BibSale status
	const status: 'available' | 'sold' = bib.status === 'available' ? 'available' : 'sold'

	return {
		user: {
			lastName: seller.lastName ?? '',
			id: seller.id,
			firstName: seller.firstName ?? 'Anonymous',
		},
		lockedAt: bib.lockedAt ?? null,
		status,
		price: bib.price,
		originalPrice: bib.originalPrice ?? bib.price,
		id: bib.id,
		event: {
			type: eventType,
			participantCount: event.participants ?? 0,
			name: event.name,
			location: event.location,
			image: generateEventImageUrl(event.typeCourse),
			id: event.id,
			distanceUnit,
			distance,
			date: new Date(event.eventDate),
		},
	}
}

/**
 * Generates an event image URL based on event type
 */
function generateEventImageUrl(eventType: 'road' | 'trail' | 'triathlon' | 'cycle'): string {
	const imageMap: Record<string, string> = {
		cycle: '/bib-blue.png',
		triathlon: '/bib-red.png',
		trail: '/bib-orange.png',
		road: '/bib-green.png',
	}

	return imageMap[eventType] ?? '/bib-pink.png'
}
