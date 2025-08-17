'use client'

import { ShoppingCart, CheckCircle, Archive, Tag, Clock } from 'lucide-react'
import { useState } from 'react'

import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'
import type { Bib } from '@/models/bib.model'

import sellerTranslations from '@/app/[locale]/dashboard/seller/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'

import SellerBibCard from './SellerBibCard'

interface BibCategoryTabsProps {
	bibs?: (Bib & { expand?: { eventId: Event } })[]
	locale: Locale
}

type CategoryKey = 'active' | 'sold' | 'expired' | 'archived'

interface Category {
	key: CategoryKey
	label: string
	icon: React.ComponentType<{ className?: string }>
	filter: (bib: Bib) => boolean
	color: string
}

// Function to check if a bib is expired based on transfer deadline
const isBibExpired = (bib: Bib & { expand?: { eventId: Event } }): boolean => {
	const transferDeadline = bib.expand?.eventId?.transferDeadline
	if (!transferDeadline) return false

	try {
		const now = new Date()
		const deadline = new Date(transferDeadline)

		// Validate dates
		if (isNaN(deadline.getTime())) return false

		return now > deadline
	} catch {
		return false
	}
}

export default function BibCategoryTabs({ locale, bibs = [] }: BibCategoryTabsProps) {
	const t = getTranslations(locale, sellerTranslations)
	const [activeCategory, setActiveCategory] = useState<CategoryKey>('active')

	// Ensure bibs is always an array and filter out invalid entries
	const validBibs = (bibs || []).filter(bib => bib && bib.id)

	const categories: Category[] = [
		{
			label: t?.categories?.active ?? 'On Sale',
			key: 'active',
			icon: ShoppingCart,
			filter: bib => (bib.status === 'available' || bib.status === 'validation_failed') && !isBibExpired(bib),
			color:
				'text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950/30',
		},
		{
			label: t?.categories?.sold ?? 'Sold',
			key: 'sold',
			icon: CheckCircle,
			filter: bib => bib.status === 'sold',
			color: 'text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950/30',
		},
		{
			label: t?.categories?.expired ?? 'Expired',
			key: 'expired',
			icon: Clock,
			filter: bib => (bib.status === 'available' || bib.status === 'validation_failed') && isBibExpired(bib),
			color: 'text-orange-600 border-orange-200 bg-orange-50 dark:text-orange-800 dark:bg-orange-950/30',
		},
		{
			label: t?.categories?.archived ?? 'Archived',
			key: 'archived',
			icon: Archive,
			filter: bib => bib.status === 'expired' || bib.status === 'withdrawn',
			color: 'text-gray-600 border-gray-200 bg-gray-50 dark:text-gray-800 dark:bg-gray-950/30',
		},
	]

	// Filter bibs by category
	const currentCategoryFilter = categories.find(cat => cat.key === activeCategory)?.filter
	const filteredBibs = currentCategoryFilter ? validBibs.filter(currentCategoryFilter) : []

	// Calculate counts for each category
	const categoryCounts = categories.map(category => ({
		...category,
		count: validBibs.filter(category.filter).length,
	}))

	return (
		<div className="space-y-6">
			{/* Category Navigation */}
			<div className="flex flex-wrap gap-2">
				{categoryCounts
					.filter(category => {
						const isActive = activeCategory === category.key
						// Only show category if it has bibs or is currently active
						return category.count > 0 || isActive
					})
					.map(category => {
						const Icon = category.icon
						const isActive = activeCategory === category.key

						return (
							<button
								key={category.key}
								onClick={() => setActiveCategory(category.key)}
								className={cn(
									'flex items-center gap-2 rounded-lg border px-4 py-2 transition-all duration-200',
									'hover:scale-105 hover:shadow-md',
									isActive ? category.color : 'text-muted-foreground border-border bg-card/50 hover:bg-card/80'
								)}
							>
								<Icon className="h-4 w-4" />
								<span className="font-medium">{category.label}</span>
								{category.count > 0 && (
									<span
										className={cn(
											'rounded-full px-2 py-0.5 text-xs font-bold',
											isActive ? 'bg-white/20 text-current' : 'bg-muted-foreground/10 text-muted-foreground'
										)}
									>
										{category.count}
									</span>
								)}
							</button>
						)
					})}
			</div>

			{/* Category Content */}
			<div className="space-y-4">
				{filteredBibs.length > 0 ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{filteredBibs.map(bib => (
							<SellerBibCard key={bib.id} bib={bib} locale={locale} />
						))}
					</div>
				) : (
					<div className="py-12 text-center">
						<div className="mb-4">
							{(() => {
								const category = categories.find(cat => cat.key === activeCategory)
								if (!category) return <Tag className="text-muted-foreground mx-auto h-16 w-16" />
								const Icon = category.icon
								return <Icon className="text-muted-foreground mx-auto h-16 w-16" />
							})()}
						</div>
						<h3 className="mb-2 text-lg font-semibold">
							{activeCategory === 'active' && (t?.messages?.noBibsActive ?? 'No bibs on sale')}
							{activeCategory === 'sold' && (t?.messages?.noBibsSold ?? 'No bibs sold')}
							{activeCategory === 'expired' && (t?.messages?.noBibsExpired ?? 'No expired bibs')}
							{activeCategory === 'archived' && (t?.messages?.noBibsArchived ?? 'No bibs archived')}
						</h3>
						<p className="text-muted-foreground mb-6">
							{activeCategory === 'active' && (t?.messages?.startListingFirst ?? 'Start by listing your first bib')}
							{activeCategory === 'sold' && (t?.messages?.soldBibsWillAppear ?? 'Your sold bibs will appear here')}
							{activeCategory === 'expired' &&
								(t?.messages?.expiredBibsWillAppear ?? 'Bibs that have passed the transfer deadline will appear here')}
							{activeCategory === 'archived' &&
								(t?.messages?.archivedBibsWillAppear ?? 'Expired or withdrawn bibs will appear here')}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
