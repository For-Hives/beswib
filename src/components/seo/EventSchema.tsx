import type { Event } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'

interface EventSchemaProps {
  event: Event
  organizer?: Organizer
  locale: string
}

export default function EventSchema({ event, organizer, locale }: EventSchemaProps) {
  const eventDate = new Date(event.eventDate)
  const isoDate = eventDate.toISOString()
  
  // Traductions des types de course
  const courseTypeTranslations = {
    en: {
      road: 'Road Running',
      trail: 'Trail Running',
      triathlon: 'Triathlon',
      cycle: 'Cycling'
    },
    fr: {
      road: 'Course sur Route',
      trail: 'Course en Trail',
      triathlon: 'Triathlon',
      cycle: 'Cyclisme'
    },
    de: {
      road: 'Straßenlauf',
      trail: 'Traillauf',
      triathlon: 'Triathlon',
      cycle: 'Radfahren'
    },
    es: {
      road: 'Carrera en Ruta',
      trail: 'Carrera en Trail',
      triathlon: 'Triatlón',
      cycle: 'Ciclismo'
    },
    it: {
      road: 'Corsa su Strada',
      trail: 'Corsa in Trail',
      triathlon: 'Triathlon',
      cycle: 'Ciclismo'
    },
    pt: {
      road: 'Corrida na Estrada',
      trail: 'Corrida em Trilha',
      triathlon: 'Triatlo',
      cycle: 'Ciclismo'
    },
    nl: {
      road: 'Weglopen',
      trail: 'Traillopen',
      triathlon: 'Triatlon',
      cycle: 'Wielrennen'
    },
    ro: {
      road: 'Alergare pe Șosea',
      trail: 'Alergare pe Trail',
      triathlon: 'Triatlon',
      cycle: 'Ciclism'
    },
    ko: {
      road: '도로 달리기',
      trail: '트레일 달리기',
      triathlon: '트라이애슬론',
      cycle: '사이클링'
    }
  }
  
  const courseType = courseTypeTranslations[locale as keyof typeof courseTypeTranslations]?.[event.typeCourse] || event.typeCourse
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.name,
    description: event.description,
    startDate: isoDate,
    endDate: isoDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.location
      }
    },
    organizer: organizer ? {
      '@type': 'Organization',
      name: organizer.name,
      url: organizer.website || undefined
    } : undefined,
    sport: courseType,
    category: 'Sports & Recreation',
    offers: {
      '@type': 'Offer',
      price: event.officialStandardPrice,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      validFrom: event.transferDeadline ? new Date(event.transferDeadline).toISOString() : undefined
    },
    performer: {
      '@type': 'SportsTeam',
      name: 'Participants'
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Athletes and Sports Enthusiasts'
    },
    inLanguage: locale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://beswib.com/${locale}/events/${event.id}`
    },
    potentialAction: {
      '@type': 'RegisterAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://beswib.com/${locale}/events/${event.id}`,
        inLanguage: locale,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform'
        ]
      },
      result: {
        '@type': 'EventReservation',
        reservationStatus: 'https://schema.org/Confirmed'
      }
    }
  }
  
  // Ajouter des propriétés conditionnelles
  if (event.distanceKm) {
    schema['distance'] = {
      '@type': 'QuantitativeValue',
      value: event.distanceKm,
      unitCode: 'KMT'
    }
  }
  
  if (event.elevationGainM) {
    schema['elevation'] = {
      '@type': 'QuantitativeValue',
      value: event.elevationGainM,
      unitCode: 'MTR'
    }
  }
  
  if (event.participants) {
    schema['maximumAttendeeCapacity'] = event.participants
  }
  
  if (event.parcoursUrl) {
    schema['courseMap'] = event.parcoursUrl
  }
  
  if (event.bibPickupLocation) {
    schema['location']['additionalProperty'] = {
      '@type': 'PropertyValue',
      name: 'Bib Pickup Location',
      value: event.bibPickupLocation
    }
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}