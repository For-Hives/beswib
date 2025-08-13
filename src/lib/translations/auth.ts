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
	ro: {
		// Common messages
		somethingWentWrong: 'Ceva nu a mers bine. Te rugăm să încerci din nou.',

		signUp: {
			verifyEmail: {
				verifying: 'Se verifică...',
				verifyButton: 'Verifică',
				title: 'Verifică-ți emailul',
				subtitle: 'Am trimis un cod de verificare la',
				codePlaceholder: '123456',
				codeLabel: 'Cod de verificare',
				backToForm: '← Înapoi la formularul de înregistrare',
			},
			title: 'Creează cont',
			subtitle: 'Alătură-te comunității Beswib și începe să îți schimbi numerele de concurs',
			signUpWithGoogle: 'Înregistrează-te cu Google',
			signUpWithFacebook: 'Înregistrează-te cu Facebook',
			signUpButton: 'Creează cont',
			signingUp: 'Se creează...',
			signIn: 'Conectează-te',
			passwordPlaceholder: '••••••••',
			passwordLabel: 'Parolă',
			orCreateWith: 'sau creează cont cu',
			lastNamePlaceholder: 'Popescu',
			lastNameLabel: 'Nume',
			firstNamePlaceholder: 'Ion',
			firstNameLabel: 'Prenume',
			emailPlaceholder: 'emailul@tau.com',
			emailLabel: 'Adresa de email',
			confirmPasswordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirmă parola',
			alreadyAccount: 'Ai deja un cont?',
		},

		signIn: {
			welcome: 'Bun venit înapoi!',
			title: 'Bun venit înapoi!',
			subtitle: 'Conectează-te la contul tău pentru a continua',
			signingIn: 'Se conectează...',
			signInButton: 'Conectează-te',
			signIn: 'Conectează-te',
			orContinueWith: 'sau continuă cu',
			noAccount: 'Nu ai cont încă?',
			forgotPassword: 'Ai uitat parola?',
			createAccount: 'Creează cont',
			continueWithGoogle: 'Conectează-te cu Google',
			continueWithFacebook: 'Conectează-te cu Facebook',
		},

		// Common placeholders
		placeholders: {
			password: '••••••••',
			lastName: 'Popescu',
			firstName: 'Ion',
			email: 'emailul@tau.com',
			confirmPassword: '••••••••',
		},

		passwordStrength: {
			weak: 'Slabă',
			veryWeak: 'Foarte slabă',
			veryStrong: 'Foarte puternică',
			suggestions: 'Îmbunătățiri sugerate:',
			strong: 'Puternică',
			oneUppercase: 'O literă mare',
			oneSpecialChar: 'Un caracter special (opțional)',
			oneNumber: 'Un număr',
			oneLowercase: 'O literă mică',
			medium: 'Medie',
			label: 'Puterea parolei',
			good: 'Bună',
			atLeast8Chars: 'Cel puțin 8 caractere',
		},
		// Legal text
		legal: {
			termsText: 'Prin crearea unui cont, ești de acord cu',
			termsOfService: 'Termenii de Utilizare',
			privacyPolicy: 'Politica de Confidențialitate',
			and: 'și',
		},
		forgotPassword: {
			title: 'Parolă uitată',
			successSubtitle: 'Parola ta a fost resetată cu succes!',
			subtitle: 'Introdu adresa de email pentru a primi un cod de resetare',
			sendCodeButton: 'Trimite cod',
			resetPasswordButton: 'Resetează parola',
			resetCodePlaceholder: '123456',
			resetCodeLabel: 'Cod de resetare',
			newPasswordLabel: 'Parolă nouă',
			emailSentSubtitle: 'Am trimis un cod de resetare la emailul tău',
			emailPlaceholder: 'emailul@tau.com',
			emailLabel: 'Adresa de email',
			continueToDashboard: 'Continuă la dashboard',
			backToSignIn: '← Înapoi la conectare',
		},
		// Common fields
		fields: {
			password: 'Parolă',
			lastName: 'Nume',
			firstName: 'Prenume',
			email: 'Adresa de email',
			confirmPassword: 'Confirmă parola',
		},
		common: {
			valid: 'Valid',
			redirecting: 'Se redirecționează...',
			loading: 'Se încarcă...',
		},
	},

	pt: {
		// Common messages
		somethingWentWrong: 'Algo deu errado. Tente novamente.',

		signUp: {
			verifyEmail: {
				verifying: 'Verificando...',
				verifyButton: 'Verificar',
				title: 'Verifique seu email',
				subtitle: 'Enviamos um código de verificação para',
				codePlaceholder: '123456',
				codeLabel: 'Código de verificação',
				backToForm: '← Voltar ao formulário de registro',
			},
			title: 'Criar conta',
			subtitle: 'Junte-se à comunidade Beswib e comece a trocar seus números de peito',
			signUpWithGoogle: 'Registrar-se com Google',
			signUpWithFacebook: 'Registrar-se com Facebook',
			signUpButton: 'Criar conta',
			signingUp: 'Criando...',
			signIn: 'Entrar',
			passwordPlaceholder: '••••••••',
			passwordLabel: 'Senha',
			orCreateWith: 'ou crie uma conta com',
			lastNamePlaceholder: 'Silva',
			lastNameLabel: 'Sobrenome',
			firstNamePlaceholder: 'João',
			firstNameLabel: 'Nome',
			emailPlaceholder: 'seu@email.com',
			emailLabel: 'Endereço de email',
			confirmPasswordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirmar senha',
			alreadyAccount: 'Já tem uma conta?',
		},

		signIn: {
			welcome: 'Bem-vindo de volta!',
			title: 'Bem-vindo de volta!',
			subtitle: 'Entre na sua conta para continuar',
			signingIn: 'Entrando...',
			signInButton: 'Entrar',
			signIn: 'Entrar',
			orContinueWith: 'ou continue com',
			noAccount: 'Ainda não tem conta?',
			forgotPassword: 'Esqueceu a senha?',
			createAccount: 'Criar conta',
			continueWithGoogle: 'Entrar com Google',
			continueWithFacebook: 'Entrar com Facebook',
		},

		// Common placeholders
		placeholders: {
			password: '••••••••',
			lastName: 'Silva',
			firstName: 'João',
			email: 'seu@email.com',
			confirmPassword: '••••••••',
		},

		passwordStrength: {
			weak: 'Fraca',
			veryWeak: 'Muito fraca',
			veryStrong: 'Muito forte',
			suggestions: 'Melhorias sugeridas:',
			strong: 'Forte',
			oneUppercase: 'Uma letra maiúscula',
			oneSpecialChar: 'Um caractere especial (opcional)',
			oneNumber: 'Um número',
			oneLowercase: 'Uma letra minúscula',
			medium: 'Média',
			label: 'Força da senha',
			good: 'Boa',
			atLeast8Chars: 'Pelo menos 8 caracteres',
		},
		// Legal text
		legal: {
			termsText: 'Ao criar uma conta, você concorda com nossos',
			termsOfService: 'Termos de Serviço',
			privacyPolicy: 'Política de Privacidade',
			and: 'e',
		},
		forgotPassword: {
			title: 'Esqueci a senha',
			successSubtitle: 'Sua senha foi redefinida com sucesso!',
			subtitle: 'Digite seu endereço de email para receber um código de recuperação',
			sendCodeButton: 'Enviar código',
			resetPasswordButton: 'Redefinir senha',
			resetCodePlaceholder: '123456',
			resetCodeLabel: 'Código de recuperação',
			newPasswordLabel: 'Nova senha',
			emailSentSubtitle: 'Enviamos um código de recuperação para seu email',
			emailPlaceholder: 'seu@email.com',
			emailLabel: 'Endereço de email',
			continueToDashboard: 'Continuar para o painel',
			backToSignIn: '← Voltar ao login',
		},
		// Common fields
		fields: {
			password: 'Senha',
			lastName: 'Sobrenome',
			firstName: 'Nome',
			email: 'Endereço de email',
			confirmPassword: 'Confirmar senha',
		},
		common: {
			valid: 'Válido',
			redirecting: 'Redirecionando...',
			loading: 'Carregando...',
		},
	},

	nl: {
		// Common messages
		somethingWentWrong: 'Er ging iets mis. Probeer het opnieuw.',

		signUp: {
			verifyEmail: {
				verifying: 'Verifiëren...',
				verifyButton: 'Verifiëren',
				title: 'Verifieer je e-mail',
				subtitle: 'We hebben een verificatiecode gestuurd naar',
				codePlaceholder: '123456',
				codeLabel: 'Verificatiecode',
				backToForm: '← Terug naar registratieformulier',
			},
			title: 'Account aanmaken',
			subtitle: 'Word lid van de Beswib-community en begin met het uitwisselen van je startnummers',
			signUpWithGoogle: 'Registreren met Google',
			signUpWithFacebook: 'Registreren met Facebook',
			signUpButton: 'Account aanmaken',
			signingUp: 'Aanmaken...',
			signIn: 'Inloggen',
			passwordPlaceholder: '••••••••',
			passwordLabel: 'Wachtwoord',
			orCreateWith: 'of maak een account aan met',
			lastNamePlaceholder: 'Jansen',
			lastNameLabel: 'Achternaam',
			firstNamePlaceholder: 'Jan',
			firstNameLabel: 'Voornaam',
			emailPlaceholder: 'jouw@email.com',
			emailLabel: 'E-mailadres',
			confirmPasswordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Wachtwoord bevestigen',
			alreadyAccount: 'Al een account?',
		},

		signIn: {
			welcome: 'Welkom terug!',
			title: 'Welkom terug!',
			subtitle: 'Log in op je account om door te gaan',
			signingIn: 'Inloggen...',
			signInButton: 'Inloggen',
			signIn: 'Inloggen',
			orContinueWith: 'of ga verder met',
			noAccount: 'Nog geen account?',
			forgotPassword: 'Wachtwoord vergeten?',
			createAccount: 'Account aanmaken',
			continueWithGoogle: 'Inloggen met Google',
			continueWithFacebook: 'Inloggen met Facebook',
		},

		// Common placeholders
		placeholders: {
			password: '••••••••',
			lastName: 'Jansen',
			firstName: 'Jan',
			email: 'jouw@email.com',
			confirmPassword: '••••••••',
		},

		passwordStrength: {
			weak: 'Zwak',
			veryWeak: 'Zeer zwak',
			veryStrong: 'Zeer sterk',
			suggestions: 'Voorgestelde verbeteringen:',
			strong: 'Sterk',
			oneUppercase: 'Eén hoofdletter',
			oneSpecialChar: 'Eén speciaal teken (optioneel)',
			oneNumber: 'Eén cijfer',
			oneLowercase: 'Eén kleine letter',
			medium: 'Gemiddeld',
			label: 'Wachtwoordsterkte',
			good: 'Goed',
			atLeast8Chars: 'Minstens 8 tekens',
		},
		// Legal text
		legal: {
			termsText: 'Door een account aan te maken, ga je akkoord met onze',
			termsOfService: 'Gebruiksvoorwaarden',
			privacyPolicy: 'Privacybeleid',
			and: 'en',
		},
		forgotPassword: {
			title: 'Wachtwoord vergeten',
			successSubtitle: 'Je wachtwoord is succesvol hersteld!',
			subtitle: 'Voer je e-mailadres in om een herstelcode te ontvangen',
			sendCodeButton: 'Code versturen',
			resetPasswordButton: 'Wachtwoord herstellen',
			resetCodePlaceholder: '123456',
			resetCodeLabel: 'Herstelcode',
			newPasswordLabel: 'Nieuw wachtwoord',
			emailSentSubtitle: 'We hebben een herstelcode naar je e-mail gestuurd',
			emailPlaceholder: 'jouw@email.com',
			emailLabel: 'E-mailadres',
			continueToDashboard: 'Doorgaan naar dashboard',
			backToSignIn: '← Terug naar inloggen',
		},
		// Common fields
		fields: {
			password: 'Wachtwoord',
			lastName: 'Achternaam',
			firstName: 'Voornaam',
			email: 'E-mailadres',
			confirmPassword: 'Wachtwoord bevestigen',
		},
		common: {
			valid: 'Geldig',
			redirecting: 'Omleiden...',
			loading: 'Laden...',
		},
	},

	ko: {
		// Common messages
		somethingWentWrong: '문제가 발생했습니다. 다시 시도해주세요.',

		signUp: {
			verifyEmail: {
				verifying: '인증 중...',
				verifyButton: '인증',
				title: '이메일 인증',
				subtitle: '인증 코드를 다음으로 보냈습니다',
				codePlaceholder: '123456',
				codeLabel: '인증 코드',
				backToForm: '← 가입 양식으로 돌아가기',
			},
			title: '계정 만들기',
			subtitle: 'Beswib 커뮤니티에 가입하고 배번 교환을 시작하세요',
			signUpWithGoogle: 'Google로 가입하기',
			signUpWithFacebook: 'Facebook으로 가입하기',
			signUpButton: '계정 만들기',
			signingUp: '만드는 중...',
			signIn: '로그인',
			passwordPlaceholder: '••••••••',
			passwordLabel: '비밀번호',
			orCreateWith: '또는 다음으로 계정 만들기',
			lastNamePlaceholder: '길동',
			lastNameLabel: '성',
			firstNamePlaceholder: '홍',
			firstNameLabel: '이름',
			emailPlaceholder: 'your@email.com',
			emailLabel: '이메일 주소',
			confirmPasswordPlaceholder: '••••••••',
			confirmPasswordLabel: '비밀번호 확인',
			alreadyAccount: '이미 계정이 있으신가요?',
		},

		signIn: {
			welcome: '다시 오신 것을 환영합니다!',
			title: '다시 오신 것을 환영합니다!',
			subtitle: '계속하려면 계정에 로그인하세요',
			signingIn: '로그인 중...',
			signInButton: '로그인',
			signIn: '로그인',
			orContinueWith: '또는 다음으로 계속',
			noAccount: '아직 계정이 없으신가요?',
			forgotPassword: '비밀번호를 잊으셨나요?',
			createAccount: '계정 만들기',
			continueWithGoogle: 'Google로 로그인',
			continueWithFacebook: 'Facebook으로 로그인',
		},

		// Common placeholders
		placeholders: {
			password: '••••••••',
			lastName: '길동',
			firstName: '홍',
			email: 'your@email.com',
			confirmPassword: '••••••••',
		},

		passwordStrength: {
			weak: '약함',
			veryWeak: '매우 약함',
			veryStrong: '매우 강함',
			suggestions: '개선 제안:',
			strong: '강함',
			oneUppercase: '대문자 하나',
			oneSpecialChar: '특수문자 하나 (선택사항)',
			oneNumber: '숫자 하나',
			oneLowercase: '소문자 하나',
			medium: '보통',
			label: '비밀번호 강도',
			good: '좋음',
			atLeast8Chars: '최소 8자',
		},
		// Legal text
		legal: {
			termsText: '계정을 만들면 당사의',
			termsOfService: '서비스 약관',
			privacyPolicy: '개인정보 보호정책',
			and: '및',
		},
		forgotPassword: {
			title: '비밀번호 찾기',
			successSubtitle: '비밀번호가 성공적으로 재설정되었습니다!',
			subtitle: '재설정 코드를 받으려면 이메일 주소를 입력하세요',
			sendCodeButton: '코드 보내기',
			resetPasswordButton: '비밀번호 재설정',
			resetCodePlaceholder: '123456',
			resetCodeLabel: '재설정 코드',
			newPasswordLabel: '새 비밀번호',
			emailSentSubtitle: '이메일로 재설정 코드를 보냈습니다',
			emailPlaceholder: 'your@email.com',
			emailLabel: '이메일 주소',
			continueToDashboard: '대시보드로 계속',
			backToSignIn: '← 로그인으로 돌아가기',
		},
		// Common fields
		fields: {
			password: '비밀번호',
			lastName: '성',
			firstName: '이름',
			email: '이메일 주소',
			confirmPassword: '비밀번호 확인',
		},
		common: {
			valid: '유효함',
			redirecting: '리디렉션 중...',
			loading: '로딩 중...',
		},
	},

	it: {
		// Common messages
		somethingWentWrong: 'Qualcosa è andato storto. Riprova.',

		signUp: {
			verifyEmail: {
				verifying: 'Verifica in corso...',
				verifyButton: 'Verifica',
				title: 'Verifica la tua email',
				subtitle: 'Abbiamo inviato un codice di verifica a',
				codePlaceholder: '123456',
				codeLabel: 'Codice di verifica',
				backToForm: '← Torna al modulo di registrazione',
			},
			title: 'Crea account',
			subtitle: 'Unisciti alla comunità Beswib e inizia a scambiare i tuoi pettorali',
			signUpWithGoogle: 'Registrati con Google',
			signUpWithFacebook: 'Registrati con Facebook',
			signUpButton: 'Crea account',
			signingUp: 'Creazione...',
			signIn: 'Accedi',
			passwordPlaceholder: '••••••••',
			passwordLabel: 'Password',
			orCreateWith: 'o crea un account con',
			lastNamePlaceholder: 'Rossi',
			lastNameLabel: 'Cognome',
			firstNamePlaceholder: 'Mario',
			firstNameLabel: 'Nome',
			emailPlaceholder: 'tuo@email.com',
			emailLabel: 'Indirizzo email',
			confirmPasswordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Conferma password',
			alreadyAccount: 'Hai già un account?',
		},

		signIn: {
			welcome: 'Bentornato!',
			title: 'Bentornato!',
			subtitle: 'Accedi al tuo account per continuare',
			signingIn: 'Accesso in corso...',
			signInButton: 'Accedi',
			signIn: 'Accedi',
			orContinueWith: 'o continua con',
			noAccount: 'Non hai un account?',
			forgotPassword: 'Password dimenticata?',
			createAccount: 'Crea account',
			continueWithGoogle: 'Accedi con Google',
			continueWithFacebook: 'Accedi con Facebook',
		},

		// Common placeholders
		placeholders: {
			password: '••••••••',
			lastName: 'Rossi',
			firstName: 'Mario',
			email: 'tuo@email.com',
			confirmPassword: '••••••••',
		},

		passwordStrength: {
			weak: 'Debole',
			veryWeak: 'Molto debole',
			veryStrong: 'Molto forte',
			suggestions: 'Miglioramenti suggeriti:',
			strong: 'Forte',
			oneUppercase: 'Una lettera maiuscola',
			oneSpecialChar: 'Un carattere speciale (opzionale)',
			oneNumber: 'Un numero',
			oneLowercase: 'Una lettera minuscola',
			medium: 'Media',
			label: 'Forza password',
			good: 'Buona',
			atLeast8Chars: 'Almeno 8 caratteri',
		},
		// Legal text
		legal: {
			termsText: 'Creando un account, accetti i nostri',
			termsOfService: 'Termini di Servizio',
			privacyPolicy: 'Politica sulla Privacy',
			and: 'e',
		},
		forgotPassword: {
			title: 'Password dimenticata',
			successSubtitle: 'La tua password è stata ripristinata con successo!',
			subtitle: 'Inserisci il tuo indirizzo email per ricevere un codice di ripristino',
			sendCodeButton: 'Invia codice',
			resetPasswordButton: 'Ripristina password',
			resetCodePlaceholder: '123456',
			resetCodeLabel: 'Codice di ripristino',
			newPasswordLabel: 'Nuova password',
			emailSentSubtitle: 'Abbiamo inviato un codice di ripristino alla tua email',
			emailPlaceholder: 'tuo@email.com',
			emailLabel: 'Indirizzo email',
			continueToDashboard: 'Continua alla dashboard',
			backToSignIn: '← Torna al login',
		},
		// Common fields
		fields: {
			password: 'Password',
			lastName: 'Cognome',
			firstName: 'Nome',
			email: 'Indirizzo email',
			confirmPassword: 'Conferma password',
		},
		common: {
			valid: 'Valido',
			redirecting: 'Reindirizzamento...',
			loading: 'Caricamento...',
		},
	},

	fr: {
		// Common messages
		somethingWentWrong: "Quelque chose s'est mal passé. Veuillez réessayer.",

		signUp: {
			verifyEmail: {
				verifying: 'Vérification...',
				verifyButton: 'Vérifier',
				title: 'Vérifiez votre email',
				subtitle: 'Nous avons envoyé un code de vérification à',
				codePlaceholder: '123456',
				codeLabel: 'Code de vérification',
				backToForm: "← Retour au formulaire d'inscription",
			},
			title: 'Créer un compte',
			subtitle: 'Rejoignez la communauté Beswib et commencez à échanger vos dossards',
			signUpWithGoogle: "S'inscrire avec Google",
			signUpWithFacebook: "S'inscrire avec Facebook",
			signUpButton: 'Créer un compte',
			signingUp: 'Création...',
			signIn: 'Se connecter',
			passwordPlaceholder: '••••••••',
			passwordLabel: 'Mot de passe',
			orCreateWith: 'ou créez un compte avec',
			lastNamePlaceholder: 'Dupont',
			lastNameLabel: 'Nom',
			firstNamePlaceholder: 'Jean',
			firstNameLabel: 'Prénom',
			emailPlaceholder: 'votre@email.com',
			emailLabel: 'Adresse email',
			confirmPasswordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirmer le mot de passe',
			alreadyAccount: 'Déjà un compte ?',
		},

		signIn: {
			welcome: 'Bon retour !',
			title: 'Bon retour !',
			subtitle: 'Connectez-vous à votre compte pour continuer',
			signingIn: 'Connexion...',
			signInButton: 'Se connecter',
			signIn: 'Se connecter',
			orContinueWith: 'ou continuez avec',
			noAccount: 'Pas encore de compte ?',
			forgotPassword: 'Mot de passe oublié ?',
			createAccount: 'Créer un compte',
			continueWithGoogle: 'Se connecter avec Google',
			continueWithFacebook: 'Se connecter avec Facebook',
		},

		// Common placeholders
		placeholders: {
			password: '••••••••',
			lastName: 'Dupont',
			firstName: 'Jean',
			email: 'votre@email.com',
			confirmPassword: '••••••••',
		},

		passwordStrength: {
			weak: 'Faible',
			veryWeak: 'Très faible',
			veryStrong: 'Très fort',
			suggestions: 'Améliorations suggérées :',
			strong: 'Fort',
			oneUppercase: 'Une lettre majuscule',
			oneSpecialChar: 'Un caractère spécial (optionnel)',
			oneNumber: 'Un chiffre',
			oneLowercase: 'Une lettre minuscule',
			medium: 'Moyen',
			label: 'Force du mot de passe',
			good: 'Bon',
			atLeast8Chars: 'Au moins 8 caractères',
		},
		// Legal text
		legal: {
			termsText: 'En créant un compte, vous acceptez nos',
			termsOfService: "Conditions d'utilisation",
			privacyPolicy: 'Politique de confidentialité',
			and: 'et',
		},
		forgotPassword: {
			title: 'Mot de passe oublié',
			successSubtitle: 'Votre mot de passe a été réinitialisé avec succès !',
			subtitle: 'Entrez votre adresse email pour recevoir un code de réinitialisation',
			sendCodeButton: 'Envoyer le code',
			resetPasswordButton: 'Réinitialiser le mot de passe',
			resetCodePlaceholder: '123456',
			resetCodeLabel: 'Code de réinitialisation',
			newPasswordLabel: 'Nouveau mot de passe',
			emailSentSubtitle: 'Nous avons envoyé un code de réinitialisation à votre email',
			emailPlaceholder: 'votre@email.com',
			emailLabel: 'Adresse email',
			continueToDashboard: 'Continuer vers le tableau de bord',
			backToSignIn: '← Retour à la connexion',
		},
		// Common fields
		fields: {
			password: 'Mot de passe',
			lastName: 'Nom',
			firstName: 'Prénom',
			email: 'Adresse email',
			confirmPassword: 'Confirmer le mot de passe',
		},
		common: {
			valid: 'Valide',
			redirecting: 'Redirection...',
			loading: 'Chargement...',
		},
	},

	es: {
		// Common messages
		somethingWentWrong: 'Algo salió mal. Por favor intenta de nuevo.',

		signUp: {
			verifyEmail: {
				verifying: 'Verificando...',
				verifyButton: 'Verificar',
				title: 'Verifica tu correo',
				subtitle: 'Enviamos un código de verificación a',
				codePlaceholder: '123456',
				codeLabel: 'Código de verificación',
				backToForm: '← Volver al formulario de registro',
			},
			title: 'Crear cuenta',
			subtitle: 'Únete a la comunidad Beswib y comienza a intercambiar tus dorsales',
			signUpWithGoogle: 'Registrarse con Google',
			signUpWithFacebook: 'Registrarse con Facebook',
			signUpButton: 'Crear cuenta',
			signingUp: 'Creando...',
			signIn: 'Iniciar sesión',
			passwordPlaceholder: '••••••••',
			passwordLabel: 'Contraseña',
			orCreateWith: 'o crea una cuenta con',
			lastNamePlaceholder: 'Pérez',
			lastNameLabel: 'Apellido',
			firstNamePlaceholder: 'Juan',
			firstNameLabel: 'Nombre',
			emailPlaceholder: 'tu@email.com',
			emailLabel: 'Dirección de correo',
			confirmPasswordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirmar contraseña',
			alreadyAccount: '¿Ya tienes cuenta?',
		},

		signIn: {
			welcome: '¡Bienvenido de vuelta!',
			title: '¡Bienvenido de vuelta!',
			subtitle: 'Inicia sesión en tu cuenta para continuar',
			signingIn: 'Iniciando sesión...',
			signInButton: 'Iniciar sesión',
			signIn: 'Iniciar sesión',
			orContinueWith: 'o continúa con',
			noAccount: '¿No tienes cuenta?',
			forgotPassword: '¿Olvidaste tu contraseña?',
			createAccount: 'Crear cuenta',
			continueWithGoogle: 'Iniciar sesión con Google',
			continueWithFacebook: 'Iniciar sesión con Facebook',
		},

		// Common placeholders
		placeholders: {
			password: '••••••••',
			lastName: 'Pérez',
			firstName: 'Juan',
			email: 'tu@email.com',
			confirmPassword: '••••••••',
		},

		passwordStrength: {
			weak: 'Débil',
			veryWeak: 'Muy débil',
			veryStrong: 'Muy fuerte',
			suggestions: 'Mejoras sugeridas:',
			strong: 'Fuerte',
			oneUppercase: 'Una letra mayúscula',
			oneSpecialChar: 'Un carácter especial (opcional)',
			oneNumber: 'Un número',
			oneLowercase: 'Una letra minúscula',
			medium: 'Media',
			label: 'Fuerza de contraseña',
			good: 'Buena',
			atLeast8Chars: 'Al menos 8 caracteres',
		},
		// Legal text
		legal: {
			termsText: 'Al crear una cuenta, aceptas nuestros',
			termsOfService: 'Términos de Servicio',
			privacyPolicy: 'Política de Privacidad',
			and: 'y',
		},
		forgotPassword: {
			title: 'Contraseña olvidada',
			successSubtitle: '¡Tu contraseña ha sido restablecida exitosamente!',
			subtitle: 'Introduce tu dirección de correo para recibir un código de recuperación',
			sendCodeButton: 'Enviar código',
			resetPasswordButton: 'Restablecer contraseña',
			resetCodePlaceholder: '123456',
			resetCodeLabel: 'Código de recuperación',
			newPasswordLabel: 'Nueva contraseña',
			emailSentSubtitle: 'Enviamos un código de recuperación a tu correo',
			emailPlaceholder: 'tu@email.com',
			emailLabel: 'Dirección de correo',
			continueToDashboard: 'Continuar al panel',
			backToSignIn: '← Volver al inicio de sesión',
		},
		// Common fields
		fields: {
			password: 'Contraseña',
			lastName: 'Apellido',
			firstName: 'Nombre',
			email: 'Dirección de correo',
			confirmPassword: 'Confirmar contraseña',
		},
		common: {
			valid: 'Válido',
			redirecting: 'Redirigiendo...',
			loading: 'Cargando...',
		},
	},

	en: {
		// Common messages
		somethingWentWrong: 'Something went wrong. Please try again.',

		signUp: {
			verifyEmail: {
				verifying: 'Verifying...',
				verifyButton: 'Verify',
				title: 'Verify your email',
				subtitle: 'We sent a verification code to',
				codePlaceholder: '123456',
				codeLabel: 'Verification code',
				backToForm: '← Back to signup form',
			},
			title: 'Create account',
			subtitle: 'Join the Beswib community and start exchanging your bibs',
			signUpWithGoogle: 'Sign up with Google',
			signUpWithFacebook: 'Sign up with Facebook',
			signUpButton: 'Create account',
			signingUp: 'Creating...',
			signIn: 'Sign in',
			passwordPlaceholder: '••••••••',
			passwordLabel: 'Password',
			orCreateWith: 'or create account with',
			lastNamePlaceholder: 'Doe',
			lastNameLabel: 'Last name',
			firstNamePlaceholder: 'John',
			firstNameLabel: 'First name',
			emailPlaceholder: 'your@email.com',
			emailLabel: 'Email address',
			confirmPasswordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Confirm password',
			alreadyAccount: 'Already have an account?',
		},

		signIn: {
			welcome: 'Welcome back!',
			title: 'Welcome back!',
			subtitle: 'Sign in to your account to continue',
			signingIn: 'Signing in...',
			signInButton: 'Sign in',
			signIn: 'Sign in',
			orContinueWith: 'or continue with',
			noAccount: 'No account yet?',
			forgotPassword: 'Forgot password?',
			createAccount: 'Create account',
			continueWithGoogle: 'Sign in with Google',
			continueWithFacebook: 'Sign in with Facebook',
		},

		// Common placeholders
		placeholders: {
			password: '••••••••',
			lastName: 'Doe',
			firstName: 'John',
			email: 'your@email.com',
			confirmPassword: '••••••••',
		},

		passwordStrength: {
			weak: 'Weak',
			veryWeak: 'Very weak',
			veryStrong: 'Very strong',
			suggestions: 'Suggested improvements:',
			strong: 'Strong',
			oneUppercase: 'One uppercase letter',
			oneSpecialChar: 'One special character (optional)',
			oneNumber: 'One number',
			oneLowercase: 'One lowercase letter',
			medium: 'Medium',
			label: 'Password strength',
			good: 'Good',
			atLeast8Chars: 'At least 8 characters',
		},
		// Legal text
		legal: {
			termsText: 'By creating an account, you agree to our',
			termsOfService: 'Terms of Service',
			privacyPolicy: 'Privacy Policy',
			and: 'and',
		},
		forgotPassword: {
			title: 'Forgot password',
			successSubtitle: 'Your password has been successfully reset!',
			subtitle: 'Enter your email address to receive a reset code',
			sendCodeButton: 'Send code',
			resetPasswordButton: 'Reset password',
			resetCodePlaceholder: '123456',
			resetCodeLabel: 'Reset code',
			newPasswordLabel: 'New password',
			emailSentSubtitle: 'We sent a reset code to your email',
			emailPlaceholder: 'your@email.com',
			emailLabel: 'Email address',
			continueToDashboard: 'Continue to dashboard',
			backToSignIn: '← Back to sign in',
		},
		// Common fields
		fields: {
			password: 'Password',
			lastName: 'Last name',
			firstName: 'First name',
			email: 'Email address',
			confirmPassword: 'Confirm password',
		},
		common: {
			valid: 'Valid',
			redirecting: 'Redirecting...',
			loading: 'Loading...',
		},
	},

	de: {
		// Common messages
		somethingWentWrong: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',

		signUp: {
			verifyEmail: {
				verifying: 'Verifiziere...',
				verifyButton: 'Verifizieren',
				title: 'E-Mail verifizieren',
				subtitle: 'Wir haben einen Verifizierungscode gesendet an',
				codePlaceholder: '123456',
				codeLabel: 'Verifizierungscode',
				backToForm: '← Zurück zum Registrierungsformular',
			},
			title: 'Konto erstellen',
			subtitle: 'Trete der Beswib-Community bei und beginne deine Startnummern zu tauschen',
			signUpWithGoogle: 'Mit Google registrieren',
			signUpWithFacebook: 'Mit Facebook registrieren',
			signUpButton: 'Konto erstellen',
			signingUp: 'Erstelle...',
			signIn: 'Anmelden',
			passwordPlaceholder: '••••••••',
			passwordLabel: 'Passwort',
			orCreateWith: 'oder Konto erstellen mit',
			lastNamePlaceholder: 'Mustermann',
			lastNameLabel: 'Nachname',
			firstNamePlaceholder: 'Max',
			firstNameLabel: 'Vorname',
			emailPlaceholder: 'deine@email.com',
			emailLabel: 'E-Mail-Adresse',
			confirmPasswordPlaceholder: '••••••••',
			confirmPasswordLabel: 'Passwort bestätigen',
			alreadyAccount: 'Bereits ein Konto?',
		},

		signIn: {
			welcome: 'Willkommen zurück!',
			title: 'Willkommen zurück!',
			subtitle: 'Melde dich in deinem Konto an, um fortzufahren',
			signingIn: 'Anmeldung...',
			signInButton: 'Anmelden',
			signIn: 'Anmelden',
			orContinueWith: 'oder fortfahren mit',
			noAccount: 'Noch kein Konto?',
			forgotPassword: 'Passwort vergessen?',
			createAccount: 'Konto erstellen',
			continueWithGoogle: 'Mit Google anmelden',
			continueWithFacebook: 'Mit Facebook anmelden',
		},

		// Common placeholders
		placeholders: {
			password: '••••••••',
			lastName: 'Mustermann',
			firstName: 'Max',
			email: 'deine@email.com',
			confirmPassword: '••••••••',
		},

		passwordStrength: {
			weak: 'Schwach',
			veryWeak: 'Sehr schwach',
			veryStrong: 'Sehr stark',
			suggestions: 'Verbesserungsvorschläge:',
			strong: 'Stark',
			oneUppercase: 'Ein Großbuchstabe',
			oneSpecialChar: 'Ein Sonderzeichen (optional)',
			oneNumber: 'Eine Zahl',
			oneLowercase: 'Ein Kleinbuchstabe',
			medium: 'Mittel',
			label: 'Passwort-Stärke',
			good: 'Gut',
			atLeast8Chars: 'Mindestens 8 Zeichen',
		},
		// Legal text
		legal: {
			termsText: 'Mit der Erstellung eines Kontos stimmst du unseren',
			termsOfService: 'Nutzungsbedingungen',
			privacyPolicy: 'Datenschutzrichtlinie',
			and: 'und',
		},
		forgotPassword: {
			title: 'Passwort vergessen',
			successSubtitle: 'Dein Passwort wurde erfolgreich zurückgesetzt!',
			subtitle: 'Gib deine E-Mail-Adresse ein, um einen Reset-Code zu erhalten',
			sendCodeButton: 'Code senden',
			resetPasswordButton: 'Passwort zurücksetzen',
			resetCodePlaceholder: '123456',
			resetCodeLabel: 'Reset-Code',
			newPasswordLabel: 'Neues Passwort',
			emailSentSubtitle: 'Wir haben einen Reset-Code an deine E-Mail gesendet',
			emailPlaceholder: 'deine@email.com',
			emailLabel: 'E-Mail-Adresse',
			continueToDashboard: 'Weiter zum Dashboard',
			backToSignIn: '← Zurück zur Anmeldung',
		},
		// Common fields
		fields: {
			password: 'Passwort',
			lastName: 'Nachname',
			firstName: 'Vorname',
			email: 'E-Mail-Adresse',
			confirmPassword: 'Passwort bestätigen',
		},
		common: {
			valid: 'Gültig',
			redirecting: 'Weiterleitung...',
			loading: 'Lade...',
		},
	},
}
