'use client'

import { useEffect } from 'react'

import { useUser } from '@clerk/nextjs'

import { getLocaleFromCookie, isSupportedLocale } from '@/lib/utils/cookies'
import { syncUserLocaleFromCookie } from '@/app/[locale]/actions/locale'

/**
 * Component that automatically synchronizes user locale from cookie to database
 * Should be included in pages where authenticated users might land
 */
export default function LocaleSynchronizer() {
	const { isSignedIn, isLoaded } = useUser()

	useEffect(() => {
		// Only run for authenticated users after Clerk has loaded
		if (isLoaded !== true || isSignedIn !== true) {
			return
		}

		const performSync = async () => {
			try {
				// Get locale from cookie
				const cookieLocale = getLocaleFromCookie()

				if (cookieLocale == null || cookieLocale === undefined || !isSupportedLocale(cookieLocale)) {
					// No valid locale in cookie, nothing to sync
					return
				}

				// Attempt to sync locale to database
				const result = await syncUserLocaleFromCookie(cookieLocale)

				if (result.success === true && result.updated === true) {
					console.info(`✅ User locale synchronized from cookie: ${cookieLocale}`)
				} else if (result.success === true && result.updated === false) {
					// User already has a locale set, which is normal
					console.debug('User already has locale preference set')
				} else {
					console.warn('Failed to sync user locale from cookie:', result.error)
				}
			} catch (error) {
				console.error('Error in locale synchronization:', error)
			}
		}

		// Run synchronization
		void performSync()
	}, [isSignedIn, isLoaded])

	// This component doesn't render anything
	return null
}
