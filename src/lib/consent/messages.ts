import type { ConsentRootProps } from '@c15t/nextjs'

import type { Locale } from '@/lib/i18n/config'

// Copy of the consent banner and of the preferences dialog, in the nine locales of the app.
// c15t only bundles English, and its other languages live in a package the app does not depend
// on (none of them is Korean). The wording follows c15t's stock copy, so every locale says what
// the English banner has always said, in the tone the landing page of that locale uses. Only the
// keys the two surfaces render are set; anything else falls back on c15t's English.

type ConsentI18n = NonNullable<NonNullable<ConsentRootProps['options']>['i18n']>
type ConsentMessages = NonNullable<ConsentI18n['messages']>[string]

const consentMessages: Record<Locale, ConsentMessages> = {
	en: {
		common: {
			acceptAll: 'Accept All',
			rejectAll: 'Reject All',
			customize: 'Customize',
			save: 'Save Settings',
			close: 'Close',
			securedBy: 'Secured by',
		},
		cookieBanner: {
			title: 'We value your privacy',
			description:
				'This site uses cookies to improve your browsing experience, analyze site traffic, and show personalized content.',
		},
		consentManagerDialog: {
			title: 'Privacy Settings',
			description:
				'Customize your privacy settings here. You can choose which types of cookies and tracking technologies you allow.',
		},
		consentTypes: {
			necessary: {
				title: 'Strictly Necessary',
				description: 'These cookies are essential for the website to function properly and cannot be disabled.',
			},
			measurement: {
				title: 'Analytics',
				description:
					'These cookies help us understand how visitors interact with the website and improve its performance.',
			},
		},
	},
	fr: {
		common: {
			acceptAll: 'Tout accepter',
			rejectAll: 'Tout refuser',
			customize: 'Personnaliser',
			save: 'Enregistrer les paramètres',
			close: 'Fermer',
			securedBy: 'Sécurisé par',
		},
		cookieBanner: {
			title: 'Nous respectons votre vie privée',
			description:
				'Ce site utilise des cookies pour améliorer votre expérience de navigation, analyser le trafic du site et afficher du contenu personnalisé.',
		},
		consentManagerDialog: {
			title: 'Paramètres de confidentialité',
			description:
				'Personnalisez vos paramètres de confidentialité ici. Vous pouvez choisir les types de cookies et de technologies de suivi que vous autorisez.',
		},
		consentTypes: {
			necessary: {
				title: 'Strictement nécessaires',
				description: 'Ces cookies sont indispensables au bon fonctionnement du site et ne peuvent pas être désactivés.',
			},
			measurement: {
				title: "Mesure d'audience",
				description:
					'Ces cookies nous aident à comprendre comment les visiteurs utilisent le site et à améliorer ses performances.',
			},
		},
	},
	es: {
		common: {
			acceptAll: 'Aceptar todo',
			rejectAll: 'Rechazar todo',
			customize: 'Personalizar',
			save: 'Guardar ajustes',
			close: 'Cerrar',
			securedBy: 'Protegido por',
		},
		cookieBanner: {
			title: 'Valoramos tu privacidad',
			description:
				'Este sitio web utiliza cookies para mejorar tu experiencia de navegación, analizar el tráfico del sitio y mostrar contenido personalizado.',
		},
		consentManagerDialog: {
			title: 'Configuración de privacidad',
			description:
				'Personaliza aquí tus ajustes de privacidad. Puedes elegir qué tipos de cookies y tecnologías de seguimiento permites.',
		},
		consentTypes: {
			necessary: {
				title: 'Estrictamente necesarias',
				description:
					'Estas cookies son esenciales para que el sitio web funcione correctamente y no se pueden desactivar.',
			},
			measurement: {
				title: 'Analítica',
				description:
					'Estas cookies nos ayudan a comprender cómo interactúan los visitantes con el sitio web y a mejorar su rendimiento.',
			},
		},
	},
	it: {
		common: {
			acceptAll: 'Accetta tutto',
			rejectAll: 'Rifiuta tutto',
			customize: 'Personalizza',
			save: 'Salva impostazioni',
			close: 'Chiudi',
			securedBy: 'Protetto da',
		},
		cookieBanner: {
			title: 'Rispettiamo la tua privacy',
			description:
				'Questo sito utilizza cookie per migliorare la tua esperienza di navigazione, analizzare il traffico e mostrare contenuti personalizzati.',
		},
		consentManagerDialog: {
			title: 'Impostazioni sulla privacy',
			description:
				'Personalizza qui le tue impostazioni sulla privacy. Puoi scegliere quali tipi di cookie e tecnologie di tracciamento consentire.',
		},
		consentTypes: {
			necessary: {
				title: 'Strettamente necessari',
				description:
					'Questi cookie sono essenziali per il corretto funzionamento del sito e non possono essere disattivati.',
			},
			measurement: {
				title: 'Analisi',
				description:
					'Questi cookie ci aiutano a capire come i visitatori interagiscono con il sito e a migliorarne le prestazioni.',
			},
		},
	},
	de: {
		common: {
			acceptAll: 'Alle akzeptieren',
			rejectAll: 'Alle ablehnen',
			customize: 'Anpassen',
			save: 'Einstellungen speichern',
			close: 'Schließen',
			securedBy: 'Gesichert durch',
		},
		cookieBanner: {
			title: 'Wir respektieren deine Privatsphäre',
			description:
				'Diese Website verwendet Cookies, um dein Surferlebnis zu verbessern, den Website-Verkehr zu analysieren und personalisierte Inhalte anzuzeigen.',
		},
		consentManagerDialog: {
			title: 'Datenschutz-Einstellungen',
			description:
				'Passe hier deine Datenschutz-Einstellungen an. Du kannst wählen, welche Arten von Cookies und Tracking-Technologien du zulässt.',
		},
		consentTypes: {
			necessary: {
				title: 'Unbedingt erforderlich',
				description:
					'Diese Cookies sind für das Funktionieren der Website unerlässlich und können nicht deaktiviert werden.',
			},
			measurement: {
				title: 'Analyse',
				description:
					'Diese Cookies helfen uns zu verstehen, wie Besucher die Website nutzen, und ihre Leistung zu verbessern.',
			},
		},
	},
	ro: {
		common: {
			acceptAll: 'Acceptă toate',
			rejectAll: 'Respinge toate',
			customize: 'Personalizează',
			save: 'Salvează setările',
			close: 'Închide',
			securedBy: 'Securizat de',
		},
		cookieBanner: {
			title: 'Prețuim confidențialitatea ta',
			description:
				'Acest site folosește cookie-uri pentru a îmbunătăți experiența de navigare, a analiza traficul site-ului și a afișa conținut personalizat.',
		},
		consentManagerDialog: {
			title: 'Setări de confidențialitate',
			description:
				'Personalizează setările de confidențialitate aici. Poți alege ce tipuri de cookie-uri și tehnologii de urmărire permiți.',
		},
		consentTypes: {
			necessary: {
				title: 'Strict necesare',
				description:
					'Aceste cookie-uri sunt esențiale pentru funcționarea corectă a site-ului și nu pot fi dezactivate.',
			},
			measurement: {
				title: 'Analitice',
				description:
					'Aceste cookie-uri ne ajută să înțelegem cum interacționează vizitatorii cu site-ul și să îi îmbunătățim performanța.',
			},
		},
	},
	pt: {
		common: {
			acceptAll: 'Aceitar todos',
			rejectAll: 'Rejeitar todos',
			customize: 'Personalizar',
			save: 'Guardar definições',
			close: 'Fechar',
			securedBy: 'Protegido por',
		},
		cookieBanner: {
			title: 'Respeitamos a tua privacidade',
			description:
				'Este site utiliza cookies para melhorar a tua experiência de navegação, analisar o tráfego do site e mostrar conteúdos personalizados.',
		},
		consentManagerDialog: {
			title: 'Definições de privacidade',
			description:
				'Personaliza aqui as tuas definições de privacidade. Podes escolher os tipos de cookies e de tecnologias de rastreio que autorizas.',
		},
		consentTypes: {
			necessary: {
				title: 'Estritamente necessários',
				description: 'Estes cookies são essenciais para o site funcionar corretamente e não podem ser desativados.',
			},
			measurement: {
				title: 'Análise',
				description:
					'Estes cookies ajudam-nos a compreender como os visitantes interagem com o site e a melhorar o seu desempenho.',
			},
		},
	},
	nl: {
		common: {
			acceptAll: 'Alles accepteren',
			rejectAll: 'Alles weigeren',
			customize: 'Aanpassen',
			save: 'Instellingen opslaan',
			close: 'Sluiten',
			securedBy: 'Beveiligd door',
		},
		cookieBanner: {
			title: 'Wij hechten waarde aan je privacy',
			description:
				'Deze site gebruikt cookies om je surfervaring te verbeteren, het verkeer op de site te analyseren en gepersonaliseerde inhoud te tonen.',
		},
		consentManagerDialog: {
			title: 'Privacy-instellingen',
			description:
				'Pas hier je privacy-instellingen aan. Je kunt kiezen welke soorten cookies en trackingtechnologieën je toestaat.',
		},
		consentTypes: {
			necessary: {
				title: 'Strikt noodzakelijk',
				description:
					'Deze cookies zijn essentieel voor het goed functioneren van de website en kunnen niet worden uitgeschakeld.',
			},
			measurement: {
				title: 'Analyse',
				description:
					'Deze cookies helpen ons te begrijpen hoe bezoekers de website gebruiken en de prestaties ervan te verbeteren.',
			},
		},
	},
	ko: {
		common: {
			acceptAll: '모두 수락',
			rejectAll: '모두 거부',
			customize: '사용자 설정',
			save: '설정 저장',
			close: '닫기',
			securedBy: '보안 제공',
		},
		cookieBanner: {
			title: '개인정보를 소중히 생각합니다',
			description:
				'이 사이트는 탐색 경험을 개선하고, 사이트 트래픽을 분석하며, 맞춤형 콘텐츠를 표시하기 위해 쿠키를 사용합니다.',
		},
		consentManagerDialog: {
			title: '개인정보 설정',
			description: '여기에서 개인정보 설정을 변경할 수 있습니다. 허용할 쿠키 및 추적 기술의 유형을 선택하세요.',
		},
		consentTypes: {
			necessary: {
				title: '필수 쿠키',
				description: '이 쿠키는 웹사이트가 정상적으로 작동하는 데 꼭 필요하며 비활성화할 수 없습니다.',
			},
			measurement: {
				title: '분석',
				description: '이 쿠키는 방문자가 웹사이트를 어떻게 이용하는지 파악하고 성능을 개선하는 데 도움이 됩니다.',
			},
		},
	},
}

/**
 * The `i18n` option of <ConsentRoot> for one page: the copy of that locale only, so a page carries
 * a single language, and no browser-language detection, so the banner speaks the language of the
 * page it sits on.
 */
export function getConsentI18n(locale: Locale): ConsentI18n {
	return {
		locale,
		detectBrowserLanguage: false,
		messages: { [locale]: consentMessages[locale] ?? consentMessages.en },
	}
}
