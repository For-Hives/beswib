import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'

export const mockUser: User = {
	updated: new Date('2024-01-01T00:00:00.000Z'),
	role: 'user',
	postalCode: null,
	phoneNumber: null,
	paypalMerchantId: null,
	paypal_kyc: false,
	medicalCertificateUrl: null,

	locale: 'fr',
	licenseNumber: null,
	lastName: 'User',
	id: 'test_user_123456',
	gender: null,
	firstName: 'Test',
	emergencyContactRelationship: null,
	emergencyContactPhone: null,
	emergencyContactName: null,
	email: 'test@example.com',
	created: new Date('2024-01-01T00:00:00.000Z'),
	country: null,
	contactEmail: null,
	clubAffiliation: null,
	clerkId: 'clerk_user1',
	city: null,
	birthDate: null,
	address: null,
}

export const mockEvent: Event = {
	typeCourse: 'trail',
	organizer: 'organizer1',
	options: null,
	name: 'Test Event',
	location: 'Test Location',
	id: 'test_event_123456',
	eventDate: new Date('2025-12-31T23:59:59Z'),
	description: 'Test Event Description',
	bibPickupWindowEndDate: new Date('2025-12-31'),
	bibPickupWindowBeginDate: new Date('2025-12-30'),
}

export const mockBib: Bib & { expand?: { eventId: Event; sellerUserId: User } } = {
	validated: false,
	status: 'available',
	sellerUserId: 'test_user_123456',
	registrationNumber: 'REG123',
	price: 50,
	originalPrice: 40,
	optionValues: {},
	listed: null,
	id: 'test_bib_123456',
	expand: {
		sellerUserId: mockUser,
		eventId: mockEvent,
	},
	eventId: 'test_event_123456',
}
