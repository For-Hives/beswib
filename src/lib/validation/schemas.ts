import { isValidPhoneNumber } from 'libphonenumber-js'
import * as v from 'valibot'

import { validationTranslations } from '@/lib/i18n/translations/validation'
import { getTranslations } from '@/lib/i18n/dictionary'
import mainLocales from '@/app/[locale]/locales.json'
import { Locale } from '@/lib/i18n/config'

// Email schema
export const createEmailSchema = (locale: Locale = 'en') => {
	const t = validationTranslations[locale]
	return v.pipe(v.string(), v.trim(), v.nonEmpty(t.email.required), v.email(t.email.invalid))
}

// Password schema for sign-in (less strict)
export const createSignInPasswordSchema = (locale: Locale = 'en') => {
	const t = validationTranslations[locale]
	return v.pipe(v.string(), v.nonEmpty(t.password.required))
}

// Password schema for sign-up (strict requirements)
export const createSignUpPasswordSchema = (locale: Locale = 'en') => {
	const t = validationTranslations[locale]
	return v.pipe(
		v.string(),
		v.nonEmpty(t.password.required),
		v.minLength(8, t.password.tooShort),
		v.regex(/(?=.*[a-z])/, t.password.missingLowercase),
		v.regex(/(?=.*[A-Z])/, t.password.missingUppercase),
		v.regex(/(?=.*\d)/, t.password.missingNumber)
	)
}

// Name schema (first name / last name)
export const createNameSchema = (fieldName: string, locale: Locale = 'en') => {
	const t = validationTranslations[locale]
	return v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty(t.name.required(fieldName)),
		v.minLength(2, t.name.tooShort(fieldName)),
		v.maxLength(50, t.name.tooLong(fieldName)),
		v.regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, t.name.invalidCharacters(fieldName))
	)
}

// Verification code schema
export const createVerificationCodeSchema = (locale: Locale = 'en') => {
	const t = validationTranslations[locale]
	return v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty(t.verificationCode.required),
		v.regex(/^\d{6}$/, t.verificationCode.invalid)
	)
}

// Phone number schema with international validation
export const createPhoneSchema = (locale: Locale = 'en', required: boolean = false) => {
	const t = validationTranslations[locale]

	const baseValidation = v.pipe(
		v.string(),
		v.trim(),
		v.check((value: string) => {
			if (!value && !required) return true
			if (!value && required) return false
			// Consider phone number as empty if it's just a country code (e.g., "+33" or "+1")
			if (value?.match(/^\+\d{1,3}$/)) return !required
			return isValidPhoneNumber(value)
		}, t.phone?.invalid || 'Invalid phone number')
	)

	if (required) {
		return v.pipe(
			v.string(),
			v.trim(),
			v.nonEmpty(t.phone?.required || 'Phone number is required'),
			v.check((value: string) => {
				// Consider phone number as empty if it's just a country code
				if (value.match(/^\+\d{1,3}$/)) return false
				return isValidPhoneNumber(value)
			}, t.phone?.invalid || 'Invalid phone number')
		)
	}

	return baseValidation
}

// Sign-in form schema
export const createSignInSchema = (locale: Locale = 'en') => {
	return v.object({
		password: createSignInPasswordSchema(locale),
		email: createEmailSchema(locale),
	})
}

// Sign-up form schema
export const createSignUpSchema = (locale: Locale = 'en') => {
	const t = validationTranslations[locale]
	return v.pipe(
		v.object({
			password: createSignUpPasswordSchema(locale),
			lastName: createNameSchema('nom', locale),
			firstName: createNameSchema('prénom', locale),
			email: createEmailSchema(locale),
			confirmPassword: v.pipe(v.string(), v.nonEmpty(t.confirmPassword.required)),
		}),
		v.forward(
			v.partialCheck(
				[['password'], ['confirmPassword']],
				input => input.password === input.confirmPassword,
				t.confirmPassword.noMatch
			),
			['confirmPassword']
		)
	)
}

// Password strength analysis using Valibot
export const analyzePasswordStrength = (password: string, locale: Locale = 'en') => {
	const tAuth = getTranslations(locale, mainLocales).auth.passwordStrength
	let score = 0
	const feedback: string[] = []

	// Length check
	const lengthCheck = v.safeParse(v.pipe(v.string(), v.minLength(8)), password)
	if (lengthCheck.success) {
		score++
	} else {
		feedback.push(tAuth.atLeast8Chars)
	}

	// Lowercase check
	const lowercaseCheck = v.safeParse(v.pipe(v.string(), v.regex(/(?=.*[a-z])/)), password)
	if (lowercaseCheck.success) {
		score++
	} else {
		feedback.push(tAuth.oneLowercase)
	}

	// Uppercase check
	const uppercaseCheck = v.safeParse(v.pipe(v.string(), v.regex(/(?=.*[A-Z])/)), password)
	if (uppercaseCheck.success) {
		score++
	} else {
		feedback.push(tAuth.oneUppercase)
	}

	// Number check
	const numberCheck = v.safeParse(v.pipe(v.string(), v.regex(/(?=.*\d)/)), password)
	if (numberCheck.success) {
		score++
	} else {
		feedback.push(tAuth.oneNumber)
	}

	// Special character check
	const specialCheck = v.safeParse(v.pipe(v.string(), v.regex(/(?=.*[!@#$%^&*(),.?":{}|<>])/)), password)
	if (specialCheck.success) {
		score++
	} else if (score >= 3) {
		feedback.push(tAuth.oneSpecialChar)
	}

	const colors: Record<number, 'red' | 'orange' | 'yellow' | 'green'> = {
		5: 'green',
		4: 'green',
		3: 'yellow',
		2: 'orange',
		1: 'red',
		0: 'red',
	}

	return {
		score,
		feedback,
		color: colors[score] || 'red',
	}
}

// Name schema for optional fields (allows empty)
export const createOptionalNameSchema = (fieldName: string, locale: Locale = 'en') => {
	const t = validationTranslations[locale]
	return v.pipe(
		v.string(),
		v.trim(),
		v.check(
			(value: string) => {
				// Allow empty values
				if (!value) return true
				// If not empty, apply normal name validation
				return value.length >= 2 && value.length <= 50 && /^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)
			},
			t.name?.invalidCharacters?.(fieldName) || `Invalid characters in ${fieldName}`
		)
	)
}

// Optional field schema with minimum length validation only if not empty
export const createOptionalFieldSchema = (minLength: number, fieldName: string) => {
	return v.pipe(
		v.string(),
		v.trim(),
		v.check((value: string) => {
			// Allow empty values
			if (!value) return true
			// If not empty, check minimum length
			return value.length >= minLength
		}, `${fieldName} must be at least ${minLength} characters when provided`)
	)
}

// Runner profile form schema - ALL FIELDS OPTIONAL
export const createRunnerFormSchema = (locale: Locale = 'en') => {
	return v.object({
		postalCode: createOptionalFieldSchema(4, 'Postal code'),
		phoneNumber: createPhoneSchema(locale, false),
		medicalCertificateUrl: v.optional(v.string()),
		licenseNumber: v.optional(v.string()),
		lastName: createOptionalNameSchema('last name', locale),
		gender: v.optional(v.picklist(['male', 'female', 'other'], 'Invalid gender')),
		firstName: createOptionalNameSchema('first name', locale),
		emergencyContactRelationship: createOptionalFieldSchema(2, 'Emergency contact relationship'),
		emergencyContactPhone: createPhoneSchema(locale, false),
		emergencyContactName: createOptionalFieldSchema(2, 'Emergency contact name'),
		country: createOptionalFieldSchema(2, 'Country'),
		contactEmail: v.optional(
			v.pipe(
				v.string(),
				v.trim(),
				v.check((value: string) => {
					// Allow empty values
					if (!value) return true
					// If not empty, must be valid email
					return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
				}, 'Invalid email address')
			)
		),
		consentMarket: v.optional(v.boolean()),
		clubAffiliation: v.optional(v.string()),
		city: createOptionalFieldSchema(2, 'City'),
		birthDate: v.pipe(
			v.string(),
			v.trim(),
			v.check((value: string) => {
				// Allow empty values
				if (!value) return true
				// If not empty, check if it's a valid date format (YYYY-MM-DD)
				return value.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(value)
			}, 'Invalid birth date format')
		),
		address: createOptionalFieldSchema(4, 'Address'),
	})
}

// Utility type for form validation results
export type ValidationResult = {
	success: boolean
	data?: unknown
	error?: string
	fieldErrors?: Record<string, string>
}

// Helper function to validate and format results
export const validateForm = <T>(
	schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>,
	data: unknown
): ValidationResult => {
	const result = v.safeParse(schema, data)

	if (result.success) {
		return {
			success: true,
			data: result.output,
		}
	}

	const fieldErrors: Record<string, string> = {}
	let globalError = ''

	if (result.issues != null) {
		result.issues.forEach(issue => {
			if (issue.path != null && issue.path.length > 0) {
				const lastPath = issue.path[issue.path.length - 1]
				if (lastPath != null && 'key' in lastPath) {
					const fieldName = lastPath.key as string
					fieldErrors[fieldName] = issue.message
				}
			} else {
				globalError = issue.message
			}
		})
	}

	return {
		success: false,
		fieldErrors,
		error: globalError,
	}
}
