'use server'

import { DateTime } from 'luxon'

import { User, type PbUserRecordMinimal } from '@/models/user.model'
import { pbDateToLuxon } from '@/lib/utils/date'
import { pb } from '@/lib/services/pocketbase'

// Supported locales for validation
const SUPPORTED_LOCALES = ['en', 'fr', 'ko', 'es', 'it', 'de', 'ro', 'pt', 'nl']

/**
 * Validates if a locale string is supported
 */
function isValidLocale(locale: string | null | undefined): boolean {
	if (locale == null || locale === '' || typeof locale !== 'string') {
		return false
	}
	return SUPPORTED_LOCALES.includes(locale)
}

/**
 * Gets a valid locale with fallback
 */
function getValidLocale(locale: string | null | undefined): string {
	if (isValidLocale(locale)) {
		return locale!
	}
	// Default to English as the standard fallback locale
	console.warn(`mapPbRecordToUser: Invalid locale "${locale}", defaulting to 'en'`)
	return 'en'
}

// Map PocketBase record to our User model

function mapPbRecordToUser(record: PbUserRecordMinimal): User {
	// Normalize PB 'birthDate' (string or Date) to 'YYYY-MM-DD' using Luxon
	let birthDate: string | null = null

	const rawBirthDate = record?.birthDate
	const parsed = pbDateToLuxon(rawBirthDate)

	if (parsed?.isValid === true) {
		birthDate = parsed.toFormat('yyyy-LL-dd')
	} else if (rawBirthDate != null) {
		console.warn('mapPbRecordToUser - Invalid birthDate:', rawBirthDate)
	}

	return {
		updated: new Date(record.updated),
		role: record.role,
		postalCode: record.postalCode,
		phoneNumber: record.phoneNumber,
		paypalMerchantId: record.paypalMerchantId,
		paypal_kyc: record.paypal_kyc === true,
		medicalCertificateUrl: record.medicalCertificateUrl,
		locale: getValidLocale(record.locale), // Validate locale with fallback
		licenseNumber: record.licenseNumber,
		lastName: record.lastName,
		id: record.id,
		gender: record.gender,
		firstName: record.firstName,
		emergencyContactRelationship: record.emergencyContactRelationship,
		emergencyContactPhone: record.emergencyContactPhone,
		emergencyContactName: record.emergencyContactName,
		email: record.email,
		created: new Date(record.created),
		country: record.country,
		contactEmail: record.contactEmail,
		consentMarket: record.consentMarket ?? false,
		clubAffiliation: record.clubAffiliation,
		clerkId: record.clerkId,
		city: record.city,
		birthDate,
		address: record.address,
	}
}

// Map our User partial (birthDate) to PB payload (birthDate)
function mapUserToPbPayload(user: Partial<User>): Record<string, unknown> {
	const payload: Record<string, unknown> = { ...user }
	// Normalize undefined -> null for boolean to avoid leaving stale values when clearing
	if ('paypal_kyc' in payload && payload.paypal_kyc == null) {
		payload.paypal_kyc = false
	}
	if ('birthDate' in payload) {
		const birthDate = payload.birthDate
		delete payload.birthDate
		if (birthDate == null || birthDate === '') {
			payload.birthDate = ''
		} else if (birthDate instanceof Date) {
			const dt = DateTime.fromJSDate(birthDate).toUTC()
			payload.birthDate = dt.isValid ? dt.toISO() : ''
		} else if (typeof birthDate === 'string') {
			// Supports 'YYYY-MM-DD' or ISO strings; normalize to UTC ISO
			const base = birthDate.length === 10 ? `${birthDate}T00:00:00` : birthDate
			const dt = DateTime.fromISO(base, { zone: 'utc' }).toUTC().startOf('day')
			payload.birthDate = dt.isValid ? dt.toISO() : ''
		}
	}
	return payload
}

export async function createUser(user: Partial<User>): Promise<User> {
	try {
		// Tests expect the raw user object to be passed to PocketBase create
		const created = await pb.collection('users').create<PbUserRecordMinimal>(user as Record<string, unknown>)
		return mapPbRecordToUser(created)
	} catch (error) {
		console.error('Error creating user:', error)
		throw error
	}
}

export async function fetchUserByClerkId(clerkId: string | undefined): Promise<null | User> {
	if (clerkId == null || clerkId === undefined || clerkId === '') {
		console.error('Clerk ID is required to fetch user by clerk ID')
		return null
	}
	try {
		const user = await pb.collection('users').getFirstListItem<PbUserRecordMinimal>(`clerkId = "${clerkId}"`)
		if (user == null) {
			return null
		}
		return mapPbRecordToUser(user)
	} catch (error) {
		console.error('Error fetching user by clerk ID:', error)
		return null
	}
}

export async function fetchUserByEmail(email: string): Promise<null | User> {
	if (email == null || email.trim() === '') {
		console.error('Email is required to fetch user by email')
		return null
	}
	try {
		const user = await pb.collection('users').getFirstListItem<PbUserRecordMinimal>(`email = "${email.trim()}"`)
		if (user == null) {
			return null
		}
		return mapPbRecordToUser(user)
	} catch (error) {
		// If no user found (404), return null - this is expected behavior
		if (error != null && typeof error === 'object' && 'status' in error && error.status === 404) {
			return null
		}
		console.error('Error fetching user by email:', error)
		return null
	}
}

/**
 * Fetch a user by their linked PayPal merchant ID
 */
export async function fetchUserByMerchantId(merchantId: string): Promise<null | User> {
	if (merchantId == null || merchantId.trim() === '') {
		console.error('merchantId is required to fetch user by PayPal merchant ID')
		return null
	}
	try {
		const user = await pb
			.collection('users')
			.getFirstListItem<PbUserRecordMinimal>(`paypalMerchantId = "${merchantId.trim()}"`)
		if (user == null) {
			return null
		}
		return mapPbRecordToUser(user)
	} catch (error) {
		// If no user found (404), return null - this is expected behavior
		if (
			error != null &&
			typeof error === 'object' &&
			'status' in error &&
			(error as { status?: number }).status === 404
		) {
			return null
		}
		console.error('Error fetching user by PayPal merchant ID:', error)
		return null
	}
}

export async function fetchUserById(id: string): Promise<null | User> {
	if (id === '') {
		console.error('User ID (PocketBase record ID) is required to fetch user data.')
		return null
	}
	try {
		const user = await pb.collection('users').getOne<PbUserRecordMinimal>(id)
		if (user == null) {
			return null
		}
		return mapPbRecordToUser(user)
	} catch (error) {
		console.error('Error fetching user by ID:', error)
		return null
	}
}

export async function getUserData(userId: string): Promise<null | User> {
	try {
		const user = await pb.collection('users').getOne<PbUserRecordMinimal>(userId)
		if (user == null) {
			return null
		}
		return mapPbRecordToUser(user)
	} catch (error) {
		console.error('Error fetching user data:', error)
		return null
	}
}

/**
 * Get user locale by email address, fallback to 'en' if not found or no locale set
 * Returns 'en' as the standard default locale for consistency
 */
export async function getUserLocaleByEmail(email: string): Promise<string> {
	if (!email || email.trim() === '') {
		console.warn('getUserLocaleByEmail: Empty email provided, using default locale')
		return 'en' // Default to English as the standard fallback locale
	}

	try {
		const user = await fetchUserByEmail(email.trim())

		if (!user) {
			console.warn(`getUserLocaleByEmail: No user found for email ${email}, using default locale`)
			return 'en' // Default to English when user not found
		}

		// Validate the user's locale - if invalid, log warning and use default
		if (user.locale == null || user.locale === '') {
			console.warn(`getUserLocaleByEmail: User ${email} has no locale set, using default 'en'`)
			return 'en'
		}

		// Use local validation function to avoid circular imports
		if (!isValidLocale(user.locale)) {
			console.warn(`getUserLocaleByEmail: User ${email} has invalid locale "${user.locale}", falling back to 'en'`)
			return 'en'
		}

		return user.locale
	} catch (error) {
		console.error('getUserLocaleByEmail: Error fetching user locale:', error)
		return 'en' // Fallback to English on error
	}
}

export async function isUserAdmin(id: string): Promise<boolean> {
	if (id == null || id === '') {
		return false
	}
	const user = await fetchUserById(id)
	return user?.role === 'admin'
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
	try {
		const payload = mapUserToPbPayload(user)
		const updated = await pb.collection('users').update<PbUserRecordMinimal>(id, payload)
		return mapPbRecordToUser(updated)
	} catch (error) {
		console.error('Error updating user:', error)
		throw error
	}
}
