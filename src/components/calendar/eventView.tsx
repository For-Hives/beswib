'use client'

import { Calendar, Clock, DollarSign, ExternalLink, Globe, Mail, MapPin, Route, Users, X } from 'lucide-react'

import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'

import { TriathlonIcon, TrailIcon, RouteIcon, CycleIcon } from '@/components/icons/RaceTypeIcons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EventViewProps {
	event: Event
	onClose: () => void
	organizer?: Organizer
	locale?: string
}

export function EventView(props: Readonly<EventViewProps>) {
	const { organizer, onClose, locale = 'en-US', event } = props

	const formatDate = (date: Date) => {
		return date.toLocaleDateString(locale, {
			year: 'numeric',
			weekday: 'long',
			month: 'long',
			day: 'numeric',
		})
	}

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString(locale, {
			minute: '2-digit',
			hour12: true,
			hour: 'numeric',
		})
	}

	const formatDateTime = (date: Date) => {
		return `${formatDate(date)} at ${formatTime(date)}`
	}

	const getEventTypeColor = (typeCourse: Event['typeCourse']) => {
		switch (typeCourse) {
			case 'road':
				return 'bg-blue-500'
			case 'trail':
				return 'bg-green-500'
			case 'triathlon':
				return 'bg-purple-500'
			case 'cycle':
				return 'bg-red-500'
			default:
				return 'bg-gray-500'
		}
	}

	const getEventTypeIcon = (typeCourse: Event['typeCourse']) => {
		switch (typeCourse) {
			case 'road':
				return <RouteIcon className="h-4 w-4" />
			case 'trail':
				return <TrailIcon className="h-4 w-4" />
			case 'triathlon':
				return <TriathlonIcon className="h-4 w-4" />
			case 'cycle':
				return <CycleIcon className="h-4 w-4" />
			default:
				return <RouteIcon className="h-4 w-4" />
		}
	}

	const isRegistrationOpen = () => {
		if (!event.transferDeadline) return true
		return new Date() < event.transferDeadline
	}

	const isBibPickupActive = () => {
		const now = new Date()
		return now >= event.bibPickupWindowBeginDate && now <= event.bibPickupWindowEndDate
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="flex max-h-[90vh] w-full max-w-2xl flex-col">
				<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
					<div className="flex-1">
						<div className="mb-2 flex items-center gap-2">
							<Badge className={`${getEventTypeColor(event.typeCourse)} text-white`}>
								{getEventTypeIcon(event.typeCourse)}
								<span className="ml-1 capitalize">{event.typeCourse}</span>
							</Badge>
							{!isRegistrationOpen() && <Badge variant="destructive">Registration Closed</Badge>}
							{isBibPickupActive() && (
								<Badge className="bg-orange-500" variant="default">
									Bib Pickup Open
								</Badge>
							)}
						</div>
						<CardTitle className="text-2xl">{event.name}</CardTitle>
					</div>
					<Button onClick={onClose} size="icon" variant="ghost">
						<X className="h-4 w-4" />
					</Button>
				</CardHeader>

				<div className="flex-1 overflow-y-auto">
					<CardContent className="space-y-6">
						{/* Event Details */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<Calendar className="text-muted-foreground h-4 w-4" />
									<div>
										<div className="font-medium">{formatDateTime(event.eventDate)}</div>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<MapPin className="text-muted-foreground h-4 w-4" />
									<div className="font-medium">{event.location}</div>
								</div>

								{typeof event.distanceKm === 'number' && !isNaN(event.distanceKm) && (
									<div className="flex items-center gap-2">
										<Route className="text-muted-foreground h-4 w-4" />
										<div>
											<span className="font-medium">{event.distanceKm} km</span>
											{typeof event.elevationGainM === 'number' && !isNaN(event.elevationGainM) && (
												<span className="text-muted-foreground ml-2">(+{event.elevationGainM}m elevation)</span>
											)}
										</div>
									</div>
								)}
							</div>

							<div className="space-y-3">
								{typeof event.participants === 'number' && !isNaN(event.participants) && (
									<div className="flex items-center gap-2">
										<Users className="text-muted-foreground h-4 w-4" />
										<div className="font-medium">{event.participants} participants</div>
									</div>
								)}

								{typeof event.officialStandardPrice === 'number' && !isNaN(event.officialStandardPrice) && (
									<div className="flex items-center gap-2">
										<DollarSign className="text-muted-foreground h-4 w-4" />
										<div className="font-medium">${event.officialStandardPrice}</div>
									</div>
								)}

								{event.transferDeadline && (
									<div className="flex items-center gap-2">
										<Clock className="text-muted-foreground h-4 w-4" />
										<div>
											<div className="text-muted-foreground text-sm">Transfer Deadline</div>
											<div className="font-medium">{formatDate(event.transferDeadline)}</div>
										</div>
									</div>
								)}
							</div>
						</div>

						<Separator />

						{/* Description */}
						<div>
							<h3 className="mb-2 font-semibold">Description</h3>
							<p className="text-muted-foreground leading-relaxed">{event.description}</p>
						</div>

						{/* Registration Options */}
						{event?.options && event.options.length > 0 && (
							<>
								<Separator />
								<div>
									<h3 className="mb-3 font-semibold">Registration Options</h3>
									<div className="space-y-2">
										{event?.options.map(option => (
											<div className="flex items-center justify-between rounded-lg border p-3" key={option.key}>
												<div>
													<div className="font-medium">{option.label}</div>
												</div>
												{option.values.length > 0 && <div className="font-semibold">{option.values.join(', ')} €</div>}
											</div>
										))}
									</div>
								</div>
							</>
						)}

						{/* Bib Pickup */}
						{typeof event.bibPickupLocation === 'string' && event.bibPickupLocation.length > 0 && (
							<>
								<Separator />
								<div>
									<h3 className="mb-3 font-semibold">Bib Pickup</h3>
									<div className="space-y-2">
										<div>
											<span className="font-medium">Location: </span>
											{event.bibPickupLocation}
										</div>
										<div>
											<span className="font-medium">Window: </span>
											{formatDateTime(event.bibPickupWindowBeginDate)} - {formatDateTime(event.bibPickupWindowEndDate)}
										</div>
									</div>
								</div>
							</>
						)}

						{/* Organizer */}
						{organizer && (
							<>
								<Separator />
								<div>
									<h3 className="mb-3 font-semibold">Organizer</h3>
									<div className="space-y-2">
										<div className="font-medium">{organizer.name}</div>
										<div className="flex flex-wrap gap-4 text-sm">
											{organizer.email && (
												<div className="flex items-center gap-1">
													<Mail className="h-3 w-3" />
													<a className="text-blue-600 hover:underline" href={`mailto:${organizer.email}`}>
														{organizer.email}
													</a>
												</div>
											)}
											{typeof organizer.website === 'string' && organizer.website.length > 0 && (
												<div className="flex items-center gap-1">
													<Globe className="h-3 w-3" />
													<a
														className="text-blue-600 hover:underline"
														href={organizer.website}
														rel="noopener noreferrer"
														target="_blank"
													>
														Website
													</a>
												</div>
											)}
										</div>
									</div>
								</div>
							</>
						)}

						{/* Action Buttons */}
						<Separator />
						<div className="flex flex-wrap gap-3">
							{typeof event.registrationUrl === 'string' &&
								event.registrationUrl.length > 0 &&
								isRegistrationOpen() && (
									<Button asChild>
										<a href={event.registrationUrl} rel="noopener noreferrer" target="_blank">
											<ExternalLink className="mr-2 h-4 w-4" />
											Register Now
										</a>
									</Button>
								)}
							{typeof event.parcoursUrl === 'string' && event.parcoursUrl.length > 0 && (
								<Button asChild variant="outline">
									<a href={event.parcoursUrl} rel="noopener noreferrer" target="_blank">
										<Route className="mr-2 h-4 w-4" />
										View Course
									</a>
								</Button>
							)}
						</div>
					</CardContent>
				</div>
			</Card>
		</div>
	)
}
