import { describe, expect, it } from 'vitest'

import { containsLink, isHoneypotFilled, isRandomLetters, looksLikeBotText } from '@/lib/security/spam'

describe('contact form spam rules', () => {
	it.each(['FzEwOOmxoOoDAyMmIDdgBtPG', 'oKcQzvnDkccQlIuC'])('%s is random letters', value => {
		expect(isRandomLetters(value)).toBe(true)
	})

	it.each(['McDonald', 'DUPONT', 'Jean-Pierre', 'Bonjour, je voudrais revendre mon dossard.', '', 42])(
		'%s is not random letters',
		value => {
			expect(isRandomLetters(value)).toBe(false)
		}
	)

	it('needs both the name and the message to look random', () => {
		expect(looksLikeBotText({ name: 'FzEwOOmxoOoDAyMmIDdgBtPG', message: 'oKcQzvnDkccQlIuC' })).toBe(true)
		expect(looksLikeBotText({ name: 'FzEwOOmxoOoDAyMmIDdgBtPG', message: 'Hello, is my bib still for sale?' })).toBe(
			false
		)
		expect(looksLikeBotText({ name: 'Marie', message: 'oKcQzvnDkccQlIuC' })).toBe(false)
		// A glued name looks random on its own: the reason the message must look random too
		expect(isRandomLetters('MarieDUPONT')).toBe(true)
		expect(looksLikeBotText({ name: 'MarieDUPONT', message: 'Is my bib still listed?' })).toBe(false)
	})

	it('spots a filled-in trap field', () => {
		expect(isHoneypotFilled('https://seo.example')).toBe(true)
		expect(isHoneypotFilled('   ')).toBe(false)
		expect(isHoneypotFilled(undefined)).toBe(false)
	})

	it('spots links', () => {
		expect(containsLink('see https://example.com/x')).toBe(true)
		expect(containsLink('see www.example.com')).toBe(true)
		expect(containsLink('my email is runner@example.com')).toBe(false)
	})
})
