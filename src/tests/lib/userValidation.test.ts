import { describe, expect, it } from 'vitest'

import type { User } from '@/models/user.model'

import { isUserProfileComplete, isSellerProfileComplete } from '@/lib/userValidation'

describe('isUserProfileComplete', () => {
	const completeUser: User = {
		id: '1',
		clerkId: 'clerk_123',
		paypalMerchantId: 'merchant_123',
		role: 'user',
		email: 'test@example.com',
		firstName: 'John',
		lastName: 'Doe',
		birthDate: new Date('1990-01-01'),
		phoneNumber: '+1234567890',
		emergencyContactName: 'Jane Doe',
		emergencyContactPhone: '+1234567891',
		emergencyContactRelationship: 'Spouse',
		address: '123 Main St',
		postalCode: '12345',
		city: 'New York',
		country: 'USA',
		gender: 'male',
		medicalCertificateUrl: null,
		licenseNumber: null,
		clubAffiliation: null,
		created: new Date(),
		updated: new Date(),
	}

	it('should return true for complete user profile', () => {
		expect(isUserProfileComplete(completeUser)).toBe(true)
	})

	it('should return false for null user', () => {
		expect(isUserProfileComplete(null)).toBe(false)
	})

	it('should return true for user without optional documents', () => {
		const userWithoutDocuments = {
			...completeUser,
			medicalCertificateUrl: null,
			licenseNumber: null,
			clubAffiliation: null,
		}
		expect(isUserProfileComplete(userWithoutDocuments)).toBe(true)
	})

	it('should return false for user with missing required fields', () => {
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

	it('should return false for user with empty string fields', () => {
		const userWithEmptyFields = { ...completeUser, email: '', firstName: '', lastName: '' }
		expect(isUserProfileComplete(userWithEmptyFields)).toBe(false)
	})

	it('should return false for user with undefined fields', () => {
		const userWithUndefinedFields = { ...completeUser, email: undefined, firstName: undefined, lastName: undefined }
		expect(isUserProfileComplete(userWithUndefinedFields)).toBe(false)
	})
})

describe('isSellerProfileComplete', () => {
	const completeSellerUser: User = {
		id: '1',
		clerkId: 'clerk_123',
		paypalMerchantId: 'merchant_123',
		role: 'user',
		email: 'test@example.com',
		firstName: 'John',
		lastName: 'Doe',
		birthDate: new Date('1990-01-01'),
		phoneNumber: '+1234567890',
		emergencyContactName: 'Jane Doe',
		emergencyContactPhone: '+1234567891',
		emergencyContactRelationship: 'Spouse',
		address: '123 Main St',
		postalCode: '12345',
		city: 'New York',
		country: 'USA',
		gender: 'male',
		medicalCertificateUrl: null,
		licenseNumber: null,
		clubAffiliation: null,
		created: new Date(),
		updated: new Date(),
	}

	it('should return true for complete seller profile', () => {
		expect(isSellerProfileComplete(completeSellerUser)).toBe(true)
	})

	it('should return false for null user', () => {
		expect(isSellerProfileComplete(null)).toBe(false)
	})

	it('should return false for user without PayPal merchant ID', () => {
		const userWithoutPayPal = { ...completeSellerUser, paypalMerchantId: null }
		expect(isSellerProfileComplete(userWithoutPayPal)).toBe(false)
	})

	it('should return false for user with empty PayPal merchant ID', () => {
		const userWithEmptyPayPal = { ...completeSellerUser, paypalMerchantId: '' }
		expect(isSellerProfileComplete(userWithEmptyPayPal)).toBe(false)
	})

	it('should return false for user with missing required seller fields', () => {
		expect(isSellerProfileComplete({ ...completeSellerUser, email: null } as unknown as User)).toBe(false)
		expect(isSellerProfileComplete({ ...completeSellerUser, firstName: null })).toBe(false)
		expect(isSellerProfileComplete({ ...completeSellerUser, lastName: null })).toBe(false)
		expect(isSellerProfileComplete({ ...completeSellerUser, phoneNumber: null })).toBe(false)
		expect(isSellerProfileComplete({ ...completeSellerUser, address: null })).toBe(false)
		expect(isSellerProfileComplete({ ...completeSellerUser, postalCode: null })).toBe(false)
		expect(isSellerProfileComplete({ ...completeSellerUser, city: null })).toBe(false)
		expect(isSellerProfileComplete({ ...completeSellerUser, country: null })).toBe(false)
	})

	it('should return true for seller without non-required fields', () => {
		const sellerWithoutNonRequired = {
			...completeSellerUser,
			birthDate: null,
			emergencyContactName: null,
			emergencyContactPhone: null,
			emergencyContactRelationship: null,
			gender: null,
			medicalCertificateUrl: null,
			licenseNumber: null,
			clubAffiliation: null,
		}
		expect(isSellerProfileComplete(sellerWithoutNonRequired)).toBe(true)
	})

	it('should return false for user with empty string fields', () => {
		const userWithEmptyFields = { ...completeSellerUser, email: '', firstName: '', lastName: '' }
		expect(isSellerProfileComplete(userWithEmptyFields)).toBe(false)
	})

	it('should return false for user with undefined fields', () => {
		const userWithUndefinedFields = {
			...completeSellerUser,
			email: undefined,
			firstName: undefined,
			lastName: undefined,
		}
		expect(isSellerProfileComplete(userWithUndefinedFields)).toBe(false)
	})
})
