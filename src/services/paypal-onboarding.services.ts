'use server'

export async function disconnectPayPalAccount(userId: string): Promise<{ error?: string; success?: boolean }> {
	try {
		await updateUser(userId, { paypalMerchantId: null, paypal_kyc: false })
		revalidatePath('/profile')
		return { success: true }
	} catch (error) {
		console.error('PayPal disconnect error:', error)
		return { error: 'Failed to disconnect PayPal account' }
	}
}

import { revalidatePath } from 'next/cache'

import { onboardSeller } from '@/services/paypal.services'
import { updateUser } from '@/services/user.services'

export async function completePayPalOnboarding(
	userId: string,
	paypalMerchantId: string
): Promise<{ error?: string; success?: boolean }> {
	try {
		// Update user with PayPal merchant ID directly
		await updateUser(userId, {
			paypalMerchantId: paypalMerchantId,
		})

		revalidatePath('/profile')
		return { success: true }
	} catch (error) {
		console.error('PayPal onboarding completion error:', error)
		return { error: 'Failed to complete PayPal onboarding' }
	}
}

export async function initiatePayPalOnboarding(
	userId: string
): Promise<{ actionUrl?: string; error?: string; referralId?: string }> {
	try {
		// Use the user's DB id as the tracking ID (per business requirement)
		// Note: This intentionally avoids adding timestamps or prefixes.
		const trackingId = userId

		// Call PayPal onboarding service
		const result = await onboardSeller(trackingId)

		if (result.error != null && result.error !== undefined && result.error !== '') {
			return { error: result.error }
		}

		revalidatePath('/profile')
		return { referralId: result.referral_id, actionUrl: result.action_url }
	} catch (error) {
		console.error('PayPal onboarding error:', error)
		return { error: 'Failed to initiate PayPal onboarding' }
	}
}

export async function updatePayPalMerchantId(
	userId: string,
	merchantId: string
): Promise<{ error?: string; success?: boolean }> {
	try {
		// Update user with PayPal merchant ID
		await updateUser(userId, {
			paypalMerchantId: merchantId,
		})

		revalidatePath('/profile')
		return { success: true }
	} catch (error) {
		console.error('PayPal merchant ID update error:', error)
		return { error: 'Failed to update PayPal merchant ID' }
	}
}
