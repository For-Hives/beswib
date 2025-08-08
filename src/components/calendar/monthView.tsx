'use client'

import type { Event } from '@/models/event.model'

import { Button } from '@/components/ui/button'

interface MonthViewProps {
	getEventsForDate: (date: Date) => Event[]
	onDateSelect: (date: Date) => void
	onEventSelect: (event: Event) => void
	selectedDate: Date
}

export function MonthView(props: Readonly<MonthViewProps>) {
	const { selectedDate, onEventSelect, getEventsForDate } = props

	const getMonthDays = () => {
		const year = selectedDate.getFullYear()
		const month = selectedDate.getMonth()

		const firstDay = new Date(year, month, 1)
		const startDate = new Date(firstDay)
		startDate.setDate(startDate.getDate() - firstDay.getDay())

		const days = []
		const current = new Date(startDate)

		for (let i = 0; i < 42; i++) {
			days.push(new Date(current))
			current.setDate(current.getDate() + 1)
		}

		return days
	}

	const monthDays = getMonthDays()
	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

	const getEventColor = (typeCourse: Event['typeCourse']) => {
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

	function getDayClass(isToday: boolean, isSelected: boolean): string {
		if (isToday) return 'bg-primary text-primary-foreground'
		if (isSelected) return 'bg-accent'
		return ''
	}

	return (
		<div className="p-4">
			<div className="grid grid-cols-7 gap-0 rounded-lg border">
				{/* Header */}
				{weekDays.map(day => (
					<div className="border-b p-3 text-center text-sm font-medium" key={day}>
						{day}
					</div>
				))}

				{/* Days */}
				{monthDays.map(day => {
					const dayEvents = getEventsForDate(day)
					const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
					const isToday = day.toDateString() === new Date().toDateString()
					const isSelected = day.toDateString() === selectedDate.toDateString()

					return (
						<div
							className={`min-h-[120px] border-r border-b p-2 ${
								!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
							}`}
							key={day.toISOString()}
						>
							<Button
								className={`mb-1 h-6 w-6 p-0 ${getDayClass(isToday, isSelected)}`}
								onClick={() => props.onDateSelect(day)}
								size="sm"
								variant="ghost"
							>
								{day.getDate()}
							</Button>

							<div className="space-y-1">
								{dayEvents.slice(0, 3).map(event => (
									<button
										className={`${getEventColor(event.typeCourse)} w-full cursor-pointer rounded p-1 text-left text-xs text-white transition-opacity hover:opacity-80`}
										key={event.id}
										onClick={e => {
											e.stopPropagation()
											onEventSelect(event)
										}}
										title={`${event.name} - ${event.distanceKm}km ${event.typeCourse}`}
									>
										<div className="truncate font-medium">{event.name}</div>
										<div className="truncate opacity-90">
											{event.distanceKm}km {event.typeCourse}
										</div>
									</button>
								))}
								{dayEvents.length > 3 && (
									<div className="text-muted-foreground text-xs">+{dayEvents.length - 3} more</div>
								)}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
