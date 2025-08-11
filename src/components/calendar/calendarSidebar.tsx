'use client'

import type { Event } from '@/models/event.model'

import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'
import { Calendar } from '@/components/ui/calendar'

interface CalendarSidebarProps {
	events: Event[]
	onDateSelect: (date: Date | undefined) => void
	selectedDate: Date
}

export function CalendarSidebar(props: Readonly<CalendarSidebarProps>) {
	const { selectedDate, onDateSelect, events } = props

	const currentYear = new Date().getFullYear()
	const year = selectedDate.getFullYear()
	const month = selectedDate.getMonth()
	const day = selectedDate.getDate()

	const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
	const months = Array.from({ length: 12 }, (_, i) => i)
	const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
	const days = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1)

	const handleChange = (newYear: number, newMonth: number, newDay: number) => {
		const maxDay = getDaysInMonth(newYear, newMonth)
		const safeDay = Math.min(newDay, maxDay)
		const newDate = new Date(newYear, newMonth, safeDay)
		onDateSelect(newDate)
	}

	// Convert arrays to SelectOption format
	const yearOptions: SelectOption[] = years.map(y => ({
		value: y.toString(),
		label: y.toString(),
	}))

	const monthOptions: SelectOption[] = months.map(m => ({
		value: m.toString(),
		label: new Date(0, m).toLocaleString('default', { month: 'short' }),
	}))

	const dayOptions: SelectOption[] = days.map(d => ({
		value: d.toString(),
		label: d.toString(),
	}))

	return (
		<div className="bg-muted/10 flex w-80 flex-col border-r p-4">
			<div className="relative mb-4 flex gap-2">
				<SelectAnimated
					className="flex-1"
					contentClassName="w-full"
					onValueChange={value => handleChange(Number(value), month, day)}
					options={yearOptions}
					placeholder="Year"
					value={year.toString()}
				/>
				<SelectAnimated
					className="flex-1"
					contentClassName="w-full"
					onValueChange={value => handleChange(year, Number(value), day)}
					options={monthOptions}
					placeholder="Month"
					value={month.toString()}
				/>
				<SelectAnimated
					className="flex-1"
					contentClassName="w-full"
					onValueChange={value => handleChange(year, month, Number(value))}
					options={dayOptions}
					placeholder="Day"
					value={day.toString()}
				/>
			</div>

			<Calendar
				classNames={{ root: 'w-full' }}
				events={events}
				mode="single"
				onSelect={onDateSelect}
				selected={selectedDate}
			/>
		</div>
	)
}
