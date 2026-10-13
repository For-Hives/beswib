// Compile-time guarantees of the analytics catalogue. This file is never run: it is checked by
// `pnpm tsc`. Every @ts-expect-error below is a call that MUST NOT compile; if one of them starts
// compiling, tsc reports the directive as unused and the check fails.

import { umamiAttrs } from '@/lib/analytics/attrs'
import type { ClientEventName, EventName, EventProps, ServerEventName } from '@/lib/analytics/catalog'
import { track, trackView } from '@/lib/analytics/client'
import {
	type ArticleId,
	articleIdOf,
	type BibId,
	bibIdOf,
	bibIdOfTransaction,
	type EventId,
	eventIdOf,
	eventIdOfBib,
	eventIdOfWaitlist,
} from '@/lib/analytics/ids'
import { trackServer } from '@/lib/analytics/server'
import type { Article } from '@/models/article.model'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'
import type { Transaction } from '@/models/transaction.model'
import type { User } from '@/models/user.model'
import type { Waitlist } from '@/models/waitlist.model'

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

declare const bib: Bib
declare const bibSale: BibSale
declare const event: Event
declare const article: Article
declare const transaction: Transaction
declare const waitlist: Waitlist
declare const user: User
declare const routeParam: string
declare const condition: boolean

export function validCalls(): void {
	const bibId = bibIdOf(bib)
	const eventId = eventIdOf(event)
	const articleId = articleIdOf(article)

	// Every way of building an id
	const ids: [BibId, BibId, BibId, EventId, EventId, EventId, EventId, ArticleId] = [
		bibId,
		bibIdOf(bibSale),
		bibIdOfTransaction(transaction),
		eventId,
		eventIdOf(bibSale.event),
		eventIdOfBib(bib),
		eventIdOfWaitlist(waitlist),
		articleId,
	]
	void ids

	track('show_special_tooltip')
	track('cta_click', { cta: 'sell_bib', where: 'hero' })
	track('bib_card_click', {
		where: 'marketplace',
		target: 'bib',
		position: 1,
		bib_id: bibId,
		event_id: eventId,
		price_bucket: '50_99',
	})
	// Optional properties may be left out or undefined
	track('bib_view', { state: 'token_required', listing: 'private', viewer: 'anonymous' })
	track('bib_view', { state: 'available', listing: 'public', viewer: 'own_bib', bib_id: undefined, event_id: eventId })
	trackView('contact_form_start', { prefilled: false })
	trackView('event_request_start')

	// The attribute helper takes every browser event: integers and booleans are written as
	// strings and read back by the before-send hook
	umamiAttrs('show_special_tooltip')
	umamiAttrs('cta_click', { cta: 'sell_bib', where: 'hero' })
	umamiAttrs('paypal_onboarding_open', { via: 'popup', popup_blocked: false })
	umamiAttrs('article_click', { position: 2, article_id: articleId })

	trackServer('account_create_success')
	trackServer('paypal_webhook_error', { kind: 'exception' })
	trackServer('sale_success', { bib_id: bibIdOfTransaction(transaction), price_bucket: '50_99' })
}

export function wrongName(): void {
	// @ts-expect-error unknown event
	track('hero_cta_click')
	// @ts-expect-error unknown event
	trackView('page_view')
	// @ts-expect-error unknown event
	umamiAttrs('Signup')
	// @ts-expect-error unknown event
	trackServer('user_created')
	// @ts-expect-error an arbitrary string is not an event name
	track(routeParam)
}

export function undeclaredProperty(): void {
	// @ts-expect-error `label` is not a property of cta_click
	track('cta_click', { cta: 'sell_bib', where: 'hero', label: 'Sell my bib' })
	// @ts-expect-error `locale` is added by the hook, never by the caller
	track('cta_click', { cta: 'sell_bib', where: 'hero', locale: 'fr' })
	// @ts-expect-error `email` is not a property of anything
	umamiAttrs('cta_click', { cta: 'sell_bib', where: 'hero', email: 'runner@example.com' })
	// @ts-expect-error `user_id` is not a property of any server event
	trackServer('paypal_webhook_error', { kind: 'exception', user_id: user.id })
	// @ts-expect-error an event without properties takes no bag
	track('show_special_tooltip', { clicked: true })
	// @ts-expect-error seller-side events do not carry bib_id
	track('listing_update_error', { action: 'price', event_id: eventIdOfBib(bib), bib_id: bibIdOf(bib) })
}

export function valueOutsideItsList(): void {
	// @ts-expect-error 'homepage' is not a member of the `where` list
	track('cta_click', { cta: 'sell_bib', where: 'homepage' })
	// @ts-expect-error a free string is not a member
	track('cta_click', { cta: routeParam, where: 'hero' })
	// @ts-expect-error an amount is not a price bucket
	trackServer('sale_success', { bib_id: bibIdOf(bib), price_bucket: '85.00' })
	// @ts-expect-error a number is not a bucket
	track('search_submit', { where: 'marketplace', result_count: 3, has_filters: false })
	// @ts-expect-error a string is not a boolean
	track('contact_form_start', { prefilled: 'false' })
	// @ts-expect-error a string is not an integer
	umamiAttrs('article_click', { position: '2', article_id: articleIdOf(article) })
	// @ts-expect-error an error message is not a closed kind
	trackServer('paypal_webhook_error', { kind: new Error('boom').message })
}

export function missingRequiredProperty(): void {
	// @ts-expect-error `where` is required
	track('cta_click', { cta: 'sell_bib' })
	// @ts-expect-error the bag is required
	track('cta_click')
	// @ts-expect-error the bag is required
	trackView('contact_form_start')
	// @ts-expect-error the bag is required
	umamiAttrs('cta_click')
	// @ts-expect-error `kind` is required
	trackServer('paypal_webhook_error', {})
	// @ts-expect-error a required property cannot be undefined
	track('cta_click', { cta: 'sell_bib', where: undefined })
}

export function unionOfNames(): void {
	const method = 'password' as const

	// One literal event name per call. A union of names would only ask for the properties the
	// members have in common, and the event would then be dropped at run time.
	// @ts-expect-error sign_in_success also requires `intent`: branch with if / else
	track(condition ? 'sign_up_success' : 'sign_in_success', { method })
	// @ts-expect-error both members require properties
	track(condition ? 'cta_click' : 'menu_open')
	// @ts-expect-error both members require properties
	trackView(condition ? 'profile_view' : 'contact_form_start')
	// @ts-expect-error both members require properties
	trackServer(condition ? 'paypal_webhook_error' : 'sale_success')
	// @ts-expect-error both members require properties
	umamiAttrs(condition ? 'theme_change' : 'menu_open')
	// @ts-expect-error a union is refused even when no member has a property
	track(condition ? 'private_token_submit' : 'private_token_cancel')
	// @ts-expect-error a union is refused even when the bag fits every member
	track(condition ? 'sign_up_success' : 'sign_up_submit', { method })

	// The way to write it
	if (condition) track('sign_up_success', { method })
	else track('sign_in_success', { method, intent: 'none' })
}

export function wrongSide(): void {
	// @ts-expect-error a server event cannot be sent from the browser
	track('sale_success', { bib_id: bibIdOf(bib), price_bucket: '50_99' })
	// @ts-expect-error a server event cannot be sent from the browser
	trackView('account_create_success')
	// @ts-expect-error a server event has no attribute form
	umamiAttrs('paypal_kyc_success')
	// @ts-expect-error a browser event cannot be sent by the server
	trackServer('cta_click', { cta: 'sell_bib', where: 'hero' })
	// @ts-expect-error a browser event cannot be sent by the server
	trackServer('show_special_tooltip')
}

export function ids(): void {
	const eventId = eventIdOf(event)
	const bibId = bibIdOf(bib)

	// @ts-expect-error a raw string is not an id
	track('waitlist_leave_start', { event_id: 'abcdefghij12345' })
	// @ts-expect-error a route parameter is not an id
	track('waitlist_leave_start', { event_id: routeParam })
	// @ts-expect-error the id of a model is still a raw string
	track('waitlist_leave_start', { event_id: event.id })
	// @ts-expect-error a user id is not an id of the catalogue
	track('waitlist_leave_start', { event_id: user.id })
	// @ts-expect-error a bib id is not an event id
	track('waitlist_leave_start', { event_id: bibId })
	// @ts-expect-error an event id is not a bib id
	trackServer('sale_success', { bib_id: eventId, price_bucket: '50_99' })
	// @ts-expect-error an event id is not an article id
	track('article_link_click', { target: 'external', article_id: eventId })

	// @ts-expect-error the helpers take a model object, not a string
	bibIdOf(routeParam)
	// @ts-expect-error the helpers take a model object, not a string
	eventIdOf(bib.eventId)
	// @ts-expect-error a user is not a bib
	bibIdOf(user)
	// @ts-expect-error a user is not an event
	eventIdOf(user)
	// @ts-expect-error a user is not an article
	articleIdOf(user)
	// @ts-expect-error a waitlist entry is not an event: its own id must not be used
	eventIdOf(waitlist)
	// @ts-expect-error a waitlist entry is not a bib
	bibIdOf(waitlist)
	// @ts-expect-error a transaction is not a bib: its own id must not be used
	bibIdOf(transaction)
	// @ts-expect-error a transaction is not an event
	eventIdOf(transaction)
	// @ts-expect-error a transaction is not a waitlist entry
	eventIdOfWaitlist(transaction)
	// @ts-expect-error a waitlist entry is not a transaction
	bibIdOfTransaction(waitlist)
	// @ts-expect-error a bib is not an event: use eventIdOfBib
	eventIdOf(bib)
	// @ts-expect-error an object literal with an id is not a model
	bibIdOf({ id: routeParam })
}

// The two sides partition the catalogue
export type SidesAreDisjoint = Expect<Equal<ClientEventName & ServerEventName, never>>
export type SidesCoverTheCatalogue = Expect<Equal<ClientEventName | ServerEventName, EventName>>
export type ServerNames = Expect<
	Equal<
		ServerEventName,
		| 'payment_capture_success'
		| 'sale_success'
		| 'paypal_webhook_error'
		| 'account_create_success'
		| 'account_create_error'
		| 'paypal_onboarding_success'
		| 'paypal_kyc_success'
	>
>
export type TooltipHasNoProps = Expect<Equal<keyof EventProps<'show_special_tooltip'>, never>>
export type SaleSuccessProps = Expect<Equal<keyof EventProps<'sale_success'>, 'bib_id' | 'price_bucket'>>
export type BibViewIdsAreOptional = Expect<
	Equal<Pick<EventProps<'bib_view'>, 'bib_id' | 'event_id'>, { readonly bib_id?: BibId; readonly event_id?: EventId }>
>
