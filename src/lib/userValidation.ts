import type { User } from '@/models/user.model'

/**
 * Checks if a user profile is complete for purchasing bibs
 * Excludes documents and affiliations fields (medicalCertificateUrl, licenseNumber, clubAffiliation)
 */
export function isUserProfileComplete(user: User | null): boolean {
	if (!user) return false

	const requiredFields = [
		user.email,
		user.firstName,
		user.lastName,
		user.birthDate,
		user.phoneNumber,
		user.emergencyContactName,
		user.emergencyContactPhone,
		user.emergencyContactRelationship,
		user.address,
		user.postalCode,
		user.city,
		user.country,
		user.gender,
	]

	return requiredFields.every(field => {
		if (field === null || field === undefined) return false
		if (field instanceof Date) {
			return !isNaN(field.getTime())
		}
		if (typeof field === 'string') {
			return field.trim() !== ''
		}
		return true
	})
}

/**
 * Checks if a user profile is complete for selling bibs (merchant profile)
 * Requires PayPal merchant ID and basic contact information
 */
export function isSellerProfileComplete(user: User | null): boolean {
	if (!user) return false

	// Check if PayPal merchant ID is configured
	if (!user.paypalMerchantId || user.paypalMerchantId.trim() === '') {
		return false
	}

	// Check for basic contact information required for selling
	const requiredSellerFields = [
		user.email,
		user.firstName,
		user.lastName,
		user.phoneNumber,
		user.address,
		user.postalCode,
		user.city,
		user.country,
	]

	return requiredSellerFields.every(field => {
		if (field === null || field === undefined) return false
		if (typeof field === 'string') {
			return field.trim() !== ''
		}
		return true
	})
}
