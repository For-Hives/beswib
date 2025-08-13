import { useState, useCallback } from 'react'

import { FieldError } from '@/stores/authStore'
import * as v from 'valibot'

type ValidationResult = {
	isValid: boolean
	errors: Record<string, FieldError | null>
	validate: (data: Record<string, any>) => boolean
	validateField: (field: string, value: any) => FieldError | null
	clearError: (field: string) => void
	clearAllErrors: () => void
}

export function useValibot<T extends Record<string, any>>(schema: v.BaseSchema<any, T, any>): ValidationResult {
	const [errors, setErrors] = useState<Record<string, FieldError | null>>({})

	const validateField = useCallback(
		(field: string, value: any): FieldError | null => {
			try {
				// Create a temporary schema for just this field
				const fieldSchema = (schema as any).entries[field]
				if (!fieldSchema) return null

				const result = v.safeParse(fieldSchema, value)

				if (result.success) {
					// Clear error for this field
					setErrors(prev => ({ ...prev, [field]: null }))
					return null
				}

				const issue = result.issues[0]
				const error: FieldError = {
					message: issue.message,
					code: getErrorCode(issue.type),
				}

				setErrors(prev => ({ ...prev, [field]: error }))
				return error
			} catch {
				return null
			}
		},
		[schema]
	)

	const validate = useCallback(
		(data: Record<string, any>): boolean => {
			const result = v.safeParse(schema, data)

			if (result.success) {
				setErrors({})
				return true
			}

			const newErrors: Record<string, FieldError | null> = {}

			result.issues.forEach(issue => {
				if (issue.path && issue.path.length > 0) {
					const fieldName = issue.path[issue.path.length - 1].key as string
					newErrors[fieldName] = {
						message: issue.message,
						code: getErrorCode(issue.type),
					}
				}
			})

			setErrors(newErrors)
			return false
		},
		[schema]
	)

	const clearError = useCallback((field: string) => {
		setErrors(prev => ({ ...prev, [field]: null }))
	}, [])

	const clearAllErrors = useCallback(() => {
		setErrors({})
	}, [])

	const isValid = Object.values(errors).every(error => error === null)

	return {
		validateField,
		validate,
		isValid,
		errors,
		clearError,
		clearAllErrors,
	}
}

// Helper function to map Valibot validation types to error codes
function getErrorCode(validation?: string): string {
	const codeMap: Record<string, string> = {
		regex: 'invalid_format',
		non_empty: 'required',
		min_length: 'too_short',
		max_length: 'too_long',
		email: 'invalid_format',
		custom: 'custom',
	}

	return codeMap[validation ?? ''] ?? 'invalid'
}
