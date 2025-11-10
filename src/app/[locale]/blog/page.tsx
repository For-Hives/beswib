import type { Metadata } from 'next'

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

	// Fetch articles for the current locale with expanded relations (image, seo)
	const articles = await fetchArticlesByLocale(locale, true)

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
