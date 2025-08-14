import Link from 'next/link'

import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { formatDateObjectForDisplay } from '@/lib/utils/date'
import { getTranslations } from '@/lib/i18n/dictionary'

import calendarTranslations from './locales.json'

interface CalendarEventListProps {
	readonly groupedEvents: GroupedEvents
	readonly sortedMonthKeys: string[]
	readonly t: { calendar: { noEvents: string } }
	readonly locale: Locale
}

interface GroupedEvents {
	[yearMonth: string]: Event[]
}

export default function CalendarEventList({ t, sortedMonthKeys, locale, groupedEvents }: CalendarEventListProps) {
	const calendarT = getTranslations(locale, calendarTranslations)
	return (
		<main className="mx-auto max-w-4xl">
			{sortedMonthKeys.length > 0 ? (
				sortedMonthKeys.map(monthKey => (
					<section className="mb-8" key={monthKey}>
						<h2 className="mb-5 border-b-2 border-gray-200 pb-2.5 text-2xl">{monthKey}</h2>
						<div className="grid grid-cols-1 gap-6">
							{groupedEvents[monthKey].map(event => (
								<div
									className="bg-card/80 border-border relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border p-5 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md transition-all duration-300 hover:border-white/35"
									key={event.id}
								>
									<h2 className="text-lg font-bold text-gray-200"> {event.name} </h2>
									<p className="text-muted-foreground mt-2 text-sm">
										<strong>{calendarT.date}:</strong> {formatDateObjectForDisplay(event.eventDate, locale)}
									</p>
									<p className="text-muted-foreground mt-1 text-sm">
										<strong>{calendarT.location}:</strong> {event.location}
									</p>
									{event.description != null && event.description !== '' && (
										<p className="mt-1 text-xs text-gray-400">
											{event.description.substring(0, 100)}
											{event.description.length > 100 ? '...' : ''}
										</p>
									)}
									<div className="mt-auto pt-4">
										<Link
											className="border-border bg-accent/20 text-accent-foreground hover:bg-accent/30 hover:text-foreground flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium backdrop-blur-md transition"
											href={`/events/${event.id}`}
										>
											{calendarT.viewEvent}
										</Link>
									</div>
								</div>
							))}
						</div>
					</section>
				))
			) : (
				<p className="text-center text-lg">{t.calendar.noEvents}</p>
			)}
		</main>
	)
}
