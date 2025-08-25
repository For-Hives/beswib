import { DateTime } from 'luxon'

import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale, i18n } from '@/lib/i18n/config'

/**
 * Parse une date PocketBase (string ou Date) en Luxon.DateTime
 * Gère les cas nullish ou mal formés
 */
export function pbDateToLuxon(date: string | Date | null | undefined): DateTime | null {
	if (date instanceof Date) {
		const dt = DateTime.fromJSDate(date).toUTC()
		return dt.isValid ? dt : null
	}

	if (typeof date === 'string' && date.trim() !== '') {
		// Premier essai : ISO
		let dt = DateTime.fromISO(date, { zone: 'utc' })
		if (dt.isValid) return dt

		// Deuxième essai : SQL (PocketBase stocke parfois des formats bizarres)
		dt = DateTime.fromSQL(date, { zone: 'utc' })
		if (dt.isValid) return dt

		// Troisième essai : format custom si besoin
		dt = DateTime.fromFormat(date, "yyyy-MM-dd HH:mm:ss.SSS'Z'", { zone: 'utc' })
		if (dt.isValid) return dt
	}

	return null
}

/**
 * Convertit une Date JS ou Luxon en string formatée PocketBase (UTC)
 */
export function dateToPbDateString(date: Date | DateTime): string {
	const dt = date instanceof DateTime ? date : DateTime.fromJSDate(date).toUTC()
	return dt.toFormat("yyyy-MM-dd HH:mm:ss.SSS'Z'")
}

/**
 * Converts a datetime-local string to a date string (YYYY-MM-DD) 🗓️
 * @param datetimeString - The datetime string (YYYY-MM-DDTHH:mm format) 🕰️
 * @returns Date string in YYYY-MM-DD format 📄
 */
export function datetimeToDate(datetimeString: string): string {
	if (!datetimeString) return ''
	return datetimeString.split('T')[0]
}

/**
 * Formats a date string to be displayed according to the locale 🌍
 * @param dateString - The date string (YYYY-MM-DD format) 🗓️
 * @param locale - The locale ('en', 'fr', 'ko') 🌐
 * @returns Formatted date string 📄
 */
export function formatDateForDisplay(dateString: string, locale: string = 'en'): string {
	if (!dateString) return ''
	try {
		// Support date-only ('YYYY-MM-DD') or ISO; normalize to UTC to avoid TZ shifts
		const base = dateString.length === 10 ? `${dateString}T00:00:00` : dateString
		const dt = DateTime.fromISO(base, { zone: 'utc' }).setLocale(locale)
		if (!dt.isValid) return dateString
		return dt.toLocaleString(DateTime.DATE_FULL)
	} catch {
		return dateString
	}
}

/**
 * Formats a Date object to be displayed according to the locale 🌍
 * @param date - The Date object 📅
 * @param locale - The locale ('en', 'fr', 'ko') 🌐
 * @param format - The format type (optional, defaults to DATE_MED) 📄
 * @returns Formatted date string 📄
 */
export function formatDateObjectForDisplay(
	date: Date | string,
	locale: string = 'en',
	format: Intl.DateTimeFormatOptions = DateTime.DATE_MED
): string {
	if (date == null || date === '') return ''
	try {
		const dt = typeof date === 'string' ? DateTime.fromISO(date) : DateTime.fromJSDate(date)
		if (!dt.isValid) return ''
		return dt.setLocale(locale).toLocaleString(format)
	} catch {
		return ''
	}
}

/**
 * Converts a date string to the format expected by HTML date inputs (YYYY-MM-DD) 📅
 * @param dateString - The date string 📄
 * @returns Date string in YYYY-MM-DD format 🗓️
 */
export function formatDateForInput(dateString: string): string {
	if (!dateString) return ''
	try {
		const base = dateString.length === 10 ? `${dateString}T00:00:00` : dateString
		const dt = DateTime.fromISO(base, { zone: 'utc' }).toUTC()
		return dt.isValid ? dt.toFormat('yyyy-LL-dd') : ''
	} catch {
		return ''
	}
}

/**
 * Robust function to format any date value for HTML date inputs (YYYY-MM-DD) 📅
 * @param date - The date (can be string, Date object, or any date-like value)
 * @returns Date string in YYYY-MM-DD format suitable for HTML date inputs
 */
export function formatDateForHTMLInput(date: unknown): string {
	if (date == null || date === '') return ''

	try {
		let dt: DateTime

		if (typeof date === 'string') {
			// Try different string formats
			dt = DateTime.fromISO(date)
			if (!dt.isValid) {
				dt = DateTime.fromSQL(date)
			}
			if (!dt.isValid) {
				dt = DateTime.fromJSDate(new Date(date))
			}
		} else if (date instanceof Date) {
			dt = DateTime.fromJSDate(date)
		} else {
			// Try to convert whatever it is to a Date first
			dt = DateTime.fromJSDate(new Date(date as string))
		}

		if (!dt.isValid) {
			console.warn('formatDateForHTMLInput: Invalid date received:', date)
			return ''
		}

		return dt.toFormat('yyyy-LL-dd')
	} catch (error) {
		console.warn('formatDateForHTMLInput: Error formatting date:', date, error)
		return ''
	}
}

// Helper function to format date with Luxon safely ✨
export function formatDateWithLocale(date: Date, locale: Locale): string {
	try {
		const dt = DateTime.fromJSDate(date)
		if (!dt.isValid) {
			return new Date(date).toLocaleDateString()
		}

		// Use provided locale, or automatically detect browser locale 🌐
		const targetLocaleFromPath = locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US')
		const dateTime = dt.setLocale(targetLocaleFromPath)

		// Check if locale is valid after configuration ✅
		if (!dateTime.isValid) {
			// If locale is not supported, use default locale 🤷
			return dt.toLocaleString(DateTime.DATE_MED)
		}

		return dateTime.toLocaleString(DateTime.DATE_MED)
	} catch {
		// Fallback to native JavaScript Date formatting  fallback to native JavaScript Date formatting 📅
		return new Date(date).toLocaleDateString()
	}
}

/**
 * Gets the locale-specific date format pattern 🗺️
 * @param locale - The locale (any supported locale from i18n config) 🌐
 * @returns Date format pattern 📄
 */
export function getDateFormatPattern(locale: string = 'en'): string {
	// Validate locale and fallback to default if not supported
	const validLocale = i18n.locales.includes(locale as Locale) ? locale : i18n.defaultLocale

	// US format for English
	if (validLocale === 'en') {
		return 'mm/dd/yyyy'
	}

	// Korean format
	if (validLocale === 'ko') {
		return 'yyyy/mm/dd'
	}

	// European format for all other languages (fr, es, it, de, ro, pt, nl)
	return 'dd/mm/yyyy'
}

/**
 * Gets the locale-specific placeholder for date inputs 🗺️
 * @param locale - The locale (any supported locale from i18n config) 🌐
 * @returns Placeholder text 📄
 */
export function getDatePlaceholder(locale: string = 'en'): string {
	// Validate locale and fallback to default if not supported
	const validLocale = i18n.locales.includes(locale as Locale) ? locale : i18n.defaultLocale

	// US format for English
	if (validLocale === 'en') {
		return 'mm/dd/yyyy'
	}

	// Korean format
	if (validLocale === 'ko') {
		return 'yyyy/mm/dd'
	}

	// French format
	if (validLocale === 'fr') {
		return 'jj/mm/aaaa'
	}

	// Spanish format
	if (validLocale === 'es') {
		return 'dd/mm/aaaa'
	}

	// Italian format
	if (validLocale === 'it') {
		return 'gg/mm/aaaa'
	}

	// German format
	if (validLocale === 'de') {
		return 'tt.mm.jjjj'
	}

	// Romanian format
	if (validLocale === 'ro') {
		return 'zz/ll/aaaa'
	}

	// Portuguese format
	if (validLocale === 'pt') {
		return 'dd/mm/aaaa'
	}

	// Dutch format
	if (validLocale === 'nl') {
		return 'dd/mm/jjjj'
	}

	// Default European format
	return 'dd/mm/yyyy'
}

/**
 * Formats a date in simple YYYY-MM-DD format 📅
 * @param date - The date (Date object, string, or any date-like value)
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateSimple(date: unknown): string {
	if (date == null || date === '') return ''
	try {
		let dt: DateTime

		if (typeof date === 'string') {
			// Try different string formats
			dt = DateTime.fromISO(date)
			if (!dt.isValid) {
				dt = DateTime.fromSQL(date)
			}
			if (!dt.isValid) {
				dt = DateTime.fromJSDate(new Date(date))
			}
		} else if (date instanceof Date) {
			dt = DateTime.fromJSDate(date)
		} else {
			// Try to convert whatever it is to a Date first
			dt = DateTime.fromJSDate(new Date(date as string))
		}

		if (!dt.isValid) {
			console.warn('formatDateSimple: Invalid date received:', date)
			return ''
		}
		return dt.toFormat('yyyy-LL-dd')
	} catch (error) {
		console.warn('formatDateSimple: Error formatting date:', date, error)
		return ''
	}
}

/**
 * Formats a date for HTML datetime-local inputs (YYYY-MM-DDTHH:mm) 📅⏰
 * @param date - The date (Date object, string, or any date-like value)
 * @returns Date string in YYYY-MM-DDTHH:mm format for datetime-local inputs
 */
export function formatDateTimeForHTMLInput(date: unknown): string {
	if (date == null || date === '') return ''

	try {
		let dt: DateTime

		if (typeof date === 'string') {
			// Try different string formats
			dt = DateTime.fromISO(date)
			if (!dt.isValid) {
				dt = DateTime.fromSQL(date)
			}
			if (!dt.isValid) {
				dt = DateTime.fromJSDate(new Date(date))
			}
		} else if (date instanceof Date) {
			dt = DateTime.fromJSDate(date)
		} else {
			// Try to convert whatever it is to a Date first
			dt = DateTime.fromJSDate(new Date(date as string))
		}

		if (!dt.isValid) {
			console.warn('formatDateTimeForHTMLInput: Invalid date received:', date)
			return ''
		}

		// Return in local timezone for datetime-local input
		return dt.toLocal().toFormat("yyyy-LL-dd'T'HH:mm")
	} catch (error) {
		console.warn('formatDateTimeForHTMLInput: Error formatting date:', date, error)
		return ''
	}
}

/**
 * Calculates time remaining until an event date with localized formatting
 * @param eventDate - The event date (Date object or string)
 * @param locale - The locale for formatting (defaults to 'en')
 * @returns Formatted time remaining string
 */
export function calculateTimeRemaining(eventDate?: Date | string, locale: string = 'en'): string {
	try {
		// Use translations to get the time units following the same pattern as components
		const translations = getTranslations(locale, {})

		// Type-safe access to timeUnits with fallback
		const timeUnits = translations.GLOBAL?.timeUnits as
			| {
					defaultDays: string
					zeroDays: string
					oneDay: string
					days: string
					oneWeek: string
					weeks: string
					oneMonth: string
					months: string
			  }
			| undefined

		// Fallback if timeUnits are not available - use English as default site language
		if (!timeUnits) {
			const fallbackDays = '7 days'
			if (eventDate === undefined || eventDate == null || (typeof eventDate === 'string' && eventDate.trim() === ''))
				return fallbackDays

			try {
				const event = new Date(eventDate)
				const now = new Date()
				const diffTime = event.getTime() - now.getTime()
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

				if (diffDays <= 0) return '0 day'
				if (diffDays === 1) return '1 day'
				if (diffDays < 7) return `${diffDays} days`
				const weeks = Math.floor(diffDays / 7)
				if (weeks === 1) return '1 week'
				if (weeks < 4) return `${weeks} weeks`
				const months = Math.floor(diffDays / 30)
				return months === 1 ? '1 month' : `${months} months`
			} catch {
				return fallbackDays
			}
		}

		if (eventDate === undefined || eventDate == null || (typeof eventDate === 'string' && eventDate.trim() === ''))
			return timeUnits.defaultDays

		const event = new Date(eventDate)
		const now = new Date()
		const diffTime = event.getTime() - now.getTime()
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

		if (diffDays <= 0) return timeUnits.zeroDays
		if (diffDays === 1) return timeUnits.oneDay
		if (diffDays < 7) return `${diffDays} ${timeUnits.days}`
		const weeks = Math.floor(diffDays / 7)
		if (weeks === 1) return timeUnits.oneWeek
		if (weeks < 4) return `${weeks} ${timeUnits.weeks}`
		const months = Math.floor(diffDays / 30)
		return months === 1 ? timeUnits.oneMonth : `${months} ${timeUnits.months}`
	} catch {
		// Ultimate fallback - use English as default site language
		return '7 days'
	}
}
