import { describe, it, expect } from 'vitest'
import { saleAlertText, contactSummaryText, contactFullText } from '../../constants/discord.constant'

describe('discord.constant templates', () => {
	it('saleAlertText builds expected string', () => {
		const txt = saleAlertText({ orderId: 'ORD123', bibId: 'BIB1', amount: 42, currency: 'EUR' })
		expect(txt).toContain('@here')
		expect(txt).toContain('order: ORD123')
		expect(txt).toContain('bib: BIB1')
		expect(txt).toContain('amount: 42 EUR')
	})

	it('contactSummaryText handles missing name/email', () => {
		const s = contactSummaryText('', '')
		expect(s).toContain('@here')
		expect(s).toContain('Anonymous')
		expect(s).toContain('n/a')
	})

	it('contactFullText wraps message in codeblock and respects length', () => {
		const msg = 'hello world'
		const full = contactFullText(msg)
		expect(full.startsWith('```')).toBe(true)
		expect(full).toContain('hello world')
		expect(full.endsWith('```')).toBe(true)
	})
})
