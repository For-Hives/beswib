'use client'

import { useState } from 'react'
import { ShoppingCart, CheckCircle, Archive, Tag } from 'lucide-react'

import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'
import SellerBibCard from './SellerBibCard'

import sellerTranslations from '@/app/[locale]/dashboard/seller/locales.json'

interface BibCategoryTabsProps {
	bibs: (Bib & { expand?: { eventId: Event } })[]
	locale: Locale
}

type CategoryKey = 'active' | 'sold' | 'archived'

interface Category {
	key: CategoryKey
	label: string
	icon: React.ComponentType<{ className?: string }>
	filter: (bib: Bib) => boolean
	color: string
}

export default function BibCategoryTabs({ bibs, locale }: BibCategoryTabsProps) {
	const t = getTranslations(locale, sellerTranslations)
	const [activeCategory, setActiveCategory] = useState<CategoryKey>('active')

	const categories: Category[] = [
		{
			key: 'active',
			label: t?.categoryActive ?? 'En cours de vente',
			icon: ShoppingCart,
			filter: bib => bib.status === 'available' || bib.status === 'validation_failed',
			color:
				'text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950/30',
		},
		{
			key: 'sold',
			label: t?.categorySold ?? 'Vendus',
			icon: CheckCircle,
			filter: bib => bib.status === 'sold',
			color: 'text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950/30',
		},
		{
			key: 'archived',
			label: t?.categoryArchived ?? 'Archivés',
			icon: Archive,
			filter: bib => bib.status === 'expired' || bib.status === 'withdrawn',
			color: 'text-gray-600 border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-800 dark:bg-gray-950/30',
		},
	]

	// Filter bibs by category
	const filteredBibs = bibs.filter(categories.find(cat => cat.key === activeCategory)?.filter || (() => false))

	// Calculate counts for each category
	const categoryCounts = categories.map(category => ({
		...category,
		count: bibs.filter(category.filter).length,
	}))

	return (
		<div className="space-y-6">
			{/* Category Navigation */}
			<div className="flex flex-wrap gap-2">
				{categoryCounts.map(category => {
					const Icon = category.icon
					const isActive = activeCategory === category.key

					// Only show category if it has bibs or is currently active
					if (category.count === 0 && !isActive) return null

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
							{activeCategory === 'active' && (t?.noBibsActive ?? 'Aucun dossard en vente')}
							{activeCategory === 'sold' && (t?.noBibsSold ?? 'Aucun dossard vendu')}
							{activeCategory === 'archived' && (t?.noBibsArchived ?? 'Aucun dossard archivé')}
						</h3>
						<p className="text-muted-foreground mb-6">
							{activeCategory === 'active' && (t?.startListingFirst ?? 'Commencez par lister votre premier dossard')}
							{activeCategory === 'sold' && (t?.soldBibsWillAppear ?? 'Vos dossards vendus apparaîtront ici')}
							{activeCategory === 'archived' &&
								(t?.archivedBibsWillAppear ?? 'Les dossards expirés ou retirés apparaîtront ici')}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
