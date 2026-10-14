'use server'

import { auth } from '@clerk/nextjs/server'

import type { User } from '@/models/user.model'
import type { VerifiedEmail } from '@/models/verifiedEmail.model'
import { disconnectPayPalAccount, initiatePayPalOnboarding } from '@/services/paypal-onboarding.services'
import { fetchUserByClerkId, updateUser } from '@/services/user.services'
import {
	createVerifiedEmail,
	deleteVerifiedEmail,
	fetchVerifiedEmailById,
	fetchVerifiedEmailsByUserId,
	resendVerificationCode,
	verifyEmail,
} from '@/services/verifiedEmail.services'
import type { ServiceResult } from '@/types/service-result'
import { createErrorResult } from '@/types/service-result'

// Every export of this file is called by the browser, signed in or not. None takes the id of a user:
// the account they act on is the one of the Clerk session, and a verified e-mail is only touched by
// its owner. The services they call take any id from anyone, which is why the browser never calls them.

// The fields of the profile form. The rest of the record (role, Clerk id, account e-mail, PayPal
// merchant id, KYC flag) is decided by the server and the webhooks, never by a profile update
const PROFILE_FIELDS = [
	'firstName',
	'lastName',
	'birthDate',
	'gender',
	'phoneNumber',
	'contactEmail',
	'consentMarket',
	'emergencyContactName',
	'emergencyContactPhone',
	'emergencyContactRelationship',
	'address',
	'postalCode',
	'city',
	'country',
	'medicalCertificateUrl',
	'licenseNumber',
	'clubAffiliation',
] as const satisfies readonly (keyof User)[]

// The shape the waitlist form asks of an address, minus the two characters that end the quoted value
// of a PocketBase filter: the verified e-mail service writes the address into its filters as it comes
const EMAIL_PATTERN = /^[^\s@"\\]+@[^\s@"\\]+\.[^\s@"\\]+$/
const EMAIL_MAX_LENGTH = 320

async function getSessionUser(): Promise<null | User> {
	const { userId: clerkId } = await auth()
	if (clerkId == null || clerkId === '') return null
	return fetchUserByClerkId(clerkId)
}

// The verification code only travels by e-mail: a record handed to the browser never carries it
function withoutCode(verifiedEmail: VerifiedEmail): VerifiedEmail {
	return { ...verifiedEmail, verificationCode: '' }
}

function withoutCodes<T extends VerifiedEmail | VerifiedEmail[]>(result: ServiceResult<T>): ServiceResult<T> {
	if (result.data == null) return result
	const data = Array.isArray(result.data) ? result.data.map(withoutCode) : withoutCode(result.data)
	return { ...result, data: data as T }
}

/** The verified e-mail with this id when it belongs to the user, null otherwise (missing, or someone else's). */
async function fetchOwnVerifiedEmail(user: User, verifiedEmailId: string): Promise<null | VerifiedEmail> {
	if (typeof verifiedEmailId !== 'string' || verifiedEmailId === '') return null
	const verifiedEmail = await fetchVerifiedEmailById(verifiedEmailId)
	return verifiedEmail?.userId === user.id ? verifiedEmail : null
}

/**
 * The record of the signed-in user, null when there is no session.
 */
export async function getCurrentUserData(): Promise<null | User> {
	try {
		return await getSessionUser()
	} catch (error) {
		console.error('Error fetching current user data:', error)
		return null
	}
}

/**
 * Saves the profile form of the signed-in user.
 */
export async function updateUserProfile(data: Partial<User>) {
	try {
		const user = await getSessionUser()
		if (user == null) {
			throw new Error('Authentication required.')
		}

		const profile: Record<string, unknown> = {}
		if (typeof data === 'object' && data != null) {
			for (const field of PROFILE_FIELDS) {
				if (field in data) profile[field] = data[field]
			}
		}

		return await updateUser(user.id, profile as Partial<User>)
	} catch (error) {
		console.error('Error updating user profile:', error)
		throw error
	}
}

/**
 * Starts the PayPal onboarding of the signed-in user. PayPal answers the webhook with the tracking id
 * of the referral, which is the id of the user the merchant account gets linked to.
 */
export async function startPayPalOnboarding(): Promise<{ actionUrl?: string; error?: string; referralId?: string }> {
	const user = await getSessionUser()
	if (user == null) return { error: 'Authentication required.' }
	return initiatePayPalOnboarding(user.id)
}

/**
 * Unlinks the PayPal merchant account of the signed-in user.
 */
export async function disconnectPayPal(): Promise<{ error?: string; success?: boolean }> {
	const user = await getSessionUser()
	if (user == null) return { error: 'Authentication required.' }
	return disconnectPayPalAccount(user.id)
}

/**
 * The verified e-mails of the signed-in user.
 */
export async function fetchMyVerifiedEmails(): Promise<ServiceResult<VerifiedEmail[]>> {
	const user = await getSessionUser()
	if (user == null) return createErrorResult('FETCH_EMAILS_FAILED')
	return withoutCodes(await fetchVerifiedEmailsByUserId(user.id))
}

/**
 * Adds an e-mail address to the signed-in user and sends its verification code to that address.
 */
export async function addVerifiedEmail(email: string): Promise<ServiceResult<VerifiedEmail>> {
	const user = await getSessionUser()
	if (user == null) return createErrorResult('CREATE_EMAIL_FAILED')

	const address = typeof email === 'string' ? email.trim() : ''
	if (address.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(address)) {
		return createErrorResult('CREATE_EMAIL_FAILED')
	}

	return withoutCodes(await createVerifiedEmail({ userId: user.id, email: address }))
}

/**
 * Verifies an e-mail address of the signed-in user with the code they received.
 */
export async function confirmVerifiedEmail(
	verifiedEmailId: string,
	verificationCode: string
): Promise<ServiceResult<VerifiedEmail>> {
	const user = await getSessionUser()
	if (user == null) return createErrorResult('VERIFY_EMAIL_FAILED')

	const verifiedEmail = await fetchOwnVerifiedEmail(user, verifiedEmailId)
	if (verifiedEmail == null) return createErrorResult('VERIFY_EMAIL_FAILED')

	return withoutCodes(await verifyEmail({ verifiedEmailId: verifiedEmail.id, verificationCode }))
}

/**
 * Sends a new verification code for an e-mail address of the signed-in user.
 */
export async function resendVerifiedEmailCode(verifiedEmailId: string): Promise<ServiceResult<boolean>> {
	const user = await getSessionUser()
	if (user == null) return createErrorResult('RESEND_CODE_FAILED')

	const verifiedEmail = await fetchOwnVerifiedEmail(user, verifiedEmailId)
	if (verifiedEmail == null) return createErrorResult('RESEND_CODE_FAILED')

	return resendVerificationCode(verifiedEmail.id)
}

/**
 * Removes an e-mail address of the signed-in user.
 */
export async function removeVerifiedEmail(verifiedEmailId: string): Promise<ServiceResult<boolean>> {
	const user = await getSessionUser()
	if (user == null) return createErrorResult('DELETE_EMAIL_FAILED')

	const verifiedEmail = await fetchOwnVerifiedEmail(user, verifiedEmailId)
	if (verifiedEmail == null) return createErrorResult('DELETE_EMAIL_FAILED')

	return deleteVerifiedEmail(verifiedEmail.id)
}
