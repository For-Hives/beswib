import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'

import { BlogSection } from '@/components/blog/BlogSection'
import blogTranslations from '@/components/blog/locales.json'
import globalTranslations from '@/components/global/locales.json'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { generateSimplePageMetadata } from '@/lib/seo/metadata-generators'
import { fetchArticlesByLocale } from '@/services/article.services'

export default async function BlogPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params
	const blogT = getTranslations(locale, blogTranslations)

	// Cache articles with tags for granular revalidation
	// Tags allow us to invalidate specific parts of the cache when articles are created/updated/deleted
	const articles = await unstable_cache(
		async () => {
			const allArticles = await fetchArticlesByLocale(locale, true)
			// Filter out draft articles for public blog page
			return allArticles.filter(article => !article.isDraft)
		},
		['blog-articles-by-locale', locale],
		{
			tags: ['blog-list', 'blog-articles'],
			revalidate: 3600, // Fallback: revalidate every hour
		}
	)()

	return <BlogSection articles={articles} locale={locale} translations={blogT.blog} />
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return generateSimplePageMetadata(locale, t.pages.blog.title, t.pages.blog.description, '/blog')
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Configure ISR: revalidate every 3600 seconds (1 hour)
// This allows for automatic cache refresh while still being efficient
export const revalidate = 3600
