'use client'

import { X, SlidersHorizontal, Calendar, MapPin, Euro, Activity, Filter } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import Fuse from 'fuse.js'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

import locales from './locales.json'

interface MarketplaceSidebarProps {
	readonly locale?: string
	readonly minPrice?: number
	readonly maxPrice?: number
	readonly maxDistance?: number
	readonly filters: MarketplaceFilters
	readonly onFiltersChange: (filters: Partial<MarketplaceFilters>) => void
	readonly regions?: string[]
}

export type MarketplaceFilters = {
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

export default function MarketplaceSidebar({
	regions = [],
	onFiltersChange,
	minPrice = 0,
	maxPrice = 2000,
	maxDistance = 200,
	locale,
	filters,
}: MarketplaceSidebarProps) {
	// UI states
	const [regionSearch, setRegionSearch] = useState('')
	const [showAllSports, setShowAllSports] = useState(false)

	const lang = locale ?? 'en'
	const t = locales[lang as keyof typeof locales] ?? locales['en']

	// Sports options
	const sportsOptions = [
		{ value: 'road', label: t.road ?? 'Road', icon: '🏃' },
		{ value: 'trail', label: t.trail ?? 'Trail', icon: '🏔️' },
		{ value: 'triathlon', label: t.triathlon ?? 'Triathlon', icon: '🏊‍♂️' },
		{ value: 'cycle', label: t.cycling ?? 'Cycling', icon: '🚴' },
		{ value: 'other', label: t.other ?? 'Other', icon: '🏅' },
	]

	// Fuzzy search for regions
	const fuse = useMemo(() => new Fuse(regions, { threshold: 0.4 }), [regions])
	const filteredRegions = regionSearch ? fuse.search(regionSearch).map(result => result.item) : regions

	// Handle sport selection as toggle
	const handleSportChange = (sport: string | null) => {
		if (sport === 'all') {
			onFiltersChange({ sport: null })
			return
		}
		const next = filters.sport === sport ? null : sport
		onFiltersChange({ sport: next })
	}

	// Handle price range changes
	const handlePriceChange = (values: number[]) => {
		onFiltersChange({ priceMin: values[0], priceMax: values[1] })
	}

	// Handle distance range changes
	const handleDistanceChange = (values: number[]) => {
		onFiltersChange({ distanceMin: values[0], distanceMax: values[1] })
	}

	// Handle geography selection
	const handleGeographyToggle = (location: string) => {
		const newGeography = filters.geography.includes(location)
			? filters.geography.filter(l => l !== location)
			: [...filters.geography, location]
		onFiltersChange({ geography: newGeography })
	}

	// Remove geography filter
	const handleRemoveGeography = (location: string) => {
		onFiltersChange({
			geography: filters.geography.filter(l => l !== location),
		})
	}

	// Handle date changes
	const handleDateStartChange = (date: string) => {
		onFiltersChange({ dateStart: date ?? undefined })
	}

	const handleDateEndChange = (date: string) => {
		onFiltersChange({ dateEnd: date ?? undefined })
	}

	// Count active filters
	const activeFiltersCount = [
		filters.sport != null,
		filters.distance != null,
		filters.distanceMin !== 0 || filters.distanceMax !== maxDistance,
		filters.priceMin !== minPrice || filters.priceMax !== maxPrice,
		filters.geography.length > 0,
		filters.dateStart !== undefined,
		filters.dateEnd !== undefined,
	].filter(Boolean).length

	return (
		<div className="bg-card border-border w-80 rounded-lg border p-6">
			<div className="space-y-6">
				{/* Header */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<h2 className="flex items-center gap-2 text-lg font-semibold">
							<Filter className="h-5 w-5" />
							{t.filters ?? 'Filters'}
						</h2>
						{activeFiltersCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									onFiltersChange({
										sport: null,
										priceMin: minPrice,
										priceMax: maxPrice,
										geography: [],
										distanceMin: 0,
										distanceMax: maxDistance,
										distance: null,
										dateStart: undefined,
										dateEnd: undefined,
									})
								}
								className="text-muted-foreground hover:text-foreground"
							>
								{(t.reset ?? 'Reset') + ` (${activeFiltersCount})`}
							</Button>
						)}
					</div>
					<Separator />
				</div>

				{/* Sport Filter */}
				<div className="space-y-3">
					<Label className="flex items-center gap-2 text-sm font-medium">
						<Activity className="h-4 w-4" />
						{t.sport ?? 'Sport'}
					</Label>
					<div className="space-y-2">
						<div className="grid grid-cols-2 gap-2">
							{sportsOptions.slice(0, showAllSports ? undefined : 4).map(sport => (
								<Button
									key={sport.value}
									variant={filters.sport === sport.value ? 'default' : 'outline'}
									size="sm"
									onClick={() => handleSportChange(sport.value)}
									className="h-auto justify-start p-2"
								>
									<span className="mr-2">{sport.icon}</span>
									<span className="text-xs">{sport.label}</span>
								</Button>
							))}
						</div>
						{sportsOptions.length > 4 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowAllSports(!showAllSports)}
								className="text-muted-foreground w-full"
							>
								{showAllSports
									? (t.showLess ?? 'Show Less')
									: t.showMoreCount
										? t.showMoreCount.replace('{count}', String(sportsOptions.length - 4))
										: `Show ${sportsOptions.length - 4} More`}
							</Button>
						)}
						{filters.sport != null && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleSportChange(null)}
								className="text-muted-foreground w-full"
							>
								{t.clearSportFilter ?? 'Clear Sport Filter'}
							</Button>
						)}
					</div>
				</div>

				{/* Distance Range */}
				<div className="space-y-3">
					<Label className="flex items-center gap-2 text-sm font-medium">
						<SlidersHorizontal className="h-4 w-4" />
						{t.distance ?? 'Distance Range'}
					</Label>
					<div className="space-y-3">
						<Slider
							value={[filters.distanceMin, filters.distanceMax]}
							onValueChange={handleDistanceChange}
							max={maxDistance}
							min={0}
							step={1}
							className="w-full"
						/>
						<div className="text-muted-foreground flex justify-between text-sm">
							<span>{filters.distanceMin}km</span>
							<span>{filters.distanceMax}km</span>
						</div>
					</div>
				</div>

				{/* Price Range */}
				<div className="space-y-3">
					<Label className="flex items-center gap-2 text-sm font-medium">
						<Euro className="h-4 w-4" />
						{t.priceRange ?? 'Price Range'}
					</Label>
					<div className="space-y-3">
						<Slider
							value={[filters.priceMin, filters.priceMax]}
							onValueChange={handlePriceChange}
							max={maxPrice}
							min={0}
							step={5}
							className="w-full"
						/>
						<div className="text-muted-foreground flex justify-between text-sm">
							<span>{filters.priceMin}€</span>
							<span>{filters.priceMax}€</span>
						</div>
					</div>
				</div>

				{/* Geography Filter */}
				<div className="space-y-3">
					<Tooltip>
						<TooltipTrigger asChild>
							<Label className="flex items-center gap-2 text-sm font-medium">
								<MapPin className="h-4 w-4" />
								{t.region ?? 'Location'}
							</Label>
						</TooltipTrigger>
						<TooltipContent>
							<p>{t.cityFilterTooltip ?? 'Only cities with available events are displayed'}</p>
						</TooltipContent>
					</Tooltip>
					<div className="space-y-2">
						<Input
							placeholder={t.searchLocationsPlaceholder ?? 'Search locations...'}
							value={regionSearch}
							onChange={e => setRegionSearch(e.target.value)}
						/>
						<div className="max-h-40 space-y-1 overflow-y-auto">
							{filteredRegions.slice(0, 10).map(region => (
								<Button
									key={region}
									variant={filters.geography.includes(region.toLowerCase()) ? 'default' : 'ghost'}
									size="sm"
									onClick={() => handleGeographyToggle(region.toLowerCase())}
									className="w-full justify-start"
								>
									{region}
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* Date Range */}
				<div className="space-y-3">
					<Label className="flex items-center gap-2 text-sm font-medium">
						<Calendar className="h-4 w-4" />
						{t.date ?? 'Event Date'}
					</Label>
					<div className="space-y-2">
						<div className="space-y-1">
							<Label className="text-muted-foreground text-xs">{t.start ?? 'From'}</Label>
							<Input
								type="date"
								value={filters.dateStart ?? ''}
								onChange={e => handleDateStartChange(e.target.value)}
								className=""
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-muted-foreground text-xs">{t.end ?? 'To'}</Label>
							<Input
								type="date"
								value={filters.dateEnd ?? ''}
								onChange={e => handleDateEndChange(e.target.value)}
								className=""
							/>
						</div>
					</div>
				</div>

				{/* Active Filters */}
				{activeFiltersCount > 0 && (
					<div className="space-y-3">
						<Separator />
						<div className="space-y-2">
							<Label className="text-sm font-medium">{t.activeFilters ?? 'Active Filters'}</Label>
							<div className="flex flex-wrap gap-1">
								{filters.geography.map(location => (
									<Badge key={location} variant="secondary" className="text-xs">
										{location}
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemoveGeography(location)} />
									</Badge>
								))}
								{filters.sport != null && (
									<Badge variant="secondary" className="text-xs">
										{sportsOptions.find(s => s.value === filters.sport)?.label}
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleSportChange(null)} />
									</Badge>
								)}
								{(filters.distanceMin !== 0 || filters.distanceMax !== maxDistance) && (
									<Badge variant="secondary" className="text-xs">
										{filters.distanceMin}km - {filters.distanceMax}km
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleDistanceChange([0, maxDistance])} />
									</Badge>
								)}
								{(filters.priceMin !== minPrice || filters.priceMax !== maxPrice) && (
									<Badge variant="secondary" className="text-xs">
										{filters.priceMin}€ - {filters.priceMax}€
										<X
											className="ml-1 h-3 w-3 cursor-pointer"
											onClick={() => handlePriceChange([minPrice, maxPrice])}
										/>
									</Badge>
								)}
								{filters.dateStart !== undefined && filters.dateStart !== '' && (
									<Badge variant="secondary" className="text-xs">
										{(t.start ?? 'From') + ': '} {filters.dateStart}
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleDateStartChange('')} />
									</Badge>
								)}
								{filters.dateEnd !== undefined && filters.dateEnd !== '' && (
									<Badge variant="secondary" className="text-xs">
										{(t.end ?? 'To') + ': '} {filters.dateEnd}
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleDateEndChange('')} />
									</Badge>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
