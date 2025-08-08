import { describe, expect, it } from 'vitest'

import { isUserProfileComplete } from '@/lib/userValidation'
import type { User } from '@/models/user.model'

describe('isUserProfileComplete', () => {
	const completeUser: User = {
		id: '1',
		clerkId: 'clerk_123',
		paypalMerchantId: null,
		role: 'user',
		email: 'john.doe@example.com',
		contactEmail: 'john.contact@example.com',
		firstName: 'John',
		lastName: 'Doe',
		birthDate: new Date('1990-01-01'),
		phoneNumber: '+33123456789',
		emergencyContactName: 'Jane Doe',
		emergencyContactPhone: '+33987654321',
		emergencyContactRelationship: 'spouse',
		address: '123 Main Street',
		postalCode: '75001',
		city: 'Paris',
		country: 'France',
		gender: 'male',
		medicalCertificateUrl: null,
		licenseNumber: null,
		clubAffiliation: null,
		created: new Date(),
		updated: new Date(),
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
		expect(isUserProfileComplete({ ...completeUser, phoneNumber: null })).toBe(false)
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
			firstName: '',
			lastName: '   ', // whitespace only
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
