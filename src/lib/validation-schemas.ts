import * as v from 'valibot'
import { Locale } from '@/lib/i18n-config'
import { validationTranslations } from '@/lib/translations/validation'

// Email schema
export const createEmailSchema = (locale: Locale = 'fr') => {
	const t = validationTranslations[locale]
	return v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty(t.email.required),
		v.email(t.email.invalid)
	)
}

// Password schema for sign-in (less strict)
export const createSignInPasswordSchema = (locale: Locale = 'fr') => {
	const t = validationTranslations[locale]
	return v.pipe(
		v.string(),
		v.nonEmpty(t.password.required)
	)
}

// Password schema for sign-up (strict requirements)
export const createSignUpPasswordSchema = (locale: Locale = 'fr') => {
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
export const createNameSchema = (fieldName: string, locale: Locale = 'fr') => {
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
export const createVerificationCodeSchema = (locale: Locale = 'fr') => {
	const t = validationTranslations[locale]
	return v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty(t.verificationCode.required),
		v.regex(/^\d{6}$/, t.verificationCode.invalid)
	)
}

// Sign-in form schema
export const createSignInSchema = (locale: Locale = 'fr') => {
	return v.object({
		email: createEmailSchema(locale),
		password: createSignInPasswordSchema(locale)
	})
}

// Sign-up form schema
export const createSignUpSchema = (locale: Locale = 'fr') => {
	const t = validationTranslations[locale]
	return v.pipe(
		v.object({
			firstName: createNameSchema('prénom', locale),
			lastName: createNameSchema('nom', locale),
			email: createEmailSchema(locale),
			password: createSignUpPasswordSchema(locale),
			confirmPassword: v.pipe(
				v.string(),
				v.nonEmpty(t.confirmPassword.required)
			)
		}),
		v.forward(
			v.partialCheck(
				[['password'], ['confirmPassword']],
				(input) => input.password === input.confirmPassword,
				t.confirmPassword.noMatch
			),
			['confirmPassword']
		)
	)
}

// Password strength analysis using Valibot
export const analyzePasswordStrength = (password: string, locale: Locale = 'fr') => {
	const t = validationTranslations[locale]
	let score = 0
	const feedback: string[] = []

	// Length check
	const lengthCheck = v.safeParse(v.pipe(v.string(), v.minLength(8)), password)
	if (lengthCheck.success) {
		score++
	} else {
		feedback.push('Au moins 8 caractères')
	}

	// Lowercase check
	const lowercaseCheck = v.safeParse(v.pipe(v.string(), v.regex(/(?=.*[a-z])/)), password)
	if (lowercaseCheck.success) {
		score++
	} else {
		feedback.push('Une minuscule')
	}

	// Uppercase check
	const uppercaseCheck = v.safeParse(v.pipe(v.string(), v.regex(/(?=.*[A-Z])/)), password)
	if (uppercaseCheck.success) {
		score++
	} else {
		feedback.push('Une majuscule')
	}

	// Number check
	const numberCheck = v.safeParse(v.pipe(v.string(), v.regex(/(?=.*\d)/)), password)
	if (numberCheck.success) {
		score++
	} else {
		feedback.push('Un chiffre')
	}

	// Special character check
	const specialCheck = v.safeParse(v.pipe(v.string(), v.regex(/(?=.*[!@#$%^&*(),.?":{}|<>])/)), password)
	if (specialCheck.success) {
		score++
	} else if (score >= 3) {
		feedback.push('Un caractère spécial')
	}

	const colors: Record<number, 'red' | 'orange' | 'yellow' | 'green'> = {
		0: 'red',
		1: 'red',
		2: 'orange',
		3: 'yellow',
		4: 'green',
		5: 'green',
	}

	return {
		score,
		feedback,
		color: colors[score] || 'red',
	}
}

// Utility type for form validation results
export type ValidationResult = {
	success: boolean
	data?: any
	error?: string
	fieldErrors?: Record<string, string>
}

// Helper function to validate and format results
export const validateForm = <T>(schema: v.BaseSchema<any, T, any>, data: unknown): ValidationResult => {
	const result = v.safeParse(schema, data)
	
	if (result.success) {
		return {
			success: true,
			data: result.output
		}
	}

	const fieldErrors: Record<string, string> = {}
	let globalError = ''

	if (result.issues) {
		result.issues.forEach(issue => {
			if (issue.path && issue.path.length > 0) {
				const fieldName = issue.path[issue.path.length - 1].key as string
				fieldErrors[fieldName] = issue.message
			} else {
				globalError = issue.message
			}
		})
	}

	return {
		success: false,
		error: globalError,
		fieldErrors
	}
}