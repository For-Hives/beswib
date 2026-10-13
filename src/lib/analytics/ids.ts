import type { Article } from '@/models/article.model'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'
import type { Transaction } from '@/models/transaction.model'
import type { Waitlist } from '@/models/waitlist.model'

// Nominal ids. The catalogue only accepts a BibId, an EventId or an ArticleId, and the helpers
// below are the only way to build one. Each takes a MODEL OBJECT (never a bare string) and asks
// for a second field that only that model has, so a user, a waitlist record, a transaction or a
// route parameter cannot be passed by mistake. Do not cast a string to one of these types.

declare const analyticsId: unique symbol

type AnalyticsId<K extends string> = string & { readonly [analyticsId]: K }

export type BibId = AnalyticsId<'bib'>
export type EventId = AnalyticsId<'event'>
export type ArticleId = AnalyticsId<'article'>

type BibLike = Pick<Bib, 'id' | 'eventId'> | Pick<BibSale, 'id' | 'event'>
type EventLike = Pick<Event, 'id' | 'typeCourse'> | Pick<BibSale['event'], 'id' | 'type'>

/** Id of a bib, from a Bib record or a marketplace BibSale. */
export function bibIdOf(bib: BibLike): BibId {
	return String(bib.id) as BibId
}

/** Id of the bib a transaction paid for (transaction.bib_id), never the transaction id. */
export function bibIdOfTransaction(transaction: Pick<Transaction, 'bib_id' | 'amount'>): BibId {
	return String(transaction.bib_id) as BibId
}

/** Id of an event, from an Event record or the `event` of a BibSale. */
export function eventIdOf(event: EventLike): EventId {
	return String(event.id) as EventId
}

/** Id of the event a bib belongs to (bib.eventId). */
export function eventIdOfBib(bib: Pick<Bib, 'id' | 'eventId'>): EventId {
	return String(bib.eventId) as EventId
}

/** Id of the event a waitlist entry is about (waitlist.event_id), never the waitlist id. */
export function eventIdOfWaitlist(waitlist: Pick<Waitlist, 'event_id' | 'added_at'>): EventId {
	return String(waitlist.event_id) as EventId
}

/** Id of a blog article. */
export function articleIdOf(article: Pick<Article, 'id' | 'slug'>): ArticleId {
	return String(article.id) as ArticleId
}
