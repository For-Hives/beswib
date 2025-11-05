import { getBibImageUrl } from '@/lib/utils/images'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'
import type { Organizer } from '@/models/organizer.model'
import type { User } from '@/models/user.model'
import type { CourseType } from '@/types/course-types'

/**
 * Maps database event type to BibSale event type
 */
export function mapEventTypeToBibSaleType(
	eventType: CourseType | undefined
): 'cycle' | 'other' | 'road' | 'trail' | 'triathlon' {
	if (!eventType) return 'other'

	const typeMap: Record<string, 'cycle' | 'other' | 'road' | 'trail' | 'triathlon'> = {
		triathlon: 'triathlon',
		trail: 'trail',
		road: 'road',
		other: 'other',
		cycle: 'cycle',
	}

	return typeMap[eventType] ?? 'other'
}

/**
 * Transforms an array of bibs to BibSale format, filtering out any that can't be transformed
 */
export function transformBibsToBibSales(
	bibs: (Bib & { expand?: { eventId: Event & { expand?: { organizer: Organizer } }; sellerUserId: User } })[]
): BibSale[] {
	return bibs.map(bib => transformBibToBibSale(bib)).filter((bibSale): bibSale is BibSale => bibSale != null)
}

/**
 * Transforms a database Bib with expanded relations into a BibSale format for the marketplace
 */
export function transformBibToBibSale(
	bib: Bib & { expand?: { eventId: Event & { expand?: { organizer: Organizer } }; sellerUserId: User } }
): BibSale | null {
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
		status,
		price: bib.price,
		originalPrice: bib.originalPrice ?? bib.price,
		lockedAt: bib.lockedAt ?? null,
		id: bib.id,
		event: {
			type: eventType,
			participantCount: event.participants ?? 0,
			name: event.name,
			location: event.location,
			image: getBibImageUrl(bib),
			id: event.id,
			distanceUnit,
			distance,
			date: new Date(event.eventDate),
		},
	}
}
