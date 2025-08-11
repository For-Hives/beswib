'use client'

import { X } from 'lucide-react'
import React from 'react'

import marketplaceTranslations from '@/components/marketplace/locales.json'
import { getTranslations } from '@/lib/getDictionary'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n-config'

interface ActiveFiltersBadgesProps {
	readonly filters: {
		sport: string | null
		distance: string | null
		priceMin: number
		priceMax: number
		geography: string[]
		dateStart?: string
		dateEnd?: string
	}
	readonly maxPrice: number
	readonly onRemoveFilter: (type: string, value?: string) => void
	readonly locale?: Locale
}

const sportsOptions = [
	{ value: 'running', label: 'Road', icon: '🏃' },
	{ value: 'trail', label: 'Trail', icon: '🏔️' },
	{ value: 'triathlon', label: 'Triathlon', icon: '🏊‍♂️' },
	{ value: 'cycling', label: 'Cycling', icon: '🚴' },
	{ value: 'other', label: 'Other', icon: '🏅' },
]

const distanceOptions = [
	{ value: '5', range: '4-6km', label: '5km' },
	{ value: '10', range: '9-11km', label: '10km' },
	{ value: '21', range: '20-22km', label: 'Semi-Marathon' },
	{ value: '42', range: '41-43km', label: 'Marathon' },
	{ value: '80', range: '80km+', label: 'Ultra (+80km)' },
	{ value: 'tri-s', range: '25-30km', label: 'Triathlon S' },
	{ value: 'tri-m', range: '50-55km', label: 'Triathlon M' },
	{ value: 'tri-l', range: '110-115km', label: 'Triathlon L' },
]

export default function ActiveFiltersBadges({ onRemoveFilter, maxPrice, locale, filters }: ActiveFiltersBadgesProps) {
	const t = getTranslations(locale ?? ('en' as Locale), marketplaceTranslations)
	const activeFilters = []

	// Sport filter
	if (filters.sport !== null) {
		const sport = sportsOptions.find(s => s.value === filters.sport)
		if (sport) {
			activeFilters.push({
				value: filters.sport,
				type: 'sport',
				label: `${sport.icon} ${sport.label}`,
			})
		}
	}

	// Distance filter
	if (filters.distance !== null) {
		const distance = distanceOptions.find(d => d.value === filters.distance)
		if (distance) {
			activeFilters.push({
				value: filters.distance,
				type: 'distance',
				label: distance.label,
			})
		}
	}

	// Price filter
	if (filters.priceMin !== 0 || filters.priceMax !== maxPrice) {
		activeFilters.push({
			value: 'price',
			type: 'price',
			label: `${filters.priceMin}€ - ${filters.priceMax}€`,
		})
	}

	// Geography filters
	filters.geography.forEach(location => {
		activeFilters.push({
			value: location,
			type: 'geography',
			label: location,
		})
	})

	// Date filters
	if (filters.dateStart !== undefined && filters.dateStart !== '') {
		activeFilters.push({
			value: 'dateStart',
			type: 'dateStart',
			label: `${t.start ?? 'From'}: ${filters.dateStart}`,
		})
	}

	if (filters.dateEnd !== undefined && filters.dateEnd !== '') {
		activeFilters.push({
			value: 'dateEnd',
			type: 'dateEnd',
			label: `${t.end ?? 'To'}: ${filters.dateEnd}`,
		})
	}

	if (activeFilters.length === 0) {
		return null
	}

	return (
		<div className="border-border bg-card/50 border-b px-6 py-3">
			<div className="w-full">
				<div className="flex flex-wrap items-center gap-2">
					{activeFilters.map((filter, index) => (
						<Badge
							key={`${filter.type}-${index}`}
							variant="secondary"
							className="hover:bg-destructive/20 hover:text-destructive cursor-pointer text-xs transition-colors"
							onClick={() => onRemoveFilter(filter.type, filter.value)}
						>
							{filter.label}
							<X className="ml-1 h-3 w-3" />
						</Badge>
					))}
				</div>
			</div>
		</div>
	)
}
