'use server'

import { auth } from '@clerk/nextjs/server'

import { updateUserLocale } from '@/app/[locale]/profile/actions'
import { fetchUserByClerkId } from '@/services/user.services'

/**
 * Updates the user's locale preference in the database
 * Only works for authenticated users
 */
export async function updateUserLocalePreference(locale: string): Promise<{ success: boolean; error?: string }> {
	try {
		// Check if user is authenticated
		const { userId: clerkId } = await auth()
		if (clerkId === null || clerkId === undefined) {
			return { success: false, error: 'User not authenticated' }
		}

		// Validate locale
		const supportedLocales = ['en', 'fr', 'ko', 'es', 'it', 'de', 'ro', 'pt', 'nl']
		if (!supportedLocales.includes(locale)) {
			return { success: false, error: 'Unsupported locale' }
		}

		// Get user from database
		const user = await fetchUserByClerkId(clerkId)
		if (!user) {
			return { success: false, error: 'User not found in database' }
		}

		// Update user locale
		await updateUserLocale(user.id, locale)

		return { success: true }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to update locale preference'
		console.error('Error updating user locale preference:', errorMessage)
		return {
			success: false,
			error: errorMessage,
		}
	}
}
