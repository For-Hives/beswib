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
	en: {
		form_identifier_not_found: 'No account found with this email address.',
		form_password_incorrect: 'Incorrect password.',
		form_identifier_exists: 'An account already exists with this email address.',
		session_exists: 'You are already signed in.',
		clerk_js_error: 'A technical error occurred. Please try again.',
		form_code_incorrect: 'Incorrect verification code.',
		verification_expired: 'The verification code has expired. Request a new code.',
		verification_failed: 'Verification failed. Please try again.',
		form_param_nil: 'All fields are required.',
		form_password_pwned: 'This password has been compromised in a security breach. Please choose another one.',
		form_password_too_common: 'This password is too common. Please choose a more secure one.',
		oauth_access_denied: 'Access was denied. Please try again.',
		oauth_email_domain_reserved_by_saml: 'This email address is reserved for SAML login.',
		network_error: 'Connection error. Check your internet connection.',
		unexpected_error: 'An unexpected error occurred. Please try again.',
		too_many_requests: 'Too many attempts. Please wait before trying again.',
		signin_failed: 'Sign in failed. Check your credentials.',
		signup_failed: 'Sign up failed. Please try again.',
		default_error: 'An error occurred. Please try again.',
	},
	
	fr: {
		form_identifier_not_found: 'Aucun compte trouvé avec cette adresse email.',
		form_password_incorrect: 'Mot de passe incorrect.',
		form_identifier_exists: 'Un compte existe déjà avec cette adresse email.',
		session_exists: 'Vous êtes déjà connecté.',
		clerk_js_error: 'Une erreur technique est survenue. Veuillez réessayer.',
		form_code_incorrect: 'Code de vérification incorrect.',
		verification_expired: 'Le code de vérification a expiré. Demandez un nouveau code.',
		verification_failed: 'La vérification a échoué. Veuillez réessayer.',
		form_param_nil: 'Tous les champs sont requis.',
		form_password_pwned: 'Ce mot de passe a été compromis dans une faille de sécurité. Veuillez en choisir un autre.',
		form_password_too_common: 'Ce mot de passe est trop commun. Veuillez en choisir un plus sécurisé.',
		oauth_access_denied: 'L\'accès a été refusé. Veuillez réessayer.',
		oauth_email_domain_reserved_by_saml: 'Cette adresse email est réservée pour la connexion SAML.',
		network_error: 'Erreur de connexion. Vérifiez votre connexion internet.',
		unexpected_error: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
		too_many_requests: 'Trop de tentatives. Veuillez attendre avant de réessayer.',
		signin_failed: 'Échec de la connexion. Vérifiez vos identifiants.',
		signup_failed: 'Échec de l\'inscription. Veuillez réessayer.',
		default_error: 'Une erreur s\'est produite. Veuillez réessayer.',
	},
	
	es: {
		form_identifier_not_found: 'No se encontró ninguna cuenta con esta dirección de correo.',
		form_password_incorrect: 'Contraseña incorrecta.',
		form_identifier_exists: 'Ya existe una cuenta con esta dirección de correo.',
		session_exists: 'Ya has iniciado sesión.',
		clerk_js_error: 'Ocurrió un error técnico. Por favor intenta de nuevo.',
		form_code_incorrect: 'Código de verificación incorrecto.',
		verification_expired: 'El código de verificación ha expirado. Solicita un nuevo código.',
		verification_failed: 'La verificación falló. Por favor intenta de nuevo.',
		form_param_nil: 'Todos los campos son obligatorios.',
		form_password_pwned: 'Esta contraseña ha sido comprometida en una violación de seguridad. Por favor elige otra.',
		form_password_too_common: 'Esta contraseña es demasiado común. Por favor elige una más segura.',
		oauth_access_denied: 'Se denegó el acceso. Por favor intenta de nuevo.',
		oauth_email_domain_reserved_by_saml: 'Esta dirección de correo está reservada para inicio de sesión SAML.',
		network_error: 'Error de conexión. Verifica tu conexión a internet.',
		unexpected_error: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
		too_many_requests: 'Demasiados intentos. Por favor espera antes de intentar de nuevo.',
		signin_failed: 'Falló el inicio de sesión. Verifica tus credenciales.',
		signup_failed: 'Falló el registro. Por favor intenta de nuevo.',
		default_error: 'Ocurrió un error. Por favor intenta de nuevo.',
	},
	
	it: {
		form_identifier_not_found: 'Nessun account trovato con questo indirizzo email.',
		form_password_incorrect: 'Password incorretta.',
		form_identifier_exists: 'Esiste già un account con questo indirizzo email.',
		session_exists: 'Sei già connesso.',
		clerk_js_error: 'Si è verificato un errore tecnico. Riprova.',
		form_code_incorrect: 'Codice di verifica errato.',
		verification_expired: 'Il codice di verifica è scaduto. Richiedi un nuovo codice.',
		verification_failed: 'Verifica fallita. Riprova.',
		form_param_nil: 'Tutti i campi sono obbligatori.',
		form_password_pwned: 'Questa password è stata compromessa in una violazione della sicurezza. Scegline un\'altra.',
		form_password_too_common: 'Questa password è troppo comune. Scegline una più sicura.',
		oauth_access_denied: 'L\'accesso è stato negato. Riprova.',
		oauth_email_domain_reserved_by_saml: 'Questo indirizzo email è riservato per l\'accesso SAML.',
		network_error: 'Errore di connessione. Controlla la tua connessione internet.',
		unexpected_error: 'Si è verificato un errore imprevisto. Riprova.',
		too_many_requests: 'Troppi tentativi. Attendi prima di riprovare.',
		signin_failed: 'Accesso fallito. Controlla le tue credenziali.',
		signup_failed: 'Registrazione fallita. Riprova.',
		default_error: 'Si è verificato un errore. Riprova.',
	},
	
	de: {
		form_identifier_not_found: 'Kein Konto mit dieser E-Mail-Adresse gefunden.',
		form_password_incorrect: 'Falsches Passwort.',
		form_identifier_exists: 'Ein Konto mit dieser E-Mail-Adresse existiert bereits.',
		session_exists: 'Du bist bereits angemeldet.',
		clerk_js_error: 'Ein technischer Fehler ist aufgetreten. Bitte versuche es erneut.',
		form_code_incorrect: 'Falscher Verifizierungscode.',
		verification_expired: 'Der Verifizierungscode ist abgelaufen. Fordere einen neuen Code an.',
		verification_failed: 'Verifizierung fehlgeschlagen. Bitte versuche es erneut.',
		form_param_nil: 'Alle Felder sind erforderlich.',
		form_password_pwned: 'Dieses Passwort wurde bei einem Sicherheitsverstoß kompromittiert. Bitte wähle ein anderes.',
		form_password_too_common: 'Dieses Passwort ist zu häufig verwendet. Bitte wähle ein sichereres.',
		oauth_access_denied: 'Der Zugriff wurde verweigert. Bitte versuche es erneut.',
		oauth_email_domain_reserved_by_saml: 'Diese E-Mail-Adresse ist für SAML-Anmeldung reserviert.',
		network_error: 'Verbindungsfehler. Überprüfe deine Internetverbindung.',
		unexpected_error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.',
		too_many_requests: 'Zu viele Versuche. Bitte warte, bevor du es erneut versuchst.',
		signin_failed: 'Anmeldung fehlgeschlagen. Überprüfe deine Anmeldedaten.',
		signup_failed: 'Registrierung fehlgeschlagen. Bitte versuche es erneut.',
		default_error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
	},
	
	ro: {
		form_identifier_not_found: 'Nu s-a găsit niciun cont cu această adresă de email.',
		form_password_incorrect: 'Parolă incorectă.',
		form_identifier_exists: 'Există deja un cont cu această adresă de email.',
		session_exists: 'Ești deja conectat.',
		clerk_js_error: 'A apărut o eroare tehnică. Te rugăm să încerci din nou.',
		form_code_incorrect: 'Cod de verificare incorect.',
		verification_expired: 'Codul de verificare a expirat. Solicită un cod nou.',
		verification_failed: 'Verificarea a eșuat. Te rugăm să încerci din nou.',
		form_param_nil: 'Toate câmpurile sunt obligatorii.',
		form_password_pwned: 'Această parolă a fost compromisă într-o breșă de securitate. Te rugăm să alegi alta.',
		form_password_too_common: 'Această parolă este prea comună. Te rugăm să alegi una mai sigură.',
		oauth_access_denied: 'Accesul a fost refuzat. Te rugăm să încerci din nou.',
		oauth_email_domain_reserved_by_saml: 'Această adresă de email este rezervată pentru conectarea SAML.',
		network_error: 'Eroare de conexiune. Verifică conexiunea la internet.',
		unexpected_error: 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.',
		too_many_requests: 'Prea multe încercări. Te rugăm să aștepți înainte de a încerca din nou.',
		signin_failed: 'Conectarea a eșuat. Verifică acreditările.',
		signup_failed: 'Înregistrarea a eșuat. Te rugăm să încerci din nou.',
		default_error: 'A apărut o eroare. Te rugăm să încerci din nou.',
	},
	
	pt: {
		form_identifier_not_found: 'Nenhuma conta encontrada com este endereço de email.',
		form_password_incorrect: 'Senha incorreta.',
		form_identifier_exists: 'Já existe uma conta com este endereço de email.',
		session_exists: 'Você já está conectado.',
		clerk_js_error: 'Ocorreu um erro técnico. Tente novamente.',
		form_code_incorrect: 'Código de verificação incorreto.',
		verification_expired: 'O código de verificação expirou. Solicite um novo código.',
		verification_failed: 'Verificação falhada. Tente novamente.',
		form_param_nil: 'Todos os campos são obrigatórios.',
		form_password_pwned: 'Esta senha foi comprometida em uma violação de segurança. Escolha outra.',
		form_password_too_common: 'Esta senha é muito comum. Escolha uma mais segura.',
		oauth_access_denied: 'O acesso foi negado. Tente novamente.',
		oauth_email_domain_reserved_by_saml: 'Este endereço de email é reservado para login SAML.',
		network_error: 'Erro de conexão. Verifique sua conexão com a internet.',
		unexpected_error: 'Ocorreu um erro inesperado. Tente novamente.',
		too_many_requests: 'Muitas tentativas. Aguarde antes de tentar novamente.',
		signin_failed: 'Login falhou. Verifique suas credenciais.',
		signup_failed: 'Registro falhou. Tente novamente.',
		default_error: 'Ocorreu um erro. Tente novamente.',
	},
	
	nl: {
		form_identifier_not_found: 'Geen account gevonden met dit e-mailadres.',
		form_password_incorrect: 'Onjuist wachtwoord.',
		form_identifier_exists: 'Er bestaat al een account met dit e-mailadres.',
		session_exists: 'Je bent al ingelogd.',
		clerk_js_error: 'Er is een technische fout opgetreden. Probeer het opnieuw.',
		form_code_incorrect: 'Onjuiste verificatiecode.',
		verification_expired: 'De verificatiecode is verlopen. Vraag een nieuwe code aan.',
		verification_failed: 'Verificatie mislukt. Probeer het opnieuw.',
		form_param_nil: 'Alle velden zijn verplicht.',
		form_password_pwned: 'Dit wachtwoord is gecompromitteerd in een beveiligingslek. Kies een ander.',
		form_password_too_common: 'Dit wachtwoord is te algemeen. Kies een veiliger wachtwoord.',
		oauth_access_denied: 'Toegang geweigerd. Probeer het opnieuw.',
		oauth_email_domain_reserved_by_saml: 'Dit e-mailadres is gereserveerd voor SAML-login.',
		network_error: 'Verbindingsfout. Controleer je internetverbinding.',
		unexpected_error: 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.',
		too_many_requests: 'Te veel pogingen. Wacht even voordat je het opnieuw probeert.',
		signin_failed: 'Inloggen mislukt. Controleer je inloggegevens.',
		signup_failed: 'Registratie mislukt. Probeer het opnieuw.',
		default_error: 'Er is een fout opgetreden. Probeer het opnieuw.',
	},
	
	ko: {
		form_identifier_not_found: '이 이메일 주소로 등록된 계정을 찾을 수 없습니다.',
		form_password_incorrect: '비밀번호가 올바르지 않습니다.',
		form_identifier_exists: '이 이메일 주소로 이미 계정이 존재합니다.',
		session_exists: '이미 로그인되어 있습니다.',
		clerk_js_error: '기술적인 오류가 발생했습니다. 다시 시도해주세요.',
		form_code_incorrect: '인증 코드가 올바르지 않습니다.',
		verification_expired: '인증 코드가 만료되었습니다. 새 코드를 요청하세요.',
		verification_failed: '인증에 실패했습니다. 다시 시도해주세요.',
		form_param_nil: '모든 필드는 필수입니다.',
		form_password_pwned: '이 비밀번호는 보안 침해로 인해 노출되었습니다. 다른 비밀번호를 선택해주세요.',
		form_password_too_common: '이 비밀번호는 너무 일반적입니다. 더 안전한 비밀번호를 선택해주세요.',
		oauth_access_denied: '접근이 거부되었습니다. 다시 시도해주세요.',
		oauth_email_domain_reserved_by_saml: '이 이메일 주소는 SAML 로그인용으로 예약되어 있습니다.',
		network_error: '연결 오류입니다. 인터넷 연결을 확인해주세요.',
		unexpected_error: '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
		too_many_requests: '너무 많은 시도를 했습니다. 잠시 후에 다시 시도해주세요.',
		signin_failed: '로그인에 실패했습니다. 자격 증명을 확인해주세요.',
		signup_failed: '회원가입에 실패했습니다. 다시 시도해주세요.',
		default_error: '오류가 발생했습니다. 다시 시도해주세요.',
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
		return translations[errorCode as keyof ClerkErrorTranslations] as string
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
