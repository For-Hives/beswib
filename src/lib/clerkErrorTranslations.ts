import { Locale } from '@/lib/i18n-config'

export interface ClerkErrorTranslations {
	// Auth errors
	form_identifier_not_found: string
	form_password_incorrect: string
	form_identifier_exists: string
	session_exists: string
	clerk_js_error: string

	// Email verification
	form_code_incorrect: string
	verification_expired: string
	verification_failed: string

	// Password reset
	form_param_nil: string
	form_password_pwned: string
	form_password_too_common: string

	// OAuth errors
	oauth_access_denied: string
	oauth_email_domain_reserved_by_saml: string

	// Network/general errors
	network_error: string
	unexpected_error: string

	// Rate limiting
	too_many_requests: string

	// Default fallbacks
	signin_failed: string
	signup_failed: string
	default_error: string
}

// Traductions des messages d'erreur Clerk pour toutes les langues
export const clerkErrorTranslations: Record<Locale, ClerkErrorTranslations> = {
	ro: {
		verification_failed: 'Verificarea a eșuat. Te rugăm să încerci din nou.',
		verification_expired: 'Codul de verificare a expirat. Solicită un cod nou.',
		unexpected_error: 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.',
		too_many_requests: 'Prea multe încercări. Te rugăm să aștepți înainte de a încerca din nou.',
		signup_failed: 'Înregistrarea a eșuat. Te rugăm să încerci din nou.',
		signin_failed: 'Conectarea a eșuat. Verifică acreditările.',
		session_exists: 'Ești deja conectat.',
		oauth_email_domain_reserved_by_saml: 'Această adresă de email este rezervată pentru conectarea SAML.',
		oauth_access_denied: 'Accesul a fost refuzat. Te rugăm să încerci din nou.',
		network_error: 'Eroare de conexiune. Verifică conexiunea la internet.',
		form_password_too_common: 'Această parolă este prea comună. Te rugăm să alegi una mai sigură.',
		form_password_pwned: 'Această parolă a fost compromisă într-o breșă de securitate. Te rugăm să alegi alta.',
		form_password_incorrect: 'Parolă incorectă.',
		form_param_nil: 'Toate câmpurile sunt obligatorii.',
		form_identifier_not_found: 'Nu s-a găsit niciun cont cu această adresă de email.',
		form_identifier_exists: 'Există deja un cont cu această adresă de email.',
		form_code_incorrect: 'Cod de verificare incorect.',
		default_error: 'A apărut o eroare. Te rugăm să încerci din nou.',
		clerk_js_error: 'A apărut o eroare tehnică. Te rugăm să încerci din nou.',
	},

	pt: {
		verification_failed: 'Verificação falhada. Tente novamente.',
		verification_expired: 'O código de verificação expirou. Solicite um novo código.',
		unexpected_error: 'Ocorreu um erro inesperado. Tente novamente.',
		too_many_requests: 'Muitas tentativas. Aguarde antes de tentar novamente.',
		signup_failed: 'Registro falhou. Tente novamente.',
		signin_failed: 'Login falhou. Verifique suas credenciais.',
		session_exists: 'Você já está conectado.',
		oauth_email_domain_reserved_by_saml: 'Este endereço de email é reservado para login SAML.',
		oauth_access_denied: 'O acesso foi negado. Tente novamente.',
		network_error: 'Erro de conexão. Verifique sua conexão com a internet.',
		form_password_too_common: 'Esta senha é muito comum. Escolha uma mais segura.',
		form_password_pwned: 'Esta senha foi comprometida em uma violação de segurança. Escolha outra.',
		form_password_incorrect: 'Senha incorreta.',
		form_param_nil: 'Todos os campos são obrigatórios.',
		form_identifier_not_found: 'Nenhuma conta encontrada com este endereço de email.',
		form_identifier_exists: 'Já existe uma conta com este endereço de email.',
		form_code_incorrect: 'Código de verificação incorreto.',
		default_error: 'Ocorreu um erro. Tente novamente.',
		clerk_js_error: 'Ocorreu um erro técnico. Tente novamente.',
	},

	nl: {
		verification_failed: 'Verificatie mislukt. Probeer het opnieuw.',
		verification_expired: 'De verificatiecode is verlopen. Vraag een nieuwe code aan.',
		unexpected_error: 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.',
		too_many_requests: 'Te veel pogingen. Wacht even voordat je het opnieuw probeert.',
		signup_failed: 'Registratie mislukt. Probeer het opnieuw.',
		signin_failed: 'Inloggen mislukt. Controleer je inloggegevens.',
		session_exists: 'Je bent al ingelogd.',
		oauth_email_domain_reserved_by_saml: 'Dit e-mailadres is gereserveerd voor SAML-login.',
		oauth_access_denied: 'Toegang geweigerd. Probeer het opnieuw.',
		network_error: 'Verbindingsfout. Controleer je internetverbinding.',
		form_password_too_common: 'Dit wachtwoord is te algemeen. Kies een veiliger wachtwoord.',
		form_password_pwned: 'Dit wachtwoord is gecompromitteerd in een beveiligingslek. Kies een ander.',
		form_password_incorrect: 'Onjuist wachtwoord.',
		form_param_nil: 'Alle velden zijn verplicht.',
		form_identifier_not_found: 'Geen account gevonden met dit e-mailadres.',
		form_identifier_exists: 'Er bestaat al een account met dit e-mailadres.',
		form_code_incorrect: 'Onjuiste verificatiecode.',
		default_error: 'Er is een fout opgetreden. Probeer het opnieuw.',
		clerk_js_error: 'Er is een technische fout opgetreden. Probeer het opnieuw.',
	},

	ko: {
		verification_failed: '인증에 실패했습니다. 다시 시도해주세요.',
		verification_expired: '인증 코드가 만료되었습니다. 새 코드를 요청하세요.',
		unexpected_error: '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
		too_many_requests: '너무 많은 시도를 했습니다. 잠시 후에 다시 시도해주세요.',
		signup_failed: '회원가입에 실패했습니다. 다시 시도해주세요.',
		signin_failed: '로그인에 실패했습니다. 자격 증명을 확인해주세요.',
		session_exists: '이미 로그인되어 있습니다.',
		oauth_email_domain_reserved_by_saml: '이 이메일 주소는 SAML 로그인용으로 예약되어 있습니다.',
		oauth_access_denied: '접근이 거부되었습니다. 다시 시도해주세요.',
		network_error: '연결 오류입니다. 인터넷 연결을 확인해주세요.',
		form_password_too_common: '이 비밀번호는 너무 일반적입니다. 더 안전한 비밀번호를 선택해주세요.',
		form_password_pwned: '이 비밀번호는 보안 침해로 인해 노출되었습니다. 다른 비밀번호를 선택해주세요.',
		form_password_incorrect: '비밀번호가 올바르지 않습니다.',
		form_param_nil: '모든 필드는 필수입니다.',
		form_identifier_not_found: '이 이메일 주소로 등록된 계정을 찾을 수 없습니다.',
		form_identifier_exists: '이 이메일 주소로 이미 계정이 존재합니다.',
		form_code_incorrect: '인증 코드가 올바르지 않습니다.',
		default_error: '오류가 발생했습니다. 다시 시도해주세요.',
		clerk_js_error: '기술적인 오류가 발생했습니다. 다시 시도해주세요.',
	},

	it: {
		verification_failed: 'Verifica fallita. Riprova.',
		verification_expired: 'Il codice di verifica è scaduto. Richiedi un nuovo codice.',
		unexpected_error: 'Si è verificato un errore imprevisto. Riprova.',
		too_many_requests: 'Troppi tentativi. Attendi prima di riprovare.',
		signup_failed: 'Registrazione fallita. Riprova.',
		signin_failed: 'Accesso fallito. Controlla le tue credenziali.',
		session_exists: 'Sei già connesso.',
		oauth_email_domain_reserved_by_saml: "Questo indirizzo email è riservato per l'accesso SAML.",
		oauth_access_denied: "L'accesso è stato negato. Riprova.",
		network_error: 'Errore di connessione. Controlla la tua connessione internet.',
		form_password_too_common: 'Questa password è troppo comune. Scegline una più sicura.',
		form_password_pwned: "Questa password è stata compromessa in una violazione della sicurezza. Scegline un'altra.",
		form_password_incorrect: 'Password incorretta.',
		form_param_nil: 'Tutti i campi sono obbligatori.',
		form_identifier_not_found: 'Nessun account trovato con questo indirizzo email.',
		form_identifier_exists: 'Esiste già un account con questo indirizzo email.',
		form_code_incorrect: 'Codice di verifica errato.',
		default_error: 'Si è verificato un errore. Riprova.',
		clerk_js_error: 'Si è verificato un errore tecnico. Riprova.',
	},

	fr: {
		verification_failed: 'La vérification a échoué. Veuillez réessayer.',
		verification_expired: 'Le code de vérification a expiré. Demandez un nouveau code.',
		unexpected_error: "Une erreur inattendue s'est produite. Veuillez réessayer.",
		too_many_requests: 'Trop de tentatives. Veuillez attendre avant de réessayer.',
		signup_failed: "Échec de l'inscription. Veuillez réessayer.",
		signin_failed: 'Échec de la connexion. Vérifiez vos identifiants.',
		session_exists: 'Vous êtes déjà connecté.',
		oauth_email_domain_reserved_by_saml: 'Cette adresse email est réservée pour la connexion SAML.',
		oauth_access_denied: "L'accès a été refusé. Veuillez réessayer.",
		network_error: 'Erreur de connexion. Vérifiez votre connexion internet.',
		form_password_too_common: 'Ce mot de passe est trop commun. Veuillez en choisir un plus sécurisé.',
		form_password_pwned: 'Ce mot de passe a été compromis dans une faille de sécurité. Veuillez en choisir un autre.',
		form_password_incorrect: 'Mot de passe incorrect.',
		form_param_nil: 'Tous les champs sont requis.',
		form_identifier_not_found: 'Aucun compte trouvé avec cette adresse email.',
		form_identifier_exists: 'Un compte existe déjà avec cette adresse email.',
		form_code_incorrect: 'Code de vérification incorrect.',
		default_error: "Une erreur s'est produite. Veuillez réessayer.",
		clerk_js_error: 'Une erreur technique est survenue. Veuillez réessayer.',
	},

	es: {
		verification_failed: 'La verificación falló. Por favor intenta de nuevo.',
		verification_expired: 'El código de verificación ha expirado. Solicita un nuevo código.',
		unexpected_error: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
		too_many_requests: 'Demasiados intentos. Por favor espera antes de intentar de nuevo.',
		signup_failed: 'Falló el registro. Por favor intenta de nuevo.',
		signin_failed: 'Falló el inicio de sesión. Verifica tus credenciales.',
		session_exists: 'Ya has iniciado sesión.',
		oauth_email_domain_reserved_by_saml: 'Esta dirección de correo está reservada para inicio de sesión SAML.',
		oauth_access_denied: 'Se denegó el acceso. Por favor intenta de nuevo.',
		network_error: 'Error de conexión. Verifica tu conexión a internet.',
		form_password_too_common: 'Esta contraseña es demasiado común. Por favor elige una más segura.',
		form_password_pwned: 'Esta contraseña ha sido comprometida en una violación de seguridad. Por favor elige otra.',
		form_password_incorrect: 'Contraseña incorrecta.',
		form_param_nil: 'Todos los campos son obligatorios.',
		form_identifier_not_found: 'No se encontró ninguna cuenta con esta dirección de correo.',
		form_identifier_exists: 'Ya existe una cuenta con esta dirección de correo.',
		form_code_incorrect: 'Código de verificación incorrecto.',
		default_error: 'Ocurrió un error. Por favor intenta de nuevo.',
		clerk_js_error: 'Ocurrió un error técnico. Por favor intenta de nuevo.',
	},

	en: {
		verification_failed: 'Verification failed. Please try again.',
		verification_expired: 'The verification code has expired. Request a new code.',
		unexpected_error: 'An unexpected error occurred. Please try again.',
		too_many_requests: 'Too many attempts. Please wait before trying again.',
		signup_failed: 'Sign up failed. Please try again.',
		signin_failed: 'Sign in failed. Check your credentials.',
		session_exists: 'You are already signed in.',
		oauth_email_domain_reserved_by_saml: 'This email address is reserved for SAML login.',
		oauth_access_denied: 'Access was denied. Please try again.',
		network_error: 'Connection error. Check your internet connection.',
		form_password_too_common: 'This password is too common. Please choose a more secure one.',
		form_password_pwned: 'This password has been compromised in a security breach. Please choose another one.',
		form_password_incorrect: 'Incorrect password.',
		form_param_nil: 'All fields are required.',
		form_identifier_not_found: 'No account found with this email address.',
		form_identifier_exists: 'An account already exists with this email address.',
		form_code_incorrect: 'Incorrect verification code.',
		default_error: 'An error occurred. Please try again.',
		clerk_js_error: 'A technical error occurred. Please try again.',
	},

	de: {
		verification_failed: 'Verifizierung fehlgeschlagen. Bitte versuche es erneut.',
		verification_expired: 'Der Verifizierungscode ist abgelaufen. Fordere einen neuen Code an.',
		unexpected_error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.',
		too_many_requests: 'Zu viele Versuche. Bitte warte, bevor du es erneut versuchst.',
		signup_failed: 'Registrierung fehlgeschlagen. Bitte versuche es erneut.',
		signin_failed: 'Anmeldung fehlgeschlagen. Überprüfe deine Anmeldedaten.',
		session_exists: 'Du bist bereits angemeldet.',
		oauth_email_domain_reserved_by_saml: 'Diese E-Mail-Adresse ist für SAML-Anmeldung reserviert.',
		oauth_access_denied: 'Der Zugriff wurde verweigert. Bitte versuche es erneut.',
		network_error: 'Verbindungsfehler. Überprüfe deine Internetverbindung.',
		form_password_too_common: 'Dieses Passwort ist zu häufig verwendet. Bitte wähle ein sichereres.',
		form_password_pwned: 'Dieses Passwort wurde bei einem Sicherheitsverstoß kompromittiert. Bitte wähle ein anderes.',
		form_password_incorrect: 'Falsches Passwort.',
		form_param_nil: 'Alle Felder sind erforderlich.',
		form_identifier_not_found: 'Kein Konto mit dieser E-Mail-Adresse gefunden.',
		form_identifier_exists: 'Ein Konto mit dieser E-Mail-Adresse existiert bereits.',
		form_code_incorrect: 'Falscher Verifizierungscode.',
		default_error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
		clerk_js_error: 'Ein technischer Fehler ist aufgetreten. Bitte versuche es erneut.',
	},
}

// Function to translate Clerk error messages
export function translateClerkError(error: any, locale: Locale = 'fr'): string {
	const translations = clerkErrorTranslations[locale]
	if (!error) return translations.default_error

	// Extract error code and message
	const errorCode = error.code || error.errors?.[0]?.code
	const errorMessage = error.message || error.errors?.[0]?.message || error.errors?.[0]?.longMessage

	// Try to find a translation for the error code
	if (errorCode && translations[errorCode as keyof ClerkErrorTranslations]) {
		return translations[errorCode as keyof ClerkErrorTranslations]
	}

	// Try to translate common English error messages
	if (errorMessage) {
		const lowerMessage = errorMessage.toLowerCase()

		if (lowerMessage.includes('password') && lowerMessage.includes('incorrect')) {
			return translations.form_password_incorrect
		}

		if (lowerMessage.includes('email') && lowerMessage.includes('not found')) {
			return translations.form_identifier_not_found
		}

		if (lowerMessage.includes('already exists') || lowerMessage.includes('already taken')) {
			return translations.form_identifier_exists
		}

		if (lowerMessage.includes('verification') && lowerMessage.includes('code')) {
			return translations.form_code_incorrect
		}

		if (lowerMessage.includes('expired')) {
			return translations.verification_expired
		}

		if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
			return translations.too_many_requests
		}
	}

	// Fallback to original message or generic error
	return errorMessage || translations.default_error
}
