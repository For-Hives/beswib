'use client'

import { useState, useMemo } from 'react'
import { Search, Calendar, MapPin, Users, Filter, Star, Clock, Mountain, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Using the actual Event interface
export interface Event {
	bibPickupLocation?: string
	bibPickupWindowBeginDate: Date
	bibPickupWindowEndDate: Date
	description: string
	distanceKm?: number
	elevationGainM?: number
	eventDate: Date
	id: string
	location: string
	name: string
	officialStandardPrice?: number
	options: EventOption[] | null
	organizer: string // Organizer['id']
	parcoursUrl?: string
	participants?: number
	registrationUrl?: string
	transferDeadline?: Date
	typeCourse: 'route' | 'trail' | 'triathlon' | 'ultra'
}

interface EventOption {
	id: string
	name: string
	price: number
}

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

export default function EventsPage({ prefetchedEvents, locale, error }: EventsPageProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedType, setSelectedType] = useState<string>('all')
	const [sortBy, setSortBy] = useState<string>('date')

	const filteredAndSortedEvents = useMemo(() => {
		const filtered = prefetchedEvents.filter(event => {
			const matchesSearch =
				event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				event.location.toLowerCase().includes(searchTerm.toLowerCase())
			const matchesType = selectedType === 'all' || event.typeCourse === selectedType

			return matchesSearch && matchesType
		})

		// Sort events
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'date':
					return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
				case 'price':
					const priceA = a.officialStandardPrice || 0
					const priceB = b.officialStandardPrice || 0
					return priceA - priceB
				case 'participants':
					return (b.participants || 0) - (a.participants || 0)
				case 'distance':
					return (a.distanceKm || 0) - (b.distanceKm || 0)
				default:
					return 0
			}
		})

		return filtered
	}, [searchTerm, selectedType, sortBy, prefetchedEvents])

	// Featured events (upcoming events within next 30 days)
	const now = new Date()
	const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

	const featuredEvents = filteredAndSortedEvents.filter(event => {
		const eventDate = new Date(event.eventDate)
		return eventDate >= now && eventDate <= thirtyDaysFromNow
	})

	const upcomingEvents = filteredAndSortedEvents.filter(event => {
		const eventDate = new Date(event.eventDate)
		return eventDate > thirtyDaysFromNow
	})

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		})
	}

	const isRegistrationOpen = (transferDeadline?: Date) => {
		if (!transferDeadline) return true
		return new Date(transferDeadline) > new Date()
	}

	const getLowestPrice = (event: Event) => {
		if (!event.options || event.options.length === 0) {
			return event.officialStandardPrice || 0
		}
		const optionPrices = event.options.map(option => option.price)
		const standardPrice = event.officialStandardPrice || Number.POSITIVE_INFINITY
		return Math.min(standardPrice, ...optionPrices)
	}

	const EventCard = ({ event }: { event: Event }) => {
		const lowestPrice = getLowestPrice(event)
		const hasDiscount = event.officialStandardPrice && lowestPrice < event.officialStandardPrice
		const discountPercentage = hasDiscount
			? Math.round(((event.officialStandardPrice! - lowestPrice) / event.officialStandardPrice!) * 100)
			: null

		return (
			<Card className="group overflow-hidden border-gray-700 bg-gray-800 transition-all duration-300 hover:border-gray-600 hover:shadow-xl">
				<CardHeader className="p-0">
					<div
						className={`${eventTypeColors[event.typeCourse]} relative flex h-32 items-center justify-center text-white`}
					>
						{discountPercentage && (
							<Badge className="absolute top-2 right-2 border-0 bg-red-600 text-white">-{discountPercentage}%</Badge>
						)}
						<div className="text-center">
							<div className="mb-1 text-xs font-medium opacity-90">{eventTypeLabels[event.typeCourse]}</div>
							<div className="text-4xl font-bold">001</div>
							<div className="mt-2 rounded bg-white/20 px-2 py-1 text-xs backdrop-blur-sm">{event.location}</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="bg-gray-800 p-4">
					<div className="mb-3 flex items-start justify-between">
						<h3 className="text-lg leading-tight font-bold text-white transition-colors group-hover:text-blue-400">
							{event.name}
						</h3>
						<div className="text-right">
							<div className="text-2xl font-bold text-white">{lowestPrice}€</div>
							{hasDiscount && event.officialStandardPrice && (
								<div className="text-sm text-gray-400 line-through">{event.officialStandardPrice}€</div>
							)}
						</div>
					</div>

					<div className="mb-4 space-y-2">
						<div className="flex items-center text-sm text-gray-300">
							<Calendar className="mr-2 h-4 w-4 text-gray-400" />
							{formatDate(event.eventDate)}
						</div>
						<div className="flex items-center text-sm text-gray-300">
							<MapPin className="mr-2 h-4 w-4 text-gray-400" />
							{event.location}
							{event.distanceKm && ` • ${event.distanceKm}km`}
						</div>
						{event.participants && (
							<div className="flex items-center text-sm text-gray-300">
								<Users className="mr-2 h-4 w-4 text-gray-400" />
								{event.participants} participants
							</div>
						)}
						{event.elevationGainM && (
							<div className="flex items-center text-sm text-gray-300">
								<Mountain className="mr-2 h-4 w-4 text-gray-400" />
								{event.elevationGainM}m D+
							</div>
						)}
					</div>

					<div className="mb-4 flex items-center justify-between">
						<Badge variant="secondary" className="border-gray-600 bg-gray-700 text-gray-200">
							{eventTypeLabels[event.typeCourse]}
						</Badge>
						{event.parcoursUrl && (
							<Badge variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
								<Route className="mr-1 h-3 w-3" />
								Parcours
							</Badge>
						)}
					</div>

					{event.registrationUrl ? (
						<Button
							className="w-full border-0 bg-blue-600 text-white hover:bg-blue-700"
							disabled={!isRegistrationOpen(event.transferDeadline)}
							onClick={() => window.open(event.registrationUrl, '_blank')}
						>
							{!isRegistrationOpen(event.transferDeadline) ? 'Inscriptions fermées' : 'Je veux ce dossard'}
						</Button>
					) : (
						<Button className="w-full border-0 bg-gray-600 text-white hover:bg-gray-700" disabled>
							Bientôt disponible
						</Button>
					)}

					{event.transferDeadline && isRegistrationOpen(event.transferDeadline) && (
						<div className="mt-2 flex items-center text-xs text-gray-400">
							<Clock className="mr-1 h-3 w-3" />
							Transfert jusqu'au {formatDate(event.transferDeadline)}
						</div>
					)}

					{event.bibPickupLocation && (
						<div className="mt-1 text-xs text-gray-400">Retrait dossard: {event.bibPickupLocation}</div>
					)}
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-900">
				<div className="text-center">
					<div className="mb-2 text-xl text-red-400">Erreur</div>
					<div className="text-gray-300">{error}</div>
				</div>
			</div>
		)
	}

	if (prefetchedEvents.length === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-900">
				<div className="text-center">
					<div className="mb-4 text-gray-400">
						<Search className="mx-auto h-16 w-16" />
					</div>
					<h3 className="mb-2 text-xl font-semibold text-white">Aucun événement disponible</h3>
					<p className="text-gray-400">Revenez bientôt pour découvrir nos prochains événements</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-4xl font-bold text-white">Événements Sportifs</h1>
					<p className="text-gray-400">Découvrez et participez aux meilleurs événements sportifs</p>
				</div>

				{/* Search and Filters */}
				<div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<div className="lg:col-span-2">
							<div className="relative">
								<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
								<Input
									placeholder="Rechercher un événement, une ville..."
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className="border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400 focus:border-blue-500"
								/>
							</div>
						</div>

						<Select value={selectedType} onValueChange={setSelectedType}>
							<SelectTrigger className="border-gray-600 bg-gray-700 text-white">
								<SelectValue placeholder="Type d'événement" />
							</SelectTrigger>
							<SelectContent className="border-gray-700 bg-gray-800">
								<SelectItem value="all" className="text-white hover:bg-gray-700">
									Tous les types
								</SelectItem>
								<SelectItem value="triathlon" className="text-white hover:bg-gray-700">
									Triathlon
								</SelectItem>
								<SelectItem value="trail" className="text-white hover:bg-gray-700">
									Trail
								</SelectItem>
								<SelectItem value="route" className="text-white hover:bg-gray-700">
									Route
								</SelectItem>
								<SelectItem value="ultra" className="text-white hover:bg-gray-700">
									Ultra
								</SelectItem>
							</SelectContent>
						</Select>

						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="border-gray-600 bg-gray-700 text-white">
								<SelectValue placeholder="Trier par" />
							</SelectTrigger>
							<SelectContent className="border-gray-700 bg-gray-800">
								<SelectItem value="date" className="text-white hover:bg-gray-700">
									Date
								</SelectItem>
								<SelectItem value="price" className="text-white hover:bg-gray-700">
									Prix
								</SelectItem>
								<SelectItem value="participants" className="text-white hover:bg-gray-700">
									Participants
								</SelectItem>
								<SelectItem value="distance" className="text-white hover:bg-gray-700">
									Distance
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="mt-4 flex items-center justify-between">
						<p className="text-sm text-gray-400">
							{filteredAndSortedEvents.length} événement{filteredAndSortedEvents.length !== 1 ? 's' : ''} trouvé
							{filteredAndSortedEvents.length !== 1 ? 's' : ''}
						</p>
						<Button
							variant="outline"
							size="sm"
							className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
						>
							<Filter className="mr-2 h-4 w-4" />
							Filtres avancés
						</Button>
					</div>
				</div>

				{/* Featured Events (Next 30 days) */}
				{featuredEvents.length > 0 && (
					<div className="mb-12">
						<div className="mb-6 flex items-center">
							<Star className="mr-2 h-6 w-6 text-yellow-500" />
							<h2 className="text-2xl font-bold text-white">Événements à venir</h2>
							<Badge className="ml-3 border-yellow-500/30 bg-yellow-500/20 text-yellow-400">Prochains 30 jours</Badge>
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
						<h2 className="mb-6 text-2xl font-bold text-white">Tous les événements</h2>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{upcomingEvents.map(event => (
								<EventCard key={event.id} event={event} />
							))}
						</div>
					</div>
				)}

				{/* No Results */}
				{filteredAndSortedEvents.length === 0 && (
					<div className="py-12 text-center">
						<div className="mb-4 text-gray-600">
							<Search className="mx-auto h-16 w-16" />
						</div>
						<h3 className="mb-2 text-xl font-semibold text-white">Aucun événement trouvé</h3>
						<p className="text-gray-400">Essayez de modifier vos critères de recherche</p>
					</div>
				)}
			</div>
		</div>
	)
}
