'use client'

import type { Event } from '@/models/event.model'

interface WeekViewProps {
	getEventsForDate: (date: Date) => Event[]
	onEventSelect: (event: Event) => void
	selectedDate: Date
	locale?: string
}

export function WeekView(props: Readonly<WeekViewProps>) {
	const { selectedDate, onEventSelect, getEventsForDate, locale = 'en-US' } = props

	const getWeekDays = () => {
		const startOfWeek = new Date(selectedDate)
		const day = startOfWeek.getDay()
		startOfWeek.setDate(startOfWeek.getDate() - day)

		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date(startOfWeek)
			date.setDate(startOfWeek.getDate() + i)
			return date
		})
	}

	const weekDays = getWeekDays()
	const hours = Array.from({ length: 24 }, (_, i) => i)

	return (
		<div className="p-4">
			<div className="grid grid-cols-[60px_repeat(7,1fr)] gap-0 rounded-lg border">
				{/* Header */}
				<div className="border-r border-b p-2"></div>
				{weekDays.map(day => (
					<div className="border-b p-2 text-center" key={day.toISOString()}>
						<div className="text-muted-foreground text-xs">{day.toLocaleDateString(locale, { weekday: 'short' })}</div>
						<div className="font-medium">{day.getDate()}</div>
					</div>
				))}

				{/* Time slots */}
				{hours.map(hour => (
					<div className="contents" key={hour}>
						<div className="text-muted-foreground border-r border-b p-2 text-right text-xs">{formatHour(hour)}</div>
						{weekDays.map(day => (
							<div className="relative min-h-[40px] border-r border-b p-1" key={`${day.toISOString()}-${hour}`}>
								{getEventsForDate(day)
									.filter(event => getEventHour(event) === hour)
									.map(event => renderEvent(event, onEventSelect))}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}

function formatHour(hour: number): string {
	if (hour === 0) return '12 AM'
	if (hour < 12) return `${hour} AM`
	if (hour === 12) return '12 PM'
	return `${hour - 12} PM`
}

function getEventHour(event: Event): number {
	return event.eventDate.getHours()
}

function renderEvent(event: Event, onEventSelect: (event: Event) => void) {
	return (
		<button
			className="mb-1 w-full cursor-pointer rounded bg-blue-500 p-1 text-xs text-white transition-colors hover:bg-blue-600"
			key={event.id}
			onClick={() => onEventSelect(event)}
			type="button"
		>
			<div className="truncate font-medium">{event.name}</div>
			<div className="opacity-90">{event.typeCourse}</div>
		</button>
	)
}
