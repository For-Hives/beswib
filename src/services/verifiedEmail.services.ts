'use server'

import { DateTime } from 'luxon'

import type { CreateVerifiedEmailRequest, VerifiedEmail, VerifyEmailRequest } from '@/models/verifiedEmail.model'

import { VERIFICATION_EXPIRY_MINUTES } from '@/constants/verifiedEmail.constant'
import { sendVerificationEmail } from '@/services/notification.service'
import { canSendVerificationEmail } from '@/lib/utils/verificationSpam'
import { pbDateToLuxon } from '@/lib/utils/date'
import { pb } from '@/lib/services/pocketbase'

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
	// Generate a 6-digit numeric code
	return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Maps PocketBase record to VerifiedEmail model
 */
function mapPbVerifiedEmailToModel(record: unknown): VerifiedEmail {
	const typedRecord = record as VerifiedEmailRecord
	return {
		verifiedAt:
			typedRecord.verifiedAt !== null && typedRecord.verifiedAt !== undefined && typedRecord.verifiedAt !== ''
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
export async function createVerifiedEmail(data: CreateVerifiedEmailRequest): Promise<VerifiedEmail | null> {
	try {
		// Check spam protection
		const spamCheck = await canSendVerificationEmail(data.userId, data.email)
		if (!spamCheck.canSend) {
			console.warn(`Verification email blocked for ${data.email}: ${spamCheck.reason}`)
			throw new Error(spamCheck.reason)
		}

		// Check if email already exists for this user
		const existingRecords = await pb.collection('verifiedEmails').getFullList({
			perPage: 1,
			filter: `userId = "${data.userId}" && email = "${data.email}"`,
		})

		const existing = existingRecords.length > 0 ? existingRecords[0] : null

		if (existing !== null && existing !== undefined && Boolean(existing.isVerified) === true) {
			// Email already verified, return existing record
			return mapPbVerifiedEmailToModel(existing)
		}

		const verificationCode = generateVerificationCode()
		const expiresAt = DateTime.now().plus({ minutes: VERIFICATION_EXPIRY_MINUTES }).toISO()

		let record: unknown

		if (existing !== null && existing !== undefined) {
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
		}

		return mapPbVerifiedEmailToModel(record)
	} catch (error) {
		handlePocketBaseError(error, 'creating verified email')
		return null
	}
}

/**
 * Verifies an email with the provided code
 */
export async function verifyEmail(data: VerifyEmailRequest): Promise<VerifiedEmail | null> {
	try {
		const record = await pb.collection('verifiedEmails').getOne(data.verifiedEmailId)

		// Check if already verified
		if (Boolean(record.isVerified) === true) {
			return mapPbVerifiedEmailToModel(record)
		}

		// Check if expired
		const expiresAt = pbDateToLuxon(record.expiresAt as string)
		if (expiresAt !== null && expiresAt.toJSDate() < new Date()) {
			throw new Error('Verification code has expired')
		}

		// Check if code matches
		if (record.verificationCode !== data.verificationCode) {
			throw new Error('Invalid verification code')
		}

		// Mark as verified
		const updatedRecord = await pb.collection('verifiedEmails').update(data.verifiedEmailId, {
			verifiedAt: DateTime.now().toISO(),
			isVerified: true,
		})

		return mapPbVerifiedEmailToModel(updatedRecord)
	} catch (error) {
		handlePocketBaseError(error, 'verifying email')
		return null
	}
}

/**
 * Fetches all verified emails for a user
 */
export async function fetchVerifiedEmailsByUserId(userId: string): Promise<VerifiedEmail[]> {
	try {
		const records = await pb.collection('verifiedEmails').getFullList({
			sort: '-created',
			filter: `userId = "${userId}" && isVerified = true`,
		})

		return records.map(mapPbVerifiedEmailToModel)
	} catch (error) {
		handlePocketBaseError(error, 'fetching verified emails')
		return []
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
export async function deleteVerifiedEmail(id: string): Promise<boolean> {
	try {
		await pb.collection('verifiedEmails').delete(id)
		return true
	} catch (error) {
		handlePocketBaseError(error, 'deleting verified email')
		return false
	}
}

/**
 * Resends verification code for an email
 */
export async function resendVerificationCode(verifiedEmailId: string): Promise<boolean> {
	try {
		const record = await pb.collection('verifiedEmails').getOne(verifiedEmailId)

		if (Boolean(record.isVerified) === true) {
			throw new Error('Email is already verified')
		}

		// Check spam protection
		const spamCheck = await canSendVerificationEmail(record.userId as string, record.email as string)
		if (!spamCheck.canSend) {
			console.warn(`Resend verification email blocked for ${record.email as string}: ${spamCheck.reason}`)
			throw new Error(spamCheck.reason)
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
		}

		return emailSent
	} catch (error) {
		handlePocketBaseError(error, 'resending verification code')
		return false
	}
}
