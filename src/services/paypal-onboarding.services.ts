'use server'

import { revalidatePath } from 'next/cache'

import { onboardSeller } from '@/services/paypal.services'
import { updateUser } from '@/services/user.services'

export async function completePayPalOnboarding(
	userId: string,
	merchantId: string,
	trackingId: string
): Promise<{ error?: string; success?: boolean }> {
	try {
		// Update user with PayPal merchant ID and verification status
		await updateUser(userId, {
			paypalAccountVerified: true,
			paypalMerchantId: merchantId,
			paypalTrackingId: trackingId,
		})

		revalidatePath('/profile')
		return { success: true }
	} catch (error) {
		console.error('PayPal onboarding completion error:', error)
		return { error: 'Failed to complete PayPal onboarding' }
	}
}

export async function initiatePayPalOnboarding(userId: string): Promise<{ actionUrl?: string; error?: string }> {
	try {
		// Generate a unique tracking ID for this onboarding
		const trackingId = `seller_${userId}_${Date.now()}`

		// Call PayPal onboarding service
		const result = await onboardSeller(trackingId)

		if (result.error !== null && result.error !== undefined && result.error !== '') {
			return { error: result.error }
		}

		// Store the tracking ID for later verification
		await updateUser(userId, {
			paypalTrackingId: trackingId,
		})

		revalidatePath('/profile')
		return { actionUrl: result.action_url }
	} catch (error) {
		console.error('PayPal onboarding error:', error)
		return { error: 'Failed to initiate PayPal onboarding' }
	}
}
