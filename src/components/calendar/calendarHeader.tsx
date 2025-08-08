'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface CalendarHeaderProps {
	onDateChange: (date: Date) => void
	onViewModeChange: (mode: ViewMode) => void
	selectedDate: Date
	viewMode: ViewMode
	locale?: string
}

// Déclaration locale du type ViewMode (day, month, week, year)
type ViewMode = 'day' | 'month' | 'week' | 'year'

export function CalendarHeader(props: Readonly<CalendarHeaderProps>) {
	const { viewMode, selectedDate, onViewModeChange, onDateChange, locale = 'en-US' } = props

	const formatHeaderDate = () => {
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
		}

		if (viewMode === 'day') {
			return selectedDate.toLocaleDateString(locale, {
				year: 'numeric',
				weekday: 'long',
				month: 'long',
				day: 'numeric',
			})
		}

		return selectedDate.toLocaleDateString(locale, options)
	}

	const navigateDate = (direction: 'next' | 'prev') => {
		const newDate = new Date(selectedDate)

		switch (viewMode) {
			case 'day':
				newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
				break
			case 'month':
				newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
				break
			case 'week':
				newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
				break
			case 'year':
				newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1))
				break
		}

		onDateChange(newDate)
	}

	const goToToday = () => {
		onDateChange(new Date())
	}

	return (
		<div className="flex items-center justify-between border-b p-4">
			<div className="flex items-center space-x-4">
				<Button onClick={goToToday} variant="outline">
					Today
				</Button>
				<div className="flex items-center space-x-1">
					<Button className="" onClick={() => navigateDate('prev')} size="icon" variant="ghost">
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button className="" onClick={() => navigateDate('next')} size="icon" variant="ghost">
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
				<h1 className="text-xl font-semibold">{formatHeaderDate()}</h1>
			</div>
			<div className="flex items-center space-x-1">
				{(['day', 'month', 'week', 'year'] as ViewMode[]).map(mode => (
					<Button
						className="capitalize"
						key={mode}
						onClick={() => onViewModeChange(mode)}
						size="sm"
						variant={viewMode === mode ? 'default' : 'ghost'}
					>
						{mode}
					</Button>
				))}
			</div>
		</div>
	)
}
