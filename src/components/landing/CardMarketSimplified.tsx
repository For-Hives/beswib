'use client'

import { Calendar, MapPinned, User } from 'lucide-react'

import Image from 'next/image'
import marketplaceTranslations from '@/components/marketplace/locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'
import { formatDateWithLocale } from '@/lib/utils/date'
import type { Event } from '@/models/event.model'
import type { BibSaleSimplified } from '@/models/marketplace.model'

interface CardMarketSimplifiedProps {
	bibSaleSimplified: BibSaleSimplified
	locale: Locale
	/** Optional event data for official price comparison */
	eventData?: Event
}

export default function CardMarketSimplified({ locale, eventData, bibSaleSimplified }: CardMarketSimplifiedProps) {
	const translations = getTranslations(locale, marketplaceTranslations).participants

	// Calculate the lowest reference price between original and official
	const officialPrice = eventData?.officialStandardPrice ?? 0
	const originalPrice = bibSaleSimplified.originalPrice ?? 0

	// Determine the reference price (lowest between original and official)
	const referencePrice =
		officialPrice > 0 && originalPrice > 0
			? Math.min(officialPrice, originalPrice)
			: officialPrice > 0
				? officialPrice
				: originalPrice > 0
					? originalPrice
					: 0

	return (
		<div className="w-full max-w-xs">
			<div className="bg-card/80 border-border relative flex flex-col overflow-hidden rounded-2xl border shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md transition-all duration-300 hover:border-white/35">
				<div
					className={cn(
						'absolute inset-0 -z-20 opacity-50',
						'[background-size:20px_20px]',
						'[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]',
						'dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]'
					)}
				/>
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-25 dark:bg-black"></div>
				<div className="relative flex justify-center px-4 pt-4">
					<div
						className={cn(
							'from-primary/10 via-accent/20 to-secondary/20 before:from-primary before:via-accent before:via-secondary before:to-ring relative h-64 w-full overflow-hidden rounded-xl bg-linear-to-br shadow-[inset_0_0_20px_hsl(var(--primary)/0.3),inset_0_0_40px_hsl(var(--accent)/0.2),0_0_30px_hsl(var(--primary)/0.4)] before:absolute before:inset-0 before:-z-10 before:m-[-1px] before:rounded-xl before:bg-linear-to-br before:p-0.5'
						)}
					>
						<Image
							alt="template-run"
							className="cover z-20 overflow-hidden rounded-2xl p-3"
							fill
							sizes="100vw"
							src={bibSaleSimplified.event.image}
						/>
						<div className="absolute inset-0 z-10 h-full w-full bg-black/50 bg-blend-color-burn"></div>
						<div className="absolute inset-0 z-10 opacity-10">
							<div className="isolate h-full w-full animate-pulse bg-[linear-gradient(90deg,hsl(var(--foreground)/0.3)_1px,transparent_1px),linear-gradient(hsl(var(--foreground)/0.3)_1px,transparent_1px)] bg-[length:15px_15px]" />
						</div>
					</div>
				</div>

				<div className="via-border mt-4 h-px w-full bg-gradient-to-r from-transparent to-transparent" />
				<div className="flex flex-col gap-2 px-4 py-2">
					<div className="flex w-full justify-between">
						<h3 className="text-foreground text-lg font-bold">{bibSaleSimplified.event.name}</h3>
						<div className="relative flex flex-col items-center gap-2">
							<p className="text-2xl font-bold text-white">{bibSaleSimplified.price}€</p>
							{referencePrice > 0 && referencePrice > bibSaleSimplified.price && (
								<p className="absolute top-8 right-0 text-sm italic line-through">{referencePrice}€</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Calendar className="h-5 w-5" />
						<p className="text-muted-foreground text-xs leading-relaxed">
							{formatDateWithLocale(bibSaleSimplified.event.date, locale)}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<MapPinned className="h-5 w-5" />
						<div className="flex items-center gap-1">
							<p className="text-muted-foreground text-xs leading-relaxed">{bibSaleSimplified.event.location}</p>
							<span className="text-muted-foreground text-xs leading-relaxed">•</span>
							<p className="text-muted-foreground text-xs leading-relaxed">
								{bibSaleSimplified.event.distance}
								<span className="text-muted-foreground text-xs leading-relaxed italic">
									{bibSaleSimplified.event.distanceUnit}
								</span>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2 pb-2">
						<User className="h-5 w-5" />
						<p className="text-muted-foreground text-xs leading-relaxed">
							{formatParticipantCount(bibSaleSimplified.event.participantCount)} {translations ?? 'participants'}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

function formatParticipantCount(participantCount: number) {
	// format the number, to display it with ',' and ' '
	return participantCount.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})
}
