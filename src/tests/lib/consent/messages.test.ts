import { describe, expect, it } from 'vitest'

import { CONSENT_CATEGORIES } from '@/lib/consent/config'
import { getConsentI18n } from '@/lib/consent/messages'
import { i18n, type Locale } from '@/lib/i18n/config'

/** Every leaf of a messages object, as "section.key" paths with their text. */
function leaves(value: unknown, prefix = ''): Map<string, unknown> {
	const found = new Map<string, unknown>()
	if (value === null || typeof value !== 'object') {
		found.set(prefix, value)
		return found
	}
	for (const [key, child] of Object.entries(value)) {
		for (const [path, text] of leaves(child, prefix === '' ? key : `${prefix}.${key}`)) found.set(path, text)
	}
	return found
}

function messagesOf(locale: Locale) {
	return getConsentI18n(locale).messages?.[locale]
}

describe('consent copy', () => {
	it('pins the language to the page: its locale, its copy only, no browser detection', () => {
		for (const locale of i18n.locales) {
			const config = getConsentI18n(locale)
			expect(config.locale).toBe(locale)
			expect(config.detectBrowserLanguage).toBe(false)
			expect(Object.keys(config.messages ?? {})).toEqual([locale])
		}
	})

	it('sets the same keys in the nine locales, none of them empty', () => {
		const reference = [...leaves(messagesOf('en')).keys()].sort()
		expect(reference.length).toBeGreaterThan(0)
		for (const locale of i18n.locales) {
			const found = leaves(messagesOf(locale))
			// A missing key would silently show c15t's English in the middle of a translated banner
			expect([...found.keys()].sort(), locale).toEqual(reference)
			for (const [path, text] of found) {
				expect(typeof text, `${locale} ${path}`).toBe('string')
				expect(String(text).trim(), `${locale} ${path}`).not.toBe('')
			}
		}
	})

	it('names every category the dialog lists', () => {
		for (const locale of i18n.locales) {
			const types = messagesOf(locale)?.consentTypes ?? {}
			expect(Object.keys(types).sort(), locale).toEqual([...CONSENT_CATEGORIES].sort())
		}
	})

	it('does not reuse the English text in another locale', () => {
		const english = leaves(messagesOf('en'))
		for (const locale of i18n.locales.filter(candidate => candidate !== 'en')) {
			const translated = leaves(messagesOf(locale))
			const untranslated = [...translated].filter(([path, text]) => english.get(path) === text).map(([path]) => path)
			expect(untranslated, locale).toEqual([])
		}
	})

	it('falls back on the English copy for a locale the app does not have', () => {
		const unknown = 'xx' as Locale
		expect(getConsentI18n(unknown).messages?.[unknown]).toEqual(messagesOf('en'))
	})
})
