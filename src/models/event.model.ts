import { EventOption } from './eventOption.model'
import { Organizer } from './organizer.model'

export interface Event {
	id: string
	name: string
	eventDate: Date
	description: string
	location: string

	bibPickupWindowBeginDate: Date
	bibPickupWindowEndDate: Date
	transferDeadline?: Date // last date for resale 📅

	distanceKm?: number
	elevationGainM?: number
	parcoursUrl?: string // GPX files, map links 🗺️
	participants?: number

	officialStandardPrice?: number
	options: EventOption[] | null
	bibPickupLocation?: string
	registrationUrl?: string // link to registration 🔗

	typeCourse: 'road' | 'trail' | 'triathlon' | 'cycle' | 'other'

	// Organizer relation 🤝
	organizer: Organizer['id'] // RELATION_RECORD_ID 🔗
}
