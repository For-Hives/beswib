import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n/config'
import { getBaseMetadata } from './metadata'

// Configuration des métadonnées pour les pages légales par langue
const legalPageConfig = {
  en: {
    terms: {
      title: 'Terms of Service',
      description: 'Terms and conditions for using Beswib services. Read our terms of service to understand your rights and obligations.',
      keywords: 'terms of service, terms and conditions, user agreement, legal terms, beswib terms'
    },
    privacy: {
      title: 'Privacy Policy',
      description: 'Learn how Beswib collects, uses, and protects your personal information. Our privacy policy explains your data rights.',
      keywords: 'privacy policy, data protection, personal information, GDPR, data privacy, beswib privacy'
    },
    cookies: {
      title: 'Cookie Policy',
      description: 'Understand how Beswib uses cookies and similar technologies to improve your experience on our platform.',
      keywords: 'cookie policy, cookies, tracking, web analytics, beswib cookies'
    },
    legalNotice: {
      title: 'Legal Notice',
      description: 'Legal information about Beswib, including company details, contact information, and legal disclaimers.',
      keywords: 'legal notice, company information, legal disclaimers, beswib legal'
    }
  },
  fr: {
    terms: {
      title: 'Conditions d\'Utilisation',
      description: 'Conditions générales d\'utilisation des services Beswib. Lisez nos conditions pour comprendre vos droits et obligations.',
      keywords: 'conditions d\'utilisation, conditions générales, accord utilisateur, termes légaux, conditions beswib'
    },
    privacy: {
      title: 'Politique de Confidentialité',
      description: 'Découvrez comment Beswib collecte, utilise et protège vos informations personnelles. Notre politique de confidentialité explique vos droits.',
      keywords: 'politique de confidentialité, protection des données, informations personnelles, RGPD, confidentialité, beswib confidentialité'
    },
    cookies: {
      title: 'Politique des Cookies',
      description: 'Comprenez comment Beswib utilise les cookies et technologies similaires pour améliorer votre expérience sur notre plateforme.',
      keywords: 'politique des cookies, cookies, suivi, analyse web, cookies beswib'
    },
    legalNotice: {
      title: 'Mentions Légales',
      description: 'Informations légales sur Beswib, incluant les détails de l\'entreprise, informations de contact et clauses de non-responsabilité.',
      keywords: 'mentions légales, informations entreprise, clauses de non-responsabilité, beswib légal'
    }
  },
  de: {
    terms: {
      title: 'Nutzungsbedingungen',
      description: 'Allgemeine Geschäftsbedingungen für Beswib-Dienste. Lesen Sie unsere Bedingungen, um Ihre Rechte und Pflichten zu verstehen.',
      keywords: 'nutzungsbedingungen, allgemeine geschäftsbedingungen, benutzervereinbarung, rechtliche bedingungen, beswib bedingungen'
    },
    privacy: {
      title: 'Datenschutzerklärung',
      description: 'Erfahren Sie, wie Beswib Ihre persönlichen Daten sammelt, verwendet und schützt. Unsere Datenschutzerklärung erklärt Ihre Rechte.',
      keywords: 'datenschutzerklärung, datenschutz, persönliche daten, DSGVO, datenschutz, beswib datenschutz'
    },
    cookies: {
      title: 'Cookie-Richtlinie',
      description: 'Verstehen Sie, wie Beswib Cookies und ähnliche Technologien verwendet, um Ihre Erfahrung auf unserer Plattform zu verbessern.',
      keywords: 'cookie-richtlinie, cookies, verfolgung, web-analyse, beswib cookies'
    },
    legalNotice: {
      title: 'Impressum',
      description: 'Rechtliche Informationen über Beswib, einschließlich Unternehmensdetails, Kontaktinformationen und rechtliche Haftungsausschlüsse.',
      keywords: 'impressum, unternehmensinformationen, haftungsausschlüsse, beswib rechtlich'
    }
  },
  es: {
    terms: {
      title: 'Términos de Servicio',
      description: 'Términos y condiciones para usar los servicios de Beswib. Lea nuestros términos de servicio para entender sus derechos y obligaciones.',
      keywords: 'términos de servicio, términos y condiciones, acuerdo de usuario, términos legales, términos beswib'
    },
    privacy: {
      title: 'Política de Privacidad',
      description: 'Aprenda cómo Beswib recopila, usa y protege su información personal. Nuestra política de privacidad explica sus derechos.',
      keywords: 'política de privacidad, protección de datos, información personal, GDPR, privacidad, beswib privacidad'
    },
    cookies: {
      title: 'Política de Cookies',
      description: 'Entienda cómo Beswib usa cookies y tecnologías similares para mejorar su experiencia en nuestra plataforma.',
      keywords: 'política de cookies, cookies, seguimiento, análisis web, cookies beswib'
    },
    legalNotice: {
      title: 'Aviso Legal',
      description: 'Información legal sobre Beswib, incluyendo detalles de la empresa, información de contacto y descargos de responsabilidad.',
      keywords: 'aviso legal, información de empresa, descargos de responsabilidad, beswib legal'
    }
  },
  it: {
    terms: {
      title: 'Termini di Servizio',
      description: 'Termini e condizioni per l\'utilizzo dei servizi Beswib. Leggi i nostri termini di servizio per comprendere i tuoi diritti e obblighi.',
      keywords: 'termini di servizio, termini e condizioni, accordo utente, termini legali, termini beswib'
    },
    privacy: {
      title: 'Informativa sulla Privacy',
      description: 'Scopri come Beswib raccoglie, utilizza e protegge le tue informazioni personali. La nostra informativa spiega i tuoi diritti.',
      keywords: 'informativa sulla privacy, protezione dati, informazioni personali, GDPR, privacy, beswib privacy'
    },
    cookies: {
      title: 'Politica sui Cookie',
      description: 'Comprendi come Beswib utilizza i cookie e tecnologie simili per migliorare la tua esperienza sulla nostra piattaforma.',
      keywords: 'politica sui cookie, cookie, tracciamento, analisi web, cookie beswib'
    },
    legalNotice: {
      title: 'Note Legali',
      description: 'Informazioni legali su Beswib, inclusi dettagli aziendali, informazioni di contatto e clausole di esclusione di responsabilità.',
      keywords: 'note legali, informazioni aziendali, clausole di esclusione, beswib legale'
    }
  },
  pt: {
    terms: {
      title: 'Termos de Serviço',
      description: 'Termos e condições para usar os serviços Beswib. Leia nossos termos de serviço para entender seus direitos e obrigações.',
      keywords: 'termos de serviço, termos e condições, acordo do usuário, termos legais, termos beswib'
    },
    privacy: {
      title: 'Política de Privacidade',
      description: 'Saiba como o Beswib coleta, usa e protege suas informações pessoais. Nossa política de privacidade explica seus direitos.',
      keywords: 'política de privacidade, proteção de dados, informações pessoais, GDPR, privacidade, beswib privacidade'
    },
    cookies: {
      title: 'Política de Cookies',
      description: 'Entenda como o Beswib usa cookies e tecnologias similares para melhorar sua experiência em nossa plataforma.',
      keywords: 'política de cookies, cookies, rastreamento, análise web, cookies beswib'
    },
    legalNotice: {
      title: 'Aviso Legal',
      description: 'Informações legais sobre o Beswib, incluindo detalhes da empresa, informações de contato e isenções de responsabilidade.',
      keywords: 'aviso legal, informações da empresa, isenções de responsabilidade, beswib legal'
    }
  },
  nl: {
    terms: {
      title: 'Gebruiksvoorwaarden',
      description: 'Algemene voorwaarden voor het gebruik van Beswib-diensten. Lees onze voorwaarden om uw rechten en verplichtingen te begrijpen.',
      keywords: 'gebruiksvoorwaarden, algemene voorwaarden, gebruikersovereenkomst, juridische voorwaarden, beswib voorwaarden'
    },
    privacy: {
      title: 'Privacybeleid',
      description: 'Leer hoe Beswib uw persoonlijke gegevens verzamelt, gebruikt en bescherpt. Ons privacybeleid legt uw rechten uit.',
      keywords: 'privacybeleid, gegevensbescherming, persoonlijke gegevens, GDPR, privacy, beswib privacy'
    },
    cookies: {
      title: 'Cookiebeleid',
      description: 'Begrijp hoe Beswib cookies en vergelijkbare technologieën gebruikt om uw ervaring op ons platform te verbeteren.',
      keywords: 'cookiebeleid, cookies, tracking, webanalyse, beswib cookies'
    },
    legalNotice: {
      title: 'Juridische Mededeling',
      description: 'Juridische informatie over Beswib, inclusief bedrijfsdetails, contactinformatie en juridische vrijwaringen.',
      keywords: 'juridische mededeling, bedrijfsinformatie, vrijwaringen, beswib juridisch'
    }
  },
  pl: {
    terms: {
      title: 'Warunki Użytkowania',
      description: 'Warunki korzystania z usług Beswib. Przeczytaj nasze warunki, aby zrozumieć swoje prawa i obowiązki.',
      keywords: 'warunki użytkowania, warunki ogólne, umowa użytkownika, warunki prawne, warunki beswib'
    },
    privacy: {
      title: 'Polityka Prywatności',
      description: 'Dowiedz się, jak Beswib zbiera, używa i chroni Twoje dane osobowe. Nasza polityka prywatności wyjaśnia Twoje prawa.',
      keywords: 'polityka prywatności, ochrona danych, dane osobowe, GDPR, prywatność, beswib prywatność'
    },
    cookies: {
      title: 'Polityka Ciasteczek',
      description: 'Zrozum, jak Beswib używa ciasteczek i podobnych technologii, aby poprawić Twoje doświadczenie na naszej platformie.',
      keywords: 'polityka ciasteczek, ciasteczka, śledzenie, analiza web, ciasteczka beswib'
    },
    legalNotice: {
      title: 'Informacje Prawne',
      description: 'Informacje prawne o Beswib, w tym szczegóły firmy, informacje kontaktowe i wyłączenia odpowiedzialności.',
      keywords: 'informacje prawne, informacje o firmie, wyłączenia odpowiedzialności, beswib prawny'
    }
  },
  sv: {
    terms: {
      title: 'Användarvillkor',
      description: 'Villkor för användning av Beswib-tjänster. Läs våra villkor för att förstå dina rättigheter och skyldigheter.',
      keywords: 'användarvillkor, allmänna villkor, användaravtal, juridiska villkor, beswib villkor'
    },
    privacy: {
      title: 'Integritetspolicy',
      description: 'Lär dig hur Beswib samlar in, använder och skyddar din personliga information. Vår integritetspolicy förklarar dina rättigheter.',
      keywords: 'integritetspolicy, dataskydd, personlig information, GDPR, integritet, beswib integritet'
    },
    cookies: {
      title: 'Cookie-policy',
      description: 'Förstå hur Beswib använder cookies och liknande teknologier för att förbättra din upplevelse på vår plattform.',
      keywords: 'cookie-policy, cookies, spårning, webbanalys, beswib cookies'
    },
    legalNotice: {
      title: 'Juridisk Information',
      description: 'Juridisk information om Beswib, inklusive företagsdetaljer, kontaktinformation och juridiska ansvarsfriskrivningar.',
      keywords: 'juridisk information, företagsinformation, ansvarsfriskrivningar, beswib juridisk'
    }
  },
  ko: {
    terms: {
      title: '서비스 약관',
      description: 'Beswib 서비스 이용 약관. 당사의 서비스 약관을 읽고 귀하의 권리와 의무를 이해하세요.',
      keywords: '서비스 약관, 이용 약관, 사용자 계약, 법적 약관, beswib 약관'
    },
    privacy: {
      title: '개인정보 보호정책',
      description: 'Beswib가 귀하의 개인정보를 어떻게 수집, 사용 및 보호하는지 알아보세요. 당사의 개인정보 보호정책이 귀하의 권리를 설명합니다.',
      keywords: '개인정보 보호정책, 데이터 보호, 개인정보, GDPR, 개인정보, beswib 개인정보'
    },
    cookies: {
      title: '쿠키 정책',
      description: 'Beswib가 쿠키와 유사한 기술을 사용하여 당사 플랫폼에서의 경험을 개선하는 방법을 이해하세요.',
      keywords: '쿠키 정책, 쿠키, 추적, 웹 분석, beswib 쿠키'
    },
    legalNotice: {
      title: '법적 고지',
      description: 'Beswib에 대한 법적 정보, 회사 세부사항, 연락처 정보 및 법적 면책조항을 포함합니다.',
      keywords: '법적 고지, 회사 정보, 면책조항, beswib 법적'
    }
  }
}

// Fonction pour générer les métadonnées des pages légales
export function getLegalPageMetadata(locale: Locale, pageType: 'terms' | 'privacy' | 'cookies' | 'legalNotice'): Metadata {
  const baseMetadata = getBaseMetadata(locale)
  const pageConfig = legalPageConfig[locale]?.[pageType] || legalPageConfig.en[pageType]
  
  return {
    ...baseMetadata,
    title: `${pageConfig.title} - ${baseMetadata.title?.default || 'Beswib'}`,
    description: pageConfig.description,
    keywords: pageConfig.keywords,
    openGraph: {
      ...baseMetadata.openGraph,
      title: `${pageConfig.title} - ${baseMetadata.openGraph?.title || 'Beswib'}`,
      description: pageConfig.description,
      url: `https://beswib.com/${locale}/legals/${pageType}`,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: `${pageConfig.title} - ${baseMetadata.twitter?.title || 'Beswib'}`,
      description: pageConfig.description,
    },
    alternates: {
      canonical: `https://beswib.com/${locale}/legals/${pageType}`,
      languages: baseMetadata.alternates?.languages || {},
    },
  }
}