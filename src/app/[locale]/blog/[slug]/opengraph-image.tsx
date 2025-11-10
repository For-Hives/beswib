import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { headers } from 'next/headers'
import { ImageResponse } from 'next/og'
import OGImage from '@/components/OG/ogImage.component'
import OGImageArticle from '@/components/OG/ogImageArticle.component'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { fetchArticleBySlug } from '@/services/article.services'

import articleTranslations from './locales.json'

// Alt text for the Open Graph image
export const alt = 'Beswib Blog Article'
// Image size for Open Graph
export const size = { width: 1200, height: 630 }
// Content type for the image
export const contentType = 'image/png'

// Generate static params for all locales 🌍
export function generateStaticParams() {
	return generateLocaleParams()
}

interface ArticleOpenGraphParams extends LocaleParams {
	slug: string
}

// Default export: async function to generate the Open Graph image
export default async function Image({ params }: { params: Promise<ArticleOpenGraphParams> }) {
	// Retrieve the dynamic locale and slug from params
	const { locale, slug } = await params

	// Get the translations for the current page and locale
	const t = getTranslations(locale, articleTranslations)

	// Try to fetch the article details
	let article = null
	let title = t.titleOG ?? 'Read on Beswib'
	let secondary = t.descriptionOG ?? 'Discover expert **insights** and **tips** from the running community'
	let readTime = 5

	try {
		// Fetch article with expanded relations (image)
		article = await fetchArticleBySlug(slug, true)

		// If we successfully got article data and it matches locale and is not a draft
		if (article && article.locale === locale && !article.isDraft) {
			// Use article title
			title = article.title

			// Use article extract or description
			secondary = article.extract || article.description || secondary

			// Calculate read time (rough estimate: 200 words per minute)
			const wordCount = article.content ? article.content.split(/\s+/).length : 0
			readTime = Math.max(1, Math.ceil(wordCount / 200))
		} else {
			// Article not found or doesn't match criteria
			article = null
		}
	} catch (error) {
		console.warn('Error fetching article data for OpenGraph:', error)
		// Fallback to generic blog content
	}

	// Build the absolute URL (useful for Satori)
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

	// Load custom fonts for @vercel/og with error handling
	try {
		const bowlbyFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/BowlbyOneSC-Regular.ttf'))
		const geistFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/Geist-Regular.ttf'))

		// Return the Open Graph image with custom fonts
		return new ImageResponse(
			<OGImageArticle
				title={title}
				secondary={secondary}
				size={size}
				article={article ?? undefined}
				locale={locale}
				readTime={readTime}
			/>,
			{
				...size,
				fonts: [
					{
						weight: 400,
						style: 'normal',
						name: 'BowlbyOneSC',
						data: bowlbyFont,
					},
					{
						weight: 400,
						style: 'normal',
						name: 'Geist',
						data: geistFont,
					},
				],
			}
		)
	} catch (error) {
		// Log error if font loading fails
		console.error('Error loading fonts:', error)
		// Fallback: return the generic image without custom fonts
		return new ImageResponse(
			<OGImage title={title} secondary={secondary} host={host} protocol={protocol} size={size} />,
			size
		)
	}
}
