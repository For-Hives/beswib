import { Locale } from '@/lib/i18n-config'

export interface ValidationTranslations {
	email: {
		required: string
		invalid: string
	}
	password: {
		required: string
		tooShort: string
		missingLowercase: string
		missingUppercase: string
		missingNumber: string
	}
	confirmPassword: {
		required: string
		noMatch: string
	}
	name: {
		required: (fieldName: string) => string
		tooShort: (fieldName: string) => string
		tooLong: (fieldName: string) => string
		invalidCharacters: (fieldName: string) => string
	}
	verificationCode: {
		required: string
		invalid: string
	}
}

export const validationTranslations: Record<Locale, ValidationTranslations> = {
	en: {
		email: {
			required: 'Email address is required',
			invalid: 'Please enter a valid email address',
		},
		password: {
			required: 'Password is required',
			tooShort: 'Password must be at least 8 characters long',
			missingLowercase: 'Password must contain at least one lowercase letter',
			missingUppercase: 'Password must contain at least one uppercase letter',
			missingNumber: 'Password must contain at least one number',
		},
		confirmPassword: {
			required: 'Please confirm your password',
			noMatch: 'Passwords do not match',
		},
		name: {
			required: (fieldName: string) => `${fieldName} is required`,
			tooShort: (fieldName: string) => `${fieldName} must be at least 2 characters long`,
			tooLong: (fieldName: string) => `${fieldName} cannot exceed 50 characters`,
			invalidCharacters: (fieldName: string) =>
				`${fieldName} can only contain letters, spaces, hyphens and apostrophes`,
		},
		verificationCode: {
			required: 'Verification code is required',
			invalid: 'Code must contain exactly 6 digits',
		},
	},

	fr: {
		email: {
			required: "L'adresse email est requise",
			invalid: 'Veuillez entrer une adresse email valide',
		},
		password: {
			required: 'Le mot de passe est requis',
			tooShort: 'Le mot de passe doit contenir au moins 8 caractères',
			missingLowercase: 'Le mot de passe doit contenir au moins une minuscule',
			missingUppercase: 'Le mot de passe doit contenir au moins une majuscule',
			missingNumber: 'Le mot de passe doit contenir au moins un chiffre',
		},
		confirmPassword: {
			required: 'Veuillez confirmer votre mot de passe',
			noMatch: 'Les mots de passe ne correspondent pas',
		},
		name: {
			required: (fieldName: string) => `Le ${fieldName} est requis`,
			tooShort: (fieldName: string) => `Le ${fieldName} doit contenir au moins 2 caractères`,
			tooLong: (fieldName: string) => `Le ${fieldName} ne peut pas dépasser 50 caractères`,
			invalidCharacters: (fieldName: string) =>
				`Le ${fieldName} ne peut contenir que des lettres, espaces, tirets et apostrophes`,
		},
		verificationCode: {
			required: 'Le code de vérification est requis',
			invalid: 'Le code doit contenir exactement 6 chiffres',
		},
	},

	es: {
		email: {
			required: 'La dirección de correo es obligatoria',
			invalid: 'Por favor ingresa una dirección de correo válida',
		},
		password: {
			required: 'La contraseña es obligatoria',
			tooShort: 'La contraseña debe tener al menos 8 caracteres',
			missingLowercase: 'La contraseña debe contener al menos una letra minúscula',
			missingUppercase: 'La contraseña debe contener al menos una letra mayúscula',
			missingNumber: 'La contraseña debe contener al menos un número',
		},
		confirmPassword: {
			required: 'Por favor confirma tu contraseña',
			noMatch: 'Las contraseñas no coinciden',
		},
		name: {
			required: (fieldName: string) => `El ${fieldName} es obligatorio`,
			tooShort: (fieldName: string) => `El ${fieldName} debe tener al menos 2 caracteres`,
			tooLong: (fieldName: string) => `El ${fieldName} no puede exceder 50 caracteres`,
			invalidCharacters: (fieldName: string) =>
				`El ${fieldName} solo puede contener letras, espacios, guiones y apostrofes`,
		},
		verificationCode: {
			required: 'El código de verificación es obligatorio',
			invalid: 'El código debe contener exactamente 6 dígitos',
		},
	},

	it: {
		email: {
			required: "L'indirizzo email è richiesto",
			invalid: 'Inserisci un indirizzo email valido',
		},
		password: {
			required: 'La password è richiesta',
			tooShort: 'La password deve essere di almeno 8 caratteri',
			missingLowercase: 'La password deve contenere almeno una lettera minuscola',
			missingUppercase: 'La password deve contenere almeno una lettera maiuscola',
			missingNumber: 'La password deve contenere almeno un numero',
		},
		confirmPassword: {
			required: 'Si prega di confermare la password',
			noMatch: 'Le password non corrispondono',
		},
		name: {
			required: (fieldName: string) => `Il ${fieldName} è richiesto`,
			tooShort: (fieldName: string) => `Il ${fieldName} deve essere di almeno 2 caratteri`,
			tooLong: (fieldName: string) => `Il ${fieldName} non può superare i 50 caratteri`,
			invalidCharacters: (fieldName: string) =>
				`Il ${fieldName} può contenere solo lettere, spazi, trattini e apostrofi`,
		},
		verificationCode: {
			required: 'Il codice di verifica è richiesto',
			invalid: 'Il codice deve contenere esattamente 6 cifre',
		},
	},

	de: {
		email: {
			required: 'E-Mail-Adresse ist erforderlich',
			invalid: 'Bitte gib eine gültige E-Mail-Adresse ein',
		},
		password: {
			required: 'Passwort ist erforderlich',
			tooShort: 'Passwort muss mindestens 8 Zeichen lang sein',
			missingLowercase: 'Passwort muss mindestens einen Kleinbuchstaben enthalten',
			missingUppercase: 'Passwort muss mindestens einen Großbuchstaben enthalten',
			missingNumber: 'Passwort muss mindestens eine Zahl enthalten',
		},
		confirmPassword: {
			required: 'Bitte bestätige dein Passwort',
			noMatch: 'Passwörter stimmen nicht überein',
		},
		name: {
			required: (fieldName: string) => `${fieldName} ist erforderlich`,
			tooShort: (fieldName: string) => `${fieldName} muss mindestens 2 Zeichen lang sein`,
			tooLong: (fieldName: string) => `${fieldName} darf 50 Zeichen nicht überschreiten`,
			invalidCharacters: (fieldName: string) =>
				`${fieldName} darf nur Buchstaben, Leerzeichen, Bindestriche und Apostrophe enthalten`,
		},
		verificationCode: {
			required: 'Verifizierungscode ist erforderlich',
			invalid: 'Code muss genau 6 Ziffern enthalten',
		},
	},

	ro: {
		email: {
			required: 'Adresa de email este obligatorie',
			invalid: 'Te rugăm să introduci o adresă de email validă',
		},
		password: {
			required: 'Parola este obligatorie',
			tooShort: 'Parola trebuie să aibă cel puțin 8 caractere',
			missingLowercase: 'Parola trebuie să conțină cel puțin o literă mică',
			missingUppercase: 'Parola trebuie să conțină cel puțin o literă mare',
			missingNumber: 'Parola trebuie să conțină cel puțin un număr',
		},
		confirmPassword: {
			required: 'Te rugăm să confirmi parola',
			noMatch: 'Parolele nu se potrivesc',
		},
		name: {
			required: (fieldName: string) => `${fieldName} este obligatoriu`,
			tooShort: (fieldName: string) => `${fieldName} trebuie să aibă cel puțin 2 caractere`,
			tooLong: (fieldName: string) => `${fieldName} nu poate depăși 50 de caractere`,
			invalidCharacters: (fieldName: string) =>
				`${fieldName} poate conține doar litere, spații, cratime și apostrofuri`,
		},
		verificationCode: {
			required: 'Codul de verificare este obligatoriu',
			invalid: 'Codul trebuie să conțină exact 6 cifre',
		},
	},

	pt: {
		email: {
			required: 'O endereço de email é obrigatório',
			invalid: 'Por favor, insira um endereço de email válido',
		},
		password: {
			required: 'A senha é obrigatória',
			tooShort: 'A senha deve ter pelo menos 8 caracteres',
			missingLowercase: 'A senha deve conter pelo menos uma letra minúscula',
			missingUppercase: 'A senha deve conter pelo menos uma letra maiúscula',
			missingNumber: 'A senha deve conter pelo menos um número',
		},
		confirmPassword: {
			required: 'Por favor, confirme sua senha',
			noMatch: 'As senhas não coincidem',
		},
		name: {
			required: (fieldName: string) => `O ${fieldName} é obrigatório`,
			tooShort: (fieldName: string) => `O ${fieldName} deve ter pelo menos 2 caracteres`,
			tooLong: (fieldName: string) => `O ${fieldName} não pode exceder 50 caracteres`,
			invalidCharacters: (fieldName: string) =>
				`O ${fieldName} pode conter apenas letras, espaços, hífens e apostrofes`,
		},
		verificationCode: {
			required: 'O código de verificação é obrigatório',
			invalid: 'O código deve conter exatamente 6 dígitos',
		},
	},

	nl: {
		email: {
			required: 'E-mailadres is verplicht',
			invalid: 'Voer een geldig e-mailadres in',
		},
		password: {
			required: 'Wachtwoord is verplicht',
			tooShort: 'Wachtwoord moet minstens 8 tekens lang zijn',
			missingLowercase: 'Wachtwoord moet minstens één kleine letter bevatten',
			missingUppercase: 'Wachtwoord moet minstens één hoofdletter bevatten',
			missingNumber: 'Wachtwoord moet minstens één cijfer bevatten',
		},
		confirmPassword: {
			required: 'Bevestig je wachtwoord',
			noMatch: 'Wachtwoorden komen niet overeen',
		},
		name: {
			required: (fieldName: string) => `${fieldName} is verplicht`,
			tooShort: (fieldName: string) => `${fieldName} moet minstens 2 tekens lang zijn`,
			tooLong: (fieldName: string) => `${fieldName} mag niet langer zijn dan 50 tekens`,
			invalidCharacters: (fieldName: string) =>
				`${fieldName} mag alleen letters, spaties, koppeltekens en apostrofes bevatten`,
		},
		verificationCode: {
			required: 'Verificatiecode is verplicht',
			invalid: 'Code moet precies 6 cijfers bevatten',
		},
	},

	ko: {
		email: {
			required: '이메일 주소는 필수입니다',
			invalid: '유효한 이메일 주소를 입력해주세요',
		},
		password: {
			required: '비밀번호는 필수입니다',
			tooShort: '비밀번호는 최소 8자 이상이어야 합니다',
			missingLowercase: '비밀번호는 최소 하나의 소문자를 포함해야 합니다',
			missingUppercase: '비밀번호는 최소 하나의 대문자를 포함해야 합니다',
			missingNumber: '비밀번호는 최소 하나의 숫자를 포함해야 합니다',
		},
		confirmPassword: {
			required: '비밀번호를 확인해주세요',
			noMatch: '비밀번호가 일치하지 않습니다',
		},
		name: {
			required: (fieldName: string) => `${fieldName}은(는) 필수입니다`,
			tooShort: (fieldName: string) => `${fieldName}은(는) 최소 2자 이상이어야 합니다`,
			tooLong: (fieldName: string) => `${fieldName}은(는) 50자를 초과할 수 없습니다`,
			invalidCharacters: (fieldName: string) =>
				`${fieldName}은(는) 문자, 공백, 하이픈, 아포스트로피만 포함할 수 있습니다`,
		},
		verificationCode: {
			required: '인증 코드는 필수입니다',
			invalid: '코드는 정확히 6자리 숫자여야 합니다',
		},
	},
}
