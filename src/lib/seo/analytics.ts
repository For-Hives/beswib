// Configuration pour Google Analytics 4
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

// Configuration pour Google Search Console
export const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || 'your-google-verification-code'

// Configuration pour Bing Webmaster Tools
export const BING_SITE_VERIFICATION = process.env.BING_SITE_VERIFICATION || 'your-bing-verification-code'

// Configuration pour Yandex Webmaster
export const YANDEX_SITE_VERIFICATION = process.env.YANDEX_SITE_VERIFICATION || 'your-yandex-verification-code'

// Configuration pour Baidu Webmaster
export const BAIDU_SITE_VERIFICATION = process.env.BAIDU_SITE_VERIFICATION || 'your-baidu-verification-code'

// Configuration pour les réseaux sociaux
export const SOCIAL_CONFIG = {
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
    pageId: process.env.FACEBOOK_PAGE_ID || 'your-facebook-page-id'
  },
  twitter: {
    handle: '@beswib',
    site: '@beswib'
  },
  linkedin: {
    companyId: process.env.LINKEDIN_COMPANY_ID || 'your-linkedin-company-id'
  },
  instagram: {
    username: 'beswib'
  }
}

// Configuration pour les outils d'analyse tiers
export const ANALYTICS_CONFIG = {
  hotjar: {
    id: process.env.HOTJAR_ID || 'your-hotjar-id'
  },
  mixpanel: {
    token: process.env.MIXPANEL_TOKEN || 'your-mixpanel-token'
  },
  amplitude: {
    apiKey: process.env.AMPLITUDE_API_KEY || 'your-amplitude-api-key'
  },
  fullstory: {
    orgId: process.env.FULLSTORY_ORG_ID || 'your-fullstory-org-id'
  }
}

// Configuration pour les outils de monitoring
export const MONITORING_CONFIG = {
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'your-sentry-dsn'
  },
  logrocket: {
    appId: process.env.LOGROCKET_APP_ID || 'your-logrocket-app-id'
  }
}

// Configuration pour les outils de conversion
export const CONVERSION_CONFIG = {
  googleAds: {
    conversionId: process.env.GOOGLE_ADS_CONVERSION_ID || 'your-google-ads-conversion-id',
    conversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL || 'your-google-ads-conversion-label'
  },
  facebookPixel: {
    id: process.env.FACEBOOK_PIXEL_ID || 'your-facebook-pixel-id'
  },
  tiktokPixel: {
    id: process.env.TIKTOK_PIXEL_ID || 'your-tiktok-pixel-id'
  }
}

// Configuration pour les outils de chat/assistance
export const SUPPORT_CONFIG = {
  intercom: {
    appId: process.env.INTERCOM_APP_ID || 'your-intercom-app-id'
  },
  zendesk: {
    key: process.env.ZENDESK_KEY || 'your-zendesk-key'
  },
  crisp: {
    websiteId: process.env.CRISP_WEBSITE_ID || 'your-crisp-website-id'
  }
}

// Configuration pour les outils de feedback
export const FEEDBACK_CONFIG = {
  typeform: {
    formId: process.env.TYPEFORM_FORM_ID || 'your-typeform-form-id'
  },
  hotjar: {
    feedbackId: process.env.HOTJAR_FEEDBACK_ID || 'your-hotjar-feedback-id'
  }
}

// Configuration pour les outils de SEO
export const SEO_CONFIG = {
  ahrefs: {
    apiKey: process.env.AHREFS_API_KEY || 'your-ahrefs-api-key'
  },
  semrush: {
    apiKey: process.env.SEMRUSH_API_KEY || 'your-semrush-api-key'
  },
  moz: {
    accessId: process.env.MOZ_ACCESS_ID || 'your-moz-access-id',
    secretKey: process.env.MOZ_SECRET_KEY || 'your-moz-secret-key'
  }
}

// Configuration pour les outils de performance
export const PERFORMANCE_CONFIG = {
  webpagetest: {
    apiKey: process.env.WEBPAGETEST_API_KEY || 'your-webpagetest-api-key'
  },
  lighthouse: {
    apiKey: process.env.LIGHTHOUSE_API_KEY || 'your-lighthouse-api-key'
  }
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
  vercel: {
    analyticsId: process.env.VERCEL_ANALYTICS_ID || 'your-vercel-analytics-id'
  },
  netlify: {
    analyticsId: process.env.NETLIFY_ANALYTICS_ID || 'your-netlify-analytics-id'
  }
}

// Configuration pour les outils de test
export const TESTING_CONFIG = {
  browserstack: {
    username: process.env.BROWSERSTACK_USERNAME || 'your-browserstack-username',
    accessKey: process.env.BROWSERSTACK_ACCESS_KEY || 'your-browserstack-access-key'
  },
  saucelabs: {
    username: process.env.SAUCELABS_USERNAME || 'your-saucelabs-username',
    accessKey: process.env.SAUCELABS_ACCESS_KEY || 'your-saucelabs-access-key'
  }
}

// Configuration pour les outils de monitoring des erreurs
export const ERROR_MONITORING_CONFIG = {
  rollbar: {
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN || 'your-rollbar-access-token',
    environment: process.env.NODE_ENV || 'development'
  },
  bugsnag: {
    apiKey: process.env.BUGSNAG_API_KEY || 'your-bugsnag-api-key'
  }
}

// Configuration pour les outils de monitoring des performances
export const PERFORMANCE_MONITORING_CONFIG = {
  newrelic: {
    licenseKey: process.env.NEWRELIC_LICENSE_KEY || 'your-newrelic-license-key',
    applicationId: process.env.NEWRELIC_APPLICATION_ID || 'your-newrelic-application-id'
  },
  datadog: {
    clientToken: process.env.DATADOG_CLIENT_TOKEN || 'your-datadog-client-token',
    applicationId: process.env.DATADOG_APPLICATION_ID || 'your-datadog-application-id'
  }
}