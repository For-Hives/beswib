'use client'

import { Calendar, Edit3, MapPinned, Tag, User } from 'lucide-react'

import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'

import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { formatDateObjectForDisplay } from '@/lib/utils/date'
import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'

import sellerTranslations from '@/app/[locale]/dashboard/seller/locales.json'

interface SellerBibCardProps {
	bib: Bib & { expand?: { eventId: Event } }
	locale: Locale
}

// Status display mapping
const getStatusDisplay = (status: string) => {
	switch (status) {
		case 'available':
			return { label: 'Available', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' }
		case 'expired':
			return { label: 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' }
		case 'sold':
			return { label: 'Sold', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
		case 'validation_failed':
			return { label: 'Validation Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
		case 'withdrawn':
			return { label: 'Withdrawn', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' }
		default:
			return { label: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' }
	}
}

export default function SellerBibCard({ bib, locale }: SellerBibCardProps) {
	const t = getTranslations(locale, sellerTranslations)

	if (!bib?.id) return null

	const statusDisplay = getStatusDisplay(bib.status ?? 'unknown')
	const canEdit = bib.status === 'available' || bib.status === 'validation_failed'

	return (
		<div className="group relative h-full w-full">
			<div className="bg-card/80 border-border hover:border-foreground/35 relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md transition-all duration-300">
				{/* Background pattern */}
				<div
					className={cn(
						'absolute inset-0 -z-20 opacity-50',
						'[background-size:20px_20px]',
						'[background-image:radial-gradient(var(--border)_1px,transparent_1px)]',
						'dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]'
					)}
				/>
				<div className="bg-background pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-25 dark:bg-black"></div>

				{/* Blur overlay and edit button on hover */}
				{canEdit && (
					<>
						{/* Blur overlay */}
						<div className="absolute inset-0 z-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
							<div className="h-full w-full rounded-2xl bg-black/20 backdrop-blur-sm" />
						</div>

						{/* Edit button */}
						<div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
							<Link href={`/dashboard/seller/edit-bib/${bib.id}`}>
								<div className="bg-primary/90 flex items-center justify-center rounded-full p-4 shadow-lg transition-transform duration-200 hover:scale-110">
									<Edit3 className="text-primary-foreground h-6 w-6" />
								</div>
							</Link>
						</div>
					</>
				)}

				{/* Event image */}
				<div className="relative flex justify-center px-4 pt-4">
					<div className="from-primary/20 via-accent/20 to-secondary/20 before:from-primary before:via-accent before:via-secondary before:to-ring relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br shadow-[inset_0_0_20px_hsl(var(--primary)/0.3),inset_0_0_40px_hsl(var(--accent)/0.2),0_0_30px_hsl(var(--primary)/0.4)] before:absolute before:inset-0 before:-z-10 before:m-[-1px] before:rounded-xl before:bg-gradient-to-br before:p-0.5">
						{bib.expand?.eventId?.image ? (
							<Image
								alt={bib.expand.eventId.name || 'Event image'}
								className="-z-10 rounded-2xl object-cover p-3"
								fill
								sizes="100vw"
								src={bib.expand.eventId.image}
							/>
						) : (
							<div className="absolute inset-0 z-10 opacity-10">
								<div className="h-full w-full animate-pulse bg-[linear-gradient(90deg,hsl(var(--foreground)/0.3)_1px,transparent_1px),linear-gradient(hsl(var(--foreground)/0.3)_1px,transparent_1px)] bg-[length:15px_15px]" />
							</div>
						)}

						{/* Status badge */}
						<div className="absolute top-0 right-0 z-20 m-2">
							<span className={`rounded-full px-3 py-1 text-xs font-medium ${statusDisplay.color}`}>
								{statusDisplay.label}
							</span>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="flex flex-1 flex-col gap-2 px-4 py-4">
					{/* Event name and price */}
					<div className="flex w-full justify-between gap-2">
						<h3 className="text-foreground truncate text-lg font-bold">
							{bib.expand?.eventId?.name ?? `Event ID: ${bib.eventId ?? 'Unknown'}`}
						</h3>
						<div className="relative flex flex-col items-center gap-2">
							<p className="text-foreground text-2xl font-bold">€{bib.price?.toFixed(2) ?? '0.00'}</p>
						</div>
					</div>

					{/* Registration number */}
					<div className="flex items-center gap-2">
						<Tag className="text-muted-foreground h-4 w-4" />
						<p className="text-muted-foreground text-sm">
							{t?.registrationNumber ?? 'Registration Number'}: {bib.registrationNumber ?? 'N/A'}
						</p>
					</div>

					{/* Event date */}
					{bib.expand?.eventId?.eventDate && (
						<div className="flex items-center gap-2">
							<Calendar className="text-muted-foreground h-4 w-4" />
							<p className="text-muted-foreground text-sm">
								{formatDateObjectForDisplay(new Date(bib.expand.eventId.eventDate), locale)}
							</p>
						</div>
					)}

					{/* Location if available */}
					{bib.expand?.eventId?.location && (
						<div className="flex items-center gap-2">
							<MapPinned className="text-muted-foreground h-4 w-4" />
							<p className="text-muted-foreground truncate text-sm">{bib.expand.eventId.location}</p>
						</div>
					)}

					{/* Bib details */}
					<div className="flex items-center gap-4">
						{bib.optionValues?.size && (
							<div className="flex items-center gap-1">
								<span className="text-muted-foreground text-xs">{t?.size ?? 'Size'}:</span>
								<p className="text-foreground text-xs font-medium">{bib.optionValues.size}</p>
							</div>
						)}
						{bib.optionValues?.gender && (
							<div className="flex items-center gap-1">
								<span className="text-muted-foreground text-xs">{t?.gender ?? 'Gender'}:</span>
								<p className="text-foreground text-xs font-medium">{bib.optionValues.gender}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
