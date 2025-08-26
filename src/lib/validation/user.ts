import type { User } from '@/models/user.model'

/**
 * Helper function to check if phone number is meaningful (not just country code)
 */
function isPhoneNumberValid(phone: string | null | undefined): boolean {
	if (phone == null || phone.trim() === '') return false
	// Consider phone number as empty if it's just a country code (e.g., "+33" or "+1")
	if (phone.match(/^\+\d{1,3}$/) != null) return false
	return true
}

/**
 * Checks if a user profile is complete for purchasing bibs
 * Excludes documents and affiliations fields (medicalCertificateUrl, licenseNumber, clubAffiliation)
 */
export function isUserProfileComplete(user: User | null): boolean {
	if (!user) return false

	// Accept at least one contact method: valid phoneNumber OR contactEmail (fallback to primary email)
	const hasAtLeastOneContact =
		isPhoneNumberValid(user.phoneNumber) ||
		(typeof user.contactEmail === 'string' && user.contactEmail.trim() !== '') ||
		// Fallback: some records may not have contactEmail populated; use primary email as contact
		(typeof user.email === 'string' && user.email.trim() !== '')

	const requiredFields = [
		user.email,
		user.firstName,
		user.lastName,
		user.birthDate,
		hasAtLeastOneContact ? 'ok' : null,
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
		if (field == null || field === undefined) return false
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
	if (user.paypalMerchantId == null || user.paypalMerchantId === undefined || user.paypalMerchantId.trim() === '') {
		return false
	}

	// Ensure PayPal KYC is complete (payments receivable + email confirmed)
	if (user.paypal_kyc !== true) {
		return false
	}

	// Accept either valid phoneNumber or contactEmail as a valid contact method
	const hasAtLeastOneContact =
		isPhoneNumberValid(user.phoneNumber) ||
		(typeof user.contactEmail === 'string' && user.contactEmail.trim() !== '') ||
		// Fallback to primary email if contactEmail is not set
		(typeof user.email === 'string' && user.email.trim() !== '')

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
		if (field == null || field === undefined) return false
		if (typeof field === 'string') {
			return field.trim() !== ''
		}
		return true
	})
}
