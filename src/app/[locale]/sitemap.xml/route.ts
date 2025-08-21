import { generateLocaleSitemap } from '@/lib/seo/sitemap-generator'
import { Locale } from '@/lib/i18n/config'

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ locale: Locale }> }
) {
	const { locale } = await params

	try {
		const sitemap = await generateLocaleSitemap(locale)

		// Générer le XML du sitemap
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified?.toISOString() || new Date().toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency || 'weekly'}</changefreq>
    <priority>${entry.priority || 0.5}</priority>
  </url>`).join('\n')}
</urlset>`

		return new Response(xml, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, sitemap, max-age=3600'
			}
		})
	} catch (error) {
		console.error('Erreur lors de la génération du sitemap:', error)

		// Retourner un sitemap minimal en cas d'erreur
		const minimalXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://beswib.com${locale === 'en' ? '' : `/${locale}`}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

		return new Response(minimalXml, {
			status: 500,
			headers: {
				'Content-Type': 'application/xml'
			}
		})
	}
}