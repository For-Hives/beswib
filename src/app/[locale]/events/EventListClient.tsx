'use client'

import { useMemo } from 'react'
import { Star, Mountain, Route, Calendar, MapPin, Users, Search } from 'lucide-react'
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import Fuse from 'fuse.js'

import type { Event } from '@/models/event.model'
import { getTranslations } from '@/lib/getDictionary'
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

	// Fuse.js instance for fuzzy search
	const fuse = useMemo(
		() =>
			new Fuse(prefetchedEvents, {
				threshold: 0.4,
				keys: ['name', 'location', 'typeCourse'],
			}),
		[prefetchedEvents]
	)

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

	// Race type summary cards as quick-access buttons
	const raceTypeSummary = [
		{
			key: 'triathlon',
			label: eventTypeLabels.triathlon,
			color: eventTypeColors.triathlon,
			count: prefetchedEvents.filter(e => e.typeCourse === 'triathlon').length,
			icon: eventTypeIcons.triathlon,
		},
		{
			key: 'trail',
			label: eventTypeLabels.trail,
			color: eventTypeColors.trail,
			count: prefetchedEvents.filter(e => e.typeCourse === 'trail').length,
			icon: eventTypeIcons.trail,
		},
		{
			key: 'route',
			label: eventTypeLabels.route,
			color: eventTypeColors.route,
			count: prefetchedEvents.filter(e => e.typeCourse === 'route').length,
			icon: eventTypeIcons.route,
		},
		{
			key: 'ultra',
			label: eventTypeLabels.ultra,
			color: eventTypeColors.ultra,
			count: prefetchedEvents.filter(e => e.typeCourse === 'ultra').length,
			icon: eventTypeIcons.ultra,
		},
	]

	function getCountLabel(): string {
		if (typeof t.events?.countLabel === 'string' && t.events.countLabel !== undefined && t.events.countLabel !== null) {
			return t.events.countLabel.replace('{count}', String(filteredEvents.length))
		}
		return `${filteredEvents.length} événement${filteredEvents.length !== 1 ? 's' : ''} trouvé${filteredEvents.length !== 1 ? 's' : ''}`
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
					<button className="bg-primary/20 text-primary hover:bg-primary/30 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors">
						Voir les détails
					</button>
				</div>
			</div>
		</SpotlightCard>
	)

	return (
		<div className="bg-background min-h-screen">
			{/* Hero Section */}
			<div className="border-border bg-card/50 border-b backdrop-blur-sm">
				<div className="container mx-auto px-4 py-12">
					<div className="text-center">
						<h1 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
							{t.events?.title ?? 'Événements sportifs'}
						</h1>
						<p className="text-muted-foreground mx-auto max-w-2xl text-lg">
							{t.events?.description ?? 'Découvrez et inscrivez-vous à des courses sportives partout en France.'}
						</p>
					</div>

					{/* Race type quick filters */}
					<div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
						{raceTypeSummary.map(type => (
							<button
								key={type.key}
								className={`group flex flex-col items-center justify-center rounded-xl border p-4 transition-all hover:scale-105 ${selectedType === type.key ? type.color : 'border-border bg-card/60 hover:bg-card/80'}`}
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
				</div>
			</div>

			{/* Search and Filters */}
			<div className="border-border bg-card/30 border-b backdrop-blur-sm">
				<div className="container mx-auto px-4 py-6">
					<div className="mb-4">
						<div className="relative">
							<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<input
								type="text"
								placeholder={t.events?.searchPlaceholder ?? 'Rechercher un événement, une ville...'}
								value={searchTerm}
								onChange={e => handleSearchChange(e.target.value)}
								className="border-border bg-background/80 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-3 pr-4 pl-10 focus:ring-2 focus:outline-none"
							/>
						</div>
					</div>

					<div className="flex flex-wrap gap-3">
						<select
							value={selectedLocation}
							onChange={e => handleLocationChange(e.target.value)}
							className="border-border bg-background/80 text-foreground focus:border-primary focus:ring-primary/20 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
						>
							<option value="">Toutes les villes</option>
							{uniqueLocations.map(location => (
								<option key={location} value={location}>
									{location}
								</option>
							))}
						</select>

						<select
							value={sortBy}
							onChange={e => handleSortChange(e.target.value as 'date' | 'price' | 'participants' | 'distance')}
							className="border-border bg-background/80 text-foreground focus:border-primary focus:ring-primary/20 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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
			<div className="container mx-auto px-4 py-8">
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
