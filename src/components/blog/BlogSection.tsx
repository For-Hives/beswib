'use client'

import Link from 'next/link'

import { LazyImage } from '@/components/ui/lazy-image'
import { pb } from '@/lib/services/pocketbase'
import type { Article } from '@/models/article.model'
import type { ImageWithAlt } from '@/models/imageWithAlt.model'
import type { SEO } from '@/models/seo.model'

interface BlogSectionProps {
	articles: (Article & { expand?: { image?: ImageWithAlt; seo?: SEO } })[]
	locale: string
	translations: {
		by: string
		description: string
		noArticles: string
		noImage: string
		readTime: string
		title: string
	}
}

export function BlogSection({ articles, locale, translations }: BlogSectionProps) {
	return (
		<div className="relative mx-auto w-full max-w-7xl grow px-4 py-12">
			{/* Header */}
			<div className="space-y-2 pb-8">
				<h1 className="text-4xl font-bold tracking-wide">{translations.title}</h1>
				<p className="text-muted-foreground text-base">{translations.description}</p>
			</div>

			{/* Divider */}
			<div className="absolute inset-x-0 h-px w-full border-b border-dashed" />

			{/* Articles Grid */}
			{articles.length === 0 ? (
				<div className="text-muted-foreground flex min-h-[400px] items-center justify-center">
					<p>{translations.noArticles}</p>
				</div>
			) : (
				<div className="z-10 grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
					{articles.map(article => {
						const imageUrl = article.expand?.image?.image
							? pb.files.getUrl(article.expand.image, article.expand.image.image)
							: null

						const formattedDate = new Date(article.created).toLocaleDateString(locale, {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
						})

						// Calculate read time (rough estimate: 200 words per minute)
						const wordCount = article.content ? article.content.split(/\s+/).length : 0
						const readTime = Math.max(1, Math.ceil(wordCount / 200))

						return (
							<Link
								key={article.id}
								className="hover:bg-accent/60 active:bg-accent group flex flex-col gap-3 rounded-lg p-3 duration-75"
								href={`/${locale}/blog/${article.slug}`}
							>
								{imageUrl ? (
									<LazyImage
										alt={article.expand?.image?.alt ?? article.title}
										className="transition-all duration-500 group-hover:scale-105"
										inView={true}
										ratio={16 / 9}
										src={imageUrl}
									/>
								) : (
									<div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
										<p className="text-muted-foreground text-sm">{translations.noImage}</p>
									</div>
								)}

								<div className="space-y-2 px-2 pb-2">
									<div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
										<p>{formattedDate}</p>
										<div className="bg-muted-foreground size-1 rounded-full" />
										<p>
											{readTime} {translations.readTime}
										</p>
									</div>
									<h2 className="line-clamp-2 text-lg font-semibold leading-5 tracking-tight">{article.title}</h2>
									<p className="text-muted-foreground line-clamp-3 text-sm">{article.extract || article.description}</p>
								</div>
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
}
