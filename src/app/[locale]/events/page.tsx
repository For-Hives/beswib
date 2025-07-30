import type { Event } from '@/models/event.model'

import { generateLocaleParams, LocaleParams } from '@/lib/generateStaticParams'
import { fetchApprovedPublicEvents } from '@/services/event.services'
import { getTranslations } from '@/lib/getDictionary'

import EventListClient from './EventListClient'
import eventsTranslations from './locales.json'

export default async function EventsPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params
	const t = getTranslations(locale, eventsTranslations)

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
			<h1 className="mb-5 text-center text-3xl">{t.events.title}</h1>
			<p className="mb-8 text-center text-gray-500">{t.events.description}</p>
			<EventListClient error={error} locale={locale} prefetchedEvents={events} />
		</div>
	)
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Disable static generation to avoid build failures when PocketBase is unavailable
export const dynamic = 'force-dynamic'
