import type { Event } from '@/models/event.model'

import { generateLocaleParams, LocaleParams } from '@/lib/generateStaticParams'
import { fetchApprovedPublicEvents } from '@/services/event.services'
import { getTranslations } from '@/lib/i18n/dictionary'

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
		<div className="min-h-screen">
			{/* Page header with title and description */}
			<header className="border-border bg-card/50 border-b px-6 py-4">
				<div className="mx-auto max-w-7xl">
					<h1 className="text-2xl font-bold">{t.events.title}</h1>
					<p className="text-muted-foreground text-sm">{t.events.description}</p>
				</div>
			</header>

			<EventListClient locale={locale} prefetchedEvents={events} />
		</div>
	)
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Disable static generation to avoid build failures when PocketBase is unavailable
export const dynamic = 'force-dynamic'
