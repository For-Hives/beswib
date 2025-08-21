// Configuration pour Google Analytics 4
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

// Configuration pour Google Search Console
export const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || 'your-google-verification-code'

// Configuration pour Bing Webmaster Tools
export const BING_SITE_VERIFICATION = process.env.BING_SITE_VERIFICATION || 'your-bing-verification-code'

// Configuration pour les réseaux sociaux
export const SOCIAL_CONFIG = {
  instagram: {
    username: 'beswib_official',
    url: 'https://www.instagram.com/beswib_official'
  },
  linkedin: {
    companyId: process.env.LINKEDIN_COMPANY_ID || 'your-linkedin-company-id',
    url: 'https://www.linkedin.com/company/beswib'
  },
  strava: {
    clubId: '1590099',
    url: 'https://www.strava.com/clubs/1590099?share_sig=EE3575891750401205'
  }
}

// Configuration pour les outils d'analyse tiers
export const ANALYTICS_CONFIG = {
  // Configuration pour les outils d'analyse tiers (si nécessaire)
}

// Configuration pour les outils de monitoring
export const MONITORING_CONFIG = {
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'your-sentry-dsn'
  }
}

// Configuration pour les outils de conversion
export const CONVERSION_CONFIG = {
  googleAds: {
    conversionId: process.env.GOOGLE_ADS_CONVERSION_ID || 'your-google-ads-conversion-id',
    conversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL || 'your-google-ads-conversion-label'
  }
}

// Configuration pour les outils de chat/assistance
export const SUPPORT_CONFIG = {
  // Configuration pour les outils de chat/assistance (si nécessaire)
}

// Configuration pour les outils de feedback
export const FEEDBACK_CONFIG = {
  // Configuration pour les outils de feedback (si nécessaire)
}

// Configuration pour les outils de SEO
export const SEO_CONFIG = {
  // Configuration pour les outils de SEO tiers (si nécessaire)
}

// Configuration pour les outils de performance
export const PERFORMANCE_CONFIG = {
  // Configuration pour les outils de performance (si nécessaire)
}

// Configuration pour les outils de sécurité
export const SECURITY_CONFIG = {
  cloudflare: {
    zoneId: process.env.CLOUDFLARE_ZONE_ID || 'your-cloudflare-zone-id',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || 'your-cloudflare-api-token'
  },
  sentry: {
    org: process.env.SENTRY_ORG || 'your-sentry-org',
    project: process.env.SENTRY_PROJECT || 'your-sentry-project'
  }
}

// Configuration pour les outils de déploiement
export const DEPLOYMENT_CONFIG = {
  // Configuration pour les outils de déploiement (si nécessaire)
}

// Configuration pour les outils de test
export const TESTING_CONFIG = {
  // Configuration pour les outils de test (si nécessaire)
}

// Configuration pour les outils de monitoring des erreurs
export const ERROR_MONITORING_CONFIG = {
  // Configuration pour les outils de monitoring des erreurs (si nécessaire)
}

// Configuration pour les outils de monitoring des performances
export const PERFORMANCE_MONITORING_CONFIG = {
  // Configuration pour les outils de monitoring des performances (si nécessaire)
}