'use client'

import { MapPin, Users, Search, ShoppingCart, Bell, Route, Mountain, Loader2 } from 'lucide-react'
import React, { useMemo, useState, useEffect } from 'react'

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { useRouter } from 'next/navigation'
import { DateTime } from 'luxon'
import Fuse from 'fuse.js'

import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'
import type { User } from '@/models/user.model'

import { TriathlonIcon, TrailIcon, RouteIcon, CycleIcon, AllTypesIcon } from '@/components/icons/RaceTypeIcons'
import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import SpotlightCard from '@/components/bits/SpotlightCard/SpotlightCard'
import { fetchAvailableBibsForEvent } from '@/services/bib.services'
import { formatDateObjectForDisplay } from '@/lib/utils/date'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Timeline } from '@/components/ui/timeline'
import { Input } from '@/components/ui/inputAlt'

import Translations from './locales.json'

interface EventTranslations {
	events?: {
		eventCard?: {
			viewDetails?: string
			bibsAvailable?: string
			soldOut?: string
			checkBibs?: string
			viewBibs?: string
			joinWaitlist?: string
			fromPrice?: string
			elevationGain?: string
		}
		filters?: {
			all?: string
			location?: string
			date?: string
			category?: string
			price?: string
			participants?: string
			distance?: string
			allCities?: string
			sortPlaceholder?: string
			sortByDate?: string
			sortByPrice?: string
			sortByParticipants?: string
			sortByDistance?: string
			priceRanges?: {
				low?: string
				medium?: string
				high?: string
				veryHigh?: string
			}
			participantRanges?: {
				small?: string
				medium?: string
				large?: string
				veryLarge?: string
			}
			distanceRanges?: {
				short?: string
				halfMarathon?: string
				marathon?: string
				ultra?: string
				veryLong?: string
			}
		}
		raceTypes?: Record<string, string>
		groupLabels?: {
			unknownDate?: string
			unknownPrice?: string
			unknownParticipants?: string
			unknownDistance?: string
		}
		searchPlaceholder?: string
		searchCityPlaceholder?: string
	}
}

interface EventsPageProps {
	prefetchedEvents: Event[]
	locale: string
}

const eventTypeColors = {
	triathlon: 'bg-purple-500/15 border-purple-500/50 text-purple-400',
	trail: 'bg-yellow-500/15 border-yellow-500/50 text-yellow-400',
	road: 'bg-blue-500/15 border-blue-500/50 text-blue-400',
	cycle: 'bg-red-500/15 border-red-500/50 text-red-400',
} as const

const eventTypeColorsDisabled = {
	triathlon: 'opacity-25',
	trail: 'opacity-25',
	road: 'opacity-25',
	cycle: 'opacity-25',
} as const

// Labels for types are now translated from locales via t.events.raceTypes

const eventTypeIcons = {
	triathlon: <TriathlonIcon className="h-5 w-5" />,
	trail: <TrailIcon className="h-5 w-5" />,
	road: <RouteIcon className="h-5 w-5" />,
	cycle: <CycleIcon className="h-5 w-5" />,
} as const

// Moved out to avoid defining components inside components (react/no-unstable-nested-components)
function EventCard({
	t,
	onAction,
	locale,
	event,
	bibsCount,
	bibsData,
}: {
	event: Event
	locale: string
	bibsCount: number | undefined
	bibsData?: (Bib & { expand?: { eventId: Event; sellerUserId: User } })[]
	onAction: (event: Event) => void | Promise<void>
	t: EventTranslations
}) {
	return (
		<SpotlightCard className="h-full">
			<div className="flex h-full flex-col">
				<div className="mb-3 flex items-center justify-between">
					<span
						className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${eventTypeColors[event.typeCourse]}`}
					>
						{eventTypeIcons[event.typeCourse]}
						{(t.events?.raceTypes as Record<string, string>)?.[event.typeCourse] || event.typeCourse.toUpperCase()}
					</span>
					<span className="text-muted-foreground text-xs">{formatDateObjectForDisplay(event.eventDate, locale)}</span>
				</div>

				<h3 className="text-foreground mb-3 line-clamp-2 text-xl font-bold" title={event.name}>
					{event.name}
				</h3>

				<div className="text-muted-foreground mb-4 flex flex-col gap-2 text-sm">
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4" />
						<span>{event.location}</span>
					</div>

					<div className="flex items-center gap-4">
						{event.distanceKm != null && (
							<div className="flex items-center gap-1">
								<Route className="h-4 w-4" />
								<span>{event.distanceKm}km</span>
							</div>
						)}
						{event.participants != null && (
							<div className="flex items-center gap-1">
								<Users className="h-4 w-4" />
								<span>{event.participants}</span>
							</div>
						)}
					</div>

					{event.elevationGainM != null && (
						<div className="flex items-center gap-2">
							<Mountain className="h-4 w-4" />
							<span>
								{event.elevationGainM}m {t.events?.eventCard?.elevationGain ?? 'D+'}
							</span>
						</div>
					)}
				</div>

				<div className="mt-auto">
					{(() => {
						// Calculate price to display: lowest bib price if available, otherwise default event price
						let priceToDisplay = event.officialStandardPrice
						
						if (bibsData && bibsData.length > 0) {
							// Get the lowest price from available bibs
							const lowestBibPrice = Math.min(...bibsData.map(bib => bib.price))
							priceToDisplay = lowestBibPrice
						}
						
						return priceToDisplay != null ? (
							<div className="mb-3 text-right">
								<span className="text-lg font-bold text-emerald-600 dark:text-green-400">
									{t.events?.eventCard?.fromPrice?.replace('{price}', priceToDisplay.toString()) ??
										`From ${priceToDisplay}€`}
								</span>
							</div>
						) : null
					})()}
					<button
						onClick={() => void onAction(event)}
						className="bg-primary/20 text-primary hover:bg-primary/30 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
					>
						{bibsCount !== undefined ? (
							bibsCount > 0 ? (
								<>
									<ShoppingCart className="h-4 w-4" />
									{t.events?.eventCard?.viewBibs?.replace('{count}', bibsCount.toString()) ??
										`View bibs (${bibsCount})`}
								</>
							) : (
								<>
									<Bell className="h-4 w-4" />
									{t.events?.eventCard?.joinWaitlist ?? 'Join waitlist'}
								</>
							)
						) : (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								{t.events?.eventCard?.checkBibs ?? 'Check bibs...'}
							</>
						)}
					</button>
				</div>
			</div>
		</SpotlightCard>
	)
}

export default function EventsPage({ prefetchedEvents, locale }: EventsPageProps) {
	// State and translation variables
	const t = getTranslations(locale, Translations)
	const router = useRouter()

	// useQueryStates for filter state management via URL
	const [query, setQuery] = useQueryStates(
		{
			type: parseAsStringLiteral(['all', 'triathlon', 'trail', 'road', 'cycle'] as const).withDefault('all'),
			sort: parseAsStringLiteral(['date', 'price', 'participants', 'distance'] as const).withDefault('date'),
			search: parseAsString.withDefault(''),
			location: parseAsString.withDefault(''),
		},
		{ history: 'push' }
	)

	const searchTerm = query.search
	const selectedType = query.type
	const sortBy = query.sort
	const selectedLocation = query.location

	// Sort options for SelectAnimated
	const sortOptions: SelectOption[] = [
		{ value: 'date', label: t.events?.filters?.sortByDate ?? 'Trier par date' },
		{ value: 'price', label: t.events?.filters?.sortByPrice ?? 'Trier par prix' },
		{ value: 'participants', label: t.events?.filters?.sortByParticipants ?? 'Trier par participants' },
		{ value: 'distance', label: t.events?.filters?.sortByDistance ?? 'Trier par distance' },
	]

	// Handlers for filter changes
	const handleSearchChange = (val: string) => {
		void setQuery({ search: val })
	}
	const handleTypeChange = (val: 'all' | 'triathlon' | 'trail' | 'road' | 'cycle') => {
		void setQuery({ type: val })
	}
	const handleSortChange = (val: string) => {
		// Intentionally not awaiting - this is a fire-and-forget operation
		void setQuery({ sort: val as 'date' | 'price' | 'participants' | 'distance' })
	}
	const handleLocationChange = (val: string) => {
		void setQuery({ location: val })
	}

	// Extract unique locations for the filter from future events only
	const uniqueLocations = Array.from(new Set(futureEvents.map(event => event.location))).sort((a, b) =>
		a.localeCompare(b)
	)

	// State for location autocomplete
	const [locationSearch, setLocationSearch] = useState('')
	const [showLocationDropdown, setShowLocationDropdown] = useState(false)

	// State to track bibs availability for each event
	const [eventBibsCache, setEventBibsCache] = useState<Record<string, number>>({})
	// State to store actual bib data for price calculation
	const [eventBibsData, setEventBibsData] = useState<Record<string, (Bib & { expand?: { eventId: Event; sellerUserId: User } })[]>>({})

	// Fuse.js instance for fuzzy search on events
	const fuse = useMemo(
		() =>
			new Fuse(prefetchedEvents, {
				threshold: 0.4,
				keys: ['name', 'location', 'typeCourse'],
			}),
		[prefetchedEvents]
	)

	// Fuse.js instance for location autocomplete
	const locationFuse = useMemo(() => new Fuse(uniqueLocations, { threshold: 0.4 }), [uniqueLocations])

	// Filtered locations for autocomplete
	const filteredLocations = locationSearch
		? locationFuse.search(locationSearch).map(result => result.item)
		: uniqueLocations.slice(0, 10)

	// Filter out past events first
	const futureEvents = useMemo(() => {
		const now = DateTime.now()
		return prefetchedEvents.filter(event => {
			const eventDate = (() => {
				if (event.eventDate instanceof Date) {
					const dt = DateTime.fromJSDate(event.eventDate)
					return dt.isValid ? dt : null
				}
				if (typeof event.eventDate === 'string' || typeof event.eventDate === 'number') {
					const iso = DateTime.fromISO(String(event.eventDate))
					if (iso.isValid) return iso
					const js = DateTime.fromJSDate(new Date(event.eventDate))
					return js.isValid ? js : null
				}
				return null
			})()
			
			// Only include events that are in the future or today
			return eventDate ? eventDate >= now.startOf('day') : true
		})
	}, [prefetchedEvents])

	// Filtering and sorting logic
	const filteredEvents = useMemo(() => {
		let filtered = futureEvents

		// Fuzzy search with Fuse.js
		if (searchTerm !== '') {
			const fuseResults = fuse.search(searchTerm)
			filtered = fuseResults.map(result => result.item).filter(item => futureEvents.includes(item))
		}

		// Filter by type
		if (selectedType !== 'all') {
			filtered = filtered.filter(event => event.typeCourse === selectedType)
		}

		// Filter by location
		if (selectedLocation !== '') {
			filtered = filtered.filter(event => event.location.toLowerCase().includes(selectedLocation.toLowerCase()))
		}

		return filtered
	}, [searchTerm, selectedType, selectedLocation, futureEvents, fuse])

	const sortedEvents = useMemo(() => {
		const parseEventDate = (value: unknown): DateTime | null => {
			if (value instanceof Date) {
				const dt = DateTime.fromJSDate(value)
				return dt.isValid ? dt : null
			}
			if (typeof value === 'string' || typeof value === 'number') {
				const iso = DateTime.fromISO(String(value))
				if (iso.isValid) return iso
				const js = DateTime.fromJSDate(new Date(value))
				return js.isValid ? js : null
			}
			return null
		}

		return [...filteredEvents].sort((a, b) => {
			switch (sortBy) {
				case 'date': {
					const da = parseEventDate(a.eventDate)
					const db = parseEventDate(b.eventDate)
					if (da != null && db != null) return da.toMillis() - db.toMillis()
					if (da != null && db == null) return -1
					if (da == null && db != null) return 1
					return 0
				}
				case 'price':
					return (a.officialStandardPrice ?? 0) - (b.officialStandardPrice ?? 0)
				case 'participants':
					return (b.participants ?? 0) - (a.participants ?? 0)
				case 'distance':
					return (a.distanceKm ?? 0) - (b.distanceKm ?? 0)
				default:
					return 0
			}
		})
	}, [filteredEvents, sortBy])

	// Grouping helpers
	type GroupSections = Array<{ title: string; events: Event[] }>

	const getMonthKey = (dt: DateTime) => dt.toFormat('yyyy-LL')

	const getMonthLabel = (dt: DateTime) => dt.setLocale(locale).toFormat('LLLL yyyy')

	const buildRangeGrouper = <T extends number | null | undefined>(
		getValue: (e: Event) => T,
		ranges: Array<{ label: string; test: (v: number) => boolean }>,
		unknownLabel: string
	): GroupSections => {
		const groups: Record<string, Event[]> = {}
		for (const r of ranges) groups[r.label] = []
		groups[unknownLabel] = []

		for (const event of sortedEvents) {
			const raw = getValue(event)
			if (raw == null) {
				groups[unknownLabel].push(event)
				continue
			}
			const value = Number(raw)
			const bucket = ranges.find(r => r.test(value))?.label
			if (bucket != null) groups[bucket].push(event)
		}

		return Object.entries(groups)
			.filter(([, list]) => (list?.length ?? 0) > 0)
			.map(([title, list]) => ({ title, events: list }))
	}

	// Build grouped sections based on selected sort
	const groupedSections: GroupSections = useMemo(() => {
		if (sortBy === 'date') {
			const byMonth: Record<string, Event[]> = {}
			const unknown: Event[] = []
			for (const event of sortedEvents) {
				const parsed = (() => {
					if (event.eventDate instanceof Date) {
						const dt = DateTime.fromJSDate(event.eventDate)
						return dt.isValid ? dt : null
					}
					const asStr = String(event.eventDate)
					const iso = DateTime.fromISO(asStr)
					if (iso.isValid) return iso
					const js = DateTime.fromJSDate(new Date(asStr))
					return js.isValid ? js : null
				})()

				if (parsed == null) {
					unknown.push(event)
					continue
				}
				const key = getMonthKey(parsed)
				byMonth[key] ??= []
				byMonth[key].push(event)
			}
			const sections: GroupSections = Object.entries(byMonth).map(([key, list]) => {
				const dt = DateTime.fromFormat(key, 'yyyy-LL')
				const label = getMonthLabel(dt)
				return { title: label, events: list }
			})
			if (unknown.length > 0)
				sections.push({ title: t.events?.groupLabels?.unknownDate ?? 'Unknown date', events: unknown })
			return sections
		}

		if (sortBy === 'price') {
			return buildRangeGrouper(
				e => e.officialStandardPrice ?? null,
				[
					{ test: v => v >= 0 && v < 20, label: t.events?.filters?.priceRanges?.low ?? '0€ – 20€' },
					{ test: v => v >= 20 && v < 50, label: t.events?.filters?.priceRanges?.medium ?? '20€ – 50€' },
					{ test: v => v >= 50 && v < 100, label: t.events?.filters?.priceRanges?.high ?? '50€ – 100€' },
					{ test: v => v >= 100, label: t.events?.filters?.priceRanges?.veryHigh ?? '100€+' },
				],
				t.events?.groupLabels?.unknownPrice ?? 'Unknown price'
			)
		}

		if (sortBy === 'participants') {
			return buildRangeGrouper(
				e => e.participants ?? null,
				[
					{ test: v => v <= 100, label: t.events?.filters?.participantRanges?.small ?? '≤ 100 participants' },
					{ test: v => v > 100 && v <= 500, label: t.events?.filters?.participantRanges?.medium ?? '100 – 500' },
					{ test: v => v > 500 && v <= 1000, label: t.events?.filters?.participantRanges?.large ?? '500 – 1 000' },
					{ test: v => v > 1000, label: t.events?.filters?.participantRanges?.veryLarge ?? '1 000+' },
				],
				t.events?.groupLabels?.unknownParticipants ?? 'Unknown participants'
			)
		}

		// distance
		return buildRangeGrouper(
			e => e.distanceKm ?? null,
			[
				{ test: v => v <= 10, label: t.events?.filters?.distanceRanges?.short ?? '≤ 10 km' },
				{ test: v => v > 10 && v <= 21, label: t.events?.filters?.distanceRanges?.halfMarathon ?? '10 – 21 km' },
				{ test: v => v > 21 && v <= 42, label: t.events?.filters?.distanceRanges?.marathon ?? '21 – 42 km' },
				{ test: v => v > 42 && v <= 100, label: t.events?.filters?.distanceRanges?.ultra ?? '42 – 100 km' },
				{ test: v => v > 100, label: t.events?.filters?.distanceRanges?.veryLong ?? '100 km+' },
			],
			t.events?.groupLabels?.unknownDistance ?? 'Unknown distance'
		)
	}, [sortedEvents, sortBy, locale])

	// Race type summary cards as quick-access buttons - dynamically generated from actual events
	const raceTypeSummary = useMemo(() => {
		// Get unique event types from actual future events
		const uniqueTypes = Array.from(new Set(futureEvents.map(e => e.typeCourse)))

		// Start with "all" option
		const summary = [
			{
				label: (t.events?.raceTypes as Record<string, string>)?.all ?? 'All',
				key: 'all',
				icon: <AllTypesIcon className="h-5 w-5" />,
				count: futureEvents.length,
				colorDisabled: 'opacity-25',
				color: 'bg-muted/80 border-border text-muted-foreground',
			},
		]

		// Add categories that actually exist in the data
		uniqueTypes.forEach(type => {
			if ((t.events?.raceTypes as Record<string, string>)?.[type] && eventTypeColors[type]) {
				summary.push({
					label: (t.events?.raceTypes as Record<string, string>)?.[type] || type.toUpperCase(),
					key: type,
					icon: eventTypeIcons[type],
					count: futureEvents.filter(e => e.typeCourse === type).length,
					colorDisabled: eventTypeColorsDisabled[type],
					color: eventTypeColors[type],
				})
			}
		})

		return summary
	}, [futureEvents])

	// Pre-load bib counts for the first 16 sorted events (stable regardless of grouping)
	useEffect(() => {
		const loadBibCounts = async () => {
			const eventsToLoad = sortedEvents.slice(0, 16)

			const promises = eventsToLoad.map(async event => {
				if (eventBibsCache[event.id] === undefined) {
					try {
						const availableBibs = await fetchAvailableBibsForEvent(event.id)
						return { 
							count: { [event.id]: availableBibs.length },
							data: { [event.id]: availableBibs }
						}
					} catch (error) {
						console.error('Error loading bibs for event:', event.id, error)
						return { 
							count: { [event.id]: 0 },
							data: { [event.id]: [] }
						}
					}
				}
				return { count: {}, data: {} }
			})

			const results = await Promise.all(promises)
			const newCountCache = results.reduce((acc, curr) => ({ ...acc, ...curr.count }), {})
			const newDataCache = results.reduce((acc, curr) => ({ ...acc, ...curr.data }), {})

			if (Object.keys(newCountCache).length > 0) {
				setEventBibsCache(prev => ({ ...prev, ...newCountCache }))
			}
			if (Object.keys(newDataCache).length > 0) {
				setEventBibsData(prev => ({ ...prev, ...newDataCache }))
			}
		}

		void loadBibCounts()
	}, [sortedEvents, eventBibsCache])

	// Function to get bib count for an event (with caching)
	const getBibCountForEvent = async (eventId: string): Promise<number> => {
		if (eventBibsCache[eventId] !== undefined) {
			return eventBibsCache[eventId]
		}

		try {
			const availableBibs = await fetchAvailableBibsForEvent(eventId)
			const count = availableBibs.length
			setEventBibsCache(prev => ({ ...prev, [eventId]: count }))
			return count
		} catch (error) {
			console.error('Error fetching bibs for event:', error)
			return 0
		}
	}

	// Function to handle event button clicks
	const handleEventAction = async (event: Event) => {
		try {
			const bibCount = await getBibCountForEvent(event.id)

			if (bibCount > 0) {
				// Redirect to marketplace with filters for this specific event
				const searchParams = new URLSearchParams({
					sport: encodeURIComponent(event.typeCourse), // Filter by sport type
					search: encodeURIComponent(event.name), // Search by event name
					geography: event.location ? encodeURIComponent(event.location.toLowerCase()) : '', // Filter by location
				})
				router.push(`/${locale}/marketplace?${searchParams.toString()}`)
			} else {
				// Redirect to event detail page (which has the waitlist functionality)
				router.push(`/${locale}/events/${event.id}`)
			}
		} catch (error) {
			console.error('Error checking event bibs:', error)
			// Fallback: redirect to event detail page
			router.push(`/${locale}/events/${event.id}`)
		}
	}

	return (
		<div className="bg-background">
			{/* Race type quick filters like in marketplace */}
			<div className="border-border bg-card/80 border-b p-6">
				<div className="mx-auto max-w-7xl">
					{/* Search bar - same style as marketplace */}
					<div className="relative mb-6">
						<Search className="text-muted-foreground absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform" />
						<Input
							className="pl-10 text-sm"
							placeholder={t.events?.searchPlaceholder ?? 'Search events...'}
							value={searchTerm}
							onChange={e => handleSearchChange(e.target.value)}
						/>
					</div>

					{/* Race type filter buttons - improved design */}
					<div
						className={`grid gap-3 ${(() => {
							if (raceTypeSummary.length <= 2) {
								return 'grid-cols-2'
							} else if (raceTypeSummary.length <= 3) {
								return 'grid-cols-2 md:grid-cols-3'
							} else {
								return 'grid-cols-2 md:grid-cols-5'
							}
						})()}`}
					>
						{raceTypeSummary.map(type => (
							<button
								key={type.key}
								className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 ${
									selectedType === type.key ? type.color : type.colorDisabled
								}`}
								onClick={() => handleTypeChange(type.key as 'all' | 'triathlon' | 'trail' | 'road' | 'cycle')}
								aria-label={(t.events?.raceTypes as Record<string, string>)?.[type.key] ?? type.label}
							>
								{/* Radio button indicator - top left */}
								<div className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center">
									<div className={`relative h-3 w-3 rounded-full bg-current transition-all duration-200`}>
										{selectedType === type.key && (
											<div className="bg-primary-foreground absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
										)}
									</div>
								</div>

								{/* Icon with better sizing and colors */}
								<div className="mb-2 text-current transition-colors duration-200">
									{React.cloneElement(type.icon, {
										size: 24,
										className: 'h-6 w-6',
									})}
								</div>

								{/* Label with better typography */}
								<div className="text-sm font-semibold text-current transition-colors duration-200">
									{(t.events?.raceTypes as Record<string, string>)?.[type.key] ?? type.label}
								</div>

								{/* Count badge */}
								{type.count > 0 && (
									<div
										className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-colors duration-200 ${
											selectedType === type.key ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
										}`}
									>
										{type.count}
									</div>
								)}

								{/* Hover effect indicator */}
								<div
									className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
										selectedType === type.key ? 'bg-current opacity-5' : 'bg-muted opacity-0 group-hover:opacity-10'
									}`}
								/>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Filters section - simplified but similar to marketplace */}
			<div className="w-full p-6">
				<div className="max-w-7xl">
					<div className="mb-6 flex flex-wrap gap-3">
						<div className="w-48">
							<SelectAnimated
								onValueChange={handleSortChange}
								options={sortOptions}
								placeholder={t.events?.filters?.sortPlaceholder ?? 'Trier par...'}
								value={sortBy}
							/>
						</div>
						{/* Location autocomplete dropdown */}
						<div className="relative w-48">
							<Tooltip>
								<TooltipTrigger asChild>
									<Input
										type="text"
										placeholder={t.events?.searchCityPlaceholder ?? 'Search a city...'}
										value={locationSearch !== '' ? locationSearch : selectedLocation}
										onChange={e => {
											setLocationSearch(e.target.value)
											setShowLocationDropdown(true)
											if (e.target.value === '') {
												handleLocationChange('')
											}
										}}
										onFocus={() => setShowLocationDropdown(true)}
										onBlur={() => {
											// Delay hiding dropdown to allow clicks on items
											setTimeout(() => setShowLocationDropdown(false), 200)
										}}
										className="text-sm"
									/>
								</TooltipTrigger>
								<TooltipContent>
									<p>{t.events?.cityFilterTooltip ?? 'Only cities with scheduled events are displayed'}</p>
								</TooltipContent>
							</Tooltip>
							{showLocationDropdown && filteredLocations.length > 0 && (
								<div className="bg-card border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-40 overflow-y-auto rounded-lg border shadow-lg">
									<button
										onClick={() => {
											handleLocationChange('')
											setLocationSearch('')
											setShowLocationDropdown(false)
										}}
										className="hover:bg-muted/50 border-border block w-full cursor-pointer border-b px-3 py-2 text-left text-sm"
									>
										{t.events?.filters?.allCities ?? 'All cities'}
									</button>
									{filteredLocations.map(location => (
										<button
											key={location}
											onClick={() => {
												handleLocationChange(location)
												setLocationSearch(location)
												setShowLocationDropdown(false)
											}}
											className="hover:bg-muted/50 block w-full cursor-pointer px-3 py-2 text-left text-sm"
										>
											{location}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Timeline-only UI */}
			<div className="px-6">
				<Timeline
					data={groupedSections.map(section => ({
						title: section.title,
						content: (
							<div className="grid grid-cols-2 gap-4">
								{section.events.slice(0, 8).map(e => (
									<div key={e.id} className="col-span-2 lg:col-span-1">
										<EventCard
											event={e}
											locale={locale}
											bibsCount={eventBibsCache[e.id]}
											bibsData={eventBibsData[e.id]}
											onAction={handleEventAction}
											t={t}
										/>
									</div>
								))}
							</div>
						),
					}))}
				/>
			</div>
		</div>
	)
}
