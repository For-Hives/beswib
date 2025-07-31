export interface Organizer {
	id: string
	name: string
	logo?: string // filename.jpg 🖼️
	email: string

	website?: string
	isPartnered: boolean

	created: Date
	updated: Date
}

// For creation forms that include file upload 📤
export interface OrganizerWithLogoFile extends Omit<Organizer, 'created' | 'id' | 'updated'> {
	logoFile?: File
}
