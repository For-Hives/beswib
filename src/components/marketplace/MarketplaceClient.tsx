'use client'

import React, { useMemo } from 'react'

import { parseAsArrayOf, parseAsFloat, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import Fuse from 'fuse.js'

import type { BibSale } from '@/components/marketplace/CardMarket'

import { Search } from 'lucide-react'

import { Input } from '@/components/ui/inputAlt'
import ActiveFiltersBadges from '@/components/marketplace/ActiveFiltersBadges'
import OfferCounter from '@/components/marketplace/offerCounter'
import CardMarket from '@/components/marketplace/CardMarket'
import MarketplaceSidebar, { type MarketplaceFilters } from '@/components/marketplace/MarketplaceSidebar'
import { Locale } from '@/lib/i18n-config'

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

// --- Main client component for the marketplace grid and filters 🖼️

export default function MarketplaceClient({ locale, bibs }: Readonly<MarketplaceClientProps>) {
	// --- Query state management with URL sync using nuqs 🔗
	const [{ sport, sort, search, priceMin, priceMax, geography, distance, dateStart, dateEnd }, setFilters] =
		useQueryStates(
			{
				sport: parseAsString, // null when not set, string when set
				sort: parseAsStringLiteral(['date', 'distance', 'price-asc', 'price-desc'] as const).withDefault('date'),
				search: parseAsString.withDefault(''),
				priceMin: parseAsFloat.withDefault(0),
				priceMax: parseAsFloat.withDefault(500),
				geography: parseAsArrayOf(parseAsString, ',').withDefault([]),
				distance: parseAsString, // null when not set, string when set
				dateStart: parseAsString, // ISO date string or null
				dateEnd: parseAsString, // ISO date string or null
			},
			{
				history: 'push', // Use push for better UX
			}
		)

	// --- Extract unique locations from bibs for the region filter 🗺️
	const uniqueLocations = Array.from(new Set(bibs.map(bib => bib.event.location))).sort((a, b) => a.localeCompare(b)) // Unique, sorted list of locations 📍

	// --- Extract the maximum price from bibs for the price slider 💰
	const maxPrice = Math.max(...bibs.map(bib => bib.price), 0) // Maximum price for slider 💸

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
				case 'price':
					void setFilters({ priceMin: 0, priceMax: maxPrice })
					break
				case 'geography':
					if (value !== null && value !== undefined && value !== '') {
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
		[setFilters, geography, maxPrice]
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
		if (search !== '') {
			const fuseResults = fuse.search(search)
			filtered = fuseResults.map(result => result.item)
		}

		// --- Filter by selected sport 🏅
		if (sport !== null && sport !== undefined && sport !== 'all') {
			filtered = filtered.filter(bib => bib.event.type === sport)
		}

		// --- Filter by selected distance 📏
		if (distance !== null && distance !== undefined && distance !== 'all') {
			const [minDistance, maxDistance] = getDistanceRange(distance)
			filtered = filtered.filter(bib => {
				const eventDistance = bib.event.distance
				return eventDistance >= minDistance && eventDistance <= maxDistance
			})
		}

		// --- Filter by price range 💰
		filtered = filtered.filter(bib => bib.price >= priceMin && bib.price <= priceMax)

		// --- Filter by region (geography) 🗺️
		if (geography.length > 0) {
			filtered = filtered.filter(bib => geography.includes(bib.event.location.toLowerCase()))
		}

		// --- Filter by start date 📅
		if (dateStart !== null && dateStart !== undefined && dateStart !== '') {
			const start = new Date(dateStart)
			filtered = filtered.filter(bib => new Date(bib.event.date) >= start)
		}

		// --- Filter by end date 📅
		if (dateEnd !== null && dateEnd !== undefined && dateEnd !== '') {
			const end = new Date(dateEnd)
			filtered = filtered.filter(bib => new Date(bib.event.date) <= end)
		}

		// --- Sort the filtered bibs 🔄
		return sortBibs(filtered, sort)
	}, [bibs, search, sport, distance, sort, priceMin, priceMax, geography, dateStart, dateEnd, fuse])

	// --- Main render: classic layout with search bar at top and sidebar 🖼️
	return (
		<div className="bg-background">
			{/* Search bar at the top */}
			<div className="border-border bg-card/80 border-b p-6">
				<div className="max-w-7xl">
					<div className="relative">
						<Search className="text-muted-foreground absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform" />
						<Input
							className="pl-10 text-sm"
							placeholder="Quick search by name, location, sport..."
							value={search}
							onChange={e => void setFilters({ search: e.target.value })}
						/>
					</div>
				</div>
			</div>

			{/* Active filters badges */}
			<ActiveFiltersBadges
				filters={{
					sport,
					distance,
					priceMin,
					priceMax,
					geography,
					dateStart: dateStart ?? undefined,
					dateEnd: dateEnd ?? undefined,
				}}
				maxPrice={maxPrice}
				onRemoveFilter={handleRemoveFilter}
			/>

			{/* Main content with sidebar and results */}
			<div className="w-full p-6">
				<div className="flex gap-8">
					{/* Sidebar with filters */}
					<div className="w-80 flex-shrink-0">
						<MarketplaceSidebar
							locale={locale}
							maxPrice={maxPrice}
							filters={{
								sport,
								distance,
								priceMin,
								priceMax,
								geography,
								dateStart: dateStart ?? undefined,
								dateEnd: dateEnd ?? undefined,
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
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
								{filteredAndSortedBibs.map(bib => (
									<CardMarket bibSale={bib} key={bib.id} locale={locale} />
								))}
							</div>

							{/* Empty state when no results */}
							{filteredAndSortedBibs.length === 0 && (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<div className="bg-muted mb-4 rounded-full p-6">
										<svg
											className="text-muted-foreground h-12 w-12"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 0a4 4 0 104 4h-6a4 4 0 100-8zm6 0V9a4 4 0 10-8 0v3"
											/>
										</svg>
									</div>
									<h3 className="text-foreground mb-2 text-lg font-semibold">No bibs found</h3>
									<p className="text-muted-foreground max-w-md">
										Try adjusting your filters or search terms to find more bibs that match your criteria.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
