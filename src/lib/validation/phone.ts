import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'

export function validatePhoneNumber(value: unknown): boolean {
	if (!value || typeof value !== 'string' || value.trim() === '') {
		return true // Allow empty values (optional field)
	}
	
	try {
		return isValidPhoneNumber(value)
	} catch {
		return false
	}
}

export function formatPhoneNumber(value: string | undefined): string | null {
	if (!value || value.trim() === '') {
		return null
	}
	
	try {
		const phoneNumber = parsePhoneNumber(value)
		return phoneNumber ? phoneNumber.formatInternational() : null
	} catch {
		return null
	}
}

export function getPhoneNumberError(value: string | undefined, locale: string = 'en'): string | null {
	if (!value || value.trim() === '') {
		return null // No error for empty values
	}
	
	if (!validatePhoneNumber(value)) {
		// Return localized error messages
		const messages = {
			en: 'Please enter a valid phone number',
			fr: 'Veuillez saisir un numéro de téléphone valide',
			es: 'Por favor, introduce un número de teléfono válido',
			de: 'Bitte geben Sie eine gültige Telefonnummer ein',
			it: 'Inserisci un numero di telefono valido',
			pt: 'Por favor, insira um número de telefone válido',
			nl: 'Voer een geldig telefoonnummer in',
			pl: 'Proszę wprowadzić prawidłowy numer telefonu',
			ru: 'Пожалуйста, введите действительный номер телефона'
		}
		
		return messages[locale as keyof typeof messages] || messages.en
	}
	
	return null
}