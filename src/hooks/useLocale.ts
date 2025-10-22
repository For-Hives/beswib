'use client'

import { useUser } from '@clerk/nextjs'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { updateUserLocalePreference } from '@/app/[locale]/actions/locale'
import type { Locale } from '@/lib/i18n/config'
import { getAuthoritativeLocale, isSupportedLocale, synchronizeLocale } from '@/lib/utils/cookies'

/**
 * Custom hook for managing locale state with localStorage and cookie synchronization
 * Provides a consistent way to handle locale changes across the application
 */
export function useLocale(initialLocale: string) {
	const [currentLocale, setCurrentLocale] = useState<Locale>(initialLocale as Locale)
	const [isUpdating, setIsUpdating] = useState(false)
	const router = useRouter()
	const { isSignedIn } = useUser()

	// Initialize locale from authoritative source on mount
	useEffect(() => {
		const authoritativeLocale = getAuthoritativeLocale(initialLocale)
		if (authoritativeLocale !== initialLocale && isSupportedLocale(authoritativeLocale)) {
			setCurrentLocale(authoritativeLocale)
		}
	}, [initialLocale])

	/**
	 * Change the current locale and persist it to localStorage, cookie, and database
	 */
	const changeLocale = useCallback(
		async (newLocale: string) => {
			if (!isSupportedLocale(newLocale) || newLocale === currentLocale) {
				return
			}

			try {
				setIsUpdating(true)

				// Synchronize locale across all storage mechanisms
				synchronizeLocale(newLocale)

				// Update local state
				setCurrentLocale(newLocale)

				// If user is signed in, update their locale preference in the database
				if (isSignedIn === true) {
					const result = await updateUserLocalePreference(newLocale)
					if (!result.success) {
						console.warn('Failed to update user locale preference:', result.error)
						// Continue with the UI update even if the database update fails
					}
				}

				// Navigate to the new locale URL
				const currentPath = window.location.pathname
				const pathWithoutLocale = currentPath.replace(`/${initialLocale}`, '') || '/'
				const href = newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`

				router.push(href)
			} catch (error) {
				console.error('Error changing locale:', error)
				setIsUpdating(false)
			}
		},
		[currentLocale, initialLocale, isSignedIn, router]
	)

	/**
	 * Get the current locale with fallback to initial locale
	 */
	const getCurrentLocale = useCallback((): Locale => {
		return currentLocale || (initialLocale as Locale)
	}, [currentLocale, initialLocale])

	return {
		isUpdating,
		isSupportedLocale,
		currentLocale: getCurrentLocale(),
		changeLocale,
	}
}
