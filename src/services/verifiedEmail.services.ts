'use server'

import { DateTime } from 'luxon'
import {
	MAX_DAILY_ATTEMPTS,
	RESEND_COOLDOWN_MINUTES,
	VERIFICATION_EXPIRY_MINUTES,
} from '@/constants/verifiedEmail.constant'
import { pb } from '@/lib/services/pocketbase'
import { pbDateToLuxon } from '@/lib/utils/date'
import type { CreateVerifiedEmailRequest, VerifiedEmail, VerifyEmailRequest } from '@/models/verifiedEmail.model'
import { sendVerificationEmail } from '@/services/notification.service'
import type { ServiceResult } from '@/types/service-result'
import { createErrorResult, createSuccessResult } from '@/types/service-result'

/**
 * Helper function to handle PocketBase errors consistently
 */
function handlePocketBaseError(error: unknown, operation: string): void {
	console.error(`Error ${operation}:`, error)
	const errorObj = error as { response?: unknown }
	console.error(errorObj.response ?? error)

	// Provide helpful error message for missing collection
	if (error instanceof Error && error.message.includes('404')) {
		console.error('❌ The "verifiedEmails" collection does not exist in PocketBase.')
		console.error('📋 Please run: node scripts/setup-verified-emails-collection.js')
		console.error('📖 Or see: docs/pocketbase-verifiedemails-setup.md for manual setup')
	}
}

export interface SpamCheckResult {
	canSend: boolean
	reason?: string
}

/**
 * Checks if the user can send another verification email (spam protection)
 */
async function canSendVerificationEmail(userId: string, email: string): Promise<SpamCheckResult> {
	try {
		// Check for recent attempts (5 minute cooldown)
		const recentCutoff = DateTime.now().minus({ minutes: RESEND_COOLDOWN_MINUTES }).toISO()
		const recentRecords = await pb.collection('verifiedEmails').getFullList({
			filter: `userId = "${userId}" && email = "${email}" && updated >= "${recentCutoff}"`,
		})

		if (recentRecords.length > 0) {
			return {
				reason: `Please wait ${RESEND_COOLDOWN_MINUTES} minutes before requesting another verification code.`,
				canSend: false,
			}
		}

		// Check daily limit (max 3 attempts per day)
		const dailyCutoff = DateTime.now().startOf('day').toISO()
		const dailyRecords = await pb.collection('verifiedEmails').getFullList({
			filter: `userId = "${userId}" && email = "${email}" && updated >= "${dailyCutoff}"`,
		})

		if (dailyRecords.length >= MAX_DAILY_ATTEMPTS) {
			return {
				reason: `Maximum daily verification attempts reached. Please try again tomorrow.`,
				canSend: false,
			}
		}

		return { canSend: true }
	} catch (error) {
		console.error('Error checking spam protection:', error)
		return { canSend: true } // Allow sending if check fails
	}
}

// PocketBase RecordModel interface for type safety
interface PocketBaseRecord {
	id: string
	created: string
	updated: string
	[key: string]: unknown
}

interface VerifiedEmailRecord extends PocketBaseRecord {
	userId: string
	email: string
	verificationCode: string
	isVerified: boolean
	verifiedAt: string | null
	expiresAt: string
}

/**
 * Generates a random verification code
 */
function generateVerificationCode(): string {
	// Generate a 6-digit numeric code using a CSPRNG (Web Crypto API)
	const cryptoObj: Crypto | undefined = (globalThis as unknown as { crypto?: Crypto }).crypto
	if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
		// In the extremely unlikely case Web Crypto is unavailable in this runtime, fail fast
		throw new Error('Secure random generator is unavailable')
	}

	const min = 100_000
	const max = 1_000_000 // exclusive
	const range = max - min // 900_000
	const arr = new Uint32Array(1)
	const maxUnsigned = 0x1_0000_0000 // 2^32
	const limit = Math.floor(maxUnsigned / range) * range

	let x = 0
	do {
		cryptoObj.getRandomValues(arr)
		x = arr[0]
	} while (x >= limit)

	return (min + (x % range)).toString()
}

/**
 * Maps PocketBase record to VerifiedEmail model
 */
function mapPbVerifiedEmailToModel(record: unknown): VerifiedEmail {
	const typedRecord = record as VerifiedEmailRecord
	return {
		verifiedAt:
			typedRecord.verifiedAt != null && typedRecord.verifiedAt !== undefined && typedRecord.verifiedAt !== ''
				? (pbDateToLuxon(typedRecord.verifiedAt)?.toJSDate() ?? null)
				: null,
		verificationCode: typedRecord.verificationCode,
		userId: typedRecord.userId,
		updated: pbDateToLuxon(typedRecord.updated)?.toJSDate() ?? new Date(),
		isVerified: Boolean(typedRecord.isVerified),
		id: typedRecord.id,
		expiresAt: pbDateToLuxon(typedRecord.expiresAt)?.toJSDate() ?? new Date(),
		email: typedRecord.email,
		created: pbDateToLuxon(typedRecord.created)?.toJSDate() ?? new Date(),
	}
}

/**
 * Creates a new verified email entry and sends verification code
 */
export async function createVerifiedEmail(data: CreateVerifiedEmailRequest): Promise<ServiceResult<VerifiedEmail>> {
	try {
		// Check spam protection
		const spamCheck = await canSendVerificationEmail(data.userId, data.email)
		if (!spamCheck.canSend) {
			console.warn(`Verification email blocked for ${data.email}: ${spamCheck.reason}`)
			return createErrorResult(spamCheck.reason ?? 'RATE_LIMIT_EXCEEDED')
		}

		// Check if email already exists for this user
		const existingRecords = await pb.collection('verifiedEmails').getFullList({
			perPage: 1,
			filter: `userId = "${data.userId}" && email = "${data.email}"`,
		})

		const existing = existingRecords.length > 0 ? existingRecords[0] : null

		if (existing != null && existing !== undefined && Boolean(existing.isVerified) === true) {
			// Email already verified, return error result
			return createErrorResult('EMAIL_ALREADY_VERIFIED')
		}

		const verificationCode = generateVerificationCode()
		const expiresAt = DateTime.now().plus({ minutes: VERIFICATION_EXPIRY_MINUTES }).toISO()

		let record: unknown

		if (existing != null && existing !== undefined) {
			// Update existing unverified record
			record = await pb.collection('verifiedEmails').update(existing.id, {
				verifiedAt: null,
				verificationCode,
				isVerified: false,
				expiresAt,
			})
		} else {
			// Create new record
			record = await pb.collection('verifiedEmails').create({
				verificationCode,
				userId: data.userId,
				isVerified: false,
				expiresAt,
				email: data.email,
			})
		}

		// Send verification email
		const emailSent = await sendVerificationEmail(data.email, verificationCode, VERIFICATION_EXPIRY_MINUTES)
		if (!emailSent) {
			console.warn(`Failed to send verification email to ${data.email}`)
			// Still return success as the record was created successfully
		}

		return createSuccessResult(mapPbVerifiedEmailToModel(record))
	} catch (error) {
		handlePocketBaseError(error, 'creating verified email')
		return createErrorResult('CREATE_EMAIL_FAILED')
	}
}

/**
 * Verifies an email with the provided code
 */
export async function verifyEmail(data: VerifyEmailRequest): Promise<ServiceResult<VerifiedEmail>> {
	try {
		const record = await pb.collection('verifiedEmails').getOne(data.verifiedEmailId)

		// Check if already verified
		if (Boolean(record.isVerified) === true) {
			return createSuccessResult(mapPbVerifiedEmailToModel(record))
		}

		// Check if expired
		const expiresAt = pbDateToLuxon(record.expiresAt as string)
		if (expiresAt != null && expiresAt.toJSDate() < new Date()) {
			return createErrorResult('VERIFICATION_CODE_EXPIRED')
		}

		// Check if code matches
		if (record.verificationCode !== data.verificationCode) {
			return createErrorResult('INVALID_VERIFICATION_CODE')
		}

		// Mark as verified
		const updatedRecord = await pb.collection('verifiedEmails').update(data.verifiedEmailId, {
			verifiedAt: DateTime.now().toISO(),
			isVerified: true,
		})

		return createSuccessResult(mapPbVerifiedEmailToModel(updatedRecord))
	} catch (error) {
		handlePocketBaseError(error, 'verifying email')
		return createErrorResult('VERIFY_EMAIL_FAILED')
	}
}

/**
 * Fetches all verified emails for a user
 */
export async function fetchVerifiedEmailsByUserId(userId: string): Promise<ServiceResult<VerifiedEmail[]>> {
	try {
		const records = await pb.collection('verifiedEmails').getFullList({
			sort: '-created',
			filter: `userId = "${userId}" && isVerified = true`,
		})

		return createSuccessResult(records.map(mapPbVerifiedEmailToModel))
	} catch (error) {
		handlePocketBaseError(error, 'fetching verified emails')
		return createErrorResult('FETCH_EMAILS_FAILED')
	}
}

/**
 * Fetches a specific verified email by ID
 */
export async function fetchVerifiedEmailById(id: string): Promise<VerifiedEmail | null> {
	try {
		const record = await pb.collection('verifiedEmails').getOne(id)
		return mapPbVerifiedEmailToModel(record)
	} catch (error) {
		handlePocketBaseError(error, 'fetching verified email')
		return null
	}
}

/**
 * Deletes a verified email record
 */
export async function deleteVerifiedEmail(id: string): Promise<ServiceResult<boolean>> {
	try {
		await pb.collection('verifiedEmails').delete(id)
		return createSuccessResult(true)
	} catch (error) {
		handlePocketBaseError(error, 'deleting verified email')
		return createErrorResult('DELETE_EMAIL_FAILED')
	}
}

/**
 * Resends verification code for an email
 */
export async function resendVerificationCode(verifiedEmailId: string): Promise<ServiceResult<boolean>> {
	try {
		const record = await pb.collection('verifiedEmails').getOne(verifiedEmailId)

		if (Boolean(record.isVerified) === true) {
			return createErrorResult('EMAIL_ALREADY_VERIFIED')
		}

		// Check spam protection
		const spamCheck = await canSendVerificationEmail(record.userId as string, record.email as string)
		if (!spamCheck.canSend) {
			console.warn(`Resend verification email blocked for ${record.email as string}: ${spamCheck.reason}`)
			return createErrorResult('RATE_LIMIT_EXCEEDED')
		}

		const newVerificationCode = generateVerificationCode()
		const newExpiresAt = DateTime.now().plus({ minutes: VERIFICATION_EXPIRY_MINUTES }).toISO()

		await pb.collection('verifiedEmails').update(verifiedEmailId, {
			verificationCode: newVerificationCode,
			expiresAt: newExpiresAt,
		})

		// Send verification email with new code
		const emailSent = await sendVerificationEmail(
			record.email as string,
			newVerificationCode,
			VERIFICATION_EXPIRY_MINUTES
		)
		if (!emailSent) {
			console.warn(`Failed to resend verification email to ${record.email as string}`)
			return createErrorResult('EMAIL_SEND_FAILED')
		}

		return createSuccessResult(true)
	} catch (error) {
		handlePocketBaseError(error, 'resending verification code')
		return createErrorResult('RESEND_CODE_FAILED')
	}
}
