'use client'

import { Book, Calendar, Clock, Share2 } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface ArticleSidebarProps {
	createdAt: string
	locale: string
	readTime: number
	title: string
	translations: {
		article: string
		publishedOn: string
		readTime: string
		shareArticle: string
	}
}

export function ArticleSidebar({ createdAt, locale, readTime, title, translations }: ArticleSidebarProps) {
	const pathname = usePathname()
	const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

	const formattedDate = new Date(createdAt).toLocaleDateString(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	const shareLinks = [
		{
			name: 'Twitter',
			icon: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/twitter-icon.svg',
			url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`,
		},
		{
			name: 'LinkedIn',
			icon: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/linkedin-icon.svg',
			url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
		},
		{
			name: 'Facebook',
			icon: 'https://cdn.simpleicons.org/facebook',
			url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
		},
	]

	const handleCopyLink = () => {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(currentUrl)
		}
	}

	return (
		<aside className="flex flex-col gap-6">
			{/* Article Info Card */}
			<div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
				<div className="border-border bg-muted/50 border-b px-5 py-4">
					<h3 className="flex items-center text-sm font-semibold">
						<Book className="text-muted-foreground mr-2.5 size-3.5" />
						{translations.article}
					</h3>
				</div>
				<div className="p-5">
					<div className="text-foreground space-y-4 text-lg font-semibold leading-snug">
						<p>{title}</p>
					</div>
				</div>
			</div>

			{/* Metadata Card */}
			<div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
				<div className="border-border bg-muted/50 border-b px-5 py-4">
					<h3 className="flex items-center text-sm font-semibold">
						<Calendar className="text-muted-foreground mr-2.5 size-3.5" />
						{translations.publishedOn}
					</h3>
				</div>
				<div className="p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Calendar className="text-muted-foreground size-4" />
							<p className="text-muted-foreground text-sm">{formattedDate}</p>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="text-muted-foreground size-4" />
							<p className="text-muted-foreground text-sm">
								{readTime} {translations.readTime}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Share Card */}
			<div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
				<div className="border-border bg-muted/50 border-b px-5 py-4">
					<h3 className="flex items-center text-sm font-semibold">
						<Share2 className="text-muted-foreground mr-2.5 size-3.5" />
						{translations.shareArticle}
					</h3>
				</div>
				<div className="p-5">
					<div className="space-y-4">
						<ul className="flex items-center gap-2">
							{shareLinks.map(link => (
								<li key={link.name}>
									<a
										aria-label={`Share on ${link.name}`}
										className="border-border bg-muted/50 hover:bg-muted flex size-10 items-center justify-center rounded-full border transition-colors"
										href={link.url}
										rel="noopener noreferrer"
										target="_blank"
									>
										<img alt={link.name} className="size-5" src={link.icon} />
									</a>
								</li>
							))}
						</ul>
						<Button className="w-full" size="sm" variant="outline" onClick={handleCopyLink}>
							Copy Link
						</Button>
					</div>
				</div>
			</div>
		</aside>
	)
}
