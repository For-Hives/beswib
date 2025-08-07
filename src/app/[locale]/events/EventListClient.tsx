'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Search, ShoppingCart, Bell, Route, Mountain } from 'lucide-react'
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'

import type { Event } from '@/models/event.model'
import { getTranslations } from '@/lib/getDictionary'
import { fetchAvailableBibsForEvent } from '@/services/bib.services'
import { Input } from '@/components/ui/inputAlt'
import { SelectAlt, SelectContentAlt, SelectItemAlt, SelectTriggerAlt, SelectValueAlt } from '@/components/ui/selectAlt'
import { TriathlonIcon, TrailIcon, RouteIcon, UltraIcon, AllTypesIcon } from '@/components/icons/RaceTypeIcons'
import SpotlightCard from '@/components/bits/SpotlightCard/SpotlightCard'
import Translations from './locales.json'

interface EventsPageProps {
	prefetchedEvents: Event[]
	locale: string
	error?: string | null
}

const eventTypeColors = {
	triathlon: 'bg-purple-500/15 border-purple-500/50 text-purple-400',
	trail: 'bg-yellow-500/15 border-yellow-500/50 text-yellow-400',
	route: 'bg-blue-500/15 border-blue-500/50 text-blue-400',
	ultra: 'bg-red-500/15 border-red-500/50 text-red-400',
}

const eventTypeColorsDisabled = {
	triathlon: 'opacity-25',
	trail: 'opacity-25',
	route: 'opacity-25',
	ultra: 'opacity-25',
}

const eventTypeLabels = {
	triathlon: 'TRIATHLON',
	trail: 'TRAIL',
	route: 'ROUTE',
	ultra: 'ULTRA',
}

const eventTypeIcons = {
	triathlon: <TriathlonIcon className="h-5 w-5" />,
	trail: <TrailIcon className="h-5 w-5" />,
	route: <RouteIcon className="h-5 w-5" />,
	ultra: <UltraIcon className="h-5 w-5" />,
}

export default function EventsPage({ prefetchedEvents, locale }: EventsPageProps) {
	// State and translation variables
	const t = getTranslations(locale, Translations)
	const router = useRouter()

	// useQueryStates for filter state management via URL
	const [query, setQuery] = useQueryStates(
		{
			search: parseAsString.withDefault(''),
			type: parseAsStringLiteral(['all', 'triathlon', 'trail', 'route', 'ultra'] as const).withDefault('all'),
			sort: parseAsStringLiteral(['date', 'price', 'participants', 'distance'] as const).withDefault('date'),
			location: parseAsString.withDefault(''),
		},
		{ history: 'push' }
	)

	const searchTerm = query.search
	const selectedType = query.type
	const sortBy = query.sort
	const selectedLocation = query.location

	// Handlers for filter changes
	const handleSearchChange = (val: string) => {
		void setQuery({ search: val })
	}
	const handleTypeChange = (val: 'all' | 'triathlon' | 'trail' | 'route' | 'ultra') => {
		void setQuery({ type: val })
	}
	const handleSortChange = (val: 'date' | 'price' | 'participants' | 'distance') => {
		void setQuery({ sort: val })
	}
	const handleLocationChange = (val: string) => {
		void setQuery({ location: val })
	}

	// Extract unique locations for the filter
	const uniqueLocations = Array.from(new Set(prefetchedEvents.map(event => event.location))).sort()

	// State for location autocomplete
	const [locationSearch, setLocationSearch] = useState('')
	const [showLocationDropdown, setShowLocationDropdown] = useState(false)

	// State to track bibs availability for each event
	const [eventBibsCache, setEventBibsCache] = useState<Record<string, number>>({})

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

	// Filtering and sorting logic
	const filteredEvents = useMemo(() => {
		let filtered = prefetchedEvents

		// Fuzzy search with Fuse.js
		if (searchTerm !== '') {
			const fuseResults = fuse.search(searchTerm)
			filtered = fuseResults.map(result => result.item)
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
	}, [searchTerm, selectedType, selectedLocation, prefetchedEvents, fuse])

	const sortedEvents = useMemo(() => {
		return [...filteredEvents].sort((a, b) => {
			switch (sortBy) {
				case 'date':
					return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
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

	// Featured events: next 30 days
	const now = new Date()
	const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
	const featuredEvents = sortedEvents.filter(event => {
		const eventDate = new Date(event.eventDate)
		return eventDate >= now && eventDate <= thirtyDaysFromNow
	})

	// Upcoming events: after 30 days
	const upcomingEvents = sortedEvents.filter(event => {
		const eventDate = new Date(event.eventDate)
		return eventDate > thirtyDaysFromNow
	})

	// Race type summary cards as quick-access buttons - dynamically generated from actual events
	const raceTypeSummary = useMemo(() => {
		// Get unique event types from actual events
		const uniqueTypes = Array.from(new Set(prefetchedEvents.map(e => e.typeCourse)))

		// Start with "all" option
		const summary = [
			{
				key: 'all',
				label: 'Tous',
				color: 'bg-black/35 border-slate-500/50 text-slate-400',
				colorDisabled: 'opacity-25',
				count: prefetchedEvents.length,
				icon: <AllTypesIcon className="h-5 w-5" />,
			},
		]

		// Add categories that actually exist in the data
		uniqueTypes.forEach(type => {
			if (eventTypeLabels[type] && eventTypeColors[type]) {
				summary.push({
					key: type,
					label: eventTypeLabels[type],
					color: eventTypeColors[type],
					colorDisabled: eventTypeColorsDisabled[type],
					count: prefetchedEvents.filter(e => e.typeCourse === type).length,
					icon: eventTypeIcons[type],
				})
			}
		})

		return summary
	}, [prefetchedEvents])

	// Pre-load bib counts for featured and upcoming events
	useEffect(() => {
		const loadBibCounts = async () => {
			const eventsToLoad = [...featuredEvents.slice(0, 8), ...upcomingEvents.slice(0, 8)] // Load first 16 events

			const promises = eventsToLoad.map(async event => {
				if (eventBibsCache[event.id] === undefined) {
					try {
						const availableBibs = await fetchAvailableBibsForEvent(event.id)
						return { [event.id]: availableBibs.length }
					} catch (error) {
						console.error('Error loading bibs for event:', event.id, error)
						return { [event.id]: 0 }
					}
				}
				return {}
			})

			const results = await Promise.all(promises)
			const newCache = results.reduce((acc, curr) => ({ ...acc, ...curr }), {})

			if (Object.keys(newCache).length > 0) {
				setEventBibsCache(prev => ({ ...prev, ...newCache }))
			}
		}

		void loadBibCounts()
	}, [featuredEvents, upcomingEvents, eventBibsCache])

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
					search: event.name, // Search by event name
					geography: event.location.toLowerCase(), // Filter by location
					sport: event.typeCourse, // Filter by sport type
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

	// Event card using SpotlightCard
	const EventCard = ({ event }: { event: Event }) => (
		<SpotlightCard className="h-full">
			<div className="flex h-full flex-col">
				<div className="mb-3 flex items-center justify-between">
					<span
						className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${eventTypeColors[event.typeCourse]}`}
					>
						{eventTypeIcons[event.typeCourse]}
						{eventTypeLabels[event.typeCourse] || event.typeCourse.toUpperCase()}
					</span>
					<span className="text-muted-foreground text-xs">
						{new Date(event.eventDate).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
					</span>
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
							<span>{event.elevationGainM}m D+</span>
						</div>
					)}
				</div>

				<div className="mt-auto">
					{event.officialStandardPrice != null && (
						<div className="mb-3 text-right">
							<span className="text-lg font-bold text-green-400">À partir de {event.officialStandardPrice}€</span>
						</div>
					)}
					<button
						onClick={() => void handleEventAction(event)}
						className="bg-primary/20 text-primary hover:bg-primary/30 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
					>
						{eventBibsCache[event.id] !== undefined ? (
							eventBibsCache[event.id] > 0 ? (
								<>
									<ShoppingCart className="h-4 w-4" />
									Voir les dossards ({eventBibsCache[event.id]})
								</>
							) : (
								<>
									<Bell className="h-4 w-4" />
									Rejoindre la waitlist
								</>
							)
						) : (
							'Vérifier les dossards...'
						)}
					</button>
				</div>
			</div>
		</SpotlightCard>
	)

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
							placeholder={t.events?.searchPlaceholder ?? 'Rechercher un événement, une ville...'}
							value={searchTerm}
							onChange={e => handleSearchChange(e.target.value)}
						/>
					</div>

					{/* Race type filter buttons - improved design */}
					<div
						className={`grid gap-3 ${raceTypeSummary.length <= 2 ? 'grid-cols-2' : raceTypeSummary.length <= 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-5'}`}
					>
						{raceTypeSummary.map(type => (
							<button
								key={type.key}
								className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 ${
									selectedType === type.key ? type.color : type.colorDisabled
								}`}
								onClick={() => handleTypeChange(type.key as 'all' | 'triathlon' | 'trail' | 'route' | 'ultra')}
								aria-label={(t.events?.raceTypes as Record<string, string>)?.[type.key] ?? type.label}
							>
								{/* Radio button indicator - top left */}
								<div className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center">
									<div className={`relative h-3 w-3 rounded-full bg-current transition-all duration-200`}>
										{selectedType === type.key && (
											<div className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
										)}
									</div>
								</div>

								{/* Icon with better sizing and colors */}
								<div
									className={`mb-2 transition-colors duration-200 ${
										selectedType === type.key ? 'text-current' : 'text-current'
									}`}
								>
									{React.cloneElement(type.icon, {
										className: 'h-6 w-6',
										size: 24,
									})}
								</div>

								{/* Label with better typography */}
								<div
									className={`text-sm font-semibold transition-colors duration-200 ${
										selectedType === type.key ? 'text-current' : 'text-current'
									}`}
								>
									{(t.events?.raceTypes as Record<string, string>)?.[type.key] ?? type.label}
								</div>

								{/* Count badge */}
								{type.count > 0 && (
									<div
										className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
											selectedType === type.key ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'
										}`}
									>
										{type.count}
									</div>
								)}

								{/* Hover effect indicator */}
								<div
									className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
										selectedType === type.key ? 'bg-current opacity-5' : 'bg-gray-200 opacity-0 group-hover:opacity-10'
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
						{/* Location autocomplete dropdown */}
						<div className="relative w-48">
							<Input
								type="text"
								placeholder="Rechercher une ville..."
								value={locationSearch || selectedLocation}
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
										Toutes les villes
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

						<SelectAlt value={sortBy} onValueChange={handleSortChange}>
							<SelectTriggerAlt className="w-48 text-sm">
								<SelectValueAlt placeholder="Trier par..." />
							</SelectTriggerAlt>
							<SelectContentAlt>
								<SelectItemAlt value="date">{t.events?.filters?.date ?? 'Trier par date'}</SelectItemAlt>
								<SelectItemAlt value="price">{t.events?.filters?.price ?? 'Trier par prix'}</SelectItemAlt>
								<SelectItemAlt value="participants">
									{t.events?.filters?.participants ?? 'Trier par participants'}
								</SelectItemAlt>
								<SelectItemAlt value="distance">{t.events?.filters?.distance ?? 'Trier par distance'}</SelectItemAlt>
							</SelectContentAlt>
						</SelectAlt>
					</div>
				</div>
			</div>

			{/* Events Grid */}
			<div className="w-full px-6">
				{/* Featured Events (Next 30 days) */}
				{featuredEvents.length > 0 && (
					<div className="mb-12">
						<div className="mb-6 flex items-center">
							<Calendar className="text-primary mr-3 h-5 w-5" />
							<h2 className="text-foreground text-2xl font-bold">{t.events?.featuredTitle ?? 'Événements à venir'}</h2>
							<span className="bg-primary/20 text-primary ml-3 rounded-full px-3 py-1 text-xs font-medium">
								{t.events?.featuredSubtitle ?? 'Prochains 30 jours'}
							</span>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{featuredEvents.map(event => (
								<EventCard key={event.id} event={event} />
							))}
						</div>
					</div>
				)}

				{/* All Events */}
				{upcomingEvents.length > 0 && (
					<div>
						<h2 className="text-foreground mb-6 text-2xl font-bold">
							{t.events?.allEventsTitle ?? 'Tous les événements'}
						</h2>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{upcomingEvents.map(event => (
								<EventCard key={event.id} event={event} />
							))}
						</div>
					</div>
				)}

				{/* No Results */}
				{sortedEvents.length === 0 && (
					<div className="py-16 text-center">
						<div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
							<Calendar className="text-muted-foreground h-6 w-6" />
						</div>
						<h3 className="text-foreground mb-2 text-xl font-semibold">
							{t.events?.noResultsTitle ?? 'Aucun événement trouvé'}
						</h3>
						<p className="text-muted-foreground">
							{t.events?.noResultsSubtitle ?? 'Essayez de modifier vos critères de recherche'}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
