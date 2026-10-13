'use client'

import { useEffect } from 'react'

import { daysToEventBucket } from '@/lib/analytics/buckets'
import type { CountBucket, Sport } from '@/lib/analytics/catalog'
import { trackView } from '@/lib/analytics/client'
import type { EventId } from '@/lib/analytics/ids'

interface EventViewTrackerProps {
	readonly eventId: EventId
	readonly sport: Sport
	readonly bibCount: CountBucket
	/** ISO date of the event: only its distance from now is sent, as a range */
	readonly eventDate: string | null
}

/** Sends event_view once when an event page is displayed. Renders nothing. */
export function EventViewTracker({ eventId, sport, bibCount, eventDate }: EventViewTrackerProps) {
	useEffect(() => {
		// Back from the waitlist server action: the same visit, not a new view of the page
		const params = new URLSearchParams(window.location.search)
		if (params.has('waitlist_success') || params.has('waitlist_error')) return

		trackView('event_view', {
			event_id: eventId,
			sport,
			bib_count: bibCount,
			days_to_event: daysToEventBucket(eventDate),
		})
	}, [eventId, sport, bibCount, eventDate])

	return null
}
