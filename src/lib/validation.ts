import { FieldError } from '@/stores/authStore'

export const validateEmail = (email: string): FieldError | null => {
	if (!email) {
		return { message: "L'adresse email est requise", code: 'required' }
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		return { message: 'Veuillez entrer une adresse email valide', code: 'invalid_format' }
	}

	return null
}

export const validatePassword = (password: string, isSignUp = false): FieldError | null => {
	if (!password) {
		return { message: 'Le mot de passe est requis', code: 'required' }
	}

	if (isSignUp) {
		if (password.length < 8) {
			return { message: 'Le mot de passe doit contenir au moins 8 caractères', code: 'too_short' }
		}

		if (!/(?=.*[a-z])/.test(password)) {
			return { message: 'Le mot de passe doit contenir au moins une minuscule', code: 'missing_lowercase' }
		}

		if (!/(?=.*[A-Z])/.test(password)) {
			return { message: 'Le mot de passe doit contenir au moins une majuscule', code: 'missing_uppercase' }
		}

		if (!/(?=.*\d)/.test(password)) {
			return { message: 'Le mot de passe doit contenir au moins un chiffre', code: 'missing_number' }
		}
	}

	return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string): FieldError | null => {
	if (!confirmPassword) {
		return { message: 'Veuillez confirmer votre mot de passe', code: 'required' }
	}

	if (password !== confirmPassword) {
		return { message: 'Les mots de passe ne correspondent pas', code: 'no_match' }
	}

	return null
}

export const validateName = (name: string, fieldName: string): FieldError | null => {
	if (!name) {
		return { message: `Le ${fieldName} est requis`, code: 'required' }
	}

	if (name.length < 2) {
		return { message: `Le ${fieldName} doit contenir au moins 2 caractères`, code: 'too_short' }
	}

	if (name.length > 50) {
		return { message: `Le ${fieldName} ne peut pas dépasser 50 caractères`, code: 'too_long' }
	}

	if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(name)) {
		return {
			message: `Le ${fieldName} ne peut contenir que des lettres, espaces, tirets et apostrophes`,
			code: 'invalid_characters',
		}
	}

	return null
}

export const validateVerificationCode = (code: string): FieldError | null => {
	if (!code) {
		return { message: 'Le code de vérification est requis', code: 'required' }
	}

	if (!/^\d{6}$/.test(code)) {
		return { message: 'Le code doit contenir exactement 6 chiffres', code: 'invalid_format' }
	}

	return null
}

// Helper function to get password strength
export const getPasswordStrength = (
	password: string
): {
	score: number
	feedback: string[]
	color: 'red' | 'orange' | 'yellow' | 'green'
} => {
	const feedback: string[] = []
	let score = 0

	if (password.length >= 8) score++
	else feedback.push('Au moins 8 caractères')

	if (/(?=.*[a-z])/.test(password)) score++
	else feedback.push('Une lettre minuscule')

	if (/(?=.*[A-Z])/.test(password)) score++
	else feedback.push('Une lettre majuscule')

	if (/(?=.*\d)/.test(password)) score++
	else feedback.push('Un chiffre')

	if (/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
		score++
	} else if (score >= 3) {
		feedback.push('Un caractère spécial (optionnel)')
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
