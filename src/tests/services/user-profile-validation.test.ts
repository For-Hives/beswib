import { describe, expect, it } from 'vitest'
import {
	isPaypalMerchantComplete,
	isSellerAddressComplete,
	isSellerContactInfoComplete,
	isSellerProfileComplete,
	isUserProfileComplete,
} from '@/lib/validation/user'
import type { User } from '@/models/user.model'

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

describe('seller profile validation functions', () => {
	const completeSellerUser: User = {
		updated: new Date(),
		role: 'user',
		postalCode: '75001',
		phoneNumber: '+33123456789',
		paypalMerchantId: 'MERCHANT123',
		paypal_kyc: true,
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

	describe('isPaypalMerchantComplete', () => {
		it('should return true when PayPal merchant setup is complete', () => {
			expect(isPaypalMerchantComplete(completeSellerUser)).toBe(true)
		})

		it('should return false when PayPal merchant ID is missing', () => {
			const userWithoutMerchantId = { ...completeSellerUser, paypalMerchantId: null }
			expect(isPaypalMerchantComplete(userWithoutMerchantId)).toBe(false)
		})

		it('should return false when PayPal KYC is not complete', () => {
			const userWithoutKyc = { ...completeSellerUser, paypal_kyc: false }
			expect(isPaypalMerchantComplete(userWithoutKyc)).toBe(false)
		})

		it('should return false for null user', () => {
			expect(isPaypalMerchantComplete(null)).toBe(false)
		})
	})

	describe('isSellerContactInfoComplete', () => {
		it('should return true when all contact info is complete', () => {
			expect(isSellerContactInfoComplete(completeSellerUser)).toBe(true)
		})

		it('should return true with just phone number', () => {
			const userWithPhoneOnly = { ...completeSellerUser, contactEmail: null }
			expect(isSellerContactInfoComplete(userWithPhoneOnly)).toBe(true)
		})

		it('should return true with just contact email', () => {
			const userWithEmailOnly = { ...completeSellerUser, phoneNumber: null }
			expect(isSellerContactInfoComplete(userWithEmailOnly)).toBe(true)
		})

		it('should return true with just primary email when contact fields are missing', () => {
			const userWithPrimaryEmailOnly = {
				...completeSellerUser,
				phoneNumber: null,
				contactEmail: null,
			}
			expect(isSellerContactInfoComplete(userWithPrimaryEmailOnly)).toBe(true)
		})

		it('should return false when contact info is missing', () => {
			const userWithoutContact = {
				...completeSellerUser,
				phoneNumber: null,
				email: null,
				contactEmail: null,
			} as unknown as User
			expect(isSellerContactInfoComplete(userWithoutContact)).toBe(false)
		})

		it('should return false when basic info is missing', () => {
			expect(isSellerContactInfoComplete({ ...completeSellerUser, firstName: null })).toBe(false)
			expect(isSellerContactInfoComplete({ ...completeSellerUser, lastName: null })).toBe(false)
		})

		it('should return false for null user', () => {
			expect(isSellerContactInfoComplete(null)).toBe(false)
		})
	})

	describe('isSellerAddressComplete', () => {
		it('should return true when all address info is complete', () => {
			expect(isSellerAddressComplete(completeSellerUser)).toBe(true)
		})

		it('should return false when address fields are missing', () => {
			expect(isSellerAddressComplete({ ...completeSellerUser, address: null })).toBe(false)
			expect(isSellerAddressComplete({ ...completeSellerUser, postalCode: null })).toBe(false)
			expect(isSellerAddressComplete({ ...completeSellerUser, city: null })).toBe(false)
			expect(isSellerAddressComplete({ ...completeSellerUser, country: null })).toBe(false)
		})

		it('should return false for null user', () => {
			expect(isSellerAddressComplete(null)).toBe(false)
		})
	})

	describe('isSellerProfileComplete', () => {
		it('should return true when all seller requirements are met', () => {
			expect(isSellerProfileComplete(completeSellerUser)).toBe(true)
		})

		it('should return false when PayPal setup is incomplete', () => {
			const userWithoutPaypal = { ...completeSellerUser, paypalMerchantId: null }
			expect(isSellerProfileComplete(userWithoutPaypal)).toBe(false)
		})

		it('should return false when contact info is incomplete', () => {
			const userWithoutContact = {
				...completeSellerUser,
				firstName: null,
			}
			expect(isSellerProfileComplete(userWithoutContact)).toBe(false)
		})

		it('should return false when address info is incomplete', () => {
			const userWithoutAddress = { ...completeSellerUser, address: null }
			expect(isSellerProfileComplete(userWithoutAddress)).toBe(false)
		})

		it('should return false for null user', () => {
			expect(isSellerProfileComplete(null)).toBe(false)
		})
	})
})
