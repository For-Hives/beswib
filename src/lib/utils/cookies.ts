/**
 * Utility functions for handling cookies on the client side
 */

import { i18n, type Locale } from '../i18n/config'

/**
 * Get a cookie value by name
 * @param name - The name of the cookie
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
	if (typeof document === 'undefined') {
		return null // SSR safety
	}

	const nameEQ = name + '='
	const cookies = document.cookie.split(';')

	for (let i = 0; i < cookies.length; i++) {
		let cookie = cookies[i]
		while (cookie.charAt(0) === ' ') {
			cookie = cookie.substring(1, cookie.length)
		}
		if (cookie.indexOf(nameEQ) === 0) {
			const value = cookie.substring(nameEQ.length, cookie.length)
			return value && value.length > 0 ? value : null
		}
	}
	return null
}

/**
 * Get the current locale from NEXT_LOCALE cookie
 * @returns The locale string or null if not found
 */
export function getLocaleFromCookie(): string | null {
	return getCookie('NEXT_LOCALE')
}

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is Locale {
	return i18n.locales.includes(locale as Locale)
}

/**
 * Get locale from localStorage
 * @returns The locale string or null if not found
 */
export function getLocaleFromLocalStorage(): string | null {
	if (typeof window === 'undefined') {
		return null // SSR safety
	}

	try {
		const locale = localStorage.getItem('NEXT_LOCALE')
		return locale !== null && locale.length > 0 ? locale : null
	} catch (error) {
		console.warn('Failed to read locale from localStorage:', error)
		return null
	}
}

/**
 * Set locale in localStorage
 * @param locale - The locale to store
 */
export function setLocaleInLocalStorage(locale: string): void {
	if (typeof window === 'undefined') {
		return // SSR safety
	}

	try {
		localStorage.setItem('NEXT_LOCALE', locale)
	} catch (error) {
		console.warn('Failed to write locale to localStorage:', error)
	}
}

/**
 * Set locale in cookie
 * @param locale - The locale to store
 */
export function setLocaleInCookie(locale: string): void {
	if (typeof document === 'undefined') {
		return // SSR safety
	}

	try {
		document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=lax`
	} catch (error) {
		console.warn('Failed to write locale to cookie:', error)
	}
}

/**
 * Get the preferred locale from multiple sources (localStorage, cookie, default)
 * Priority: localStorage > cookie > default
 * @returns The preferred locale string
 */
export function getPreferredLocale(): string {
	// Try localStorage first
	const localStorageLocale = getLocaleFromLocalStorage()
	if (localStorageLocale !== null && isSupportedLocale(localStorageLocale)) {
		return localStorageLocale
	}

	// Fallback to cookie
	const cookieLocale = getLocaleFromCookie()
	if (cookieLocale !== null && isSupportedLocale(cookieLocale)) {
		return cookieLocale
	}

	// Final fallback to default
	return i18n.defaultLocale
}

/**
 * Synchronize locale across all storage mechanisms
 * This ensures consistency between localStorage, cookies, and optionally database
 * @param locale - The locale to synchronize
 */
export function synchronizeLocale(locale: string): void {
	if (!isSupportedLocale(locale)) {
		console.warn(`Attempted to synchronize unsupported locale: ${locale}`)
		return
	}

	try {
		// Update localStorage
		setLocaleInLocalStorage(locale)

		// Update cookie
		setLocaleInCookie(locale)

		console.debug(`✅ Locale synchronized: ${locale}`)
	} catch (error) {
		console.error('Failed to synchronize locale:', error)
	}
}

/**
 * Get the most authoritative locale source
 * Priority: URL > localStorage > cookie > database > default
 * @param urlLocale - The locale from the current URL
 * @param databaseLocale - The locale from the database (if available)
 * @returns The authoritative locale
 */
export function getAuthoritativeLocale(urlLocale: string, databaseLocale?: string | null): string {
	// URL locale has highest priority (user explicitly navigated to it)
	if (urlLocale && urlLocale.length > 0 && isSupportedLocale(urlLocale)) {
		return urlLocale
	}

	// Check localStorage
	const localStorageLocale = getLocaleFromLocalStorage()
	if (localStorageLocale !== null && isSupportedLocale(localStorageLocale)) {
		return localStorageLocale
	}

	// Check cookie
	const cookieLocale = getLocaleFromCookie()
	if (cookieLocale !== null && isSupportedLocale(cookieLocale)) {
		return cookieLocale
	}

	// Check database (if available)
	if (
		databaseLocale !== null &&
		databaseLocale !== undefined &&
		databaseLocale.length > 0 &&
		isSupportedLocale(databaseLocale)
	) {
		return databaseLocale
	}

	// Final fallback
	return i18n.defaultLocale
}
