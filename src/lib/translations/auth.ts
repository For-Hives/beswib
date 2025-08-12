import { Locale } from '@/lib/i18n-config'

export interface AuthTranslations {
	// Common fields
	fields: {
		email: string
		password: string
		firstName: string
		lastName: string
		confirmPassword: string
	}

	// Common placeholders
	placeholders: {
		email: string
		password: string
		firstName: string
		lastName: string
		confirmPassword: string
	}

	// Common messages
	somethingWentWrong: string

	// Legal text
	legal: {
		termsText: string
		termsOfService: string
		privacyPolicy: string
		and: string
	}

	// Sign In
	signIn: {
		title: string
		subtitle: string
		welcome: string
		forgotPassword: string
		signInButton: string
		signingIn: string
		signIn: string
		noAccount: string
		createAccount: string
		continueWithGoogle: string
		continueWithFacebook: string
		orContinueWith: string
	}

	// Sign Up
	signUp: {
		title: string
		subtitle: string
		firstNameLabel: string
		firstNamePlaceholder: string
		lastNameLabel: string
		lastNamePlaceholder: string
		emailLabel: string
		emailPlaceholder: string
		passwordLabel: string
		passwordPlaceholder: string
		confirmPasswordLabel: string
		confirmPasswordPlaceholder: string
		signUpButton: string
		signingUp: string
		alreadyAccount: string
		signIn: string
		signUpWithGoogle: string
		signUpWithFacebook: string
		orCreateWith: string

		// Email verification
		verifyEmail: {
			title: string
			subtitle: string
			codeLabel: string
			codePlaceholder: string
			verifyButton: string
			verifying: string
			backToForm: string
		}
	}

	// Forgot Password
	forgotPassword: {
		title: string
		subtitle: string
		emailSentSubtitle: string
		successSubtitle: string
		emailLabel: string
		emailPlaceholder: string
		newPasswordLabel: string
		resetCodeLabel: string
		resetCodePlaceholder: string
		sendCodeButton: string
		resetPasswordButton: string
		backToSignIn: string
		continueToDashboard: string
	}

	// Password Strength
	passwordStrength: {
		label: string
		veryWeak: string
		weak: string
		medium: string
		good: string
		strong: string
		veryStrong: string
		suggestions: string
		atLeast8Chars: string
		oneLowercase: string
		oneUppercase: string
		oneNumber: string
		oneSpecialChar: string
	}

	// Common
	common: {
		loading: string
		redirecting: string
		valid: string
	}
}

export const authTranslations: Record<Locale, AuthTranslations> = {
	en: {
		// Common fields
		fields: {
			email: 'Email address',
			password: 'Password',
			firstName: 'First name',
			lastName: 'Last name',
			confirmPassword: 'Confirm password',
		},

		// Common placeholders
		placeholders: {
			email: 'your@email.com',
			password: '••••••••',
			firstName: 'John',
			lastName: 'Doe',
			confirmPassword: '••••••••',
		},

		// Common messages
		somethingWentWrong: 'Something went wrong. Please try again.',

		// Legal text
		legal: {
			termsText: 'By creating an account, you agree to our',
			termsOfService: 'Terms of Service',
			privacyPolicy: 'Privacy Policy',
			and: 'and',
		},

		signIn: {
			title: 'Welcome back!',
			subtitle: 'Sign in to your account to continue',
			welcome: 'Welcome back!',
			forgotPassword: 'Forgot password?',
			signInButton: 'Sign in',
			signingIn: 'Signing in...',
			signIn: 'Sign in',
			noAccount: 'No account yet?',
			createAccount: 'Create account',
			continueWithGoogle: 'Sign in with Google',
			continueWithFacebook: 'Sign in with Facebook',
			orContinueWith: 'or continue with',
		},
		signUp: {
			title: 'Create account',
			subtitle: 'Join the Beswib community and start exchanging your bibs',
			firstNameLabel: 'First name',
			firstNamePlaceholder: 'John',
			lastNameLabel: 'Last name',
			lastNamePlaceholder: 'Doe',
			emailLabel: 'Email address',
			emailPlaceholder: 'your@email.com',
			passwordLabel: 'Password',
			passwordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirm password',
			confirmPasswordPlaceholder: '••••••••',
			signUpButton: 'Create account',
			signingUp: 'Creating...',
			alreadyAccount: 'Already have an account?',
			signIn: 'Sign in',
			signUpWithGoogle: 'Sign up with Google',
			signUpWithFacebook: 'Sign up with Facebook',
			orCreateWith: 'or create account with',
			verifyEmail: {
				title: 'Verify your email',
				subtitle: 'We sent a verification code to',
				codeLabel: 'Verification code',
				codePlaceholder: '123456',
				verifyButton: 'Verify',
				verifying: 'Verifying...',
				backToForm: '← Back to signup form',
			},
		},
		forgotPassword: {
			title: 'Forgot password',
			subtitle: 'Enter your email address to receive a reset code',
			emailSentSubtitle: 'We sent a reset code to your email',
			successSubtitle: 'Your password has been successfully reset!',
			emailLabel: 'Email address',
			emailPlaceholder: 'your@email.com',
			newPasswordLabel: 'New password',
			resetCodeLabel: 'Reset code',
			resetCodePlaceholder: '123456',
			sendCodeButton: 'Send code',
			resetPasswordButton: 'Reset password',
			backToSignIn: '← Back to sign in',
			continueToDashboard: 'Continue to dashboard',
		},
		passwordStrength: {
			label: 'Password strength',
			veryWeak: 'Very weak',
			weak: 'Weak',
			medium: 'Medium',
			good: 'Good',
			strong: 'Strong',
			veryStrong: 'Very strong',
			suggestions: 'Suggested improvements:',
			atLeast8Chars: 'At least 8 characters',
			oneLowercase: 'One lowercase letter',
			oneUppercase: 'One uppercase letter',
			oneNumber: 'One number',
			oneSpecialChar: 'One special character (optional)',
		},
		common: {
			loading: 'Loading...',
			redirecting: 'Redirecting...',
			valid: 'Valid',
		},
	},

	fr: {
		// Common fields
		fields: {
			email: 'Adresse email',
			password: 'Mot de passe',
			firstName: 'Prénom',
			lastName: 'Nom',
			confirmPassword: 'Confirmer le mot de passe',
		},

		// Common placeholders
		placeholders: {
			email: 'votre@email.com',
			password: '••••••••',
			firstName: 'Jean',
			lastName: 'Dupont',
			confirmPassword: '••••••••',
		},

		// Common messages
		somethingWentWrong: "Quelque chose s'est mal passé. Veuillez réessayer.",

		// Legal text
		legal: {
			termsText: 'En créant un compte, vous acceptez nos',
			termsOfService: 'Conditions d\'utilisation',
			privacyPolicy: 'Politique de confidentialité',
			and: 'et',
		},

		signIn: {
			title: 'Bon retour !',
			subtitle: 'Connectez-vous à votre compte pour continuer',
			welcome: 'Bon retour !',
			forgotPassword: 'Mot de passe oublié ?',
			signInButton: 'Se connecter',
			signingIn: 'Connexion...',
			signIn: 'Se connecter',
			noAccount: 'Pas encore de compte ?',
			createAccount: 'Créer un compte',
			continueWithGoogle: 'Se connecter avec Google',
			continueWithFacebook: 'Se connecter avec Facebook',
			orContinueWith: 'ou continuez avec',
		},
		signUp: {
			title: 'Créer un compte',
			subtitle: 'Rejoignez la communauté Beswib et commencez à échanger vos dossards',
			firstNameLabel: 'Prénom',
			firstNamePlaceholder: 'Jean',
			lastNameLabel: 'Nom',
			lastNamePlaceholder: 'Dupont',
			emailLabel: 'Adresse email',
			emailPlaceholder: 'votre@email.com',
			passwordLabel: 'Mot de passe',
			passwordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirmer le mot de passe',
			confirmPasswordPlaceholder: '••••••••',
			signUpButton: 'Créer un compte',
			signingUp: 'Création...',
			alreadyAccount: 'Déjà un compte ?',
			signIn: 'Se connecter',
			signUpWithGoogle: "S'inscrire avec Google",
			signUpWithFacebook: "S'inscrire avec Facebook",
			orCreateWith: 'ou créez un compte avec',
			verifyEmail: {
				title: 'Vérifiez votre email',
				subtitle: 'Nous avons envoyé un code de vérification à',
				codeLabel: 'Code de vérification',
				codePlaceholder: '123456',
				verifyButton: 'Vérifier',
				verifying: 'Vérification...',
				backToForm: "← Retour au formulaire d'inscription",
			},
		},
		forgotPassword: {
			title: 'Mot de passe oublié',
			subtitle: 'Entrez votre adresse email pour recevoir un code de réinitialisation',
			emailSentSubtitle: 'Nous avons envoyé un code de réinitialisation à votre email',
			successSubtitle: 'Votre mot de passe a été réinitialisé avec succès !',
			emailLabel: 'Adresse email',
			emailPlaceholder: 'votre@email.com',
			newPasswordLabel: 'Nouveau mot de passe',
			resetCodeLabel: 'Code de réinitialisation',
			resetCodePlaceholder: '123456',
			sendCodeButton: 'Envoyer le code',
			resetPasswordButton: 'Réinitialiser le mot de passe',
			backToSignIn: '← Retour à la connexion',
			continueToDashboard: 'Continuer vers le tableau de bord',
		},
		passwordStrength: {
			label: 'Force du mot de passe',
			veryWeak: 'Très faible',
			weak: 'Faible',
			medium: 'Moyen',
			good: 'Bon',
			strong: 'Fort',
			veryStrong: 'Très fort',
			suggestions: 'Améliorations suggérées :',
			atLeast8Chars: 'Au moins 8 caractères',
			oneLowercase: 'Une lettre minuscule',
			oneUppercase: 'Une lettre majuscule',
			oneNumber: 'Un chiffre',
			oneSpecialChar: 'Un caractère spécial (optionnel)',
		},
		common: {
			loading: 'Chargement...',
			redirecting: 'Redirection...',
			valid: 'Valide',
		},
	},

	es: {
		// Common fields
		fields: {
			email: 'Dirección de correo',
			password: 'Contraseña',
			firstName: 'Nombre',
			lastName: 'Apellido',
			confirmPassword: 'Confirmar contraseña',
		},

		// Common placeholders
		placeholders: {
			email: 'tu@email.com',
			password: '••••••••',
			firstName: 'Juan',
			lastName: 'Pérez',
			confirmPassword: '••••••••',
		},

		// Common messages
		somethingWentWrong: 'Algo salió mal. Por favor intenta de nuevo.',

		// Legal text
		legal: {
			termsText: 'Al crear una cuenta, aceptas nuestros',
			termsOfService: 'Términos de Servicio',
			privacyPolicy: 'Política de Privacidad',
			and: 'y',
		},

		signIn: {
			title: '¡Bienvenido de vuelta!',
			subtitle: 'Inicia sesión en tu cuenta para continuar',
			welcome: '¡Bienvenido de vuelta!',
			forgotPassword: '¿Olvidaste tu contraseña?',
			signInButton: 'Iniciar sesión',
			signingIn: 'Iniciando sesión...',
			signIn: 'Iniciar sesión',
			noAccount: '¿No tienes cuenta?',
			createAccount: 'Crear cuenta',
			continueWithGoogle: 'Iniciar sesión con Google',
			continueWithFacebook: 'Iniciar sesión con Facebook',
			orContinueWith: 'o continúa con',
		},
		signUp: {
			title: 'Crear cuenta',
			subtitle: 'Únete a la comunidad Beswib y comienza a intercambiar tus dorsales',
			firstNameLabel: 'Nombre',
			firstNamePlaceholder: 'Juan',
			lastNameLabel: 'Apellido',
			lastNamePlaceholder: 'Pérez',
			emailLabel: 'Dirección de correo',
			emailPlaceholder: 'tu@email.com',
			passwordLabel: 'Contraseña',
			passwordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirmar contraseña',
			confirmPasswordPlaceholder: '••••••••',
			signUpButton: 'Crear cuenta',
			signingUp: 'Creando...',
			alreadyAccount: '¿Ya tienes cuenta?',
			signIn: 'Iniciar sesión',
			signUpWithGoogle: 'Registrarse con Google',
			signUpWithFacebook: 'Registrarse con Facebook',
			orCreateWith: 'o crea una cuenta con',
			verifyEmail: {
				title: 'Verifica tu correo',
				subtitle: 'Enviamos un código de verificación a',
				codeLabel: 'Código de verificación',
				codePlaceholder: '123456',
				verifyButton: 'Verificar',
				verifying: 'Verificando...',
				backToForm: '← Volver al formulario de registro',
			},
		},
		forgotPassword: {
			title: 'Contraseña olvidada',
			subtitle: 'Introduce tu dirección de correo para recibir un código de recuperación',
			emailSentSubtitle: 'Enviamos un código de recuperación a tu correo',
			successSubtitle: '¡Tu contraseña ha sido restablecida exitosamente!',
			emailLabel: 'Dirección de correo',
			emailPlaceholder: 'tu@email.com',
			newPasswordLabel: 'Nueva contraseña',
			resetCodeLabel: 'Código de recuperación',
			resetCodePlaceholder: '123456',
			sendCodeButton: 'Enviar código',
			resetPasswordButton: 'Restablecer contraseña',
			backToSignIn: '← Volver al inicio de sesión',
			continueToDashboard: 'Continuar al panel',
		},
		passwordStrength: {
			label: 'Fuerza de contraseña',
			veryWeak: 'Muy débil',
			weak: 'Débil',
			medium: 'Media',
			good: 'Buena',
			strong: 'Fuerte',
			veryStrong: 'Muy fuerte',
			suggestions: 'Mejoras sugeridas:',
			atLeast8Chars: 'Al menos 8 caracteres',
			oneLowercase: 'Una letra minúscula',
			oneUppercase: 'Una letra mayúscula',
			oneNumber: 'Un número',
			oneSpecialChar: 'Un carácter especial (opcional)',
		},
		common: {
			loading: 'Cargando...',
			redirecting: 'Redirigiendo...',
			valid: 'Válido',
		},
	},

	it: {
		// Common fields
		fields: {
			email: 'Indirizzo email',
			password: 'Password',
			firstName: 'Nome',
			lastName: 'Cognome',
			confirmPassword: 'Conferma password',
		},

		// Common placeholders
		placeholders: {
			email: 'tuo@email.com',
			password: '••••••••',
			firstName: 'Mario',
			lastName: 'Rossi',
			confirmPassword: '••••••••',
		},

		// Common messages
		somethingWentWrong: 'Qualcosa è andato storto. Riprova.',

		// Legal text
		legal: {
			termsText: 'Creando un account, accetti i nostri',
			termsOfService: 'Termini di Servizio',
			privacyPolicy: 'Politica sulla Privacy',
			and: 'e',
		},

		signIn: {
			title: 'Bentornato!',
			subtitle: 'Accedi al tuo account per continuare',
			welcome: 'Bentornato!',
			forgotPassword: 'Password dimenticata?',
			signInButton: 'Accedi',
			signingIn: 'Accesso in corso...',
			signIn: 'Accedi',
			noAccount: 'Non hai un account?',
			createAccount: 'Crea account',
			continueWithGoogle: 'Accedi con Google',
			continueWithFacebook: 'Accedi con Facebook',
			orContinueWith: 'o continua con',
		},
		signUp: {
			title: 'Crea account',
			subtitle: 'Unisciti alla comunità Beswib e inizia a scambiare i tuoi pettorali',
			firstNameLabel: 'Nome',
			firstNamePlaceholder: 'Mario',
			lastNameLabel: 'Cognome',
			lastNamePlaceholder: 'Rossi',
			emailLabel: 'Indirizzo email',
			emailPlaceholder: 'tuo@email.com',
			passwordLabel: 'Password',
			passwordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Conferma password',
			confirmPasswordPlaceholder: '••••••••',
			signUpButton: 'Crea account',
			signingUp: 'Creazione...',
			alreadyAccount: 'Hai già un account?',
			signIn: 'Accedi',
			signUpWithGoogle: 'Registrati con Google',
			signUpWithFacebook: 'Registrati con Facebook',
			orCreateWith: 'o crea un account con',
			verifyEmail: {
				title: 'Verifica la tua email',
				subtitle: 'Abbiamo inviato un codice di verifica a',
				codeLabel: 'Codice di verifica',
				codePlaceholder: '123456',
				verifyButton: 'Verifica',
				verifying: 'Verifica in corso...',
				backToForm: '← Torna al modulo di registrazione',
			},
		},
		forgotPassword: {
			title: 'Password dimenticata',
			subtitle: 'Inserisci il tuo indirizzo email per ricevere un codice di ripristino',
			emailSentSubtitle: 'Abbiamo inviato un codice di ripristino alla tua email',
			successSubtitle: 'La tua password è stata ripristinata con successo!',
			emailLabel: 'Indirizzo email',
			emailPlaceholder: 'tuo@email.com',
			newPasswordLabel: 'Nuova password',
			resetCodeLabel: 'Codice di ripristino',
			resetCodePlaceholder: '123456',
			sendCodeButton: 'Invia codice',
			resetPasswordButton: 'Ripristina password',
			backToSignIn: '← Torna al login',
			continueToDashboard: 'Continua alla dashboard',
		},
		passwordStrength: {
			label: 'Forza password',
			veryWeak: 'Molto debole',
			weak: 'Debole',
			medium: 'Media',
			good: 'Buona',
			strong: 'Forte',
			veryStrong: 'Molto forte',
			suggestions: 'Miglioramenti suggeriti:',
			atLeast8Chars: 'Almeno 8 caratteri',
			oneLowercase: 'Una lettera minuscola',
			oneUppercase: 'Una lettera maiuscola',
			oneNumber: 'Un numero',
			oneSpecialChar: 'Un carattere speciale (opzionale)',
		},
		common: {
			loading: 'Caricamento...',
			redirecting: 'Reindirizzamento...',
			valid: 'Valido',
		},
	},

	de: {
		// Common fields
		fields: {
			email: 'E-Mail-Adresse',
			password: 'Passwort',
			firstName: 'Vorname',
			lastName: 'Nachname',
			confirmPassword: 'Passwort bestätigen',
		},

		// Common placeholders
		placeholders: {
			email: 'deine@email.com',
			password: '••••••••',
			firstName: 'Max',
			lastName: 'Mustermann',
			confirmPassword: '••••••••',
		},

		// Common messages
		somethingWentWrong: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',

		// Legal text
		legal: {
			termsText: 'Mit der Erstellung eines Kontos stimmst du unseren',
			termsOfService: 'Nutzungsbedingungen',
			privacyPolicy: 'Datenschutzrichtlinie',
			and: 'und',
		},

		signIn: {
			title: 'Willkommen zurück!',
			subtitle: 'Melde dich in deinem Konto an, um fortzufahren',
			welcome: 'Willkommen zurück!',
			forgotPassword: 'Passwort vergessen?',
			signInButton: 'Anmelden',
			signingIn: 'Anmeldung...',
			signIn: 'Anmelden',
			noAccount: 'Noch kein Konto?',
			createAccount: 'Konto erstellen',
			continueWithGoogle: 'Mit Google anmelden',
			continueWithFacebook: 'Mit Facebook anmelden',
			orContinueWith: 'oder fortfahren mit',
		},
		signUp: {
			title: 'Konto erstellen',
			subtitle: 'Trete der Beswib-Community bei und beginne deine Startnummern zu tauschen',
			firstNameLabel: 'Vorname',
			firstNamePlaceholder: 'Max',
			lastNameLabel: 'Nachname',
			lastNamePlaceholder: 'Mustermann',
			emailLabel: 'E-Mail-Adresse',
			emailPlaceholder: 'deine@email.com',
			passwordLabel: 'Passwort',
			passwordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Passwort bestätigen',
			confirmPasswordPlaceholder: '••••••••',
			signUpButton: 'Konto erstellen',
			signingUp: 'Erstelle...',
			alreadyAccount: 'Bereits ein Konto?',
			signIn: 'Anmelden',
			signUpWithGoogle: 'Mit Google registrieren',
			signUpWithFacebook: 'Mit Facebook registrieren',
			orCreateWith: 'oder Konto erstellen mit',
			verifyEmail: {
				title: 'E-Mail verifizieren',
				subtitle: 'Wir haben einen Verifizierungscode gesendet an',
				codeLabel: 'Verifizierungscode',
				codePlaceholder: '123456',
				verifyButton: 'Verifizieren',
				verifying: 'Verifiziere...',
				backToForm: '← Zurück zum Registrierungsformular',
			},
		},
		forgotPassword: {
			title: 'Passwort vergessen',
			subtitle: 'Gib deine E-Mail-Adresse ein, um einen Reset-Code zu erhalten',
			emailSentSubtitle: 'Wir haben einen Reset-Code an deine E-Mail gesendet',
			successSubtitle: 'Dein Passwort wurde erfolgreich zurückgesetzt!',
			emailLabel: 'E-Mail-Adresse',
			emailPlaceholder: 'deine@email.com',
			newPasswordLabel: 'Neues Passwort',
			resetCodeLabel: 'Reset-Code',
			resetCodePlaceholder: '123456',
			sendCodeButton: 'Code senden',
			resetPasswordButton: 'Passwort zurücksetzen',
			backToSignIn: '← Zurück zur Anmeldung',
			continueToDashboard: 'Weiter zum Dashboard',
		},
		passwordStrength: {
			label: 'Passwort-Stärke',
			veryWeak: 'Sehr schwach',
			weak: 'Schwach',
			medium: 'Mittel',
			good: 'Gut',
			strong: 'Stark',
			veryStrong: 'Sehr stark',
			suggestions: 'Verbesserungsvorschläge:',
			atLeast8Chars: 'Mindestens 8 Zeichen',
			oneLowercase: 'Ein Kleinbuchstabe',
			oneUppercase: 'Ein Großbuchstabe',
			oneNumber: 'Eine Zahl',
			oneSpecialChar: 'Ein Sonderzeichen (optional)',
		},
		common: {
			loading: 'Lade...',
			redirecting: 'Weiterleitung...',
			valid: 'Gültig',
		},
	},

	ro: {
		// Common fields
		fields: {
			email: 'Adresa de email',
			password: 'Parolă',
			firstName: 'Prenume',
			lastName: 'Nume',
			confirmPassword: 'Confirmă parola',
		},

		// Common placeholders
		placeholders: {
			email: 'emailul@tau.com',
			password: '••••••••',
			firstName: 'Ion',
			lastName: 'Popescu',
			confirmPassword: '••••••••',
		},

		// Common messages
		somethingWentWrong: 'Ceva nu a mers bine. Te rugăm să încerci din nou.',

		// Legal text
		legal: {
			termsText: 'Prin crearea unui cont, ești de acord cu',
			termsOfService: 'Termenii de Utilizare',
			privacyPolicy: 'Politica de Confidențialitate',
			and: 'și',
		},

		signIn: {
			title: 'Bun venit înapoi!',
			subtitle: 'Conectează-te la contul tău pentru a continua',
			welcome: 'Bun venit înapoi!',
			forgotPassword: 'Ai uitat parola?',
			signInButton: 'Conectează-te',
			signingIn: 'Se conectează...',
			signIn: 'Conectează-te',
			noAccount: 'Nu ai cont încă?',
			createAccount: 'Creează cont',
			continueWithGoogle: 'Conectează-te cu Google',
			continueWithFacebook: 'Conectează-te cu Facebook',
			orContinueWith: 'sau continuă cu',
		},
		signUp: {
			title: 'Creează cont',
			subtitle: 'Alătură-te comunității Beswib și începe să îți schimbi numerele de concurs',
			firstNameLabel: 'Prenume',
			firstNamePlaceholder: 'Ion',
			lastNameLabel: 'Nume',
			lastNamePlaceholder: 'Popescu',
			emailLabel: 'Adresa de email',
			emailPlaceholder: 'emailul@tau.com',
			passwordLabel: 'Parolă',
			passwordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirmă parola',
			confirmPasswordPlaceholder: '••••••••',
			signUpButton: 'Creează cont',
			signingUp: 'Se creează...',
			alreadyAccount: 'Ai deja un cont?',
			signIn: 'Conectează-te',
			signUpWithGoogle: 'Înregistrează-te cu Google',
			signUpWithFacebook: 'Înregistrează-te cu Facebook',
			orCreateWith: 'sau creează cont cu',
			verifyEmail: {
				title: 'Verifică-ți emailul',
				subtitle: 'Am trimis un cod de verificare la',
				codeLabel: 'Cod de verificare',
				codePlaceholder: '123456',
				verifyButton: 'Verifică',
				verifying: 'Se verifică...',
				backToForm: '← Înapoi la formularul de înregistrare',
			},
		},
		forgotPassword: {
			title: 'Parolă uitată',
			subtitle: 'Introdu adresa de email pentru a primi un cod de resetare',
			emailSentSubtitle: 'Am trimis un cod de resetare la emailul tău',
			successSubtitle: 'Parola ta a fost resetată cu succes!',
			emailLabel: 'Adresa de email',
			emailPlaceholder: 'emailul@tau.com',
			newPasswordLabel: 'Parolă nouă',
			resetCodeLabel: 'Cod de resetare',
			resetCodePlaceholder: '123456',
			sendCodeButton: 'Trimite cod',
			resetPasswordButton: 'Resetează parola',
			backToSignIn: '← Înapoi la conectare',
			continueToDashboard: 'Continuă la dashboard',
		},
		passwordStrength: {
			label: 'Puterea parolei',
			veryWeak: 'Foarte slabă',
			weak: 'Slabă',
			medium: 'Medie',
			good: 'Bună',
			strong: 'Puternică',
			veryStrong: 'Foarte puternică',
			suggestions: 'Îmbunătățiri sugerate:',
			atLeast8Chars: 'Cel puțin 8 caractere',
			oneLowercase: 'O literă mică',
			oneUppercase: 'O literă mare',
			oneNumber: 'Un număr',
			oneSpecialChar: 'Un caracter special (opțional)',
		},
		common: {
			loading: 'Se încarcă...',
			redirecting: 'Se redirecționează...',
			valid: 'Valid',
		},
	},

	pt: {
		// Common fields
		fields: {
			email: 'Endereço de email',
			password: 'Senha',
			firstName: 'Nome',
			lastName: 'Sobrenome',
			confirmPassword: 'Confirmar senha',
		},

		// Common placeholders
		placeholders: {
			email: 'seu@email.com',
			password: '••••••••',
			firstName: 'João',
			lastName: 'Silva',
			confirmPassword: '••••••••',
		},

		// Common messages
		somethingWentWrong: 'Algo deu errado. Tente novamente.',

		// Legal text
		legal: {
			termsText: 'Ao criar uma conta, você concorda com nossos',
			termsOfService: 'Termos de Serviço',
			privacyPolicy: 'Política de Privacidade',
			and: 'e',
		},

		signIn: {
			title: 'Bem-vindo de volta!',
			subtitle: 'Entre na sua conta para continuar',
			welcome: 'Bem-vindo de volta!',
			forgotPassword: 'Esqueceu a senha?',
			signInButton: 'Entrar',
			signingIn: 'Entrando...',
			signIn: 'Entrar',
			noAccount: 'Ainda não tem conta?',
			createAccount: 'Criar conta',
			continueWithGoogle: 'Entrar com Google',
			continueWithFacebook: 'Entrar com Facebook',
			orContinueWith: 'ou continue com',
		},
		signUp: {
			title: 'Criar conta',
			subtitle: 'Junte-se à comunidade Beswib e comece a trocar seus números de peito',
			firstNameLabel: 'Nome',
			firstNamePlaceholder: 'João',
			lastNameLabel: 'Sobrenome',
			lastNamePlaceholder: 'Silva',
			emailLabel: 'Endereço de email',
			emailPlaceholder: 'seu@email.com',
			passwordLabel: 'Senha',
			passwordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirmar senha',
			confirmPasswordPlaceholder: '••••••••',
			signUpButton: 'Criar conta',
			signingUp: 'Criando...',
			alreadyAccount: 'Já tem uma conta?',
			signIn: 'Entrar',
			signUpWithGoogle: 'Registrar-se com Google',
			signUpWithFacebook: 'Registrar-se com Facebook',
			orCreateWith: 'ou crie uma conta com',
			verifyEmail: {
				title: 'Verifique seu email',
				subtitle: 'Enviamos um código de verificação para',
				codeLabel: 'Código de verificação',
				codePlaceholder: '123456',
				verifyButton: 'Verificar',
				verifying: 'Verificando...',
				backToForm: '← Voltar ao formulário de registro',
			},
		},
		forgotPassword: {
			title: 'Esqueci a senha',
			subtitle: 'Digite seu endereço de email para receber um código de recuperação',
			emailSentSubtitle: 'Enviamos um código de recuperação para seu email',
			successSubtitle: 'Sua senha foi redefinida com sucesso!',
			emailLabel: 'Endereço de email',
			emailPlaceholder: 'seu@email.com',
			newPasswordLabel: 'Nova senha',
			resetCodeLabel: 'Código de recuperação',
			resetCodePlaceholder: '123456',
			sendCodeButton: 'Enviar código',
			resetPasswordButton: 'Redefinir senha',
			backToSignIn: '← Voltar ao login',
			continueToDashboard: 'Continuar para o painel',
		},
		passwordStrength: {
			label: 'Força da senha',
			veryWeak: 'Muito fraca',
			weak: 'Fraca',
			medium: 'Média',
			good: 'Boa',
			strong: 'Forte',
			veryStrong: 'Muito forte',
			suggestions: 'Melhorias sugeridas:',
			atLeast8Chars: 'Pelo menos 8 caracteres',
			oneLowercase: 'Uma letra minúscula',
			oneUppercase: 'Uma letra maiúscula',
			oneNumber: 'Um número',
			oneSpecialChar: 'Um caractere especial (opcional)',
		},
		common: {
			loading: 'Carregando...',
			redirecting: 'Redirecionando...',
			valid: 'Válido',
		},
	},

	nl: {
		// Common fields
		fields: {
			email: 'E-mailadres',
			password: 'Wachtwoord',
			firstName: 'Voornaam',
			lastName: 'Achternaam',
			confirmPassword: 'Wachtwoord bevestigen',
		},

		// Common placeholders
		placeholders: {
			email: 'jouw@email.com',
			password: '••••••••',
			firstName: 'Jan',
			lastName: 'Jansen',
			confirmPassword: '••••••••',
		},

		// Common messages
		somethingWentWrong: 'Er ging iets mis. Probeer het opnieuw.',

		// Legal text
		legal: {
			termsText: 'Door een account aan te maken, ga je akkoord met onze',
			termsOfService: 'Gebruiksvoorwaarden',
			privacyPolicy: 'Privacybeleid',
			and: 'en',
		},

		signIn: {
			title: 'Welkom terug!',
			subtitle: 'Log in op je account om door te gaan',
			welcome: 'Welkom terug!',
			forgotPassword: 'Wachtwoord vergeten?',
			signInButton: 'Inloggen',
			signingIn: 'Inloggen...',
			signIn: 'Inloggen',
			noAccount: 'Nog geen account?',
			createAccount: 'Account aanmaken',
			continueWithGoogle: 'Inloggen met Google',
			continueWithFacebook: 'Inloggen met Facebook',
			orContinueWith: 'of ga verder met',
		},
		signUp: {
			title: 'Account aanmaken',
			subtitle: 'Word lid van de Beswib-community en begin met het uitwisselen van je startnummers',
			firstNameLabel: 'Voornaam',
			firstNamePlaceholder: 'Jan',
			lastNameLabel: 'Achternaam',
			lastNamePlaceholder: 'Jansen',
			emailLabel: 'E-mailadres',
			emailPlaceholder: 'jouw@email.com',
			passwordLabel: 'Wachtwoord',
			passwordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Wachtwoord bevestigen',
			confirmPasswordPlaceholder: '••••••••',
			signUpButton: 'Account aanmaken',
			signingUp: 'Aanmaken...',
			alreadyAccount: 'Al een account?',
			signIn: 'Inloggen',
			signUpWithGoogle: 'Registreren met Google',
			signUpWithFacebook: 'Registreren met Facebook',
			orCreateWith: 'of maak een account aan met',
			verifyEmail: {
				title: 'Verifieer je e-mail',
				subtitle: 'We hebben een verificatiecode gestuurd naar',
				codeLabel: 'Verificatiecode',
				codePlaceholder: '123456',
				verifyButton: 'Verifiëren',
				verifying: 'Verifiëren...',
				backToForm: '← Terug naar registratieformulier',
			},
		},
		forgotPassword: {
			title: 'Wachtwoord vergeten',
			subtitle: 'Voer je e-mailadres in om een herstelcode te ontvangen',
			emailSentSubtitle: 'We hebben een herstelcode naar je e-mail gestuurd',
			successSubtitle: 'Je wachtwoord is succesvol hersteld!',
			emailLabel: 'E-mailadres',
			emailPlaceholder: 'jouw@email.com',
			newPasswordLabel: 'Nieuw wachtwoord',
			resetCodeLabel: 'Herstelcode',
			resetCodePlaceholder: '123456',
			sendCodeButton: 'Code versturen',
			resetPasswordButton: 'Wachtwoord herstellen',
			backToSignIn: '← Terug naar inloggen',
			continueToDashboard: 'Doorgaan naar dashboard',
		},
		passwordStrength: {
			label: 'Wachtwoordsterkte',
			veryWeak: 'Zeer zwak',
			weak: 'Zwak',
			medium: 'Gemiddeld',
			good: 'Goed',
			strong: 'Sterk',
			veryStrong: 'Zeer sterk',
			suggestions: 'Voorgestelde verbeteringen:',
			atLeast8Chars: 'Minstens 8 tekens',
			oneLowercase: 'Eén kleine letter',
			oneUppercase: 'Eén hoofdletter',
			oneNumber: 'Eén cijfer',
			oneSpecialChar: 'Eén speciaal teken (optioneel)',
		},
		common: {
			loading: 'Laden...',
			redirecting: 'Omleiden...',
			valid: 'Geldig',
		},
	},

	ko: {
		// Common fields
		fields: {
			email: '이메일 주소',
			password: '비밀번호',
			firstName: '이름',
			lastName: '성',
			confirmPassword: '비밀번호 확인',
		},

		// Common placeholders
		placeholders: {
			email: 'your@email.com',
			password: '••••••••',
			firstName: '홍',
			lastName: '길동',
			confirmPassword: '••••••••',
		},

		// Common messages
		somethingWentWrong: '문제가 발생했습니다. 다시 시도해주세요.',

		// Legal text
		legal: {
			termsText: '계정을 만들면 당사의',
			termsOfService: '서비스 약관',
			privacyPolicy: '개인정보 보호정책',
			and: '및',
		},

		signIn: {
			title: '다시 오신 것을 환영합니다!',
			subtitle: '계속하려면 계정에 로그인하세요',
			welcome: '다시 오신 것을 환영합니다!',
			forgotPassword: '비밀번호를 잊으셨나요?',
			signInButton: '로그인',
			signingIn: '로그인 중...',
			signIn: '로그인',
			noAccount: '아직 계정이 없으신가요?',
			createAccount: '계정 만들기',
			continueWithGoogle: 'Google로 로그인',
			continueWithFacebook: 'Facebook으로 로그인',
			orContinueWith: '또는 다음으로 계속',
		},
		signUp: {
			title: '계정 만들기',
			subtitle: 'Beswib 커뮤니티에 가입하고 배번 교환을 시작하세요',
			firstNameLabel: '이름',
			firstNamePlaceholder: '홍',
			lastNameLabel: '성',
			lastNamePlaceholder: '길동',
			emailLabel: '이메일 주소',
			emailPlaceholder: 'your@email.com',
			passwordLabel: '비밀번호',
			passwordPlaceholder: '••••••••',
			confirmPasswordLabel: '비밀번호 확인',
			confirmPasswordPlaceholder: '••••••••',
			signUpButton: '계정 만들기',
			signingUp: '만드는 중...',
			alreadyAccount: '이미 계정이 있으신가요?',
			signIn: '로그인',
			signUpWithGoogle: 'Google로 가입하기',
			signUpWithFacebook: 'Facebook으로 가입하기',
			orCreateWith: '또는 다음으로 계정 만들기',
			verifyEmail: {
				title: '이메일 인증',
				subtitle: '인증 코드를 다음으로 보냈습니다',
				codeLabel: '인증 코드',
				codePlaceholder: '123456',
				verifyButton: '인증',
				verifying: '인증 중...',
				backToForm: '← 가입 양식으로 돌아가기',
			},
		},
		forgotPassword: {
			title: '비밀번호 찾기',
			subtitle: '재설정 코드를 받으려면 이메일 주소를 입력하세요',
			emailSentSubtitle: '이메일로 재설정 코드를 보냈습니다',
			successSubtitle: '비밀번호가 성공적으로 재설정되었습니다!',
			emailLabel: '이메일 주소',
			emailPlaceholder: 'your@email.com',
			newPasswordLabel: '새 비밀번호',
			resetCodeLabel: '재설정 코드',
			resetCodePlaceholder: '123456',
			sendCodeButton: '코드 보내기',
			resetPasswordButton: '비밀번호 재설정',
			backToSignIn: '← 로그인으로 돌아가기',
			continueToDashboard: '대시보드로 계속',
		},
		passwordStrength: {
			label: '비밀번호 강도',
			veryWeak: '매우 약함',
			weak: '약함',
			medium: '보통',
			good: '좋음',
			strong: '강함',
			veryStrong: '매우 강함',
			suggestions: '개선 제안:',
			atLeast8Chars: '최소 8자',
			oneLowercase: '소문자 하나',
			oneUppercase: '대문자 하나',
			oneNumber: '숫자 하나',
			oneSpecialChar: '특수문자 하나 (선택사항)',
		},
		common: {
			loading: '로딩 중...',
			redirecting: '리디렉션 중...',
			valid: '유효함',
		},
	},
}
