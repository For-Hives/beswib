'use client'

import { X } from 'lucide-react'

import marketplaceTranslations from '@/components/marketplace/locales.json'
import { Badge } from '@/components/ui/badge'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'

interface ActiveFiltersBadgesProps {
	readonly filters: {
		sport: string | null
		distance: string | null
		distanceMin: number
		distanceMax: number
		priceMin: number
		priceMax: number
		geography: string[]
		dateStart?: string
		dateEnd?: string
	}
	readonly minPrice: number
	readonly maxPrice: number
	readonly maxDistance: number
	readonly onRemoveFilter: (type: string, value?: string) => void
	readonly locale?: Locale
}

// options are now built inside the component to leverage translations

export default function ActiveFiltersBadges({
	onRemoveFilter,
	minPrice,
	maxPrice,
	maxDistance,
	locale,
	filters,
}: ActiveFiltersBadgesProps) {
	const t = getTranslations(locale ?? ('en' as Locale), marketplaceTranslations)
	const sportsOptions = [
		{ value: 'road', label: t.road ?? 'Road', icon: '🏃' },
		{ value: 'trail', label: t.trail ?? 'Trail', icon: '🏔️' },
		{ value: 'triathlon', label: t.triathlon ?? 'Triathlon', icon: '🏊‍♂️' },
		{
			value: 'cycle',
			label: (t as { cycling?: string }).cycling ?? 'Cycling',
			icon: '🚴',
		},
		{ value: 'other', label: t.other ?? 'Other', icon: '🏅' },
	]

	const distanceOptions = [
		{
			value: '5',
			range: t?.distances?.fiveKmRange ?? '4-6km',
			label: t?.distances?.fiveKm ?? '5km',
		},
		{
			value: '10',
			range: t?.distances?.tenKmRange ?? '9-11km',
			label: t?.distances?.tenKm ?? '10km',
		},
		{
			value: '21',
			range: t?.distances?.halfMarathonRange ?? '20-22km',
			label: t?.distances?.halfMarathon ?? 'Semi-Marathon',
		},
		{
			value: '42',
			range: t?.distances?.marathonRange ?? '41-43km',
			label: t?.distances?.marathon ?? 'Marathon',
		},
		{
			value: '80',
			range: t?.distances?.ultraRange ?? '80km+',
			label: t?.distances?.ultra ?? 'Ultra (+80km)',
		},
		{
			value: 'tri-s',
			range: t?.distances?.triSRange ?? '25-30km',
			label: t?.distances?.triS ?? 'Triathlon S',
		},
		{
			value: 'tri-m',
			range: t?.distances?.triMRange ?? '50-55km',
			label: t?.distances?.triM ?? 'Triathlon M',
		},
		{
			value: 'tri-l',
			range: t?.distances?.triLRange ?? '110-115km',
			label: t?.distances?.triL ?? 'Triathlon L',
		},
	]
	const activeFilters = []

	// Sport filter
	if (filters.sport != null) {
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
	if (filters.distance != null) {
		const distance = distanceOptions.find(d => d.value === filters.distance)
		if (distance) {
			activeFilters.push({
				value: filters.distance,
				type: 'distance',
				label: distance.label,
			})
		}
	}

	// Distance range filter
	if (filters.distanceMin !== 0 || filters.distanceMax !== maxDistance) {
		activeFilters.push({
			value: 'distanceRange',
			type: 'distanceRange',
			label: `${filters.distanceMin}km - ${filters.distanceMax}km`,
		})
	}

	// Price filter
	if (filters.priceMin !== minPrice || filters.priceMax !== maxPrice) {
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
