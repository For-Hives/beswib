// Traductions des messages d'erreur Clerk en français
export const clerkErrorTranslations: Record<string, string> = {
	// Auth errors
	form_identifier_not_found: 'Aucun compte trouvé avec cette adresse email.',
	form_password_incorrect: 'Mot de passe incorrect.',
	form_identifier_exists: 'Un compte existe déjà avec cette adresse email.',
	session_exists: 'Vous êtes déjà connecté.',
	clerk_js_error: 'Une erreur technique est survenue. Veuillez réessayer.',

	// Email verification
	form_code_incorrect: 'Code de vérification incorrect.',
	verification_expired: 'Le code de vérification a expiré. Demandez un nouveau code.',
	verification_failed: 'La vérification a échoué. Veuillez réessayer.',

	// Password reset
	form_param_nil: 'Tous les champs sont requis.',
	form_password_pwned: 'Ce mot de passe a été compromis dans une faille de sécurité. Veuillez en choisir un autre.',
	form_password_too_common: 'Ce mot de passe est trop commun. Veuillez en choisir un plus sécurisé.',

	// OAuth errors
	oauth_access_denied: "L'accès a été refusé. Veuillez réessayer.",
	oauth_email_domain_reserved_by_saml: 'Cette adresse email est réservée pour la connexion SAML.',

	// Network/general errors
	network_error: 'Erreur de connexion. Vérifiez votre connexion internet.',
	unexpected_error: "Une erreur inattendue s'est produite. Veuillez réessayer.",

	// Rate limiting
	too_many_requests: 'Trop de tentatives. Veuillez attendre avant de réessayer.',

	// Default fallbacks
	signin_failed: 'Échec de la connexion. Vérifiez vos identifiants.',
	signup_failed: "Échec de l'inscription. Veuillez réessayer.",
}

// Function to translate Clerk error messages
export function translateClerkError(error: any): string {
	if (!error) return "Une erreur inconnue s'est produite."

	// Extract error code and message
	const errorCode = error.code || error.errors?.[0]?.code
	const errorMessage = error.message || error.errors?.[0]?.message || error.errors?.[0]?.longMessage

	// Try to find a translation for the error code
	if (errorCode && clerkErrorTranslations[errorCode]) {
		return clerkErrorTranslations[errorCode]
	}

	// Try to translate common English error messages
	if (errorMessage) {
		const lowerMessage = errorMessage.toLowerCase()

		if (lowerMessage.includes('password') && lowerMessage.includes('incorrect')) {
			return 'Mot de passe incorrect.'
		}

		if (lowerMessage.includes('email') && lowerMessage.includes('not found')) {
			return 'Aucun compte trouvé avec cette adresse email.'
		}

		if (lowerMessage.includes('already exists') || lowerMessage.includes('already taken')) {
			return 'Un compte existe déjà avec cette adresse email.'
		}

		if (lowerMessage.includes('verification') && lowerMessage.includes('code')) {
			return 'Code de vérification incorrect.'
		}

		if (lowerMessage.includes('expired')) {
			return 'Le code de vérification a expiré. Demandez un nouveau code.'
		}

		if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
			return 'Trop de tentatives. Veuillez attendre avant de réessayer.'
		}
	}

	// Fallback to original message or generic error
	return errorMessage || "Une erreur s'est produite. Veuillez réessayer."
}
