import type { User } from '@/models/user.model'

/**
 * Checks if a user profile is complete for purchasing bibs
 * Excludes documents and affiliations fields (medicalCertificateUrl, licenseNumber, clubAffiliation)
 */
export function isUserProfileComplete(user: User | null): boolean {
	if (!user) return false

	// Require both phoneNumber and contactEmail individually
	const requiredFields = [
		user.email,
		user.firstName,
		user.lastName,
		user.birthDate,
		user.phoneNumber,
		user.contactEmail,
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
	if (user.paypalMerchantId === null || user.paypalMerchantId === undefined || user.paypalMerchantId.trim() === '') {
		return false
	}

	// Accept either phoneNumber or contactEmail as a valid contact method
	const hasAtLeastOneContact =
		(typeof user.phoneNumber === 'string' && user.phoneNumber.trim() !== '') ||
		(typeof user.contactEmail === 'string' && user.contactEmail.trim() !== '')

	// Check for basic contact information required for selling
	const requiredSellerFields = [
		user.email,
		user.firstName,
		user.lastName,
		hasAtLeastOneContact ? 'ok' : null,
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
