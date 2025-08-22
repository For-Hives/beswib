import type { Metadata } from 'next'

import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'

import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'
import { fetchApprovedPublicEventsWithBibs } from '@/services/event.services'
import { generateEventsMetadata } from '@/lib/seo/metadata-generators'
import { StructuredData } from '@/lib/seo'
import { getTranslations } from '@/lib/i18n/dictionary'

import EventListClient from './EventListClient'
import eventsTranslations from './locales.json'

// Dynamic SEO metadata
export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return generateEventsMetadata(locale)
}

export default async function EventsPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params
	const t = getTranslations(locale, eventsTranslations)

	let events: (Event & {
		expand?: {
			organizer?: Organizer
			bibs_via_eventId?: (Bib & { expand?: { sellerUserId: User } })[]
		}
	})[] = []
	let error: null | string = null

	try {
		events = await fetchApprovedPublicEventsWithBibs()
	} catch (e: unknown) {
		error = e instanceof Error ? e.message : String(e)
		console.error('Error fetching events:', error)
	}

	return (
		<>
			{/* SEO Structured Data */}
			<StructuredData 
				locale={locale} 
				type="events"
				breadcrumbs={[
					{ name: 'Events', item: '/events' }
				]}
			/>
			
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
		</>
	)
}

// Generate static params for all locales (for sitemap)
export function generateStaticParams() {
	return generateLocaleParams()
}
