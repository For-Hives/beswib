'use client'

import { Book, Calendar, Check, Clock, Copy, Facebook, Instagram, Linkedin, Share2, Twitter } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { SOCIALS } from '@/lib/utils/social'

interface ArticleSidebarProps {
	createdAt: string
	locale: string
	readTime: number
	title: string
	translations: {
		article: string
		copied: string
		copyLink: string
		publishedOn: string
		readTime: string
		shareArticle: string
	}
}

export function ArticleSidebar({ createdAt, locale, readTime, title, translations }: ArticleSidebarProps) {
	const [isCopied, setIsCopied] = useState(false)
	const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

	const formattedDate = new Date(createdAt).toLocaleDateString(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	const shareLinks = [
		{
			name: 'Twitter',
			icon: Twitter,
			url: `https://x.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`,
		},
		{
			name: 'LinkedIn',
			icon: Linkedin,
			url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
		},
		{
			name: 'Instagram',
			icon: Instagram,
			url: SOCIALS.instagram,
		},
		{
			name: 'Facebook',
			icon: Facebook,
			url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
		},
	]

	const handleCopyLink = async () => {
		if (navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(currentUrl)
				setIsCopied(true)
				toast.success('Link copied to clipboard!')
				setTimeout(() => setIsCopied(false), 2000)
			} catch (error) {
				toast.error('Failed to copy link')
			}
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
							{shareLinks.map(link => {
								const IconComponent = link.icon
								return (
									<li key={link.name}>
										<a
											aria-label={`Share on ${link.name}`}
											className="border-border bg-muted/50 hover:bg-muted flex size-10 items-center justify-center rounded-full border transition-colors"
											href={link.url}
											rel="noopener noreferrer"
											target="_blank"
										>
											<IconComponent className="size-5" />
										</a>
									</li>
								)
							})}
						</ul>
						<Button
							className="w-full"
							disabled={isCopied}
							size="sm"
							variant={isCopied ? 'default' : 'outline'}
							onClick={handleCopyLink}
						>
							{isCopied ? (
								<>
									<Check className="mr-2 size-4" />
									{translations.copied}
								</>
							) : (
								<>
									<Copy className="mr-2 size-4" />
									{translations.copyLink}
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</aside>
	)
}
