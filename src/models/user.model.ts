export interface User {
	id: string
	clerkId: null | string
	paypalMerchantId: null | string
	role: 'admin' | 'user'

	email: string
	contactEmail: null | string
	firstName: null | string
	lastName: null | string

	birthDate: null | string | Date
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

// PocketBase user record minimal shape used by services mapping
export interface PbUserRecordMinimal {
	id: string
	clerkId: string | null
	paypalMerchantId: string | null
	role: 'admin' | 'user'
	email: string
	contactEmail: string | null
	firstName: string | null
	lastName: string | null
	birthDate: string | Date | null
	phoneNumber: string | null
	emergencyContactName: string | null
	emergencyContactPhone: string | null
	emergencyContactRelationship: string | null
	address: string | null
	postalCode: string | null
	city: string | null
	country: string | null
	gender: 'female' | 'male' | 'other' | null
	medicalCertificateUrl: string | null
	licenseNumber: string | null
	clubAffiliation: string | null
	created: string
	updated: string
}
