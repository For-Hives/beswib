import { NextResponse } from 'next/server'

export function GET() {
	const baseUrl = 'https://beswib.com'

	const robotsTxt = `# Beswib - Robots.txt
# Race bib transfer service

# User-agent: *
User-agent: *
Allow: /

# Sitemaps for all locales
Sitemap: ${baseUrl}/sitemap.xml

# Sitemaps for all locales
Sitemap: ${baseUrl}/en/sitemap.xml
Sitemap: ${baseUrl}/fr/sitemap.xml
Sitemap: ${baseUrl}/de/sitemap.xml
Sitemap: ${baseUrl}/es/sitemap.xml
Sitemap: ${baseUrl}/it/sitemap.xml
Sitemap: ${baseUrl}/pt/sitemap.xml
Sitemap: ${baseUrl}/nl/sitemap.xml
Sitemap: ${baseUrl}/ro/sitemap.xml
Sitemap: ${baseUrl}/ko/sitemap.xml

# Important pages to index
Allow: /en/
Allow: /fr/
Allow: /de/
Allow: /es/
Allow: /it/
Allow: /pt/
Allow: /nl/
Allow: /ro/
Allow: /ko/

# Events pages
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

# FAQ and information pages
Allow: /en/faq/
Allow: /fr/faq/
Allow: /de/faq/
Allow: /es/faq/
Allow: /it/faq/
Allow: /pt/faq/
Allow: /nl/faq/
Allow: /ro/faq/
Allow: /ko/faq/

# Legal pages
Allow: /en/legals/
Allow: /fr/legals/
Allow: /de/legals/
Allow: /es/legals/
Allow: /it/legals/
Allow: /pt/legals/
Allow: /nl/legals/
Allow: /ro/legals/
Allow: /ko/legals/

# Contact pages
Allow: /en/contact/
Allow: /fr/contact/
Allow: /de/contact/
Allow: /es/contact/
Allow: /it/contact/
Allow: /pt/contact/
Allow: /nl/contact/
Allow: /ro/contact/
Allow: /ko/contact/

# Block sensitive pages
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /auth/
Disallow: /purchase/
Disallow: /error/
Disallow: /_next/
Disallow: /static/

# Block sensitive URL parameters
Disallow: /*?waitlist_error=*
Disallow: /*?waitlist_success=*
Disallow: /*?email=*
Disallow: /*?error=*
Disallow: /*?success=*

# Block development files
Disallow: /*.map
Disallow: /*.js.map
Disallow: /*.css.map

# Block cache files
Disallow: /_next/static/
Disallow: /_next/image/

# Block sensitive API endpoints
Disallow: /api/auth/
Disallow: /api/webhooks/
Disallow: /api/admin/

# Googlebot configuration
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Bingbot configuration
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# DuckDuckBot configuration
User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Yandex configuration
User-agent: Yandex
Allow: /
Crawl-delay: 1

# Baiduspider configuration
User-agent: Baiduspider
Allow: /
Crawl-delay: 2

# Social media bots configuration
User-agent: facebookexternalhit
Allow: /
Crawl-delay: 1

User-agent: Twitterbot
Allow: /
Crawl-delay: 1

User-agent: LinkedInBot
Allow: /
Crawl-delay: 1

# Analysis bots configuration
User-agent: AhrefsBot
Allow: /
Crawl-delay: 2

User-agent: SemrushBot
Allow: /
Crawl-delay: 2

User-agent: MJ12bot
Allow: /
Crawl-delay: 2

# Crawl delay
Crawl-delay: 1

# Other bots 
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /auth/
Disallow: /purchase/
Disallow: /error/
Disallow: /_next/
Disallow: /static/
Disallow: /*?waitlist_error=*
Disallow: /*?waitlist_success=*
Disallow: /*?email=*
Disallow: /*?error=*
Disallow: /*?success=*
Disallow: /*.map
Disallow: /*.js.map
Disallow: /*.css.map
Disallow: /_next/static/
Disallow: /_next/image/

# Site information
# Site: ${baseUrl}
# Contact: contact@beswib.com
# Description: Race bib transfer service (running, trail, triathlon, cycling)
# Languages: EN, FR, ES, IT, DE, RO, PT, NL, KO
`
	return new NextResponse(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400',
		},
	})
}
