'use client'

import React from 'react'
import { Package, TrendingUp, Euro, Activity } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { BibSale } from './CardMarket'
import locales from './locales.json'

interface MarketplaceHeaderProps {
	readonly bibs: BibSale[]
	readonly filteredBibs: BibSale[]
	readonly locale?: keyof typeof locales
}

export default function MarketplaceHeader({ bibs, filteredBibs }: MarketplaceHeaderProps) {
	// Calculate stats
	const totalBibs = bibs.length
	const visibleBibs = filteredBibs.length
	const totalSales = bibs.reduce((sum, bib) => sum + (bib.status === 'sold' ? 1 : 0), 0)

	const averagePrice = totalBibs > 0 ? bibs.reduce((sum, bib) => sum + bib.price, 0) / totalBibs : 0

	const stats = [
		{
			title: 'Total Bibs',
			value: totalBibs.toString(),
			description: 'Available bibs',
			icon: Package,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50 dark:bg-blue-950',
		},
		{
			title: 'Showing Results',
			value: visibleBibs.toString(),
			description: 'Matching your filters',
			icon: Activity,
			color: 'text-green-600',
			bgColor: 'bg-green-50 dark:bg-green-950',
		},
		{
			title: 'Average Price',
			value: `€${averagePrice.toFixed(2)}`,
			description: 'Across all bibs',
			icon: Euro,
			color: 'text-amber-600',
			bgColor: 'bg-amber-50 dark:bg-amber-950',
		},
		{
			title: 'Total Sales',
			value: totalSales.toString(),
			description: 'Bibs sold',
			icon: TrendingUp,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50 dark:bg-purple-950',
		},
	]

	return (
		<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			{stats.map(stat => {
				const Icon = stat.icon
				return (
					<Card key={stat.title} className="relative overflow-hidden">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
									<p className="text-2xl font-bold">{stat.value}</p>
									<p className="text-muted-foreground text-xs">{stat.description}</p>
								</div>
								<div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', stat.bgColor)}>
									<Icon className={cn('h-6 w-6', stat.color)} />
								</div>
							</div>
							{/* Subtle background pattern */}
							<div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5" />
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
