import type { Event } from './event.model'
import type { User } from './user.model'

export interface Waitlist {
	id: string
	addedAt: Date
	eventId: Event['id']
	mailNotification: boolean

	optionPreferences: Record<string, string>
	userId: User['id']
}
