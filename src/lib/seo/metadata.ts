import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n/config'

// Configuration SEO par langue
export const seoConfig = {
  en: {
    defaultTitle: 'Beswib - Transfer Race Bibs | Buy & Sell Running, Trail, Triathlon Bibs',
    defaultDescription: 'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
    keywords: 'race bibs, running bibs, trail running, triathlon, cycling, race transfer, buy bibs, sell bibs, marathon, ultra trail',
    locale: 'en_US',
    alternateLanguages: {
      'fr': '/fr',
      'de': '/de', 
      'es': '/es',
      'it': '/it',
      'pt': '/pt',
      'nl': '/nl',
      'pl': '/pl',
      'sv': '/sv',
      'ko': '/ko'
    }
  },
  fr: {
    defaultTitle: 'Beswib - Transfert de Dossards | Acheter & Vendre des Dossards de Course',
    defaultDescription: 'Transférez vos dossards de course en toute sécurité avec Beswib. Achetez et vendez des dossards de running, trail, triathlon et cyclisme.',
    keywords: 'dossards, course à pied, trail running, triathlon, cyclisme, transfert dossard, acheter dossard, vendre dossard, marathon, ultra trail',
    locale: 'fr_FR',
    alternateLanguages: {
      'en': '/en',
      'de': '/de',
      'es': '/es', 
      'it': '/it',
      'pt': '/pt',
      'nl': '/nl',
      'pl': '/pl',
      'sv': '/sv',
      'ko': '/ko'
    }
  },
  de: {
    defaultTitle: 'Beswib - Startnummern Transfer | Kaufen & Verkaufen von Lauf-, Trail- und Triathlon-Startnummern',
    defaultDescription: 'Übertragen Sie Ihre Startnummern sicher mit Beswib. Kaufen und verkaufen Sie Startnummern für Laufen, Trail, Triathlon und Radfahren.',
    keywords: 'startnummern, laufen, trail running, triathlon, radfahren, startnummer transfer, startnummer kaufen, startnummer verkaufen, marathon, ultra trail',
    locale: 'de_DE',
    alternateLanguages: {
      'en': '/en',
      'fr': '/fr',
      'es': '/es',
      'it': '/it', 
      'pt': '/pt',
      'nl': '/nl',
      'pl': '/pl',
      'sv': '/sv',
      'ko': '/ko'
    }
  },
  es: {
    defaultTitle: 'Beswib - Transferencia de Dorsales | Comprar y Vender Dorsales de Carrera',
    defaultDescription: 'Transfiere tus dorsales de carrera de forma segura con Beswib. Compra y vende dorsales de running, trail, triatlón y ciclismo.',
    keywords: 'dorsales, carrera a pie, trail running, triatlón, ciclismo, transferencia dorsal, comprar dorsal, vender dorsal, maratón, ultra trail',
    locale: 'es_ES',
    alternateLanguages: {
      'en': '/en',
      'fr': '/fr',
      'de': '/de',
      'it': '/it',
      'pt': '/pt',
      'nl': '/nl',
      'pl': '/pl',
      'sv': '/sv',
      'ko': '/ko'
    }
  },
  it: {
    defaultTitle: 'Beswib - Trasferimento Petti | Compra e Vendi Pettorali di Gara',
    defaultDescription: 'Trasferisci i tuoi pettorali di gara in sicurezza con Beswib. Compra e vendi pettorali per running, trail, triathlon e ciclismo.',
    keywords: 'pettorali, corsa, trail running, triathlon, ciclismo, trasferimento pettorale, comprare pettorale, vendere pettorale, maratona, ultra trail',
    locale: 'it_IT',
    alternateLanguages: {
      'en': '/en',
      'fr': '/fr',
      'de': '/de',
      'es': '/es',
      'pt': '/pt',
      'nl': '/nl',
      'pl': '/pl',
      'sv': '/sv',
      'ko': '/ko'
    }
  },
  pt: {
    defaultTitle: 'Beswib - Transferência de Peitos | Comprar e Vender Peitos de Corrida',
    defaultDescription: 'Transfira seus peitos de corrida com segurança com Beswib. Compre e venda peitos para running, trail, triatlo e ciclismo.',
    keywords: 'peitos, corrida, trail running, triatlo, ciclismo, transferência peito, comprar peito, vender peito, maratona, ultra trail',
    locale: 'pt_PT',
    alternateLanguages: {
      'en': '/en',
      'fr': '/fr',
      'de': '/de',
      'es': '/es',
      'it': '/it',
      'nl': '/nl',
      'pl': '/pl',
      'sv': '/sv',
      'ko': '/ko'
    }
  },
  nl: {
    defaultTitle: 'Beswib - Startnummer Overdracht | Koop en Verkoop Hardloop-, Trail- en Triatlon Startnummers',
    defaultDescription: 'Draag je startnummers veilig over met Beswib. Koop en verkoop startnummers voor hardlopen, trail, triatlon en wielrennen.',
    keywords: 'startnummers, hardlopen, trail running, triatlon, wielrennen, startnummer overdracht, startnummer kopen, startnummer verkopen, marathon, ultra trail',
    locale: 'nl_NL',
    alternateLanguages: {
      'en': '/en',
      'fr': '/fr',
      'de': '/de',
      'es': '/es',
      'it': '/it',
      'pt': '/pt',
      'pl': '/pl',
      'sv': '/sv',
      'ko': '/ko'
    }
  },
  pl: {
    defaultTitle: 'Beswib - Transfer Numerów Startowych | Kupuj i Sprzedawaj Numery Biegowe, Trail i Triathlon',
    defaultDescription: 'Bezpiecznie przekaż swoje numery startowe z Beswib. Kupuj i sprzedawaj numery do biegania, trail, triathlonu i kolarstwa.',
    keywords: 'numery startowe, bieganie, trail running, triathlon, kolarstwo, transfer numeru, kup numer, sprzedaj numer, maraton, ultra trail',
    locale: 'pl_PL',
    alternateLanguages: {
      'en': '/en',
      'fr': '/fr',
      'de': '/de',
      'es': '/es',
      'it': '/it',
      'pt': '/pt',
      'nl': '/nl',
      'sv': '/sv',
      'ko': '/ko'
    }
  },
  sv: {
    defaultTitle: 'Beswib - Startnummer Överföring | Köp och Sälj Löp-, Trail- och Triathlon Startnummer',
    defaultDescription: 'Överför dina startnummer säkert med Beswib. Köp och sälj startnummer för löpning, trail, triathlon och cykling.',
    keywords: 'startnummer, löpning, trail running, triathlon, cykling, startnummer överföring, köp startnummer, sälj startnummer, maraton, ultra trail',
    locale: 'sv_SE',
    alternateLanguages: {
      'en': '/en',
      'fr': '/fr',
      'de': '/de',
      'es': '/es',
      'it': '/it',
      'pt': '/pt',
      'nl': '/nl',
      'pl': '/pl',
      'ko': '/ko'
    }
  },
  ko: {
    defaultTitle: 'Beswib - 경주 번호 이전 | 러닝, 트레일, 트라이애슬론 번호 구매 및 판매',
    defaultDescription: 'Beswib으로 경주 번호를 안전하게 이전하세요. 러닝, 트레일, 트라이애슬론, 사이클링 경주 번호를 구매하고 판매하세요.',
    keywords: '경주 번호, 러닝, 트레일 러닝, 트라이애슬론, 사이클링, 번호 이전, 번호 구매, 번호 판매, 마라톤, 울트라 트레일',
    locale: 'ko_KR',
    alternateLanguages: {
      'en': '/en',
      'fr': '/fr',
      'de': '/de',
      'es': '/es',
      'it': '/it',
      'pt': '/pt',
      'nl': '/nl',
      'pl': '/pl',
      'sv': '/sv'
    }
  }
}

// Métadonnées de base pour toutes les pages
export function getBaseMetadata(locale: Locale): Metadata {
  const config = seoConfig[locale]
  
  return {
    metadataBase: new URL('https://beswib.com'),
    title: {
      default: config.defaultTitle,
      template: '%s | Beswib'
    },
    description: config.defaultDescription,
    keywords: config.keywords,
    authors: [{ name: 'Beswib Team' }],
    creator: 'Beswib',
    publisher: 'Beswib',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: config.locale,
      alternateLocale: Object.keys(config.alternateLanguages).map(lang => seoConfig[lang as Locale].locale),
      siteName: 'Beswib',
      title: config.defaultTitle,
      description: config.defaultDescription,
      url: `https://beswib.com/${locale}`,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Beswib - Transfer Race Bibs',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.defaultTitle,
      description: config.defaultDescription,
      images: ['/og-image.jpg'],
      creator: '@beswib',
      site: '@beswib',
    },
    alternates: {
      canonical: `https://beswib.com/${locale}`,
      languages: config.alternateLanguages,
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
    category: 'Sports & Recreation',
    classification: 'Race Bib Marketplace',
    referrer: 'origin-when-cross-origin',
    colorScheme: 'light dark',
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
  }
}

// Métadonnées spécifiques pour les pages d'événements
export function getEventMetadata(locale: Locale, event: any): Metadata {
  const baseMetadata = getBaseMetadata(locale)
  const config = seoConfig[locale]
  
  const eventTitle = `${event.name} | ${config.defaultTitle.split(' - ')[1]}`
  const eventDescription = event.description || `${event.name} - ${config.defaultDescription}`
  
  return {
    ...baseMetadata,
    title: eventTitle,
    description: eventDescription,
    openGraph: {
      ...baseMetadata.openGraph,
      title: eventTitle,
      description: eventDescription,
      type: 'event',
      url: `https://beswib.com/${locale}/events/${event.id}`,
      images: [
        {
          url: event.imageUrl || '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title: eventTitle,
      description: eventDescription,
      images: [event.imageUrl || '/og-image.jpg'],
    },
    alternates: {
      canonical: `https://beswib.com/${locale}/events/${event.id}`,
      languages: config.alternateLanguages,
    },
    other: {
      'event:start_time': event.eventDate,
      'event:end_time': event.eventDate,
      'event:location': event.location,
      'event:type': 'sports_event',
    },
  }
}

// Métadonnées pour les pages de marketplace
export function getMarketplaceMetadata(locale: Locale): Metadata {
  const baseMetadata = getBaseMetadata(locale)
  const config = seoConfig[locale]
  
  const marketplaceTitle = `Marketplace - ${config.defaultTitle}`
  const marketplaceDescription = `Découvrez notre marketplace de dossards de course. ${config.defaultDescription}`
  
  return {
    ...baseMetadata,
    title: marketplaceTitle,
    description: marketplaceDescription,
    openGraph: {
      ...baseMetadata.openGraph,
      title: marketplaceTitle,
      description: marketplaceDescription,
      url: `https://beswib.com/${locale}/marketplace`,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: marketplaceTitle,
      description: marketplaceDescription,
    },
    alternates: {
      canonical: `https://beswib.com/${locale}/marketplace`,
      languages: config.alternateLanguages,
    },
  }
}