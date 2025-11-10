import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleSidebar } from '@/components/blog/ArticleSidebar'
import blogTranslations from '@/components/blog/locales.json'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { pb } from '@/lib/services/pocketbase'
import type { Article } from '@/models/article.model'
import type { ImageWithAlt } from '@/models/imageWithAlt.model'
import type { SEO } from '@/models/seo.model'
import { fetchArticleBySlug } from '@/services/article.services'

interface ArticlePageParams extends LocaleParams {
	slug: string
}

export default async function ArticlePage({ params }: { params: Promise<ArticlePageParams> }) {
	const { locale, slug } = await params
	const blogT = getTranslations(locale, blogTranslations)

	// Fetch article by slug with expanded relations
	const article = await fetchArticleBySlug(slug, true)

	// If article doesn't exist or isn't in the current locale, show 404
	if (!article || article.locale !== locale) {
		notFound()
	}

	// Breadcrumb navigation
	const breadcrumbItems: BreadcrumbItem[] = [
		{ href: `/${locale}`, label: blogT.breadcrumb.home },
		{ href: `/${locale}/blog`, label: blogT.breadcrumb.blog },
		{ label: article.title },
	]

	// Calculate read time (rough estimate: 200 words per minute)
	const wordCount = article.content ? article.content.split(/\s+/).length : 0
	const readTime = Math.max(1, Math.ceil(wordCount / 200))

	// Get image URL if available
	const imageUrl =
		article.expand?.image?.image ? pb.files.getUrl(article.expand.image, article.expand.image.image) : null

	return (
		<section className="py-12 md:py-16">
			<div className="container">
				{/* Breadcrumb */}
				<Breadcrumb className="mb-8" items={breadcrumbItems} />

				{/* Main content grid */}
				<div className="grid gap-12 md:grid-cols-12 md:gap-8">
					{/* Sidebar - Left on desktop, bottom on mobile */}
					<div className="order-last md:order-none md:col-span-4 lg:col-span-3">
						<ArticleSidebar
							createdAt={article.created}
							locale={locale}
							readTime={readTime}
							title={article.title}
							translations={blogT.sidebar}
						/>
					</div>

					{/* Article Content - Right on desktop, top on mobile */}
					<div className="md:col-span-8 md:col-start-5 lg:col-span-9 lg:col-start-4">
						<article className="prose prose-neutral dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h1:font-extrabold prose-h2:text-3xl prose-h3:text-2xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:italic prose-strong:font-semibold prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-muted prose-img:rounded-lg prose-img:shadow-lg">
							{/* Article Header */}
							<h1>{article.title}</h1>

							{/* Featured Image */}
							{imageUrl && (
								<img
									alt={article.expand?.image?.alt ?? article.title}
									className="w-full"
									src={imageUrl}
								/>
							)}

							{/* Article Extract/Description */}
							{article.extract && <p className="lead text-xl text-muted-foreground">{article.extract}</p>}

							{/* Article Content (HTML from rich text editor) */}
							<div dangerouslySetInnerHTML={{ __html: article.content }} />
						</article>
					</div>
				</div>
			</div>
		</section>
	)
}

export async function generateMetadata({ params }: { params: Promise<ArticlePageParams> }): Promise<Metadata> {
	const { locale, slug } = await params

	// Fetch article for metadata
	const article = await fetchArticleBySlug(slug, true)

	if (!article || article.locale !== locale) {
		return {
			title: 'Article Not Found',
		}
	}

	// Use SEO data if available, otherwise fallback to article data
	const title = article.expand?.seo?.title || article.title
	const description = article.expand?.seo?.description || article.description || article.extract

	// Get image URL for OpenGraph
	const imageUrl =
		article.expand?.image?.image ? pb.files.getUrl(article.expand.image, article.expand.image.image) : null

	return {
		title: `${title} | Beswib`,
		description,
		openGraph: {
			title,
			description,
			type: 'article',
			publishedTime: article.created,
			modifiedTime: article.updated,
			locale,
			...(imageUrl && {
				images: [
					{
						url: imageUrl,
						alt: article.expand?.image?.alt || article.title,
					},
				],
			}),
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			...(imageUrl && {
				images: [imageUrl],
			}),
		},
	}
}

// Generate static params for all articles
export async function generateStaticParams(): Promise<ArticlePageParams[]> {
	const locales = generateLocaleParams()
	const allParams: ArticlePageParams[] = []

	// Import article service to get all articles
	const { getAllArticles } = await import('@/services/article.services')
	const articles = await getAllArticles(false)

	// Generate params for each article in each locale
	for (const locale of locales) {
		const localeArticles = articles.filter((article: Article) => article.locale === locale.locale)

		for (const article of localeArticles) {
			allParams.push({
				locale: locale.locale,
				slug: article.slug,
			})
		}
	}

	return allParams
}
