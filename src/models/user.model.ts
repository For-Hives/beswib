export interface User {
	id: string
	clerkId: null | string
	paypalMerchantId: null | string
	role: 'admin' | 'user'

	email: string
	firstName: null | string
	lastName: null | string

	birthDate: null | string
	phoneNumber: null | string
	emergencyContactName: null | string
	emergencyContactPhone: null | string
	emergencyContactRelationship: null | string

	address: null | string
	postalCode: null | string
	city: null | string
	country: null | string

	gender: 'female' | 'male' | 'other' | null

	medicalCertificateUrl: null | string
	licenseNumber: null | string
	clubAffiliation: null | string

	created: Date
	updated: Date
}
