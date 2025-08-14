import { FieldError } from '@/stores/authStore'
import * as v from 'valibot'

import { validationTranslations } from '@/lib/translations/validation'
import { authTranslations } from '@/lib/translations/auth'
import { Locale } from '@/lib/i18n-config'

import {
    createEmailSchema,
    createSignInPasswordSchema,
    createSignUpPasswordSchema,
    createNameSchema,
    createVerificationCodeSchema,
    analyzePasswordStrength,
} from './validation-schemas'

// Email validation using Valibot
export const validateEmailValibot = (email: string, locale: Locale = 'fr'): FieldError | null => {
	const schema = createEmailSchema(locale)
	const result = v.safeParse(schema, email)

	if (result.success) {
		return null
	}

	const issue = result.issues[0]
	return {
		message: issue.message,
		code: issue.type === 'email' ? 'invalid_format' : 'required',
	}
}

// Password validation using Valibot
export const validatePasswordValibot = (
	password: string,
	isSignUp = false,
	locale: Locale = 'fr'
): FieldError | null => {
	const schema = isSignUp ? createSignUpPasswordSchema(locale) : createSignInPasswordSchema(locale)
	const result = v.safeParse(schema, password)

	if (result.success) {
		return null
	}

	const issue = result.issues[0]
	let code = 'required'

	if (issue.type === 'min_length') code = 'too_short'
	else if (issue.type === 'regex') {
		const message = issue.message
		if (message.includes('minuscule')) code = 'missing_lowercase'
		else if (message.includes('majuscule')) code = 'missing_uppercase'
		else if (message.includes('chiffre')) code = 'missing_number'
	}

	return {
		message: issue.message,
		code,
	}
}

// Confirm password validation using Valibot
export const validateConfirmPasswordValibot = (
	password: string,
	confirmPassword: string,
	locale: Locale = 'fr'
): FieldError | null => {
	const t = validationTranslations[locale]

	if (!confirmPassword) {
		return { message: t.confirmPassword.required, code: 'required' }
	}

	if (password !== confirmPassword) {
		return { message: t.confirmPassword.noMatch, code: 'no_match' }
	}

	return null
}

// Name validation using Valibot
export const validateNameValibot = (name: string, fieldName: string, locale: Locale = 'fr'): FieldError | null => {
	const schema = createNameSchema(fieldName, locale)
	const result = v.safeParse(schema, name)

	if (result.success) {
		return null
	}

	const issue = result.issues[0]
	let code = 'required'

	if (issue.type === 'min_length') code = 'too_short'
	else if (issue.type === 'max_length') code = 'too_long'
	else if (issue.type === 'regex') code = 'invalid_characters'

	return {
		message: issue.message,
		code,
	}
}

// Verification code validation using Valibot
export const validateVerificationCodeValibot = (code: string, locale: Locale = 'fr'): FieldError | null => {
	const schema = createVerificationCodeSchema(locale)
	const result = v.safeParse(schema, code)

	if (result.success) {
		return null
	}

	const issue = result.issues[0]
	return {
		message: issue.message,
		code: issue.type === 'regex' ? 'invalid_format' : 'required',
	}
}

// Enhanced password strength using Valibot (wrapper around existing function)
export const getPasswordStrengthValibot = (
    password: string,
    locale: Locale = 'fr'
): {
	score: number
	feedback: string[]
	color: 'red' | 'orange' | 'yellow' | 'green'
} => {
    return analyzePasswordStrength(password, locale)
}

// Form validation helpers
export const validateSignInForm = (data: { email: string; password: string }, locale: Locale = 'fr') => {
	const emailError = validateEmailValibot(data.email, locale)
	const passwordError = validatePasswordValibot(data.password, false, locale)

	return {
		isValid: !emailError && !passwordError,
		errors: {
			password: passwordError,
			email: emailError,
		},
	}
}

export const validateSignUpForm = (
	data: {
		firstName: string
		lastName: string
		email: string
		password: string
		confirmPassword: string
	},
	locale: Locale = 'fr'
) => {
	const t = authTranslations[locale]

	const firstNameError = validateNameValibot(data.firstName, t.signUp.firstNameLabel.toLowerCase(), locale)
	const lastNameError = validateNameValibot(data.lastName, t.signUp.lastNameLabel.toLowerCase(), locale)
	const emailError = validateEmailValibot(data.email, locale)
	const passwordError = validatePasswordValibot(data.password, true, locale)
	const confirmPasswordError = validateConfirmPasswordValibot(data.password, data.confirmPassword, locale)

	return {
		isValid: !firstNameError && !lastNameError && !emailError && !passwordError && !confirmPasswordError,
		errors: {
			password: passwordError,
			lastName: lastNameError,
			firstName: firstNameError,
			email: emailError,
			confirmPassword: confirmPasswordError,
		},
	}
}
