export interface User {
	address: null | string
	birthDate: null | string
	city: null | string
	clerkId: null | string
	country: null | string
	createdAt: string
	email: string
	emergencyContactName: null | string
	emergencyContactPhone: null | string
	firstName: null | string
	id: string
	isAdmin: boolean
	isOrganizer: boolean
	lastName: null | string
	phoneNumber: null | string
	postalCode: null | string
	role: 'admin' | 'user'
	stripeAccountId: null | string
	stripeAccountVerified: boolean
	updatedAt: string
}
