import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = 'https://beswib.com'
  
  const robotsTxt = `# Beswib - Robots.txt
# Marketplace de transfert de dossards de course

# User-agent: *
User-agent: *
Allow: /

# Sitemaps pour toutes les langues
Sitemap: ${baseUrl}/sitemap.xml

# Sitemaps spécifiques par langue
Sitemap: ${baseUrl}/en/sitemap.xml
Sitemap: ${baseUrl}/fr/sitemap.xml
Sitemap: ${baseUrl}/de/sitemap.xml
Sitemap: ${baseUrl}/es/sitemap.xml
Sitemap: ${baseUrl}/it/sitemap.xml
Sitemap: ${baseUrl}/pt/sitemap.xml
Sitemap: ${baseUrl}/nl/sitemap.xml
Sitemap: ${baseUrl}/ro/sitemap.xml
Sitemap: ${baseUrl}/ko/sitemap.xml

# Pages importantes à indexer
Allow: /en/
Allow: /fr/
Allow: /de/
Allow: /es/
Allow: /it/
Allow: /pt/
Allow: /nl/
Allow: /ro/
Allow: /ko/

# Pages d'événements
Allow: /en/events/
Allow: /fr/events/
Allow: /de/events/
Allow: /es/events/
Allow: /it/events/
Allow: /pt/events/
Allow: /nl/events/
Allow: /ro/events/
Allow: /ko/events/

# Marketplace
Allow: /en/marketplace/
Allow: /fr/marketplace/
Allow: /de/marketplace/
Allow: /es/marketplace/
Allow: /it/marketplace/
Allow: /pt/marketplace/
Allow: /nl/marketplace/
Allow: /ro/marketplace/
Allow: /ko/marketplace/

# FAQ et pages d'information
Allow: /en/faq/
Allow: /fr/faq/
Allow: /de/faq/
Allow: /es/faq/
Allow: /it/faq/
Allow: /pt/faq/
Allow: /nl/faq/
Allow: /ro/faq/
Allow: /ko/faq/

# Pages légales
Allow: /en/legals/
Allow: /fr/legals/
Allow: /de/legals/
Allow: /es/legals/
Allow: /it/legals/
Allow: /pt/legals/
Allow: /nl/legals/
Allow: /ro/legals/
Allow: /ko/legals/

# Pages de contact
Allow: /en/contact/
Allow: /fr/contact/
Allow: /de/contact/
Allow: /es/contact/
Allow: /it/contact/
Allow: /pt/contact/
Allow: /nl/contact/
Allow: /ro/contact/
Allow: /ko/contact/

# Bloquer les pages sensibles
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /auth/
Disallow: /purchase/
Disallow: /error/
Disallow: /_next/
Disallow: /static/

# Bloquer les paramètres d'URL sensibles
Disallow: /*?waitlist_error=*
Disallow: /*?waitlist_success=*
Disallow: /*?email=*
Disallow: /*?error=*
Disallow: /*?success=*

# Bloquer les fichiers de développement
Disallow: /*.map
Disallow: /*.js.map
Disallow: /*.css.map

# Bloquer les fichiers de cache
Disallow: /_next/static/
Disallow: /_next/image/

# Bloquer les endpoints d'API sensibles
Disallow: /api/auth/
Disallow: /api/webhooks/
Disallow: /api/admin/

# Configuration pour Googlebot
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Configuration pour Bingbot
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Configuration pour DuckDuckBot
User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Configuration pour Yandex
User-agent: Yandex
Allow: /
Crawl-delay: 1

# Configuration pour Baiduspider
User-agent: Baiduspider
Allow: /
Crawl-delay: 2

# Configuration pour les bots de réseaux sociaux
User-agent: facebookexternalhit
Allow: /
Crawl-delay: 1

User-agent: Twitterbot
Allow: /
Crawl-delay: 1

User-agent: LinkedInBot
Allow: /
Crawl-delay: 1

# Configuration pour les bots d'analyse
User-agent: AhrefsBot
Allow: /
Crawl-delay: 2

User-agent: SemrushBot
Allow: /
Crawl-delay: 2

User-agent: MJ12bot
Allow: /
Crawl-delay: 2

# Bloquer les bots malveillants
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /auth/
Disallow: /purchase/
Disallow: /error/

# Paramètres de crawl
Crawl-delay: 1

# Informations sur le site
# Site: ${baseUrl}
# Contact: contact@beswib.com
# Description: Marketplace de transfert de dossards de course (running, trail, triathlon, cyclisme)
# Langues: EN, FR, DE, ES, IT, PT, NL, RO, KO
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}