import { i18n } from '@/lib/i18n/config'

export async function GET() {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beswib.com'

	// Générer l'index des sitemaps pour toutes les langues
	const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${i18n.locales.map(locale => {
	const sitemapUrl = locale === 'en'
		? `${baseUrl}/sitemap.xml`
		: `${baseUrl}/${locale}/sitemap.xml`

	return `  <sitemap>
    <loc>${sitemapUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
}).join('\n')}
</sitemapindex>`

	return new Response(sitemapIndex, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, sitemap, max-age=3600'
		}
	})
}