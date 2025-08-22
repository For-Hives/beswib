import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { StructuredData } from '@/lib/seo'

interface ModernEventPageSEOProps {
	event: Event
	organizer?: Organizer
	locale: Locale
	breadcrumbs?: Array<{ name: string; item: string }>
}

export function ModernEventPageSEO({ organizer, locale, event, breadcrumbs }: ModernEventPageSEOProps) {
	return <StructuredData locale={locale} type="event" event={event} organizer={organizer} breadcrumbs={breadcrumbs} />
}

export default ModernEventPageSEO
