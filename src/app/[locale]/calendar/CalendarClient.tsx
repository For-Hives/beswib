'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarIcon, MapPin, Users, Clock, Mountain, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Event } from '@/models/event.model'

interface CalendarPageProps {
	prefetchedEvents: Event[]
	locale: string
	error?: string | null
}

const eventTypeColors = {
	triathlon: 'bg-red-600 border-red-500',
	trail: 'bg-orange-600 border-orange-500',
	route: 'bg-blue-600 border-blue-500',
	ultra: 'bg-purple-600 border-purple-500',
}

const eventTypeLabels = {
	triathlon: 'TRIATHLON',
	trail: 'TRAIL',
	route: 'ROUTE',
	ultra: 'ULTRA',
}

const monthNames = [
	'Janvier',
	'Février',
	'Mars',
	'Avril',
	'Mai',
	'Juin',
	'Juillet',
	'Août',
	'Septembre',
	'Octobre',
	'Novembre',
	'Décembre',
]

const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function CalendarPage({ prefetchedEvents, locale, error }: CalendarPageProps) {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
	const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

	// Group events by date
	const eventsByDate = useMemo(() => {
		const grouped: { [key: string]: Event[] } = {}

		prefetchedEvents.forEach(event => {
			const dateKey = new Date(event.eventDate).toDateString()
			if (!grouped[dateKey]) {
				grouped[dateKey] = []
			}
			grouped[dateKey].push(event)
		})

		return grouped
	}, [prefetchedEvents])

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		})
	}

	const getLowestPrice = (event: Event) => {
		if (!event.options || event.options.length === 0) {
			return event.officialStandardPrice || 0
		}
		const optionPrices = event.options.map(option => option.price)
		const standardPrice = event.officialStandardPrice || Number.POSITIVE_INFINITY
		return Math.min(standardPrice, ...optionPrices)
	}

	const isRegistrationOpen = (transferDeadline?: Date) => {
		if (!transferDeadline) return true
		return new Date(transferDeadline) > new Date()
	}

	// Generate calendar days for current month
	const generateCalendarDays = () => {
		const year = currentDate.getFullYear()
		const month = currentDate.getMonth()

		const firstDay = new Date(year, month, 1)
		const lastDay = new Date(year, month + 1, 0)
		const startDate = new Date(firstDay)

		// Adjust to start on Monday
		const dayOfWeek = (firstDay.getDay() + 6) % 7
		startDate.setDate(startDate.getDate() - dayOfWeek)

		const days = []
		const current = new Date(startDate)

		// Generate 42 days (6 weeks)
		for (let i = 0; i < 42; i++) {
			days.push(new Date(current))
			current.setDate(current.getDate() + 1)
		}

		return days
	}

	const navigateMonth = (direction: 'prev' | 'next') => {
		const newDate = new Date(currentDate)
		if (direction === 'prev') {
			newDate.setMonth(newDate.getMonth() - 1)
		} else {
			newDate.setMonth(newDate.getMonth() + 1)
		}
		setCurrentDate(newDate)
	}

	const goToToday = () => {
		setCurrentDate(new Date())
	}

	const calendarDays = generateCalendarDays()
	const currentMonth = currentDate.getMonth()
	const today = new Date()

	const EventCard = ({ event }: { event: Event }) => {
		const lowestPrice = getLowestPrice(event)

		return (
			<Dialog>
				<DialogTrigger asChild>
					<div
						className={`${eventTypeColors[event.typeCourse]} mb-1 cursor-pointer truncate rounded p-1 text-xs text-white transition-opacity hover:opacity-80`}
						onClick={() => setSelectedEvent(event)}
					>
						<div className="truncate font-medium">{event.name}</div>
						<div className="opacity-90">{event.location}</div>
					</div>
				</DialogTrigger>
				<DialogContent className="max-w-2xl border-gray-700 bg-gray-800 text-white">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-white">{event.name}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-3">
								<div className="flex items-center text-gray-300">
									<CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
									{formatDate(event.eventDate)}
								</div>
								<div className="flex items-center text-gray-300">
									<MapPin className="mr-2 h-4 w-4 text-gray-400" />
									{event.location}
								</div>
								{event.distanceKm && (
									<div className="flex items-center text-gray-300">
										<Route className="mr-2 h-4 w-4 text-gray-400" />
										{event.distanceKm}km
									</div>
								)}
								{event.elevationGainM && (
									<div className="flex items-center text-gray-300">
										<Mountain className="mr-2 h-4 w-4 text-gray-400" />
										{event.elevationGainM}m D+
									</div>
								)}
								{event.participants && (
									<div className="flex items-center text-gray-300">
										<Users className="mr-2 h-4 w-4 text-gray-400" />
										{event.participants} participants
									</div>
								)}
							</div>

							<div className="space-y-3">
								<div className="text-right">
									<div className="text-2xl font-bold text-white">À partir de {lowestPrice}€</div>
									{event.officialStandardPrice && lowestPrice < event.officialStandardPrice && (
										<div className="text-sm text-gray-400 line-through">{event.officialStandardPrice}€</div>
									)}
								</div>

								<Badge className={`${eventTypeColors[event.typeCourse]} border-0`}>
									{eventTypeLabels[event.typeCourse]}
								</Badge>

								{event.transferDeadline && (
									<div className="flex items-center text-sm text-gray-300">
										<Clock className="mr-2 h-4 w-4 text-gray-400" />
										Transfert jusqu'au {formatDate(event.transferDeadline)}
									</div>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<h4 className="font-semibold text-white">Description</h4>
							<p className="text-sm text-gray-300">{event.description}</p>
						</div>

						{event.bibPickupLocation && (
							<div className="space-y-2">
								<h4 className="font-semibold text-white">Retrait des dossards</h4>
								<div className="text-sm text-gray-300">
									<div>📍 {event.bibPickupLocation}</div>
									<div>
										📅 Du {formatDate(event.bibPickupWindowBeginDate)} au {formatDate(event.bibPickupWindowEndDate)}
									</div>
								</div>
							</div>
						)}

						{event.options && event.options.length > 0 && (
							<div className="space-y-2">
								<h4 className="font-semibold text-white">Options d'inscription</h4>
								<div className="space-y-1">
									{event.options.map(option => (
										<div key={option.id} className="flex items-center justify-between text-sm">
											<span className="text-gray-300">{option.name}</span>
											<span className="font-medium text-white">{option.price}€</span>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="flex gap-2 pt-4">
							{event.registrationUrl && (
								<Button
									className="flex-1 bg-blue-600 hover:bg-blue-700"
									disabled={!isRegistrationOpen(event.transferDeadline)}
									onClick={() => window.open(event.registrationUrl, '_blank')}
								>
									{!isRegistrationOpen(event.transferDeadline) ? 'Inscriptions fermées' : "S'inscrire"}
								</Button>
							)}
							{event.parcoursUrl && (
								<Button
									variant="outline"
									className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
									onClick={() => window.open(event.parcoursUrl, '_blank')}
								>
									<Route className="mr-2 h-4 w-4" />
									Parcours
								</Button>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
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

	return (
		<div className="min-h-screen bg-gray-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="mb-2 text-3xl font-bold text-white">Calendrier des Événements</h1>
						<p className="text-gray-400">Découvrez tous les événements sportifs par date</p>
					</div>

					<div className="flex items-center gap-2">
						<Select value={viewMode} onValueChange={(value: 'month' | 'week') => setViewMode(value)}>
							<SelectTrigger className="w-32 border-gray-700 bg-gray-800 text-white">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="border-gray-700 bg-gray-800">
								<SelectItem value="month" className="text-white hover:bg-gray-700">
									Mois
								</SelectItem>
								<SelectItem value="week" className="text-white hover:bg-gray-700">
									Semaine
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Calendar Navigation */}
				<Card className="mb-6 border-gray-700 bg-gray-800">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<Button
									variant="outline"
									size="sm"
									onClick={() => navigateMonth('prev')}
									className="border-gray-600 text-gray-300 hover:bg-gray-700"
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>

								<h2 className="text-2xl font-bold text-white">
									{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
								</h2>

								<Button
									variant="outline"
									size="sm"
									onClick={() => navigateMonth('next')}
									className="border-gray-600 text-gray-300 hover:bg-gray-700"
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>

							<Button
								variant="outline"
								size="sm"
								onClick={goToToday}
								className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
							>
								Aujourd'hui
							</Button>
						</div>
					</CardHeader>
				</Card>

				{/* Calendar Grid */}
				<Card className="border-gray-700 bg-gray-800">
					<CardContent className="p-0">
						{/* Day Headers */}
						<div className="grid grid-cols-7 border-b border-gray-700">
							{dayNames.map(day => (
								<div key={day} className="bg-gray-750 p-4 text-center text-sm font-medium text-gray-400">
									{day}
								</div>
							))}
						</div>

						{/* Calendar Days */}
						<div className="grid grid-cols-7">
							{calendarDays.map((day, index) => {
								const dayEvents = eventsByDate[day.toDateString()] || []
								const isCurrentMonth = day.getMonth() === currentMonth
								const isToday = day.toDateString() === today.toDateString()
								const hasEvents = dayEvents.length > 0

								return (
									<div
										key={index}
										className={`min-h-32 border-r border-b border-gray-700 p-2 ${
											!isCurrentMonth ? 'bg-gray-850 opacity-50' : 'bg-gray-800'
										} ${isToday ? 'bg-blue-900/30' : ''}`}
									>
										<div
											className={`mb-2 text-sm ${
												isToday
													? 'flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white'
													: isCurrentMonth
														? 'text-white'
														: 'text-gray-500'
											}`}
										>
											{day.getDate()}
										</div>

										<div className="space-y-1">
											{dayEvents.slice(0, 3).map(event => (
												<EventCard key={event.id} event={event} />
											))}

											{dayEvents.length > 3 && (
												<div className="py-1 text-center text-xs text-gray-400">+{dayEvents.length - 3} autres</div>
											)}
										</div>
									</div>
								)
							})}
						</div>
					</CardContent>
				</Card>

				{/* Event Statistics */}
				<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
					<Card className="border-gray-700 bg-gray-800">
						<CardContent className="p-4 text-center">
							<div className="text-2xl font-bold text-white">{prefetchedEvents.length}</div>
							<div className="text-sm text-gray-400">Événements total</div>
						</CardContent>
					</Card>

					<Card className="border-gray-700 bg-gray-800">
						<CardContent className="p-4 text-center">
							<div className="text-2xl font-bold text-blue-400">
								{prefetchedEvents.filter(e => e.typeCourse === 'route').length}
							</div>
							<div className="text-sm text-gray-400">Routes</div>
						</CardContent>
					</Card>

					<Card className="border-gray-700 bg-gray-800">
						<CardContent className="p-4 text-center">
							<div className="text-2xl font-bold text-orange-400">
								{prefetchedEvents.filter(e => e.typeCourse === 'trail').length}
							</div>
							<div className="text-sm text-gray-400">Trails</div>
						</CardContent>
					</Card>

					<Card className="border-gray-700 bg-gray-800">
						<CardContent className="p-4 text-center">
							<div className="text-2xl font-bold text-red-400">
								{prefetchedEvents.filter(e => e.typeCourse === 'triathlon').length}
							</div>
							<div className="text-sm text-gray-400">Triathlons</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
