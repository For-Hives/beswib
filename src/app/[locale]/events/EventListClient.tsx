'use client'

import { useMemo, useState } from 'react'
import { Star, Mountain, Route, Calendar, MapPin, Users, Search, ShoppingCart, Bell } from 'lucide-react'
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'

import type { Event } from '@/models/event.model'
import { getTranslations } from '@/lib/getDictionary'
import { fetchAvailableBibsForEvent } from '@/services/bib.services'
import SpotlightCard from '@/Components/SpotlightCard/SpotlightCard'
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

const eventTypeLabels = {
	triathlon: 'TRIATHLON',
	trail: 'TRAIL',
	route: 'ROUTE',
	ultra: 'ULTRA',
}

const eventTypeIcons = {
	triathlon: <Star className="h-4 w-4" />,
	trail: <Mountain className="h-4 w-4" />,
	route: <Route className="h-4 w-4" />,
	ultra: <Star className="h-4 w-4" />,
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
				label: 'TOUTES',
				color: 'bg-gray-500/15 border-gray-500/50 text-gray-400',
				count: prefetchedEvents.length,
				icon: <Star className="h-4 w-4" />,
			},
		]

		// Add categories that actually exist in the data
		uniqueTypes.forEach(type => {
			if (eventTypeLabels[type] && eventTypeColors[type]) {
				summary.push({
					key: type,
					label: eventTypeLabels[type],
					color: eventTypeColors[type],
					count: prefetchedEvents.filter(e => e.typeCourse === type).length,
					icon: eventTypeIcons[type],
				})
			}
		})

		return summary
	}, [prefetchedEvents])

	function getCountLabel(): string {
		if (typeof t.events?.countLabel === 'string' && t.events.countLabel !== undefined && t.events.countLabel !== null) {
			return t.events.countLabel.replace('{count}', String(filteredEvents.length))
		}
		return `${filteredEvents.length} événement${filteredEvents.length !== 1 ? 's' : ''} trouvé${filteredEvents.length !== 1 ? 's' : ''}`
	}

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
					sport: event.typeCourse === 'all' ? '' : event.typeCourse // Filter by sport type
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
						onClick={() => handleEventAction(event)}
						className="bg-primary/20 text-primary hover:bg-primary/30 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
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
					<div className={`mb-6 grid gap-4 ${raceTypeSummary.length <= 2 ? 'grid-cols-2' : raceTypeSummary.length <= 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
						{raceTypeSummary.map(type => (
							<button
								key={type.key}
								className={`group flex flex-col items-center justify-center rounded-xl border p-4 transition-all hover:scale-105 cursor-pointer ${selectedType === type.key ? type.color : 'border-border bg-card/60 hover:bg-card/80'}`}
								onClick={() => handleTypeChange(type.key as 'all' | 'triathlon' | 'trail' | 'route' | 'ultra')}
								aria-label={(t.events?.raceTypes as Record<string, string>)?.[type.key] ?? type.label}
							>
								<div className="mb-2">{type.icon}</div>
								<div
									className={`text-sm font-medium ${selectedType === type.key ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
								>
									{(t.events?.raceTypes as Record<string, string>)?.[type.key] ?? type.label}
								</div>
								<div
									className={`text-xl font-bold ${selectedType === type.key ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
								>
									{type.count}
								</div>
							</button>
						))}
					</div>

					{/* Search bar - same style as marketplace */}
					<div className="relative">
						<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
						<input
							className="border-border bg-card/60 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent block w-full rounded-lg border p-2.5 pl-10 text-sm"
							placeholder={t.events?.searchPlaceholder ?? 'Rechercher un événement, une ville...'}
							value={searchTerm}
							onChange={e => handleSearchChange(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Filters section - simplified but similar to marketplace */}
			<div className="w-full p-6">
				<div className="max-w-7xl">
					<div className="mb-6 flex flex-wrap gap-3">
						{/* Location autocomplete dropdown */}
						<div className="relative">
							<input
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
								className="border-border bg-card/60 text-foreground focus:border-accent focus:ring-accent w-48 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
							/>
							{showLocationDropdown && filteredLocations.length > 0 && (
								<div className="bg-card border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-40 overflow-y-auto rounded-lg border shadow-lg">
									<button
										onClick={() => {
											handleLocationChange('')
											setLocationSearch('')
											setShowLocationDropdown(false)
										}}
										className="hover:bg-muted/50 border-border block w-full border-b px-3 py-2 text-left text-sm"
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
											className="hover:bg-muted/50 block w-full px-3 py-2 text-left text-sm"
										>
											{location}
										</button>
									))}
								</div>
							)}
						</div>

						<select
							value={sortBy}
							onChange={e => handleSortChange(e.target.value as 'date' | 'price' | 'participants' | 'distance')}
							className="border-border bg-card/60 text-foreground focus:border-accent focus:ring-accent rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
						>
							<option value="date">{t.events?.filters?.date ?? 'Trier par date'}</option>
							<option value="price">{t.events?.filters?.price ?? 'Trier par prix'}</option>
							<option value="participants">{t.events?.filters?.participants ?? 'Trier par participants'}</option>
							<option value="distance">{t.events?.filters?.distance ?? 'Trier par distance'}</option>
						</select>

						<div className="text-muted-foreground ml-auto text-sm">{getCountLabel()}</div>
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
