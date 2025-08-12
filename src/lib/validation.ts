import { FieldError } from '@/stores/authStore'
import { Locale } from '@/lib/i18n-config'
import { validationTranslations } from '@/lib/translations/validation'
import { authTranslations } from '@/lib/translations/auth'

export const validateEmail = (email: string, locale: Locale = 'fr'): FieldError | null => {
	const t = validationTranslations[locale]
	if (!email) {
		return { message: t.email.required, code: 'required' }
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		return { message: t.email.invalid, code: 'invalid_format' }
	}

	return null
}

export const validatePassword = (password: string, isSignUp = false, locale: Locale = 'fr'): FieldError | null => {
	const t = validationTranslations[locale]
	if (!password) {
		return { message: t.password.required, code: 'required' }
	}

	if (isSignUp) {
		if (password.length < 8) {
			return { message: t.password.tooShort, code: 'too_short' }
		}

		if (!/(?=.*[a-z])/.test(password)) {
			return { message: t.password.missingLowercase, code: 'missing_lowercase' }
		}

		if (!/(?=.*[A-Z])/.test(password)) {
			return { message: t.password.missingUppercase, code: 'missing_uppercase' }
		}

		if (!/(?=.*\d)/.test(password)) {
			return { message: t.password.missingNumber, code: 'missing_number' }
		}
	}

	return null
}

export const validateConfirmPassword = (
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

export const validateName = (name: string, fieldName: string, locale: Locale = 'fr'): FieldError | null => {
	const t = validationTranslations[locale]
	if (!name) {
		return { message: t.name.required(fieldName), code: 'required' }
	}

	if (name.length < 2) {
		return { message: t.name.tooShort(fieldName), code: 'too_short' }
	}

	if (name.length > 50) {
		return { message: t.name.tooLong(fieldName), code: 'too_long' }
	}

	if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(name)) {
		return {
			message: t.name.invalidCharacters(fieldName),
			code: 'invalid_characters',
		}
	}

	return null
}

export const validateVerificationCode = (code: string, locale: Locale = 'fr'): FieldError | null => {
	const t = validationTranslations[locale]
	if (!code) {
		return { message: t.verificationCode.required, code: 'required' }
	}

	if (!/^\d{6}$/.test(code)) {
		return { message: t.verificationCode.invalid, code: 'invalid_format' }
	}

	return null
}

// Helper function to get password strength
export const getPasswordStrength = (
	password: string,
	locale: Locale = 'fr'
): {
	score: number
	feedback: string[]
	color: 'red' | 'orange' | 'yellow' | 'green'
} => {
	const t = authTranslations[locale].passwordStrength
	const feedback: string[] = []
	let score = 0

	if (password.length >= 8) score++
	else feedback.push(t.atLeast8Chars)

	if (/(?=.*[a-z])/.test(password)) score++
	else feedback.push(t.oneLowercase)

	if (/(?=.*[A-Z])/.test(password)) score++
	else feedback.push(t.oneUppercase)

	if (/(?=.*\d)/.test(password)) score++
	else feedback.push(t.oneNumber)

	if (/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
		score++
	} else if (score >= 3) {
		feedback.push(t.oneSpecialChar)
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
