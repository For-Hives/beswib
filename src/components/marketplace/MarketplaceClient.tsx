'use client'

import React, { useMemo, useCallback } from 'react'
import { Search } from 'lucide-react'

import { parseAsArrayOf, parseAsFloat, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import dynamic from 'next/dynamic'
import Fuse from 'fuse.js'

import type { BibSale } from '@/models/marketplace.model'
import type { Locale } from '@/lib/i18n/config'

import MarketplaceSidebar, { type MarketplaceFilters } from '@/components/marketplace/MarketplaceSidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ActiveFiltersBadges from '@/components/marketplace/ActiveFiltersBadges'
import marketplaceTranslations from '@/components/marketplace/locales.json'
import OfferCounter from '@/components/marketplace/offerCounter'
import CardMarket from '@/components/marketplace/CardMarket'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
const EmptyResultsRive = dynamic(() => import('@/components/marketplace/EmptyResultsRive'), { ssr: false })

// Props for the MarketplaceClient: receives an array of bibs to display 🛍️
interface MarketplaceClientProps {
	readonly bibs: BibSale[]
	locale: Locale
}

// --- Helper function to get the min/max range for each distance filter 📏
const getDistanceRange = (distanceFilter: null | string): [number, number] => {
	switch (distanceFilter) {
		case '5':
			return [4, 6]
		case '10':
			return [9, 11]
		case '21':
			return [20, 22]
		case '42':
			return [41, 43]
		case '80':
			return [80, Infinity]
		case 'tri-l':
			return [110, 115] // Half Ironman total 💪
		case 'tri-m':
			return [50, 55] // Olympic distance total 🏊🚴🏃
		case 'tri-s':
			return [25, 30] // Sprint distance total 💨
		default:
			return [0, Infinity]
	}
}

// --- Helper function to sort bibs according to the selected sort option 🔄
const sortBibs = (bibs: BibSale[], sort: string) => {
	switch (sort) {
		case 'distance':
			return [...bibs].sort((a, b) => b.event.distance - a.event.distance)
		case 'price-asc':
			return [...bibs].sort((a, b) => a.price - b.price)
		case 'price-desc':
			return [...bibs].sort((a, b) => b.price - a.price)
		case 'date':
		default:
			return [...bibs].sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime())
	}
}

// --- Custom parser for search that handles URL encoding/decoding safely 🔒
const parseAsSearchString = {
	...parseAsString,
	serialize: (value: string) => {
		try {
			// Encode special characters for URL safety
			return encodeURIComponent(value || '')
		} catch {
			// If encoding fails, return the original value
			return value || ''
		}
	},
	parse: (value: string) => {
		try {
			// Decode URL-encoded characters safely
			return decodeURIComponent(value || '')
		} catch {
			// If decoding fails, return the original value
			return value || ''
		}
	},
}

// --- Custom parser for dates that prevents 'undefined' strings in URLs 📅
const parseAsDateString = {
	...parseAsString,
	serialize: (value: string | null) => {
		// If value is null, undefined, empty string, or the string "undefined", don't serialize it
		if (!value || value === 'undefined' || value === 'null') {
			return null
		}
		return value
	},
	parse: (value: string) => {
		// If value is the string "undefined", "null", empty, or invalid date format, return null
		if (!value || value === 'undefined' || value === 'null' || value.trim() === '') {
			return null
		}
		// Basic date format validation (YYYY-MM-DD)
		const datePattern = /^\d{4}-\d{2}-\d{2}$/
		if (!datePattern.test(value)) {
			return null
		}
		return value
	},
}

// --- Custom parser for numbers that prevents 'undefined', 'NaN', and invalid values 💰
const parseAsSafeFloat = {
	...parseAsFloat,
	serialize: (value: number) => {
		// Don't serialize invalid numbers
		if (isNaN(value) || !isFinite(value)) {
			return null
		}
		return value.toString()
	},
	parse: (value: string) => {
		// Handle 'undefined' and other invalid strings
		if (!value || value === 'undefined' || value === 'null' || value === 'NaN') {
			return null
		}
		const parsed = parseFloat(value)
		// Return null for invalid numbers instead of NaN
		if (isNaN(parsed) || !isFinite(parsed)) {
			return null
		}
		return parsed
	},
}

// --- Main client component for the marketplace grid and filters 🖼️

export default function MarketplaceClient({ locale, bibs }: Readonly<MarketplaceClientProps>) {
	const translations = getTranslations(locale, marketplaceTranslations)
	// --- Query state management with URL sync using nuqs 🔗
	const [
		{ sport, sort, search, priceMin, priceMax, geography, distanceMin, distanceMax, distance, dateStart, dateEnd },
		setFilters,
	] = useQueryStates(
		{
			sport: parseAsString, // null when not set, string when set
			sort: parseAsStringLiteral(['date', 'distance', 'price-asc', 'price-desc'] as const).withDefault('date'),
			search: parseAsSearchString.withDefault(''), // Use custom parser for search
			priceMin: parseAsSafeFloat.withDefault(0), // Use safe parser to prevent 'undefined' in URLs
			priceMax: parseAsSafeFloat.withDefault(Infinity), // Use safe parser to prevent 'undefined' in URLs
			geography: parseAsArrayOf(parseAsString, ',').withDefault([]),
			distanceMin: parseAsSafeFloat.withDefault(0), // Use safe parser for consistency
			distanceMax: parseAsSafeFloat.withDefault(Infinity), // Use safe parser for consistency
			distance: parseAsString, // null when not set, string when set - kept for backward compatibility
			dateStart: parseAsDateString, // Use custom parser for dates to prevent 'undefined' strings
			dateEnd: parseAsDateString, // Use custom parser for dates to prevent 'undefined' strings
		},
		{
			history: 'push', // Use push for better UX
		}
	)

	// --- Extract unique locations from bibs for the region filter 🗺️
	const uniqueLocations = Array.from(new Set(bibs.map(bib => bib.event.location))).sort((a, b) => a.localeCompare(b)) // Unique, sorted list of locations 📍

	// --- Extract the min/max price from bibs for the price slider 💰
	const maxPrice = Math.max(...bibs.map(bib => bib.price), 0) // Maximum price for slider 💸
	const minPrice = Math.min(...bibs.map(bib => bib.price), 0) // Minimum price for slider 💰

	// --- Extract the maximum distance from bibs for the distance slider 📏
	const maxDistance = Math.max(...bibs.map(bib => bib.event.distance), 0) // Maximum distance for slider 🏃

	// --- Initialize price and distance range with actual min/max values when first loading
	React.useEffect(() => {
		const needsPriceInit = bibs.length > 0 && (priceMax === Infinity || priceMax == null)
		const needsDistanceInit = bibs.length > 0 && (distanceMax === Infinity || distanceMax == null)
		
		// Also handle cases where values were undefined/null from URL
		const needsPriceCleanup = priceMin == null || priceMax == null
		const needsDistanceCleanup = distanceMin == null || distanceMax == null

		if (needsPriceInit || needsDistanceInit || needsPriceCleanup || needsDistanceCleanup) {
			const updates: { priceMin?: number; priceMax?: number; distanceMin?: number; distanceMax?: number } = {}

			if (needsPriceInit || needsPriceCleanup) {
				const calculatedMinPrice = Math.min(...bibs.map(bib => bib.price), 0)
				const calculatedMaxPrice = Math.max(...bibs.map(bib => bib.price), 0)
				updates.priceMin = priceMin ?? calculatedMinPrice
				updates.priceMax = priceMax === Infinity || priceMax == null ? calculatedMaxPrice : priceMax
			}

			if (needsDistanceInit || needsDistanceCleanup) {
				const calculatedMaxDistance = Math.max(...bibs.map(bib => bib.event.distance), 0)
				updates.distanceMin = distanceMin ?? 0
				updates.distanceMax = distanceMax === Infinity || distanceMax == null ? calculatedMaxDistance : distanceMax
			}

			void setFilters(updates)
		}
	}, [bibs.length, priceMax, distanceMax, priceMin, distanceMin, setFilters])

	// --- Handler function for sidebar filters 🔗
	const handleFiltersChange = React.useCallback(
		(sidebarFilters: Partial<MarketplaceFilters>) => {
			void setFilters(sidebarFilters)
		},
		[setFilters]
	)

	const handleSortChange = React.useCallback(
		(sortOption: string) => {
			void setFilters({ sort: sortOption as 'date' | 'distance' | 'price-asc' | 'price-desc' })
		},
		[setFilters]
	)

	// --- Handler for search input that safely handles special characters 🔍
	const handleSearchChange = useCallback(
		(inputValue: string) => {
			// Trim whitespace and ensure safe handling of special characters
			const sanitizedValue = inputValue.trim()
			void setFilters({ search: sanitizedValue })
		},
		[setFilters]
	)

	// --- Handler for removing individual filters 🔗
	const handleRemoveFilter = React.useCallback(
		(type: string, value?: string) => {
			switch (type) {
				case 'sport':
					void setFilters({ sport: null })
					break
				case 'distance':
					void setFilters({ distance: null })
					break
				case 'distanceRange':
					void setFilters({ distanceMin: 0, distanceMax: maxDistance })
					break
				case 'price':
					void setFilters({ priceMin: minPrice, priceMax: maxPrice })
					break
				case 'geography':
					if (value != null && value !== undefined && value !== '') {
						const newGeography = geography.filter(loc => loc !== value)
						void setFilters({ geography: newGeography })
					}
					break
				case 'dateStart':
					void setFilters({ dateStart: null })
					break
				case 'dateEnd':
					void setFilters({ dateEnd: null })
					break
			}
		},
		[setFilters, geography, minPrice, maxPrice, maxDistance]
	)

	// --- Fuse.js instance for fuzzy search on bibs (name, location, type) ✨
	const fuse = useMemo(
		() =>
			new Fuse(bibs, {
				threshold: 0.4,
				keys: ['event.name', 'event.location', 'event.type'],
			}),
		[bibs]
	)

	// --- Memoized filtered and sorted bibs to avoid unnecessary recalculations 🧠
	const filteredAndSortedBibs = useMemo(() => {
		let filtered = bibs

		// --- Fuzzy search with Fuse.js on search term 🔍
		if (search && search.trim() !== '') {
			// Ensure search term is properly handled for fuzzy search
			const searchTerm = search.trim()
			const fuseResults = fuse.search(searchTerm)
			filtered = fuseResults.map(result => result.item)
		}

		// --- Filter by selected sport 🏅
		if (sport != null && sport !== undefined && sport !== 'all') {
			filtered = filtered.filter(bib => bib.event.type === sport)
		}

		// --- Filter by selected distance 📏
		if (distance != null && distance !== undefined && distance !== 'all') {
			const [minDistance, maxDistanceRange] = getDistanceRange(distance)
			filtered = filtered.filter(bib => {
				const eventDistance = bib.event.distance
				return eventDistance >= minDistance && eventDistance <= maxDistanceRange
			})
		}

		// --- Filter by distance range slider 📏
		const safeDistanceMin = distanceMin ?? 0
		const safeDistanceMax = distanceMax ?? Infinity
		filtered = filtered.filter(bib => bib.event.distance >= safeDistanceMin && bib.event.distance <= safeDistanceMax)

		// --- Filter by price range 💰
		const safePriceMin = priceMin ?? 0
		const safePriceMax = priceMax ?? Infinity
		filtered = filtered.filter(bib => bib.price >= safePriceMin && bib.price <= safePriceMax)

		// --- Filter by region (geography) 🗺️
		if (geography.length > 0) {
			filtered = filtered.filter(bib => geography.includes(bib.event.location.toLowerCase()))
		}

		// --- Filter by start date 📅
		if (dateStart != null && dateStart !== undefined && dateStart !== '' && dateStart !== 'undefined') {
			const start = new Date(dateStart)
			// Also validate that the date is valid
			if (!isNaN(start.getTime())) {
				filtered = filtered.filter(bib => new Date(bib.event.date) >= start)
			}
		}

		// --- Filter by end date 📅
		if (dateEnd != null && dateEnd !== undefined && dateEnd !== '' && dateEnd !== 'undefined') {
			const end = new Date(dateEnd)
			// Also validate that the date is valid
			if (!isNaN(end.getTime())) {
				filtered = filtered.filter(bib => new Date(bib.event.date) <= end)
			}
		}

		// --- Sort the filtered bibs 🔄
		return sortBibs(filtered, sort)
	}, [
		bibs,
		search,
		sport,
		distance,
		distanceMin,
		distanceMax,
		sort,
		priceMin,
		priceMax,
		geography,
		dateStart,
		dateEnd,
		fuse,
	])

	// --- Main render: classic layout with search bar at top and sidebar 🖼️
	return (
		<div className="bg-background">
			{/* Search bar at the top */}
			<div className="border-border bg-card/80 border-b p-6">
				<div className="w-full">
					<div className="relative">
						<Search className="text-muted-foreground absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform" />
						<Input
							className="pl-10 text-sm"
							placeholder={translations.searchPlaceholder ?? 'Quick search by name, location, sport...'}
							value={search}
							onChange={e => handleSearchChange(e.target.value)}
						/>
					</div>
					{/* Mobile-only Filters button (outside relative container to keep icon centered) */}
					<div className="mt-3 block sm:hidden">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline" className="w-full">
									{translations.filtersButton ?? 'Filters'}
								</Button>
							</DialogTrigger>
							<DialogContent className="p-0 sm:max-w-[90vw]">
								<DialogHeader className="px-4 py-3">
									<DialogTitle>{translations.filtersTitle ?? 'Filters'}</DialogTitle>
								</DialogHeader>
								<div className="max-h-[80vh] overflow-y-auto p-4">
									<MarketplaceSidebar
										locale={locale}
										minPrice={minPrice}
										maxPrice={maxPrice}
										maxDistance={maxDistance}
										filters={{
											sport,
											priceMin: priceMin ?? 0,
											priceMax: priceMax ?? maxPrice,
											geography,
											distanceMin: distanceMin ?? 0,
											distanceMax: distanceMax ?? maxDistance,
											distance,
											dateStart: dateStart && dateStart !== 'undefined' ? dateStart : undefined,
											dateEnd: dateEnd && dateEnd !== 'undefined' ? dateEnd : undefined,
										}}
										onFiltersChange={handleFiltersChange}
										regions={uniqueLocations}
									/>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</div>

			{/* Active filters badges - take full width and align left */}
			<ActiveFiltersBadges
				filters={{
					sport,
					priceMin: priceMin ?? 0,
					priceMax: priceMax ?? maxPrice,
					geography,
					distanceMin: distanceMin ?? 0,
					distanceMax: distanceMax ?? maxDistance,
					distance,
					dateStart: dateStart && dateStart !== 'undefined' ? dateStart : undefined,
					dateEnd: dateEnd && dateEnd !== 'undefined' ? dateEnd : undefined,
				}}
				minPrice={minPrice}
				maxPrice={maxPrice}
				maxDistance={maxDistance}
				onRemoveFilter={handleRemoveFilter}
				locale={locale}
			/>

			{/* Main content with sidebar and results */}
			<div className="w-full p-6">
				<div className="flex gap-8">
					{/* Sidebar with filters */}
					<div className="hidden w-80 flex-shrink-0 sm:block">
						<MarketplaceSidebar
							locale={locale}
							minPrice={minPrice}
							maxPrice={maxPrice}
							maxDistance={maxDistance}
							filters={{
								sport,
								priceMin: priceMin ?? 0,
								priceMax: priceMax ?? maxPrice,
								geography,
								distanceMin: distanceMin ?? 0,
								distanceMax: distanceMax ?? maxDistance,
								distance,
								dateStart: dateStart && dateStart !== 'undefined' ? dateStart : undefined,
								dateEnd: dateEnd && dateEnd !== 'undefined' ? dateEnd : undefined,
							}}
							onFiltersChange={handleFiltersChange}
							regions={uniqueLocations}
						/>
					</div>

					{/* Main content area */}
					<div className="min-w-0 flex-1">
						<div className="space-y-6">
							{/* OfferCounter displays the number of results and the sort selector 🔢 */}
							<OfferCounter
								count={filteredAndSortedBibs.length}
								onSortChange={handleSortChange}
								sortValue={sort}
								locale={locale}
							/>

							{/* Grid of bib cards, responsive layout 🖼️ */}
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
								{filteredAndSortedBibs.map(bib => (
									<CardMarket bibSale={bib} key={bib.id} locale={locale} />
								))}
							</div>

							{/* Empty state when no results */}
							{filteredAndSortedBibs.length === 0 && <EmptyResultsRive locale={locale} />}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
