import { describe, expect, it } from 'vitest'

import {
	datetimeToDate,
	formatDateForDisplay,
	formatDateForInput,
	getDateFormatPattern,
	getDatePlaceholder,
} from '@/lib/utils/date'

describe('dateUtils', () => {
	it('should convert datetime-local string to date string', () => {
		expect(datetimeToDate('2025-06-28T10:00')).toBe('2025-06-28')
		expect(datetimeToDate('')).toBe('')
	})

	it('should format date string for display', () => {
		expect(formatDateForDisplay('2025-06-28', 'en')).toBe('June 28, 2025')
		expect(formatDateForDisplay('2025-06-28', 'fr')).toBe('28 juin 2025')
		expect(formatDateForDisplay('2025-06-28', 'ko')).toBe('2025년 6월 28일')
		expect(formatDateForDisplay('')).toBe('')
	})

	it('should format date string for input', () => {
		expect(formatDateForInput('2025-06-28')).toBe('2025-06-28')
		expect(formatDateForInput('')).toBe('')
	})

	it('should get date format pattern', () => {
		expect(getDateFormatPattern('en')).toBe('mm/dd/yyyy')
		expect(getDateFormatPattern('fr')).toBe('dd/mm/yyyy')
		expect(getDateFormatPattern('ko')).toBe('yyyy/mm/dd')
		expect(getDateFormatPattern()).toBe('mm/dd/yyyy')
	})

	it('should get date placeholder', () => {
		expect(getDatePlaceholder('en')).toBe('mm/dd/yyyy')
		expect(getDatePlaceholder('fr')).toBe('jj/mm/aaaa')
		expect(getDatePlaceholder('ko')).toBe('yyyy/mm/dd')
		expect(getDatePlaceholder()).toBe('mm/dd/yyyy')
	})
})
