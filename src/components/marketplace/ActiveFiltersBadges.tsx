'use client'

import React from 'react'
import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n-config'
import { getTranslations } from '@/lib/getDictionary'
import marketplaceTranslations from '@/components/marketplace/locales.json'

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
	{ value: 'triathlon', label: 'Triathlon', icon: '🏊‍♂️🚴‍♂️🏃‍♂️' },
	{ value: 'cycling', label: 'Cycling', icon: '🚴' },
	{ value: 'other', label: 'Other', icon: '🏅' },
]

const distanceOptions = [
	{ value: '5', label: '5km', range: '4-6km' },
	{ value: '10', label: '10km', range: '9-11km' },
	{ value: '21', label: 'Semi-Marathon', range: '20-22km' },
	{ value: '42', label: 'Marathon', range: '41-43km' },
	{ value: '80', label: 'Ultra (+80km)', range: '80km+' },
	{ value: 'tri-s', label: 'Triathlon S', range: '25-30km' },
	{ value: 'tri-m', label: 'Triathlon M', range: '50-55km' },
	{ value: 'tri-l', label: 'Triathlon L', range: '110-115km' },
]

export default function ActiveFiltersBadges({ filters, maxPrice, onRemoveFilter, locale }: ActiveFiltersBadgesProps) {
    const t = getTranslations(locale ?? ('en' as Locale), marketplaceTranslations)
	const activeFilters = []

	// Sport filter
	if (filters.sport !== null) {
		const sport = sportsOptions.find(s => s.value === filters.sport)
		if (sport) {
			activeFilters.push({
				type: 'sport',
				label: `${sport.icon} ${sport.label}`,
				value: filters.sport,
			})
		}
	}

	// Distance filter
	if (filters.distance !== null) {
		const distance = distanceOptions.find(d => d.value === filters.distance)
		if (distance) {
			activeFilters.push({
				type: 'distance',
				label: distance.label,
				value: filters.distance,
			})
		}
	}

	// Price filter
	if (filters.priceMin !== 0 || filters.priceMax !== maxPrice) {
		activeFilters.push({
			type: 'price',
			label: `${filters.priceMin}€ - ${filters.priceMax}€`,
			value: 'price',
		})
	}

	// Geography filters
	filters.geography.forEach(location => {
		activeFilters.push({
			type: 'geography',
			label: location,
			value: location,
		})
	})

	// Date filters
    if (filters.dateStart !== undefined && filters.dateStart !== '') {
		activeFilters.push({
			type: 'dateStart',
            label: `${t.start ?? 'From'}: ${filters.dateStart}`,
			value: 'dateStart',
		})
	}

    if (filters.dateEnd !== undefined && filters.dateEnd !== '') {
		activeFilters.push({
			type: 'dateEnd',
            label: `${t.end ?? 'To'}: ${filters.dateEnd}`,
			value: 'dateEnd',
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
