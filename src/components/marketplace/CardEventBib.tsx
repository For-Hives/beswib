'use client'

import { Eye } from 'lucide-react'

import Link from 'next/link'

import type { Locale } from '@/lib/i18n/config'
import type { Bib } from '@/models/bib.model'

import eventTranslations from '@/app/[locale]/events/[id]/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'

interface CardEventBibProps {
	bib: Bib
	locale: Locale
}

export default function CardEventBib({ locale, bib }: Readonly<CardEventBibProps>) {
	const t = getTranslations(locale, eventTranslations)

	// Calculate the lowest reference price between original and official
	const originalPrice = bib.originalPrice ?? 0

	// Calculate discount percentage if there's an original price
	const discountPercentage =
		originalPrice > 0 && originalPrice > bib.price ? Math.round(((originalPrice - bib.price) / originalPrice) * 100) : 0

	return (
		<div className="h-full w-full">
			<div className="bg-card/80 border-border hover:border-foreground/35 relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md transition-all duration-300">
				<div
					className={cn(
						'absolute inset-0 -z-20 opacity-50',
						'[background-size:20px_20px]',
						'[background-image:radial-gradient(var(--border)_1px,transparent_1px)]',
						'dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]'
					)}
				/>
				<div className="bg-background pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-25 dark:bg-black"></div>

				{/* Header with event image placeholder */}
				<div className="relative flex justify-center px-4 pt-4">
					<div className="from-primary/20 via-accent/20 to-secondary/20 before:from-primary before:via-accent before:via-secondary before:to-ring relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br shadow-[inset_0_0_20px_hsl(var(--primary)/0.3),inset_0_0_40px_hsl(var(--accent)/0.2),0_0_30px_hsl(var(--primary)/0.4)] before:absolute before:inset-0 before:-z-10 before:m-[-1px] before:rounded-xl before:bg-gradient-to-br before:p-0.5">
						{/* Placeholder for event image - you can add actual event image here */}
						<div className="absolute inset-0 z-10 opacity-10">
							<div className="h-full w-full animate-pulse bg-[linear-gradient(90deg,hsl(var(--foreground)/0.3)_1px,transparent_1px),linear-gradient(hsl(var(--foreground)/0.3)_1px,transparent_1px)] bg-[length:15px_15px]" />
						</div>

						{/* Discount badge if applicable */}
						{discountPercentage > 10 && (
							<div className="absolute top-0 right-0 z-20 m-2 flex justify-center">
								<span className="mb-2 rounded-full border border-red-500/50 bg-red-500/15 px-3 py-1 text-xs font-medium text-white/90 shadow-md shadow-red-500/20 backdrop-blur-md">
									-{discountPercentage}%
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Seller info */}
				<div className="flex w-full items-center justify-center py-2">
					<div className="flex w-full items-center justify-center">
						<p className="text-muted-foreground text-xs leading-relaxed italic">
							{t.event.bibs.soldBy} {bib.sellerUserId ?? 'Anonymous'}
						</p>
					</div>
				</div>

				<div className="via-border h-px w-full bg-gradient-to-r from-transparent to-transparent" />

				{/* Content */}
				<div className="flex flex-1 flex-col gap-2 px-4 py-2">
					{/* Price section */}
					<div className="flex w-full justify-between gap-2">
						<h3 className="text-foreground text-lg font-bold">{t.event.bibs.availableBib}</h3>
						<div className="relative flex flex-col items-center gap-2">
							<p className="text-foreground text-2xl font-bold">{bib.price}€</p>
							{originalPrice > 0 && originalPrice > bib.price && (
								<p className="absolute top-8 right-0 text-sm italic line-through">{originalPrice}€</p>
							)}
						</div>
					</div>

					{/* Bib details */}
					{bib.optionValues.size && (
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-xs">{t.event.bibs.size}:</span>
							<p className="text-foreground text-xs font-medium">{bib.optionValues.size}</p>
						</div>
					)}
					{bib.optionValues.gender && (
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-xs">{t.event.bibs.gender}:</span>
							<p className="text-foreground text-xs font-medium">{bib.optionValues.gender}</p>
						</div>
					)}

					{/* Action button */}
					<div className="flex h-full items-end justify-center py-2">
						<Link
							className="border-border bg-accent/20 text-accent-foreground hover:bg-accent/30 hover:text-foreground flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition"
							href={`/marketplace/${bib.id}`}
						>
							<Eye className="h-5 w-5" />
							{t.event.bibs.viewListing}
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
