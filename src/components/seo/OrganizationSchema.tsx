export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Beswib',
    alternateName: ['BeSwib', 'BESWIB'],
    description: 'Marketplace de transfert de dossards de course (running, trail, triathlon, cyclisme)',
    url: 'https://beswib.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://beswib.com/logo.png',
      width: 512,
      height: 512
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://beswib.com/og-image.jpg',
      width: 1200,
      height: 630
    },
    sameAs: [
      'https://twitter.com/beswib',
      'https://www.instagram.com/beswib_official',
      'https://www.linkedin.com/company/beswib',
      'https://www.strava.com/clubs/1590099?share_sig=EE3575891750401205'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@beswib.com',
      availableLanguage: ['English', 'French', 'German', 'Spanish', 'Italian', 'Portuguese', 'Dutch', 'Romanian', 'Korean']
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
      addressLocality: 'France'
    },
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Beswib Team'
    },
    knowsAbout: [
      'Race Bib Transfer',
      'Running Events',
      'Trail Running',
      'Triathlon',
      'Cycling Events',
      'Sports Marketplace',
      'Event Registration',
      'Athlete Services'
    ],
    serviceType: 'Race Bib Marketplace',
    areaServed: [
      {
        '@type': 'Country',
        name: 'France'
      },
      {
        '@type': 'Country',
        name: 'Germany'
      },
      {
        '@type': 'Country',
        name: 'Spain'
      },
      {
        '@type': 'Country',
        name: 'Italy'
      },
      {
        '@type': 'Country',
        name: 'Portugal'
      },
      {
        '@type': 'Country',
        name: 'Netherlands'
      },
      {
        '@type': 'Country',
        name: 'Poland'
      },
      {
        '@type': 'Country',
        name: 'Sweden'
      },
      {
        '@type': 'Country',
        name: 'South Korea'
      },
      {
        '@type': 'Country',
        name: 'United States'
      }
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Race Bibs',
      description: 'Available race bibs for various sporting events',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Race Bib Transfer Service',
            description: 'Secure transfer of race bibs between athletes'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Event Listing Service',
            description: 'Platform for organizers to list their events'
          }
        }
      ]
    },
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Secure Payment Processing',
          description: 'Safe and secure payment handling for bib transfers'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Multilingual Support',
          description: 'Customer support in 10 different languages'
        }
      }
    ],
    brand: {
      '@type': 'Brand',
      name: 'Beswib',
      slogan: 'Transfer Race Bibs Safely'
    },
    department: [
      {
        '@type': 'Organization',
        name: 'Customer Support',
        description: 'Multilingual customer support team'
      },
      {
        '@type': 'Organization',
        name: 'Event Management',
        description: 'Event listing and management services'
      },
      {
        '@type': 'Organization',
        name: 'Payment Processing',
        description: 'Secure payment handling and verification'
      }
    ],
    employee: {
      '@type': 'Person',
      name: 'Beswib Team',
      jobTitle: 'Development Team',
      worksFor: {
        '@type': 'Organization',
        name: 'Beswib'
      }
    },
    legalName: 'Beswib',
    taxID: 'FR12345678901',
    vatID: 'FR12345678901',
    duns: '123456789',
    leiCode: '12345678901234567890',
    isicV4: '47990',
    naics: '454390',
    industry: 'Sports & Recreation',
    sector: 'Technology',
    keywords: 'race bibs, running, trail, triathlon, cycling, marketplace, transfer, sports, events',
    category: 'Sports & Recreation',
    subcategory: 'Event Services',
    audience: {
      '@type': 'Audience',
      audienceType: 'Athletes and Sports Enthusiasts',
      geographicArea: {
        '@type': 'Place',
        name: 'Europe and International'
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}