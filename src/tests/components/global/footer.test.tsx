import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { i18n, type Locale } from '@/lib/i18n/config'

// Before hydration c15t's link renders nothing: the footer is rendered here as the server sends it
vi.mock('@c15t/nextjs', () => ({ ConsentDialogLink: () => null }))
// The language selector reads the signed-in user: not what is looked at here
vi.mock('@/components/global/LanguageSelector', () => ({ default: () => null }))

import Footer from '@/components/global/footer'

// One label per locale, written here on purpose: the longest ones wrap on a phone
const COOKIE_SETTINGS: Record<Locale, string> = {
	en: 'Cookie settings',
	fr: 'Gestion des cookies',
	es: 'Configuración de cookies',
	it: 'Impostazioni dei cookie',
	de: 'Cookie-Einstellungen',
	ro: 'Setări cookie-uri',
	pt: 'Definições de cookies',
	nl: 'Cookie-instellingen',
	ko: '쿠키 설정',
}

describe('Footer', () => {
	it.each(i18n.locales)(
		'keeps the place of the cookie settings link in the server HTML, with its label: %s',
		async locale => {
			const html = renderToString(await Footer({ localeParams: Promise.resolve({ locale }) }))

			// The button only exists after hydration. An empty line of fixed height moved the language
			// selector down wherever the label takes two lines: the label itself, invisible, holds the space.
			expect(html).toContain(
				`<li class="grid"><span aria-hidden="true" class="invisible col-start-1 row-start-1">${COOKIE_SETTINGS[locale]}</span></li>`
			)
		}
	)
})
