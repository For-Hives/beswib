export interface User {
	address: null | string
	birthDate: null | string
	city: null | string
	clerkId: null | string
	clubAffiliation: null | string
	country: null | string
	createdAt: string
	email: string
	emergencyContactName: null | string
	emergencyContactPhone: null | string
	emergencyContactRelationship: null | string
	firstName: null | string
	gender: 'female' | 'male' | 'other' | null
	id: string
	isAdmin: boolean
	isOrganizer: boolean
	lastName: null | string
	licenseNumber: null | string
	medicalCertificateUrl: null | string
	paypalMerchantId: null | string
	phoneNumber: null | string
	postalCode: null | string
	role: 'admin' | 'user'
	tshirtSize: null | 'L' | 'M' | 'S' | 'XL' | 'XS' | 'XXL'
	updatedAt: string
}
