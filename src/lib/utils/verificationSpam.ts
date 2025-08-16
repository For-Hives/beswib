import { DateTime } from 'luxon'

import { MAX_DAILY_ATTEMPTS, RESEND_COOLDOWN_MINUTES } from '@/constants/verifiedEmail.constant'
import { pb } from '@/lib/services/pocketbase'

export interface SpamCheckResult {
	canSend: boolean
	reason?: string
}

/**
 * Checks if the user can send another verification email (spam protection)
 */
export async function canSendVerificationEmail(userId: string, email: string): Promise<SpamCheckResult> {
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
