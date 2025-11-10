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
		readTime: string
		title: string
	}
}

export function BlogSection({ articles, locale, translations }: BlogSectionProps) {
	return (
		<div className="relative mx-auto w-full max-w-7xl grow px-4 py-12">
			{/* Background decoration */}
			<div aria-hidden className="absolute inset-0 isolate -z-10 contain-strict opacity-60">
				<div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full" />
				<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -rotate-45 rounded-full [translate:5%_-50%]" />
				<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 rounded-full" />
			</div>

			{/* Header */}
			<div className="space-y-2 pb-8">
				<h1 className="font-mono text-4xl font-bold tracking-wide">{translations.title}</h1>
				<p className="text-muted-foreground text-base">{translations.description}</p>
			</div>

			{/* Divider */}
			<div className="absolute inset-x-0 h-px w-full border-b border-dashed" />

			{/* Articles Grid */}
			{articles.length === 0 ? (
				<div className="text-muted-foreground flex min-h-[400px] items-center justify-center">
					<p>No articles available yet.</p>
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
										<p className="text-muted-foreground text-sm">No image</p>
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
