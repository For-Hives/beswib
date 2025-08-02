'use client'

import { useState, useMemo } from 'react'
import { Star, Mountain, Route } from 'lucide-react'
import { Card } from '@/components/ui/card'

import type { Event } from '@/models/event.model'
import { getTranslations } from '@/lib/getDictionary'
import Translations from './locales.json'

interface EventsPageProps {
	prefetchedEvents: Event[]
	locale: string
	error?: string | null
}

const eventTypeColors = {
	triathlon: 'bg-gradient-to-br from-red-600 to-red-700',
	trail: 'bg-gradient-to-br from-orange-600 to-orange-700',
	route: 'bg-gradient-to-br from-blue-600 to-blue-700',
	ultra: 'bg-gradient-to-br from-purple-600 to-purple-700',
}

const eventTypeLabels = {
	triathlon: 'TRIATHLON',
	trail: 'TRAIL',
	route: 'ROUTE',
	ultra: 'ULTRA',
}

export default function EventsPage({ prefetchedEvents, locale }: EventsPageProps) {
	function getCountLabel(): string {
		if (typeof t.events?.countLabel === 'string' && t.events.countLabel !== undefined && t.events.countLabel !== null) {
			return (t.events.countLabel as string).replace('{count}', String(prefetchedEvents.length))
		}
		return `${prefetchedEvents.length} événement${prefetchedEvents.length !== 1 ? 's' : ''} trouvé${prefetchedEvents.length !== 1 ? 's' : ''}`
	}
	// ...existing code...
	// ...existing code...
	// Calendar view logic
	const currentMonth = new Date().getMonth()
	const currentYear = new Date().getFullYear()
	// Get all days for the current month
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
	const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay() // 0=Sunday

	// State and translation variables
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedType, setSelectedType] = useState<string>('all')
	const [sortBy, setSortBy] = useState<string>('date')
	const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
	const t = getTranslations(locale, Translations)

	// Filtering and sorting logic
	const filteredEvents = useMemo(() => {
		return prefetchedEvents.filter(event => {
			const matchesSearch =
				event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				event.location.toLowerCase().includes(searchTerm.toLowerCase())
			const matchesType = selectedType === 'all' || event.typeCourse === selectedType
			return matchesSearch && matchesType
		})
	}, [searchTerm, selectedType, prefetchedEvents])

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

	// Group events by date string (must be after sortedEvents)
	const eventsByDate = useMemo(() => {
		const grouped: { [date: string]: Event[] } = {}
		sortedEvents.forEach(event => {
			const dateKey = new Date(event.eventDate).toDateString()
			grouped[dateKey] ??= []
			grouped[dateKey].push(event)
		})
		return grouped
	}, [sortedEvents])

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
			icon: <Star className="h-6 w-6 text-red-500" />,
		},
		{
			key: 'trail',
			label: eventTypeLabels.trail,
			color: eventTypeColors.trail,
			count: prefetchedEvents.filter(e => e.typeCourse === 'trail').length,
			icon: <Mountain className="h-6 w-6 text-orange-500" />,
		},
		{
			key: 'route',
			label: eventTypeLabels.route,
			color: eventTypeColors.route,
			count: prefetchedEvents.filter(e => e.typeCourse === 'route').length,
			icon: <Route className="h-6 w-6 text-blue-500" />,
		},
		{
			key: 'ultra',
			label: eventTypeLabels.ultra,
			color: eventTypeColors.ultra,
			count: prefetchedEvents.filter(e => e.typeCourse === 'ultra').length,
			icon: <Star className="h-6 w-6 text-purple-500" />,
		},
	]

	// Improved event card (Tailwind UI best practices)
	const EventCard = ({ event }: { event: Event }) => (
		<Card className="flex flex-col gap-2 border border-gray-700 bg-gray-900 p-4 transition hover:shadow-xl">
			<div className="mb-2 flex items-center gap-2">
				<span className={`rounded px-2 py-1 text-xs font-semibold ${eventTypeColors[event.typeCourse]}`}>
					{eventTypeLabels[event.typeCourse]}
				</span>
				<span className="text-xs text-gray-400">
					{new Date(event.eventDate).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
				</span>
			</div>
			<div className="truncate text-lg font-bold text-white" title={event.name}>
				{event.name}
			</div>
			<div className="flex items-center gap-1 text-sm text-gray-400">
				<svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 1011.314-11.314l-4.243 4.243z"
					/>
				</svg>
				{event.location}
			</div>
			<div className="flex flex-wrap gap-2 text-xs text-gray-400">
				{event.distanceKm != null && <span>{event.distanceKm}km</span>}
				{event.elevationGainM != null && <span>{event.elevationGainM}m D+</span>}
				{event.participants != null && <span>{event.participants} participants</span>}
			</div>
			{event.officialStandardPrice != null && (
				<div className="text-xs font-bold text-green-400">À partir de {event.officialStandardPrice}€</div>
			)}
		</Card>
	)

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-4 py-8">
				{/* Header and Race Type Summary */}
				<div className="mb-8">
					<h1 className="mb-2 text-3xl font-bold text-white">{t.events?.title ?? 'Événements sportifs'}</h1>
					<p className="mb-6 text-gray-400">
						{t.events?.description ?? 'Découvrez et inscrivez-vous à des courses sportives partout en France.'}
					</p>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{raceTypeSummary.map(type => (
							<button
								key={type.key}
								className={`flex flex-col items-center justify-center py-6 transition hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none ${type.color} shadow-lg`}
								onClick={() => setSelectedType(type.key)}
								aria-label={(t.events?.raceTypes as Record<string, string>)?.[type.key] ?? type.label}
							>
								<div className="mb-2">{type.icon}</div>
								<div className="text-lg font-bold text-white">
									{(t.events?.raceTypes as Record<string, string>)?.[type.key] ?? type.label}
								</div>
								<div className="mt-1 text-2xl font-bold text-white">{type.count}</div>
							</button>
						))}
					</div>
				</div>

				{/* Filter Bar and View Toggle */}
				<div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<div className="lg:col-span-2">
							<input
								type="text"
								placeholder={t.events?.searchPlaceholder ?? 'Rechercher un événement, une ville...'}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className="w-full rounded border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500"
							/>
						</div>
						<div>
							<select
								value={selectedType}
								onChange={e => setSelectedType(e.target.value)}
								className="w-full rounded border-gray-600 bg-gray-700 px-4 py-2 text-white"
							>
								<option value="all">{t.events?.filters?.all ?? 'Tous les types'}</option>
								<option value="triathlon">
									{(t.events?.raceTypes as Record<string, string>)?.triathlon ?? 'Triathlon'}
								</option>
								<option value="trail">{(t.events?.raceTypes as Record<string, string>)?.trail ?? 'Trail'}</option>
								<option value="route">{(t.events?.raceTypes as Record<string, string>)?.route ?? 'Route'}</option>
								<option value="ultra">{(t.events?.raceTypes as Record<string, string>)?.ultra ?? 'Ultra'}</option>
							</select>
						</div>
						<div>
							<select
								value={sortBy}
								onChange={e => setSortBy(e.target.value)}
								className="w-full rounded border-gray-600 bg-gray-700 px-4 py-2 text-white"
							>
								<option value="date">{t.events?.filters?.date ?? 'Date'}</option>
								<option value="price">{t.events?.filters?.price ?? 'Prix'}</option>
								<option value="participants">{t.events?.filters?.participants ?? 'Participants'}</option>
								<option value="distance">{t.events?.filters?.distance ?? 'Distance'}</option>
							</select>
						</div>
					</div>
					<div className="mt-4 flex items-center justify-between">
						<p className="text-sm text-gray-400">{getCountLabel()}</p>
						<button
							className={`rounded border border-gray-600 bg-transparent px-4 py-2 text-gray-300 transition hover:bg-gray-700 ${viewMode === 'calendar' ? 'bg-blue-700 text-white' : ''}`}
							onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
						>
							{viewMode === 'list' ? (t.events?.calendarView ?? 'Vue calendrier') : (t.events?.listView ?? 'Vue liste')}
						</button>
					</div>
				</div>

				{/* List View */}
				{viewMode === 'list' && (
					<>
						{/* Featured Events (Next 30 days) */}
						{featuredEvents.length > 0 && (
							<div className="mb-12">
								<div className="mb-6 flex items-center">
									<Star className="mr-2 h-6 w-6 text-yellow-500" />
									<h2 className="text-2xl font-bold text-white">{t.events?.featuredTitle ?? 'Événements à venir'}</h2>
									<span className="ml-3 rounded bg-yellow-500/20 px-3 py-1 text-xs text-yellow-400">
										{t.events?.featuredSubtitle ?? 'Prochains 30 jours'}
									</span>
								</div>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{featuredEvents.map(event => (
										<EventCard key={event.id} event={event} />
									))}
								</div>
							</div>
						)}

						{/* Upcoming Events */}
						{upcomingEvents.length > 0 && (
							<div>
								<h2 className="mb-6 text-2xl font-bold text-white">
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
							<div className="py-12 text-center">
								<h3 className="mb-2 text-xl font-semibold text-white">
									{t.events?.noResultsTitle ?? 'Aucun événement trouvé'}
								</h3>
								<p className="text-gray-400">
									{t.events?.noResultsSubtitle ?? 'Essayez de modifier vos critères de recherche'}
								</p>
							</div>
						)}
					</>
				)}

				{/* Calendar View */}
				{viewMode === 'calendar' && (
					<div className="mb-12">
						<h2 className="mb-6 text-2xl font-bold text-white">
							{t.events?.calendarTitle ?? 'Calendrier des événements'}
						</h2>
						<div className="grid grid-cols-7 gap-2 rounded-lg bg-gray-800 p-4">
							{/* Day headers */}
							{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
								<div key={day} className="pb-2 text-center text-xs font-bold text-gray-400">
									{day}
								</div>
							))}
							{/* Empty cells for first week */}
							{Array((firstDayOfWeek + 6) % 7)
								.fill(null)
								.map((_, i) => (
									<div key={`empty-${i}`} />
								))}
							{/* Calendar days */}
							{Array(daysInMonth)
								.fill(null)
								.map((_, i) => {
									const dateObj = new Date(currentYear, currentMonth, i + 1)
									const dateKey = dateObj.toDateString()
									const dayEvents = eventsByDate[dateKey] ?? []
									return (
										<div key={i} className="flex min-h-[60px] flex-col rounded border border-gray-700 bg-gray-900 p-1">
											<div className="mb-1 text-xs font-bold text-white">{i + 1}</div>
											{dayEvents.length > 0 ? (
												<div className="space-y-1">
													{dayEvents.slice(0, 2).map(event => (
														<div
															key={event.id}
															className={`rounded px-1 py-0.5 text-xs text-white ${eventTypeColors[event.typeCourse]} truncate`}
															title={event.name}
														>
															{event.name}
														</div>
													))}
													{dayEvents.length > 2 && (
														<div className="text-[10px] text-gray-400">+{dayEvents.length - 2} autres</div>
													)}
												</div>
											) : (
												<div className="flex-1" />
											)}
										</div>
									)
								})}
						</div>
						{sortedEvents.length === 0 && (
							<div className="py-12 text-center">
								<h3 className="mb-2 text-xl font-semibold text-white">
									{t.events?.noResultsTitle ?? 'Aucun événement trouvé'}
								</h3>
								<p className="text-gray-400">
									{t.events?.noResultsSubtitle ?? 'Essayez de modifier vos critères de recherche'}
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
