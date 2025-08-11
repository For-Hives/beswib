'use client'

import type { Event } from '@/models/event.model'

import { Button } from '@/components/ui/button'

interface YearViewProps {
	getEventsForDate: (date: Date) => Event[]
	onDateSelect: (date: Date) => void
	selectedDate: Date
	locale?: string
}

export function YearView(props: Readonly<YearViewProps>) {
	const { selectedDate, onDateSelect, locale = 'en-US', getEventsForDate } = props
	const year = selectedDate.getFullYear()
	const months = Array.from({ length: 12 }, (_, i) => i)

	const getMonthDays = (month: number) => {
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

	return (
		<div className="p-4">
			<div className="grid grid-cols-3 gap-6">
				{months.map(month => {
					const monthDays = getMonthDays(month)
					const monthName = new Date(year, month, 1).toLocaleDateString(locale, { month: 'long' })

					return (
						<div className="rounded-lg border p-3" key={month}>
							<h3 className="mb-2 text-center font-medium">{monthName}</h3>
							<div className="grid grid-cols-7 gap-1">
								{[
									{ label: 'S', key: 'sun' },
									{ label: 'M', key: 'mon' },
									{ label: 'T', key: 'tue' },
									{ label: 'W', key: 'wed' },
									{ label: 'T', key: 'thu' },
									{ label: 'F', key: 'fri' },
									{ label: 'S', key: 'sat' },
								].map(day => (
									<div className="text-muted-foreground p-1 text-center text-xs" key={day.key}>
										{day.label}
									</div>
								))}
								{monthDays.map(day => {
									const isCurrentMonth = day.getMonth() === month
									const hasEvents = getEventsForDate(day).length > 0
									const isToday = day.toDateString() === new Date().toDateString()

									return (
										<Button
											className={`relative h-6 w-6 p-0 text-xs ${
												!isCurrentMonth ? 'text-muted-foreground' : ''
											} ${isToday ? 'bg-primary text-primary-foreground' : ''} ${hasEvents ? 'font-bold' : ''}`}
											key={day.toISOString()}
											onClick={() => onDateSelect(day)}
											size="sm"
											variant="ghost"
										>
											{day.getDate()}
											{hasEvents && (
												<div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-blue-500" />
											)}
										</Button>
									)
								})}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
