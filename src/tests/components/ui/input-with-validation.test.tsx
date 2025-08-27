import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/utils'

describe('InputWithValidation utils', () => {
	it('should combine classes correctly', () => {
		// Test that the utility function works as expected
		const result = cn('pr-8', 'border-red-500', 'pr-10')
		expect(result).toBe('border-red-500 pr-10')
	})

	it('should handle conditional classes', () => {
		const hasError = true
		const isCompleted = false

		const result = cn('pr-8', hasError && 'border-red-500', isCompleted && 'pr-10')
		expect(result).toBe('pr-8 border-red-500')
	})

	it('should handle pointer-events-none class', () => {
		const result = cn('absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-green-600', 'pointer-events-none')
		expect(result).toBe('absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-green-600 pointer-events-none')
	})
})
