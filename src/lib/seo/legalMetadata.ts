import type { Metadata } from 'next'

import type { Locale } from '@/lib/i18n/config'

import { getBaseMetadata } from './metadata'

// Configuration des métadonnées pour les pages légales par langue
const legalPageConfig = {
	ro: {
		terms: {
			title: 'Termeni și Condiții',
			keywords: 'termeni și condiții, termeni de utilizare, acord utilizator, termeni legali, termeni beswib',
			description:
				'Termeni și condiții pentru utilizarea serviciilor Beswib. Citiți termenii noștri pentru a înțelege drepturile și obligațiile dvs.',
		},
		privacy: {
			title: 'Politica de Confidențialitate',
			keywords:
				'politica de confidențialitate, protecția datelor, informații personale, GDPR, confidențialitate, beswib confidențialitate',
			description:
				'Aflați cum Beswib colectează, folosește și protejează informațiile dvs. personale. Politica noastră de confidențialitate explică drepturile dvs.',
		},
		legalNotice: {
			title: 'Avis Legal',
			keywords: 'avis legal, informații companie, excluderi de răspundere, beswib legal',
			description:
				'Informații legale despre Beswib, inclusiv detalii companie, informații de contact și excluderi de răspundere.',
		},
		cookies: {
			title: 'Politica de Cookie-uri',
			keywords: 'politica de cookie-uri, cookie-uri, urmărire, analiză web, cookie-uri beswib',
			description:
				'Înțelegeți cum Beswib folosește cookie-urile și tehnologii similare pentru a vă îmbunătăți experiența pe platforma noastră.',
		},
	},
	pt: {
		terms: {
			title: 'Termos de Serviço',
			keywords: 'termos de serviço, termos e condições, acordo do usuário, termos legais, termos beswib',
			description:
				'Termos e condições para usar os serviços Beswib. Leia nossos termos de serviço para entender seus direitos e obrigações.',
		},
		privacy: {
			title: 'Política de Privacidade',
			keywords:
				'política de privacidade, proteção de dados, informações pessoais, GDPR, privacidade, beswib privacidade',
			description:
				'Saiba como o Beswib coleta, usa e protege suas informações pessoais. Nossa política de privacidade explica seus direitos.',
		},
		legalNotice: {
			title: 'Aviso Legal',
			keywords: 'aviso legal, informações da empresa, isenções de responsabilidade, beswib legal',
			description:
				'Informações legais sobre o Beswib, incluindo detalhes da empresa, informações de contato e isenções de responsabilidade.',
		},
		cookies: {
			title: 'Política de Cookies',
			keywords: 'política de cookies, cookies, rastreamento, análise web, cookies beswib',
			description:
				'Entenda como o Beswib usa cookies e tecnologias similares para melhorar sua experiência em nossa plataforma.',
		},
	},
	nl: {
		terms: {
			title: 'Gebruiksvoorwaarden',
			keywords:
				'gebruiksvoorwaarden, algemene voorwaarden, gebruikersovereenkomst, juridische voorwaarden, beswib voorwaarden',
			description:
				'Algemene voorwaarden voor het gebruik van Beswib-diensten. Lees onze voorwaarden om uw rechten en verplichtingen te begrijpen.',
		},
		privacy: {
			title: 'Privacybeleid',
			keywords: 'privacybeleid, gegevensbescherming, persoonlijke gegevens, GDPR, privacy, beswib privacy',
			description:
				'Leer hoe Beswib uw persoonlijke gegevens verzamelt, gebruikt en bescherpt. Ons privacybeleid legt uw rechten uit.',
		},
		legalNotice: {
			title: 'Juridische Mededeling',
			keywords: 'juridische mededeling, bedrijfsinformatie, vrijwaringen, beswib juridisch',
			description:
				'Juridische informatie over Beswib, inclusief bedrijfsdetails, contactinformatie en juridische vrijwaringen.',
		},
		cookies: {
			title: 'Cookiebeleid',
			keywords: 'cookiebeleid, cookies, tracking, webanalyse, beswib cookies',
			description:
				'Begrijp hoe Beswib cookies en vergelijkbare technologieën gebruikt om uw ervaring op ons platform te verbeteren.',
		},
	},
	ko: {
		terms: {
			title: '서비스 약관',
			keywords: '서비스 약관, 이용 약관, 사용자 계약, 법적 약관, beswib 약관',
			description: 'Beswib 서비스 이용 약관. 당사의 서비스 약관을 읽고 귀하의 권리와 의무를 이해하세요.',
		},
		privacy: {
			title: '개인정보 보호정책',
			keywords: '개인정보 보호정책, 데이터 보호, 개인정보, GDPR, 개인정보, beswib 개인정보',
			description:
				'Beswib가 귀하의 개인정보를 어떻게 수집, 사용 및 보호하는지 알아보세요. 당사의 개인정보 보호정책이 귀하의 권리를 설명합니다.',
		},
		legalNotice: {
			title: '법적 고지',
			keywords: '법적 고지, 회사 정보, 면책조항, beswib 법적',
			description: 'Beswib에 대한 법적 정보, 회사 세부사항, 연락처 정보 및 법적 면책조항을 포함합니다.',
		},
		cookies: {
			title: '쿠키 정책',
			keywords: '쿠키 정책, 쿠키, 추적, 웹 분석, beswib 쿠키',
			description: 'Beswib가 쿠키와 유사한 기술을 사용하여 당사 플랫폼에서의 경험을 개선하는 방법을 이해하세요.',
		},
	},
	it: {
		terms: {
			title: 'Termini di Servizio',
			keywords: 'termini di servizio, termini e condizioni, accordo utente, termini legali, termini beswib',
			description:
				"Termini e condizioni per l'utilizzo dei servizi Beswib. Leggi i nostri termini di servizio per comprendere i tuoi diritti e obblighi.",
		},
		privacy: {
			title: 'Informativa sulla Privacy',
			keywords: 'informativa sulla privacy, protezione dati, informazioni personali, GDPR, privacy, beswib privacy',
			description:
				'Scopri come Beswib raccoglie, utilizza e protegge le tue informazioni personali. La nostra informativa spiega i tuoi diritti.',
		},
		legalNotice: {
			title: 'Note Legali',
			keywords: 'note legali, informazioni aziendali, clausole di esclusione, beswib legale',
			description:
				'Informazioni legali su Beswib, inclusi dettagli aziendali, informazioni di contatto e clausole di esclusione di responsabilità.',
		},
		cookies: {
			title: 'Politica sui Cookie',
			keywords: 'politica sui cookie, cookie, tracciamento, analisi web, cookie beswib',
			description:
				'Comprendi come Beswib utilizza i cookie e tecnologie simili per migliorare la tua esperienza sulla nostra piattaforma.',
		},
	},
	fr: {
		terms: {
			title: "Conditions d'Utilisation",
			keywords: "conditions d'utilisation, conditions générales, accord utilisateur, termes légaux, conditions beswib",
			description:
				"Conditions générales d'utilisation des services Beswib. Lisez nos conditions pour comprendre vos droits et obligations.",
		},
		privacy: {
			title: 'Politique de Confidentialité',
			keywords:
				'politique de confidentialité, protection des données, informations personnelles, RGPD, confidentialité, beswib confidentialité',
			description:
				'Découvrez comment Beswib collecte, utilise et protège vos informations personnelles. Notre politique de confidentialité explique vos droits.',
		},
		legalNotice: {
			title: 'Mentions Légales',
			keywords: 'mentions légales, informations entreprise, clauses de non-responsabilité, beswib légal',
			description:
				"Informations légales sur Beswib, incluant les détails de l'entreprise, informations de contact et clauses de non-responsabilité.",
		},
		cookies: {
			title: 'Politique des Cookies',
			keywords: 'politique des cookies, cookies, suivi, analyse web, cookies beswib',
			description:
				'Comprenez comment Beswib utilise les cookies et technologies similaires pour améliorer votre expérience sur notre plateforme.',
		},
	},
	es: {
		terms: {
			title: 'Términos de Servicio',
			keywords: 'términos de servicio, términos y condiciones, acuerdo de usuario, términos legales, términos beswib',
			description:
				'Términos y condiciones para usar los servicios de Beswib. Lea nuestros términos de servicio para entender sus derechos y obligaciones.',
		},
		privacy: {
			title: 'Política de Privacidad',
			keywords:
				'política de privacidad, protección de datos, información personal, GDPR, privacidad, beswib privacidad',
			description:
				'Aprenda cómo Beswib recopila, usa y protege su información personal. Nuestra política de privacidad explica sus derechos.',
		},
		legalNotice: {
			title: 'Aviso Legal',
			keywords: 'aviso legal, información de empresa, descargos de responsabilidad, beswib legal',
			description:
				'Información legal sobre Beswib, incluyendo detalles de la empresa, información de contacto y descargos de responsabilidad.',
		},
		cookies: {
			title: 'Política de Cookies',
			keywords: 'política de cookies, cookies, seguimiento, análisis web, cookies beswib',
			description:
				'Entienda cómo Beswib usa cookies y tecnologías similares para mejorar su experiencia en nuestra plataforma.',
		},
	},

	en: {
		terms: {
			title: 'Terms of Service',
			keywords: 'terms of service, terms and conditions, user agreement, legal terms, beswib terms',
			description:
				'Terms and conditions for using Beswib services. Read our terms of service to understand your rights and obligations.',
		},
		privacy: {
			title: 'Privacy Policy',
			keywords: 'privacy policy, data protection, personal information, GDPR, data privacy, beswib privacy',
			description:
				'Learn how Beswib collects, uses, and protects your personal information. Our privacy policy explains your data rights.',
		},
		legalNotice: {
			title: 'Legal Notice',
			keywords: 'legal notice, company information, legal disclaimers, beswib legal',
			description:
				'Legal information about Beswib, including company details, contact information, and legal disclaimers.',
		},
		cookies: {
			title: 'Cookie Policy',
			keywords: 'cookie policy, cookies, tracking, web analytics, beswib cookies',
			description:
				'Understand how Beswib uses cookies and similar technologies to improve your experience on our platform.',
		},
	},
	de: {
		terms: {
			title: 'Nutzungsbedingungen',
			keywords:
				'nutzungsbedingungen, allgemeine geschäftsbedingungen, benutzervereinbarung, rechtliche bedingungen, beswib bedingungen',
			description:
				'Allgemeine Geschäftsbedingungen für Beswib-Dienste. Lesen Sie unsere Bedingungen, um Ihre Rechte und Pflichten zu verstehen.',
		},
		privacy: {
			title: 'Datenschutzerklärung',
			keywords: 'datenschutzerklärung, datenschutz, persönliche daten, DSGVO, datenschutz, beswib datenschutz',
			description:
				'Erfahren Sie, wie Beswib Ihre persönlichen Daten sammelt, verwendet und schützt. Unsere Datenschutzerklärung erklärt Ihre Rechte.',
		},
		legalNotice: {
			title: 'Impressum',
			keywords: 'impressum, unternehmensinformationen, haftungsausschlüsse, beswib rechtlich',
			description:
				'Rechtliche Informationen über Beswib, einschließlich Unternehmensdetails, Kontaktinformationen und rechtliche Haftungsausschlüsse.',
		},
		cookies: {
			title: 'Cookie-Richtlinie',
			keywords: 'cookie-richtlinie, cookies, verfolgung, web-analyse, beswib cookies',
			description:
				'Verstehen Sie, wie Beswib Cookies und ähnliche Technologien verwendet, um Ihre Erfahrung auf unserer Plattform zu verbessern.',
		},
	},
}

// Fonction pour générer les métadonnées des pages légales
export function getLegalPageMetadata(
	locale: Locale,
	pageType: 'terms' | 'privacy' | 'cookies' | 'legalNotice'
): Metadata {
	const baseMetadata = getBaseMetadata(locale)
	const pageConfig = legalPageConfig[locale]?.[pageType] ?? legalPageConfig.en[pageType]

	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: `${pageConfig.title} - Beswib`,
			description: pageConfig.description,
		},
		title: `${pageConfig.title} - Beswib`,
		openGraph: {
			...baseMetadata.openGraph,
			url: `https://beswib.com/${locale}/legals/${pageType}`,
			title: `${pageConfig.title} - Beswib`,
			description: pageConfig.description,
		},
		keywords: pageConfig.keywords,
		description: pageConfig.description,
		alternates: {
			languages: baseMetadata.alternates?.languages ?? {},
			canonical: `https://beswib.com/${locale}/legals/${pageType}`,
		},
	}
}
