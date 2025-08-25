import { describe, expect, it } from 'vitest'

import type { User } from '@/models/user.model'

import { isUserProfileComplete } from '@/lib/validation/user'

describe('isUserProfileComplete', () => {
	const completeUser: User = {
		updated: new Date(),
		role: 'user',
		postalCode: '75001',
		phoneNumber: '+33123456789',
		paypalMerchantId: null,
		paypal_kyc: false,
		medicalCertificateUrl: null,
		locale: 'fr',
		licenseNumber: null,
		lastName: 'Doe',
		id: '1',
		gender: 'male',
		firstName: 'John',
		emergencyContactRelationship: 'spouse',
		emergencyContactPhone: '+33987654321',
		emergencyContactName: 'Jane Doe',
		email: 'john.doe@example.com',
		created: new Date(),
		country: 'France',
		contactEmail: 'john.contact@example.com',
		consentMarket: false,
		clubAffiliation: null,
		clerkId: 'clerk_123',
		city: 'Paris',
		birthDate: new Date('1990-01-01'),
		address: '123 Main Street',
	}

	it('should return true for a complete user profile', () => {
		expect(isUserProfileComplete(completeUser)).toBe(true)
	})

	it('should return false for null user', () => {
		expect(isUserProfileComplete(null)).toBe(false)
	})

	it('should return true even when documents/affiliations are missing', () => {
		const userWithoutDocuments: User = {
			...completeUser,
			medicalCertificateUrl: null,
			licenseNumber: null,
			clubAffiliation: null,
		}
		expect(isUserProfileComplete(userWithoutDocuments)).toBe(true)
	})

	it('should return false when required fields are missing', () => {
		expect(isUserProfileComplete({ ...completeUser, email: null } as unknown as User)).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, firstName: null })).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, lastName: null })).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, birthDate: null })).toBe(false)
		// With the new rule, having at least one contact method (contactEmail or email) is acceptable
		expect(isUserProfileComplete({ ...completeUser, phoneNumber: null })).toBe(true)
		expect(isUserProfileComplete({ ...completeUser, emergencyContactName: null })).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, emergencyContactPhone: null })).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, emergencyContactRelationship: null })).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, address: null })).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, postalCode: null })).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, city: null })).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, country: null })).toBe(false)
		expect(isUserProfileComplete({ ...completeUser, gender: null })).toBe(false)
	})

	it('should return false when required fields are empty strings', () => {
		const userWithEmptyFields: User = {
			...completeUser,
			lastName: '   ', // whitespace only
			firstName: '',
		}
		expect(isUserProfileComplete(userWithEmptyFields)).toBe(false)
	})

	it('should return false when required fields are undefined', () => {
		const userWithUndefinedFields = {
			...completeUser,
			email: undefined,
		} as unknown as User

		expect(isUserProfileComplete(userWithUndefinedFields)).toBe(false)
	})
})
