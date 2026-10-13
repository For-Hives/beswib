'use client'

import clsx from 'clsx'
import { Calendar, Eye, MapPinned, ShoppingCart, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { TrackClick } from '@/components/analytics/TrackClick'
import { priceBucket } from '@/lib/analytics/buckets'
import type { EventProps } from '@/lib/analytics/catalog'
import { bibIdOf, eventIdOf } from '@/lib/analytics/ids'
import { cn } from '@/lib/utils'

import { formatDateWithLocale } from '@/lib/utils/date'
import type { BibSale } from '@/models/marketplace.model'

interface CardMarketProps {
	bibSale: BibSale
	locale: Locale
	/** Optional event data for official price comparison */
	eventData?: Event
	/** List the card sits in and its rank there: set where a click on the card is counted, left out elsewhere */
	trackWhere?: EventProps<'bib_card_click'>['where']
	position?: number
}

import marketplaceTranslations from '@/components/marketplace/locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import type { Event } from '@/models/event.model'

export default function CardMarket({ locale, eventData, bibSale, trackWhere, position }: Readonly<CardMarketProps>) {
	const translations = getTranslations(locale, marketplaceTranslations)

	const cardClick =
		trackWhere != null && position != null
			? {
					where: trackWhere,
					position: Math.min(position, 50),
					bib_id: bibIdOf(bibSale),
					event_id: eventIdOf(bibSale.event),
					price_bucket: priceBucket(bibSale.price),
				}
			: undefined

	const eventLink = (
		<Link
			className="border-border text-foreground hover:bg-accent/10 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition"
			href={`/${locale}/events/${bibSale.event.id}`}
		>
			<Eye className="h-4 w-4" />
			{translations.viewEvent ?? 'View event'}
		</Link>
	)
	const bibLink = (
		<Link
			className="bg-primary text-primary-foreground hover:bg-primary/90 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition"
			href={`/${locale}/marketplace/${bibSale.id}`}
		>
			<ShoppingCart className="h-4 w-4" />
			{translations.wantThisBib ?? 'I want this bib'}
		</Link>
	)

	// Calculate the lowest reference price between original and official
	const officialPrice = eventData?.officialStandardPrice ?? 0
	const originalPrice = bibSale.originalPrice ?? 0

	// Determine the reference price (lowest between original and official)
	const referencePrice =
		officialPrice > 0 && originalPrice > 0
			? Math.min(officialPrice, originalPrice)
			: officialPrice > 0
				? officialPrice
				: originalPrice > 0
					? originalPrice
					: 0

	// Calculate discount percentage based on the lowest reference price
	const discountPercentage =
		referencePrice > 0 && referencePrice > bibSale.price
			? Math.round(((referencePrice - bibSale.price) / referencePrice) * 100)
			: 0

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
				<div className="relative flex justify-center px-4 pt-4">
					<div className="from-primary/20 via-accent/20 to-secondary/20 before:from-primary before:via-accent before:via-secondary before:to-ring relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-linear-to-br shadow-[inset_0_0_20px_hsl(var(--primary)/0.3),inset_0_0_40px_hsl(var(--accent)/0.2),0_0_30px_hsl(var(--primary)/0.4)] before:absolute before:inset-0 before:-z-10 before:m-[-1px] before:rounded-xl before:bg-linear-to-br before:p-0.5">
						<Image
							alt="template-run"
							className="-z-10 rounded-2xl object-cover p-3"
							fill
							sizes="100vw"
							src={bibSale.event.image}
						/>
						<div className="absolute inset-0 z-10 opacity-10">
							<div className="h-full w-full animate-pulse bg-[linear-gradient(90deg,hsl(var(--foreground)/0.3)_1px,transparent_1px),linear-gradient(hsl(var(--foreground)/0.3)_1px,transparent_1px)] bg-[length:15px_15px]" />
						</div>
						{/* type of event 🎉 */}
						<div className="absolute inset-0 top-0 left-0 z-20 m-2">
							<span
								className={clsx(
									'mb-3 inline-block rounded-full border px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md',
									bgFromType(bibSale.event.type)
								)}
							>
								{(() => {
									const type = bibSale.event.type
									switch (type) {
										case 'trail':
											return translations.trail ?? 'Trail'
										case 'road':
											return translations.road ?? 'Road'
										case 'triathlon':
											return translations.triathlon ?? 'Triathlon'
										case 'cycle':
											return typeof (translations as { cycling?: unknown }).cycling === 'string'
												? (translations as { cycling?: string }).cycling
												: 'Cycling'
										default:
											return translations.other ?? 'Other'
									}
								})()}
							</span>
						</div>
						{/* Calc of the discount - red if more than 10% off 💰 */}
						{discountPercentage > 10 && (
							<div className="absolute top-0 right-0 z-20 m-2 flex justify-center">
								<span
									className={clsx('text-xs', {
										'mb-2 rounded-full border border-red-500/50 bg-red-500/15 px-3 py-1 font-medium text-white/90 shadow-md shadow-red-500/20 backdrop-blur-md':
											discountPercentage > 10,
									})}
								>
									-{discountPercentage}%
								</span>
							</div>
						)}
					</div>
				</div>
				<div className="flex w-full items-center justify-center py-2">
					<div className="flex w-full items-center justify-center">
						<p className="text-muted-foreground text-xs leading-relaxed italic">
							{translations?.soldBy ?? 'vendu par'} {bibSale.user.firstName ?? 'Anonymous'}{' '}
						</p>
					</div>
				</div>
				<div className="via-border h-px w-full bg-gradient-to-r from-transparent to-transparent" />
				<div className="flex flex-1 flex-col gap-2 px-4 py-2">
					<div className="flex w-full justify-between gap-2">
						<h3 className="text-foreground text-lg font-bold">{bibSale.event.name}</h3>
						<div className="relative flex flex-col items-center gap-2">
							<p className="text-foreground text-2xl font-bold">{bibSale.price}€</p>
							{referencePrice > 0 && referencePrice > bibSale.price && (
								<p className="absolute top-8 right-0 text-sm italic line-through">{referencePrice}€</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Calendar className="h-5 w-5" />
						<p className="text-muted-foreground text-xs leading-relaxed">
							{formatDateWithLocale(bibSale.event.date, locale)}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<MapPinned className="h-5 w-5" />
						<div className="flex items-center gap-1">
							<p className="text-muted-foreground text-xs leading-relaxed">{bibSale.event.location}</p>
							<span className="text-muted-foreground text-xs leading-relaxed">•</span>
							<p className="text-muted-foreground text-xs leading-relaxed">
								{bibSale.event.distance}
								<span className="text-muted-foreground text-xs leading-relaxed italic">
									{bibSale.event.distanceUnit}
								</span>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<User className="h-5 w-5" />
						<p className="text-muted-foreground text-xs leading-relaxed">
							{formatParticipantCount(bibSale.event.participantCount)} {translations.participants ?? 'participants'}
						</p>
					</div>
					<div className="flex h-full items-end justify-center py-2">
						<div className="flex w-full flex-col gap-2 md:flex-row">
							{cardClick != null ? (
								<>
									<TrackClick name="bib_card_click" props={{ ...cardClick, target: 'event' }}>
										{eventLink}
									</TrackClick>
									<TrackClick name="bib_card_click" props={{ ...cardClick, target: 'bib' }}>
										{bibLink}
									</TrackClick>
								</>
							) : (
								<>
									{eventLink}
									{bibLink}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function bgFromType(type: BibSale['event']['type']) {
	switch (type) {
		case 'cycle':
			return 'bg-cyan-500/15 border-cyan-500/50'
		case 'other':
			return 'bg-gray-500/15 border-gray-500/50'
		case 'road':
			return 'bg-green-500/15 border-green-500/50'
		case 'trail':
			return 'bg-yellow-500/15 border-yellow-500/50'
		case 'triathlon':
			return 'bg-purple-500/15 border-purple-500/50'
	}
}

function formatParticipantCount(participantCount: number) {
	// format the number, to display it with ',' and ' ' 🔢
	return participantCount.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})
}
