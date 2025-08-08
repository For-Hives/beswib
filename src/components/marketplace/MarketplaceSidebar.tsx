'use client'

import React, { useMemo, useState } from 'react'
import { X, SlidersHorizontal, Calendar, MapPin, Euro, Activity, Filter } from 'lucide-react'
import Fuse from 'fuse.js'

import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

import locales from './locales.json'

interface MarketplaceSidebarProps {
	readonly locale?: string
	readonly maxPrice?: number
	readonly filters: MarketplaceFilters
	readonly onFiltersChange: (filters: Partial<MarketplaceFilters>) => void
	readonly regions?: string[]
}

export type MarketplaceFilters = {
	sport: string | null
	distance: string | null
	priceMin: number
	priceMax: number
	geography: string[]
	dateStart?: string
	dateEnd?: string
}

export default function MarketplaceSidebar({
	regions = [],
	onFiltersChange,
	filters,
	maxPrice = 2000,
	locale,
}: MarketplaceSidebarProps) {
	// UI states
	const [regionSearch, setRegionSearch] = useState('')
	const [showAllSports, setShowAllSports] = useState(false)
	const [showAllDistances, setShowAllDistances] = useState(false)

	const lang = locale ?? 'en'
	const t = locales[lang as keyof typeof locales] ?? locales['en']

	// Sports options
	const sportsOptions = [
		{ value: 'running', label: 'Running', icon: '🏃' },
		{ value: 'trail', label: 'Trail', icon: '🏔️' },
		{ value: 'triathlon', label: 'Triathlon', icon: '🏊‍♂️🚴‍♂️🏃‍♂️' },
		{ value: 'cycling', label: t.cycling ?? 'Cycling', icon: '🚴' },
		{ value: 'swimming', label: t.swimming ?? 'Swimming', icon: '🏊' },
		{ value: 'other', label: 'Other', icon: '🏅' },
	]

	// Distance options
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

	// Handle distance selection as toggle
	const handleDistanceChange = (distance: string | null) => {
		if (distance === 'all') {
			onFiltersChange({ distance: null })
			return
		}
		const next = filters.distance === distance ? null : distance
		onFiltersChange({ distance: next })
	}

	// Handle price range changes
	const handlePriceChange = (values: number[]) => {
		onFiltersChange({ priceMin: values[0], priceMax: values[1] })
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
		filters.sport !== null,
		filters.distance !== null,
		filters.priceMin !== 0 || filters.priceMax !== maxPrice,
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
										distance: null,
										priceMin: 0,
										priceMax: maxPrice,
										geography: [],
										dateStart: undefined,
										dateEnd: undefined,
									})
								}
								className="text-muted-foreground hover:text-foreground"
							>
								Reset ({activeFiltersCount})
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
								{showAllSports ? 'Show Less' : `Show ${sportsOptions.length - 4} More`}
							</Button>
						)}
						{filters.sport !== null && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleSportChange(null)}
								className="text-muted-foreground w-full"
							>
								Clear Sport Filter
							</Button>
						)}
					</div>
				</div>

				{/* Distance Filter */}
				<div className="space-y-3">
					<Label className="flex items-center gap-2 text-sm font-medium">
						<SlidersHorizontal className="h-4 w-4" />
						{t.distance ?? 'Distance'}
					</Label>
					<div className="space-y-2">
						<div className="space-y-1">
							{distanceOptions.slice(0, showAllDistances ? undefined : 4).map(distance => (
								<Button
									key={distance.value}
									variant={filters.distance === distance.value ? 'default' : 'ghost'}
									size="sm"
									onClick={() => handleDistanceChange(distance.value)}
									className="h-auto w-full justify-between p-2"
								>
									<span className="font-medium">{distance.label}</span>
									<span className="text-muted-foreground text-xs">{distance.range}</span>
								</Button>
							))}
						</div>
						{distanceOptions.length > 4 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowAllDistances(!showAllDistances)}
								className="text-muted-foreground w-full"
							>
								{showAllDistances ? 'Show Less' : `Show ${distanceOptions.length - 4} More`}
							</Button>
						)}
						{filters.distance !== null && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleDistanceChange(null)}
								className="text-muted-foreground w-full"
							>
								Clear Distance Filter
							</Button>
						)}
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
					<Label className="flex items-center gap-2 text-sm font-medium">
						<MapPin className="h-4 w-4" />
						{t.region ?? 'Location'}
					</Label>
					<div className="space-y-2">
						<Input
							placeholder="Search locations..."
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
							<Label className="text-muted-foreground text-xs">From</Label>
							<Input
								type="date"
								value={filters.dateStart ?? ''}
								onChange={e => handleDateStartChange(e.target.value)}
								className=""
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-muted-foreground text-xs">To</Label>
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
							<Label className="text-sm font-medium">Active Filters</Label>
							<div className="flex flex-wrap gap-1">
								{filters.geography.map(location => (
									<Badge key={location} variant="secondary" className="text-xs">
										{location}
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemoveGeography(location)} />
									</Badge>
								))}
								{filters.sport !== null && (
									<Badge variant="secondary" className="text-xs">
										{sportsOptions.find(s => s.value === filters.sport)?.label}
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleSportChange(null)} />
									</Badge>
								)}
								{filters.distance !== null && (
									<Badge variant="secondary" className="text-xs">
										{distanceOptions.find(d => d.value === filters.distance)?.label}
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleDistanceChange(null)} />
									</Badge>
								)}
								{(filters.priceMin !== 0 || filters.priceMax !== maxPrice) && (
									<Badge variant="secondary" className="text-xs">
										{filters.priceMin}€ - {filters.priceMax}€
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handlePriceChange([0, maxPrice])} />
									</Badge>
								)}
								{filters.dateStart !== undefined && filters.dateStart !== '' && (
									<Badge variant="secondary" className="text-xs">
										From: {filters.dateStart}
										<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleDateStartChange('')} />
									</Badge>
								)}
								{filters.dateEnd !== undefined && filters.dateEnd !== '' && (
									<Badge variant="secondary" className="text-xs">
										To: {filters.dateEnd}
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
