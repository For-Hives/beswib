'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { syncUserLocaleFromCookie } from '@/app/[locale]/actions/locale'
import { getAuthoritativeLocale, isSupportedLocale, synchronizeLocale } from '@/lib/utils/cookies'

/**
 * Component that automatically synchronizes user locale from localStorage/cookie to database
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
				// Get the most authoritative locale from all sources
				const authoritativeLocale = getAuthoritativeLocale('', null) // No URL locale in this context

				if (!authoritativeLocale || !isSupportedLocale(authoritativeLocale)) {
					// No valid locale found, nothing to sync
					return
				}

				// Ensure consistency across all storage mechanisms
				synchronizeLocale(authoritativeLocale)

				// Attempt to sync locale to database
				const result = await syncUserLocaleFromCookie(authoritativeLocale)

				if (result.success === true && result.updated === true) {
					console.info(`✅ User locale synchronized and stored: ${authoritativeLocale}`)
				} else if (result.success === true && result.updated === false) {
					// User already has a locale set, which is normal
					console.debug('User already has locale preference set')
				} else {
					console.warn('Failed to sync user locale to database:', result.error)
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

/**
 * Component that ensures locale consistency for all users (connected and non-connected)
 * This component runs on every page load to maintain consistency
 */
export function GlobalLocaleSynchronizer() {
	useEffect(() => {
		const performGlobalSync = () => {
			try {
				// Get the most authoritative locale from all sources
				const authoritativeLocale = getAuthoritativeLocale('', null)

				if (authoritativeLocale && isSupportedLocale(authoritativeLocale)) {
					// Ensure consistency across all storage mechanisms
					synchronizeLocale(authoritativeLocale)
					console.debug(`🌐 Global locale synchronized: ${authoritativeLocale}`)
				}
			} catch (error) {
				console.warn('Error in global locale synchronization:', error)
			}
		}

		// Run synchronization after a short delay to ensure DOM is ready
		const timeoutId = setTimeout(performGlobalSync, 100)
		return () => clearTimeout(timeoutId)
	}, [])

	// This component doesn't render anything
	return null
}
