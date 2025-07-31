import type { Event } from '@/models/event.model'

import { generateLocaleParams, LocaleParams } from '@/lib/generateStaticParams'
import { fetchApprovedPublicEvents } from '@/services/event.services'

import CalendarPage from './CalendarClient'

export default async function EventsPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	let events: Event[] = []
	let error: null | string = null

	try {
		events = await fetchApprovedPublicEvents()
	} catch (e: unknown) {
		error = e instanceof Error ? e.message : String(e)
		console.error('Error fetching events:', error)
	}

	return (
		<div className="p-5">
			<CalendarPage error={error} locale={locale} prefetchedEvents={events} />
		</div>
	)
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Disable static generation to avoid build failures when PocketBase is unavailable
export const dynamic = 'force-dynamic'
