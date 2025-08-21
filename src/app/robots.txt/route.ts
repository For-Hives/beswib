import { i18n } from '@/lib/i18n/config'

export async function GET() {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beswib.com'

	// Générer le robots.txt pour toutes les langues
	const robotsTxt = `# Beswib - Race Bib Transfer Platform
# Robots.txt generated for multilingual SEO
# Generated on: ${new Date().toISOString()}

User-agent: *
Allow: /

# Sitemaps pour toutes les langues
${i18n.locales.map(locale => {
	const sitemapUrl = locale === 'en'
		? `${baseUrl}/sitemap.xml`
		: `${baseUrl}/${locale}/sitemap.xml`
	return `Sitemap: ${sitemapUrl}`
}).join('\n')}

# Crawl-delay pour éviter la surcharge
Crawl-delay: 1

# Pages à indexer en priorité
Allow: /events/
Allow: /marketplace/
Allow: /faq
Allow: /contact
Allow: /legals/

# Pages administratives à ne pas indexer
Disallow: /admin/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /auth/
Disallow: /api/

# Fichiers temporaires et de développement
Disallow: /_next/
Disallow: /static/
Disallow: *.json
Disallow: *.js.map

# Paramètres d'URL à ignorer
Disallow: *?print=1
Disallow: *?utm_*
Disallow: *&utm_*
Disallow: *?source=*
Disallow: *&source=*
Disallow: *?ref=*
Disallow: *&ref=*

# Spécifique à Googlebot
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Spécifique à Bingbot
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Spécifique à Yandex
User-agent: Yandex
Allow: /
Crawl-delay: 1

# Spécifique aux réseaux sociaux
User-agent: Twitterbot
Allow: /
User-agent: facebookexternalhit
Allow: /
User-agent: LinkedInBot
Allow: /`

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400' // Cache 24h
		}
	})
}