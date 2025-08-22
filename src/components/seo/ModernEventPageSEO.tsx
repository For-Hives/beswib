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

/**
 * Modern, centralized SEO component for event pages
 * Replaces the old EventPageSEO component with cleaner architecture
 *
 * Usage:
 * import { ModernEventPageSEO } from '@/components/seo/ModernEventPageSEO'
 * import { generateEventMetadata } from '@/lib/seo'
 *
 * // In your page.tsx
 * export async function generateMetadata({ params }: { params: { locale: Locale, id: string } }): Promise<Metadata> {
 *   const event = await getEvent(params.id)
 *   return generateEventMetadata(params.locale, event)
 * }
 *
 * // In your component
 * <ModernEventPageSEO
 *   event={event}
 *   organizer={organizer}
 *   locale={locale}
 *   breadcrumbs={[
 *     { name: 'Home', item: '/' },
 *     { name: 'Events', item: '/events' },
 *     { name: event.name, item: `/events/${event.id}` }
 *   ]}
 * />
 */
export function ModernEventPageSEO({ organizer, locale, event, breadcrumbs }: ModernEventPageSEOProps) {
	return <StructuredData locale={locale} type="event" event={event} organizer={organizer} breadcrumbs={breadcrumbs} />
}

export default ModernEventPageSEO
