'use server'

import { auth } from '@clerk/nextjs/server'

import { updateUserLocale } from '@/app/[locale]/profile/actions'
import { fetchUserByClerkId } from '@/services/user.services'
import { i18n, type Locale } from '@/lib/i18n/config'

function isValidLocale(locale: string): locale is Locale {
	return i18n.locales.includes(locale as Locale)
}

/**
 * Synchronizes user locale from cookie to database if user has no locale set
 * @param cookieLocale - The locale from the NEXT_LOCALE cookie
 * @returns Result of the synchronization
 */
export async function syncUserLocaleFromCookie(
	cookieLocale: string
): Promise<{ success: boolean; error?: string; updated?: boolean }> {
	try {
		// Check if user is authenticated
		const { userId: clerkId } = await auth()
		if (clerkId === null || clerkId === undefined) {
			return { success: false, error: 'User not authenticated' }
		}

		// Validate locale
		if (!isValidLocale(cookieLocale)) {
			return { success: false, error: 'Unsupported locale from cookie' }
		}

		// Get user from database
		const user = await fetchUserByClerkId(clerkId)
		if (!user) {
			return { success: false, error: 'User not found in database' }
		}

		// Only update if user doesn't have a locale set (null or empty)
		if (user.locale === null || user.locale === undefined || user.locale.trim() === '') {
			await updateUserLocale(user.id, cookieLocale)
			return { updated: true, success: true }
		}

		// User already has a locale set, no need to update
		return { updated: false, success: true }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to sync locale from cookie'
		console.error('Error syncing user locale from cookie:', errorMessage)
		return {
			success: false,
			error: errorMessage,
		}
	}
}

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
		if (!isValidLocale(locale)) {
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
