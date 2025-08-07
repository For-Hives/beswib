'use client'

import React from 'react'
import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

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
}

const sportsOptions = [
	{ value: 'running', label: 'Running', icon: '🏃' },
	{ value: 'trail', label: 'Trail', icon: '🏔️' },
	{ value: 'triathlon', label: 'Triathlon', icon: '🏊‍♂️🚴‍♂️🏃‍♂️' },
	{ value: 'cycling', label: 'Cycling', icon: '🚴' },
	{ value: 'swimming', label: 'Swimming', icon: '🏊' },
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

export default function ActiveFiltersBadges({ filters, maxPrice, onRemoveFilter }: ActiveFiltersBadgesProps) {
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
			label: `From: ${filters.dateStart}`,
			value: 'dateStart',
		})
	}

	if (filters.dateEnd !== undefined && filters.dateEnd !== '') {
		activeFilters.push({
			type: 'dateEnd',
			label: `To: ${filters.dateEnd}`,
			value: 'dateEnd',
		})
	}

	if (activeFilters.length === 0) {
		return null
	}

	return (
		<div className="border-border bg-card/50 border-b px-6 py-3">
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap gap-2">
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
