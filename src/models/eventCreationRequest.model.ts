import { User } from './user.model'

export interface EventCreationRequest {
	id: string
	name: string
	location: string
	message?: string

	eventDate?: Date
	status: 'accepted' | 'rejected' | 'waiting'
	userId: User['id']

	created: Date
	updated: Date
}
