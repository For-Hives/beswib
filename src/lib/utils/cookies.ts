/**
 * Utility functions for handling cookies on the client side
 */

import { i18n } from '../i18n/config'

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
			return cookie.substring(nameEQ.length, cookie.length)
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
export function isSupportedLocale(locale: string): boolean {
	return i18n.locales.includes(locale as any)
}
