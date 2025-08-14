import type { Event } from './event.model'
import type { User } from './user.model'

export interface Waitlist {
	id: string
	added_at: Date | string
	event_id: Event['id']
	mail_notification: boolean

	optionPreferences: Record<string, string>
	user_id: User['id'] | null // Allow null for email-only subscriptions
	email?: string // Direct email for non-authenticated users
}
