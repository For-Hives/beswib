import { Calendar, CheckCircle, MapPin, Plus, Search, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'

import Link from 'next/link'

import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'

import { Card, CardContent } from '@/components/ui/card'
import { formatDateSimple } from '@/lib/dateUtils'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'

interface EventSelectionStepProps {
	availableEvents: (Event & { expand?: { organizer?: Organizer } })[]
	error?: string
	locale: Locale
	onEventSelect: (event: Event & { expand?: { organizer?: Organizer } }) => void
	selectedEvent: (Event & { expand?: { organizer?: Organizer } }) | null
}

import sellBibTranslations from '@/app/[locale]/dashboard/seller/sell-bib/locales.json'
import { getTranslations } from '@/lib/getDictionary'
import { Locale } from '@/lib/i18n-config'

export default function EventSelectionStep({
	selectedEvent,
	onEventSelect,
	locale,
	error,
	availableEvents,
}: Readonly<EventSelectionStepProps>) {
	const t = getTranslations(locale, sellBibTranslations)

	const [searchQuery, setSearchQuery] = useState('')

	// Filter events: exclude past events and apply search query
	const filteredEvents = availableEvents.filter(event => {
		// Filter out past events (events before today)
		const eventDate = new Date(event.eventDate)
		const today = new Date()
		today.setHours(0, 0, 0, 0) // Reset time to compare only dates

		const isNotPastEvent = eventDate >= today

		// Apply search filter
		const matchesSearch =
			searchQuery === '' ||
			event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.location.toLowerCase().includes(searchQuery.toLowerCase())

		return isNotPastEvent && matchesSearch
	})

	return (
		<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
			{/* Section Header */}
			<div>
				<h2 className="text-foreground text-2xl font-semibold">{t.form.eventSelection.eventInfo}</h2>
				<p className="text-muted-foreground mt-2 text-base leading-7">{t.steps.eventSelection.description}</p>
			</div>

			{/* Event Selection Content */}
			<div className="md:col-span-2">
				{/* Search */}
				<div className="relative mb-6">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<Input
						className="pl-10"
						onChange={e => setSearchQuery(e.target.value)}
						placeholder={t.form.eventSelection.searchPlaceholder}
						type="text"
						value={searchQuery}
					/>
				</div>

				{/* Events List */}
				<div className="max-h-96 space-y-4 overflow-y-auto">
					{filteredEvents.length === 0 ? (
						<div className="text-muted-foreground py-8 text-center">{t.form.eventSelection.noEventsFound}</div>
					) : (
						filteredEvents.map(event => (
							<Card
								className={`dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${
									selectedEvent?.id === event.id ? 'ring-primary border-primary bg-primary/5 ring-2' : ''
								}`}
								key={event.id}
								onClick={() => onEventSelect(event)}
							>
								<CardContent className="p-4">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h3 className="mb-2 text-lg font-semibold">{event.name}</h3>
											<div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
												<div className="flex items-center gap-2">
													<Calendar className="h-4 w-4" />
													{(() => {
														const formatted = formatDateSimple(event.eventDate)
														if (formatted) return formatted

														// Fallback: simple date formatting
														try {
															const date = new Date(event.eventDate)
															if (isNaN(date.getTime())) return 'Invalid Date'

															const year = date.getFullYear()
															const month = String(date.getMonth() + 1).padStart(2, '0')
															const day = String(date.getDate()).padStart(2, '0')
															return `${year}-${month}-${day}`
														} catch {
															return 'Date Error'
														}
													})()}
												</div>
												<div className="flex items-center gap-2">
													<MapPin className="h-4 w-4" />
													{event.location}
												</div>
												{event.distanceKm !== null && event.distanceKm !== undefined && event.distanceKm > 0 && (
													<div className="flex items-center gap-2">
														<TrendingUp className="h-4 w-4" />
														{event.distanceKm} km
													</div>
												)}
												{event.participants !== null && event.participants !== undefined && event.participants > 0 && (
													<div className="flex items-center gap-2">
														<Users className="h-4 w-4" />
														{event.participants} participants
													</div>
												)}
											</div>
											{event.expand?.organizer && (
												<p className="text-muted-foreground mt-2 text-xs">by {event.expand.organizer.name}</p>
											)}
										</div>
										{selectedEvent?.id === event.id && (
											<CheckCircle className="text-primary absolute top-0 right-0 m-4 h-6 w-6" />
										)}
									</div>
								</CardContent>
							</Card>
						))
					)}
				</div>

				{/* Request New Event Section */}
				<div className="mt-6 border-t pt-6">
					<Card className="border-2 border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-600 dark:bg-gray-800/50">
						<CardContent className="p-6 text-center">
							<Plus className="mx-auto mb-3 h-8 w-8 text-gray-400" />
							<h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
								{t.form.eventSelection.requestNewEvent}
							</h3>
							<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
								{t.form.eventSelection.requestNewEventDescription}
							</p>
							<Link href="/dashboard/seller/request-event">
								<Button className="gap-2" variant="outline">
									<Plus className="h-4 w-4" />
									{t.form.eventSelection.requestNewEventButton}
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>

				{error !== null && error !== undefined && error !== '' && (
					<p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
				)}
			</div>
		</div>
	)
}
