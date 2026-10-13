/**
 * The closed catalogue of analytics events (Umami).
 *
 * Every event and every property the product may send is declared HERE and nowhere else.
 * Anything that is not declared is refused three times: by TypeScript (track, trackView,
 * umamiAttrs, TrackClick, TrackView, trackServer), by sanitizeEvent() at call time, and by
 * the before-send hook on the way out of the browser.
 *
 * Rules for whoever adds or changes an event:
 *  1. Name: snake_case `object_action`, at most 50 characters, and the LAST word comes from
 *     one verb set: view, click, open, select, change, start, step, submit, success, error,
 *     cancel, expire, read. (show_special_tooltip predates the rule and is the only exception.)
 *  2. Prefer one event with a property over near-duplicates (cta_click { cta, where } rather
 *     than hero_cta_click and footer_cta_click).
 *  3. There is NO free-text property. A property is one of:
 *       oneOf([...])  a member of a closed list
 *       bucket([...]) a member of a closed list of ranges, computed by a function of buckets.ts
 *       bool          true / false
 *       int(max)      an integer clamped to 0..max
 *       id(kind)      a branded PocketBase id built by a helper of ids.ts
 *     Values are lower-case tokens ([a-z0-9_]), property keys are snake_case, at most
 *     6 properties per event.
 *  4. Never an e-mail, a name, a phone number, an address, a date, typed text, a search query,
 *     a user id (Clerk or PocketBase), a waitlist or transaction id, a token, an amount, a URL,
 *     a file name or an error message. An error is a closed `kind`, mapped by classify.ts.
 *  5. The same key means the same thing everywhere (where = UI surface, kind = failure reason,
 *     step = position in a funnel, ...). Reuse the shared tuples below instead of retyping them.
 *  6. `locale` is never declared: the before-send hook adds it to every browser payload.
 *  7. side 'client' events go through track / trackView / umamiAttrs / TrackClick / TrackView,
 *     side 'server' events through trackServer. A name is never sent from both sides.
 *  8. Server events never carry anything that identifies a user.
 *  9. The catalogue test (src/tests/lib/analytics/catalog.test.ts) pins every event with its
 *     properties (expected-events.ts) and the full shape of the catalogue, value lists included
 *     (catalogue-shape.snap): update both in the same change.
 */

import { LOCALES } from './config'
import type { ArticleId, BibId, EventId } from './ids'

export type IdKind = 'bib' | 'event' | 'article'

export type PropSpec =
	| { readonly type: 'enum' | 'bucket'; readonly values: readonly string[]; readonly optional?: true }
	| { readonly type: 'boolean'; readonly optional?: true }
	| { readonly type: 'int'; readonly max: number; readonly optional?: true }
	| { readonly type: 'id'; readonly kind: IdKind; readonly optional?: true }

export interface EventSpec {
	readonly side: 'client' | 'server'
	readonly props: { readonly [key: string]: PropSpec }
}

const oneOf = <const V extends readonly string[]>(values: V) => ({ values, type: 'enum' }) as const
const bucket = <const V extends readonly string[]>(values: V) => ({ values, type: 'bucket' }) as const
const bool = { type: 'boolean' } as const
const int = <M extends number>(max: M) => ({ type: 'int', max }) as const
const id = <K extends IdKind>(kind: K) => ({ type: 'id', kind }) as const
const optional = <S extends PropSpec>(spec: S) => ({ ...spec, optional: true }) as S & { readonly optional: true }

// ---- Shared value tuples (declared once, reused by several events and by buckets.ts / classify.ts) ----

export { LOCALES }

export const PRICE_BUCKETS = ['lt_25', '25_49', '50_99', '100_199', '200_499', '500_plus'] as const
export const COUNT_BUCKETS = ['0', '1', '2_5', '6_20', '21_plus'] as const
export const SPORTS = ['road', 'trail', 'triathlon', 'cycle', 'other'] as const
export const LISTINGS = ['public', 'private'] as const
export const VIEWERS = ['anonymous', 'profile_incomplete', 'own_bib', 'ready'] as const
export const WIZARD_STEPS = ['event_selection', 'email_verification', 'bib_details', 'pricing', 'confirmation'] as const
export const SECTIONS = [
	'home',
	'marketplace',
	'events',
	'blog',
	'faq',
	'contact',
	'legals',
	'auth',
	'dashboard',
	'profile',
	'purchase',
	'other',
] as const
export const AUTH_METHODS = ['password', 'google', 'facebook'] as const
export const AUTH_ERROR_KINDS = [
	'validation',
	'wrong_password',
	'account_not_found',
	'account_exists',
	'code_incorrect',
	'code_expired',
	'verification_failed',
	'password_rejected',
	'captcha',
	'rate_limited',
	'invalid_param',
	'oauth',
	'oauth_incomplete',
	'session_exists',
	'network',
	'incomplete',
	'unknown',
] as const
export const CTAS = [
	'browse_events',
	'browse_marketplace',
	'buy_bib',
	'sell_bib',
	'organizer_contact',
	'contact',
	'sign_in',
	'sign_up',
	'forgot_password',
	'complete_profile',
	'dashboard',
	'buyer_dashboard',
	'seller_dashboard',
	'profile',
	'my_listings',
	'request_event',
	'event_details',
	'edit_listing',
	'terms',
	'home',
	'back',
] as const
export const CTA_WHERES = [
	'hero',
	'cta_section',
	'faq_intro',
	'legal_aup',
	'not_found',
	'error_page',
	'event_waitlist',
	'event_page',
	'bib_page',
	'purchase_success',
	'dashboard_buyer_card',
	'dashboard_seller_card',
	'dashboard_quick_actions',
	'buyer_quick_actions',
	'buyer_purchases_empty',
	'buyer_waitlist_intro',
	'buyer_waitlist_empty',
	'user_header',
	'seller_quick_actions',
	'seller_sales_empty',
	'seller_listings_empty',
	'seller_listing_card',
	'seller_gate',
	'sell_wizard',
	'auth_sign_in',
	'auth_sign_up',
	'auth_sign_up_exists',
	'auth_forgot_password',
] as const
export const NAV_ITEMS = [
	'logo',
	'home',
	'events',
	'marketplace',
	'blog',
	'faq',
	'contact',
	'sign_in',
	'sign_up',
	'dashboard',
	'profile',
	'buy_bib',
	'sell_bib',
	'sign_out',
	'legal_notice',
	'privacy_policy',
	'terms',
	'data_deletion',
	'aup',
] as const
export const NAV_WHERES = ['header', 'header_mobile', 'user_menu', 'footer', 'profile'] as const
export const OUTBOUND_TARGETS = [
	'forhives',
	'linkedin',
	'instagram',
	'strava',
	'facebook',
	'paypal_fees',
	'course_map',
	'registration',
	'organizer_site',
	'mail_contact',
	'mail_support',
	'mail_partners',
] as const
export const OUTBOUND_WHERES = [
	'footer',
	'faq',
	'contact_page',
	'event_page',
	'bib_page',
	'legal_aup',
	'legal_notice',
] as const
export const WAITLIST_WHERES = ['event_page', 'bib_page'] as const
export const VERIFIED_EMAIL_WHERES = ['profile', 'sell_wizard'] as const
export const VERIFIED_EMAIL_KINDS = [
	'validation',
	'rate_limited',
	'already_verified',
	'code_expired',
	'code_incorrect',
	'send_failed',
	'failed',
	'unknown',
] as const
export const PURCHASE_ERROR_KINDS = [
	'locked_by_other',
	'lock_failed',
	'lock_expired',
	'seller_not_configured',
	'unauthenticated',
	'missing_params',
	'bib_not_found',
	'bib_unavailable',
	'buyer_not_found',
	'order_not_found',
	'not_owner',
	'instrument_declined',
	'insufficient_funds',
	'payer_restricted',
	'paypal_error',
	'sdk_load_failed',
	'sdk_error',
	'exception',
] as const
export const FUNDING_SOURCES = ['paypal', 'card', 'paylater', 'sepa', 'other', 'na'] as const
export const DAYS_TO_EVENT_BUCKETS = ['past', '0_7', '8_30', '31_90', '91_plus'] as const
export const LEAD_TIME_BUCKETS = ['0_30', '31_90', '91_180', '181_plus'] as const
export const ELAPSED_BUCKETS = ['lt_15s', '15_60s', '1_3m', '3_10m', 'gt_10m'] as const
export const READ_TIME_BUCKETS = ['1_2', '3_5', '6_10', 'gt_10'] as const
export const ARTICLE_LINK_TARGETS = [
	'marketplace',
	'events',
	'sell_bib',
	'blog',
	'faq',
	'contact',
	'auth',
	'home',
	'internal_other',
	'external',
	'mailto',
] as const
export const WAITLIST_MODES = ['account', 'email'] as const
export const EMAIL_SOURCES = ['account', 'other'] as const
export const LIST_WHERES = ['marketplace', 'events'] as const
export const SIGN_IN_INTENTS = ['none', 'purchase', 'sell'] as const
export const LISTING_UPDATE_ACTIONS = ['price', 'make_public', 'make_private', 'token_regenerate', 'withdraw'] as const
export const PRICE_VS_ORIGINAL = ['unknown', 'below', 'equal', 'above'] as const
export const REFERRER_SOURCES = ['internal', 'external', 'direct'] as const
export const LANDING_SECTIONS = ['journey', 'features', 'security_process', 'cta_section'] as const

// ---- The catalogue ----

export const EVENTS = {
	// ---- Chrome and landing ----

	/** A visitor clicked an in-page call-to-action link or button leading to another part of the product. */
	cta_click: {
		side: 'client',
		props: {
			cta: oneOf(CTAS),
			where: oneOf(CTA_WHERES),
		},
	},
	/** A visitor clicked an entry of the global chrome: header, mobile menu, signed-in user menu, footer, or a sign-out control. */
	nav_click: {
		side: 'client',
		props: {
			item: oneOf(NAV_ITEMS),
			where: oneOf(NAV_WHERES),
		},
	},
	/** A visitor opened a menu: the mobile burger panel, the signed-in user dropdown or the mobile filters dialog of the marketplace. */
	menu_open: {
		side: 'client',
		props: {
			menu: oneOf(['mobile_nav', 'user_menu', 'filters']),
		},
	},
	/** A visitor chose another language in one of the three language switchers. */
	locale_change: {
		side: 'client',
		props: {
			to: oneOf(LOCALES),
			where: oneOf(['header', 'header_mobile', 'footer']),
			result: oneOf(['same_page', 'article_translated', 'article_fallback_list']),
		},
	},
	/** A visitor toggled between light and dark theme. */
	theme_change: {
		side: 'client',
		props: {
			to: oneOf(['light', 'dark']),
		},
	},
	/** A visitor clicked a link leaving the Beswib flow: social profile, external reference, organiser site or one of Beswib's public mailboxes. */
	outbound_click: {
		side: 'client',
		props: {
			target: oneOf(OUTBOUND_TARGETS),
			where: oneOf(OUTBOUND_WHERES),
			event_id: optional(id('event')),
		},
	},
	/** A below-the-fold section of the landing page (or the CTA band on /faq) entered the viewport for the first time in this page view. */
	section_view: {
		side: 'client',
		props: {
			landing_section: oneOf(LANDING_SECTIONS),
		},
	},
	/** A visitor switched the 'How does it work?' block between the buyer and the seller journey. */
	journey_tab_select: {
		side: 'client',
		props: {
			tab: oneOf(['buyer', 'seller']),
		},
	},
	/** Existing event, kept unchanged: a visitor clicked the animated runners strip of the hero (toggles the hidden name tooltips). */
	show_special_tooltip: {
		side: 'client',
		props: {},
	},
	/** A visitor expanded one of the FAQ questions. */
	faq_item_open: {
		side: 'client',
		props: {
			question: oneOf([
				'what_is_beswib',
				'how_to_sell',
				'is_it_legal',
				'how_to_buy',
				'payment_security',
				'organizer_benefits',
				'fees',
				'cancellation',
			]),
		},
	},

	// ---- Browsing (marketplace, events, bib page) ----

	/** A typed search settled on a list (live search: 1 s after the last keystroke, non-empty, different from the last tracked value, never the value present at mount). */
	search_submit: {
		side: 'client',
		props: {
			where: oneOf([...LIST_WHERES, 'sell_wizard']),
			result_count: bucket(COUNT_BUCKETS),
			has_filters: bool,
		},
	},
	/** A filter was applied, removed or all filters were reset on a list. */
	filter_change: {
		side: 'client',
		props: {
			where: oneOf(LIST_WHERES),
			filter: oneOf([
				'sport',
				'distance_range',
				'distance_preset',
				'price_range',
				'geography',
				'date_start',
				'date_end',
				'all',
			]),
			action: oneOf(['apply', 'remove', 'reset']),
			surface: oneOf(['sidebar', 'mobile_dialog', 'badge_bar', 'toolbar']),
			value: oneOf([...SPORTS, 'all', 'na']),
			price_max: optional(bucket(PRICE_BUCKETS)),
		},
	},
	/** The sort order of a list was changed. */
	sort_change: {
		side: 'client',
		props: {
			where: oneOf(LIST_WHERES),
			sort: oneOf(['date', 'price', 'price_asc', 'price_desc', 'distance', 'participants']),
		},
	},
	/** The empty state of a list was shown and stayed: no bib, no event or no article. */
	empty_results_view: {
		side: 'client',
		props: {
			where: oneOf([...LIST_WHERES, 'blog']),
			has_query: bool,
			filter_count: int(7),
			catalogue_empty: bool,
			load_failed: optional(bool),
		},
	},
	/** A link of a bib card was clicked (to the bib page or to its event page). */
	bib_card_click: {
		side: 'client',
		props: {
			where: oneOf(['marketplace', 'event_page']),
			target: oneOf(['bib', 'event']),
			position: int(50),
			bib_id: id('bib'),
			event_id: id('event'),
			price_bucket: bucket(PRICE_BUCKETS),
		},
	},
	/** A button of an event card was clicked on the events list. */
	event_card_click: {
		side: 'client',
		props: {
			action: oneOf(['view_event', 'view_bibs', 'join_waitlist']),
			event_id: id('event'),
			sport: oneOf(SPORTS),
			bib_count: bucket(COUNT_BUCKETS),
		},
	},
	/** An event detail page was displayed, with the supply available at that moment. */
	event_view: {
		side: 'client',
		props: {
			event_id: id('event'),
			sport: oneOf(SPORTS),
			bib_count: bucket(COUNT_BUCKETS),
			days_to_event: bucket(DAYS_TO_EVENT_BUCKETS),
		},
	},
	/** A bib detail page was displayed, with the state the visitor actually got (purchasable, token required, wrong token, sold or withdrawn, sale closed). */
	bib_view: {
		side: 'client',
		props: {
			state: oneOf(['available', 'token_required', 'token_invalid', 'unavailable', 'sale_closed']),
			listing: oneOf([...LISTINGS, 'unknown']),
			viewer: oneOf([...VIEWERS, 'unknown']),
			bib_id: optional(id('bib')),
			event_id: optional(id('event')),
			price_bucket: optional(bucket(PRICE_BUCKETS)),
		},
	},
	/** A private-listing token was submitted for validation. */
	private_token_submit: {
		side: 'client',
		props: {},
	},
	/** A private-listing token was accepted by the server (the page then reloads onto the purchase UI). */
	private_token_success: {
		side: 'client',
		props: {},
	},
	/** A private-listing token submission was empty, refused, or the validation call failed. */
	private_token_error: {
		side: 'client',
		props: {
			kind: oneOf(['empty', 'invalid', 'server', 'network']),
		},
	},
	/** The visitor left the private-listing token form with 'Back to marketplace'. */
	private_token_cancel: {
		side: 'client',
		props: {},
	},

	// ---- Purchase ----

	/** The buy button of the bib detail page was clicked. */
	purchase_click: {
		side: 'client',
		props: {
			bib_id: id('bib'),
			event_id: id('event'),
			price_bucket: bucket(PRICE_BUCKETS),
			listing: oneOf(LISTINGS),
			viewer: oneOf(VIEWERS),
		},
	},
	/** The bib is locked for the buyer and the payment dialog opens. */
	purchase_start: {
		side: 'client',
		props: {
			bib_id: id('bib'),
			event_id: id('event'),
			price_bucket: bucket(PRICE_BUCKETS),
			listing: oneOf(LISTINGS),
			lock: oneOf(['new', 'resumed']),
		},
	},
	/** The payment progressed: a PayPal funding button was clicked, the PayPal order was created, or the buyer approved it and the capture was requested. */
	purchase_step: {
		side: 'client',
		props: {
			step: oneOf(['payment_click', 'order_created', 'approved']),
			bib_id: id('bib'),
			event_id: id('event'),
			price_bucket: bucket(PRICE_BUCKETS),
			listing: oneOf(LISTINGS),
			funding_source: oneOf(FUNDING_SOURCES),
		},
	},
	/** The buyer's browser received a successful capture and is sent to the success page. This is the browser funnel end (attribution); payment_capture_success is the money truth, sale_success the fulfilment truth. */
	purchase_success: {
		side: 'client',
		props: {
			bib_id: id('bib'),
			event_id: id('event'),
			price_bucket: bucket(PRICE_BUCKETS),
			listing: oneOf(LISTINGS),
		},
	},
	/** A step of the purchase failed: lock, order creation, PayPal SDK or capture. kind=lock_expired is the server refusal at capture; purchase_lock_expire is the client timer. */
	purchase_error: {
		side: 'client',
		props: {
			step: oneOf(['lock', 'order', 'paypal', 'capture']),
			kind: oneOf(PURCHASE_ERROR_KINDS),
			bib_id: id('bib'),
			event_id: id('event'),
			price_bucket: bucket(PRICE_BUCKETS),
			listing: oneOf(LISTINGS),
		},
	},
	/** The buyer backed out of the payment. where=paypal_popup: the PayPal popup was dismissed (NOT terminal, the dialog stays open and the buyer may pay another way). where=payment_dialog: the payment dialog was closed without paying; this is the abandonment to chart in the funnel. */
	purchase_cancel: {
		side: 'client',
		props: {
			where: oneOf(['paypal_popup', 'payment_dialog']),
			reached: oneOf(['dialog', 'order_created', 'paypal_dismissed']),
			bib_id: id('bib'),
			event_id: id('event'),
			price_bucket: bucket(PRICE_BUCKETS),
			listing: oneOf(LISTINGS),
		},
	},
	/** The 5-minute bib lock countdown reached zero while the buyer was still on the page (client timer; the server-side refusal is purchase_error{kind=lock_expired}). */
	purchase_lock_expire: {
		side: 'client',
		props: {
			bib_id: id('bib'),
			event_id: id('event'),
			stage: oneOf(['dialog_closed', 'dialog_open', 'paypal_open', 'error_shown']),
		},
	},
	/** A button of the payment error dialog was clicked. Today dismiss and try_again both only close the dialog (see ownerNotes: the error is not cleared, so the next Buy click reopens the same error). */
	purchase_error_click: {
		side: 'client',
		props: {
			variant: oneOf(['declined', 'generic']),
			action: oneOf(['dismiss', 'restart_payment', 'try_again']),
		},
	},
	/** PayPal confirmed the capture of the buyer's payment: the money truth, independent of ad-blockers and closed tabs. listing is always public today (captureOrder loads the bib with fetchPublicBibById, so a private bib fails before capture: see ownerNotes). */
	payment_capture_success: {
		side: 'server',
		props: {
			bib_id: id('bib'),
			event_id: id('event'),
			price_bucket: bucket(PRICE_BUCKETS),
			listing: oneOf(LISTINGS),
		},
	},
	/** The capture webhook finalised a sale for the first time: the pending transaction was found and switched to succeeded, the bib marked sold. The fulfilment truth. Unmatched webhooks are NOT counted here (paypal_webhook_error{transaction_not_found}). */
	sale_success: {
		side: 'server',
		props: {
			bib_id: id('bib'),
			price_bucket: bucket(PRICE_BUCKETS),
		},
	},
	/** A PayPal webhook was rejected or its processing failed. */
	paypal_webhook_error: {
		side: 'server',
		props: {
			kind: oneOf(['signature_invalid', 'transaction_not_found', 'exception']),
		},
	},

	// ---- Waitlist, account, authentication ----

	/** A visitor clicked the button to join an event waitlist. */
	waitlist_join_submit: {
		side: 'client',
		props: {
			where: oneOf(WAITLIST_WHERES),
			mode: oneOf(WAITLIST_MODES),
			event_id: id('event'),
		},
	},
	/** A visitor was added to an event waitlist. */
	waitlist_join_success: {
		side: 'client',
		props: {
			where: oneOf(WAITLIST_WHERES),
			mode: oneOf(WAITLIST_MODES),
			event_id: id('event'),
		},
	},
	/** A waitlist subscription attempt did not create a subscription (outcome of a submit only; the status-check failure is waitlist_status_error). */
	waitlist_join_error: {
		side: 'client',
		props: {
			where: oneOf(WAITLIST_WHERES),
			mode: oneOf([...WAITLIST_MODES, 'unknown']),
			event_id: id('event'),
			kind: oneOf(['invalid_email', 'already_joined', 'failed']),
		},
	},
	/** The waitlist status check of the event page failed, which hides the join button with no retry. */
	waitlist_status_error: {
		side: 'client',
		props: {
			event_id: id('event'),
		},
	},
	/** A buyer clicked the X of a waitlist entry and the confirmation dialog opened. */
	waitlist_leave_start: {
		side: 'client',
		props: {
			event_id: id('event'),
		},
	},
	/** The leave-waitlist confirmation was dismissed with the Cancel button (Escape / overlay dismissals are not counted). */
	waitlist_leave_cancel: {
		side: 'client',
		props: {
			event_id: id('event'),
		},
	},
	/** A waitlist subscription was disabled. */
	waitlist_leave_success: {
		side: 'client',
		props: {
			event_id: id('event'),
		},
	},
	/** Leaving a waitlist failed. */
	waitlist_leave_error: {
		side: 'client',
		props: {
			event_id: id('event'),
			kind: oneOf(['unauthorized', 'user_missing', 'bad_request', 'server', 'network']),
		},
	},
	/** The buyer dashboard was displayed, with how much it contains. */
	buyer_dashboard_view: {
		side: 'client',
		props: {
			purchases: bucket(COUNT_BUCKETS),
			waitlists: bucket(COUNT_BUCKETS),
		},
	},
	/** The profile page was displayed, with the completion state the member arrives in. */
	profile_view: {
		side: 'client',
		props: {
			available: bool,
			complete: bool,
			seller_ready: bool,
		},
	},
	/** The member made a first edit in the runner profile form (once per mount). */
	profile_form_start: {
		side: 'client',
		props: {
			was_complete: bool,
		},
	},
	/** The runner profile was saved. */
	profile_form_success: {
		side: 'client',
		props: {
			complete: bool,
			was_complete: bool,
			personal_done: bool,
			emergency_done: bool,
			address_done: bool,
			marketing_consent: bool,
		},
	},
	/** Saving the runner profile failed, at schema validation or on the server. */
	profile_form_error: {
		side: 'client',
		props: {
			kind: oneOf(['validation', 'server']),
			block: oneOf(['none', 'personal', 'emergency', 'address', 'documents']),
			field: oneOf([
				'none',
				'first_name',
				'last_name',
				'birth_date',
				'gender',
				'phone_number',
				'contact_email',
				'emergency_contact_name',
				'emergency_contact_phone',
				'emergency_contact_relationship',
				'address',
				'postal_code',
				'city',
				'country',
				'other',
			]),
			invalid_count: int(17),
		},
	},
	/** The member moved through the account-deletion request: opened the dialog, cancelled it, or confirmed and was sent to the contact form. */
	account_delete_step: {
		side: 'client',
		props: {
			step: oneOf(['open', 'cancel', 'confirm']),
		},
	},
	/** The member opened the 'add an e-mail address' input, on the profile page or in the sell wizard. */
	verified_email_start: {
		side: 'client',
		props: {
			where: oneOf(VERIFIED_EMAIL_WHERES),
		},
	},
	/** A verification code was sent, or sent again, for an added e-mail address. */
	verified_email_step: {
		side: 'client',
		props: {
			where: oneOf(VERIFIED_EMAIL_WHERES),
			step: oneOf(['code_sent', 'code_resent']),
		},
	},
	/** An added e-mail address was verified with its code. */
	verified_email_success: {
		side: 'client',
		props: {
			where: oneOf(VERIFIED_EMAIL_WHERES),
		},
	},
	/** Loading, adding, verifying, resending or removing a verified e-mail failed. */
	verified_email_error: {
		side: 'client',
		props: {
			where: oneOf(VERIFIED_EMAIL_WHERES),
			step: oneOf(['load', 'add', 'verify', 'resend', 'remove']),
			kind: oneOf(VERIFIED_EMAIL_KINDS),
		},
	},
	/** A visitor began a sign-up attempt: first edit of the e-mail form or click on an OAuth button (once per mount and method). */
	sign_up_start: {
		side: 'client',
		props: {
			method: oneOf(AUTH_METHODS),
		},
	},
	/** The e-mail sign-up moved forward: valid form sent to Clerk, then verification-code screen shown. */
	sign_up_step: {
		side: 'client',
		props: {
			step: oneOf(['form_submit', 'email_code']),
		},
	},
	/** A sign-up finished in the browser and the new session is active (browser funnel end; account_create_success is the server truth). Can arrive without sign_up_start: Google on the sign-in form for an unknown account is transferred by Clerk and resolved as a sign-up. */
	sign_up_success: {
		side: 'client',
		props: {
			method: oneOf(AUTH_METHODS),
		},
	},
	/** A sign-up attempt failed at client validation, at Clerk, at the e-mail code or on return from OAuth. */
	sign_up_error: {
		side: 'client',
		props: {
			method: oneOf(AUTH_METHODS),
			step: oneOf(['form', 'email_code', 'oauth']),
			kind: oneOf(AUTH_ERROR_KINDS),
			field: oneOf(['none', 'first_name', 'last_name', 'email', 'password', 'confirm_password', 'code']),
		},
	},
	/** The visitor left the e-mail verification screen with 'Back to form'. */
	sign_up_cancel: {
		side: 'client',
		props: {},
	},
	/** An account was really created: the Clerk user.created webhook produced the PocketBase user. The server truth for sign-ups (OAuth round trips and ad-blocked browsers included); the method split comes from the browser event sign_up_success. */
	account_create_success: {
		side: 'server',
		props: {},
	},
	/** A Clerk user.created webhook did not end normally. kind=exception can follow an account_create_success when the step after the creation (waitlist linking) throws; Svix retries, so repeats are expected. */
	account_create_error: {
		side: 'server',
		props: {
			kind: oneOf(['missing_clerk_id', 'missing_email', 'db_failed', 'exception']),
		},
	},
	/** A visitor began a sign-in attempt: first submit of the form or click on an OAuth button. */
	sign_in_start: {
		side: 'client',
		props: {
			method: oneOf(AUTH_METHODS),
			intent: oneOf(SIGN_IN_INTENTS),
		},
	},
	/** A sign-in succeeded and the session is active. */
	sign_in_success: {
		side: 'client',
		props: {
			method: oneOf(AUTH_METHODS),
			intent: oneOf(SIGN_IN_INTENTS),
		},
	},
	/** A sign-in attempt failed at client validation, at Clerk or on return from OAuth. */
	sign_in_error: {
		side: 'client',
		props: {
			method: oneOf(AUTH_METHODS),
			kind: oneOf(AUTH_ERROR_KINDS),
			field: oneOf(['none', 'email', 'password']),
		},
	},
	/** A visitor submitted the e-mail form of the forgot-password page. */
	password_reset_start: {
		side: 'client',
		props: {},
	},
	/** The reset code was e-mailed and the new-password form is shown. */
	password_reset_step: {
		side: 'client',
		props: {
			step: oneOf(['code_sent']),
		},
	},
	/** The password was changed and the visitor is signed in. */
	password_reset_success: {
		side: 'client',
		props: {},
	},
	/** The reset request or the code + new password submission failed. */
	password_reset_error: {
		side: 'client',
		props: {
			step: oneOf(['request', 'reset']),
			kind: oneOf(AUTH_ERROR_KINDS),
		},
	},

	// ---- Seller ----

	/** The seller dashboard was displayed, with the size of the seller's inventory. */
	seller_dashboard_view: {
		side: 'client',
		props: {
			listings: bucket(COUNT_BUCKETS),
			active: bucket(COUNT_BUCKETS),
			sold: bucket(COUNT_BUCKETS),
			profile_complete: bool,
		},
	},
	/** The 'Profile Incomplete' gate card was shown to a user who cannot sell yet. */
	seller_gate_view: {
		side: 'client',
		props: {
			where: oneOf(['seller_dashboard', 'sell_wizard']),
			paypal_state: oneOf(['not_linked', 'kyc_pending', 'ready']),
			contact_missing: bool,
			address_missing: bool,
		},
	},
	/** The sell-bib wizard was opened on its first step. */
	listing_start: {
		side: 'client',
		props: {
			profile_complete: bool,
			events: bucket(COUNT_BUCKETS),
		},
	},
	/** The seller moved to another step of the sell-bib wizard. */
	listing_step: {
		side: 'client',
		props: {
			step: oneOf(WIZARD_STEPS),
			direction: oneOf(['next', 'back']),
		},
	},
	/** The seller picked an event card in wizard step 1. */
	listing_event_select: {
		side: 'client',
		props: {
			event_id: id('event'),
			search_used: bool,
		},
	},
	/** The seller confirmed the listing and the creation request was sent. */
	listing_submit: {
		side: 'client',
		props: {
			event_id: id('event'),
			listing: oneOf(LISTINGS),
			price_bucket: bucket(PRICE_BUCKETS),
			price_vs_original: oneOf(PRICE_VS_ORIGINAL),
			email_source: oneOf(EMAIL_SOURCES),
		},
	},
	/** The bib listing was created. */
	listing_success: {
		side: 'client',
		props: {
			event_id: id('event'),
			listing: oneOf(LISTINGS),
			price_bucket: bucket(PRICE_BUCKETS),
			price_vs_original: oneOf(PRICE_VS_ORIGINAL),
			email_source: oneOf(EMAIL_SOURCES),
		},
	},
	/** The wizard refused to continue or the creation failed: client validation, seller-profile gate, or createBib refusal / failure. */
	listing_error: {
		side: 'client',
		props: {
			step: oneOf(WIZARD_STEPS),
			kind: oneOf(['validation', 'profile_incomplete', 'create_rejected', 'create_failed']),
			field: oneOf(['none', 'event', 'email', 'registration_number', 'price', 'terms']),
		},
	},
	/** The seller clicked Cancel in the wizard before the listing was created. */
	listing_cancel: {
		side: 'client',
		props: {
			step: oneOf(WIZARD_STEPS),
		},
	},
	/** The seller copied or opened the link (or the private token) of one of their listings. */
	listing_share_click: {
		side: 'client',
		props: {
			action: oneOf(['copy_link', 'open_link', 'copy_token']),
			where: oneOf(['wizard_success', 'edit_page']),
			listing: oneOf(LISTINGS),
		},
	},
	/** The edit page of a listing was displayed, or failed to load. */
	listing_edit_view: {
		side: 'client',
		props: {
			state: oneOf(['ok', 'error']),
			event_id: optional(id('event')),
			status: optional(oneOf(['available', 'validation_failed', 'sold', 'expired', 'withdrawn'])),
			listing: optional(oneOf(LISTINGS)),
		},
	},
	/** A change to an existing listing was saved: price, visibility, private token or withdrawal. */
	listing_update_success: {
		side: 'client',
		props: {
			action: oneOf(LISTING_UPDATE_ACTIONS),
			event_id: id('event'),
			listing: oneOf(LISTINGS),
			price_change: oneOf(['up', 'down', 'same', 'na']),
			price_bucket: bucket(PRICE_BUCKETS),
		},
	},
	/** A change to an existing listing failed. No failure reason: the edit-bib server actions throw free-text errors (see ownerNotes). */
	listing_update_error: {
		side: 'client',
		props: {
			action: oneOf(LISTING_UPDATE_ACTIONS),
			event_id: id('event'),
		},
	},
	/** The user clicked the button that starts PayPal merchant onboarding. */
	paypal_onboarding_start: {
		side: 'client',
		props: {},
	},
	/** The PayPal onboarding link was obtained and opened, by the automatic popup or by the fallback link. */
	paypal_onboarding_open: {
		side: 'client',
		props: {
			via: oneOf(['popup', 'link']),
			popup_blocked: bool,
		},
	},
	/** Starting PayPal onboarding failed: no referral link could be created. */
	paypal_onboarding_error: {
		side: 'client',
		props: {
			kind: oneOf(['referral_failed', 'request_failed']),
		},
	},
	/** PayPal confirmed by webhook that the seller linked a merchant account. Invisible to the browser (the PayPal popup returns to a missing page). Both webhooks can arrive for one onboarding: chart one webhook value. */
	paypal_onboarding_success: {
		side: 'server',
		props: {
			webhook: oneOf(['onboarding_completed', 'consent_granted']),
		},
	},
	/** The PayPal merchant readiness status was fetched and displayed on the profile page. */
	paypal_status_view: {
		side: 'client',
		props: {
			state: oneOf(['ready', 'pending', 'error']),
			payments_receivable: bool,
			email_confirmed: bool,
			permissions_granted: bool,
			refresh: bool,
		},
	},
	/** A status check found a seller's PayPal account fully ready while the stored flag was not yet true. Counts transitions, not sellers: two concurrent checks can both send it, and it can repeat after PayPal regresses (see ownerNotes). */
	paypal_kyc_success: {
		side: 'server',
		props: {},
	},
	/** The seller unlinked their PayPal account from Beswib. */
	paypal_disconnect_success: {
		side: 'client',
		props: {},
	},
	/** The 'request a new event' form was displayed. */
	event_request_start: {
		side: 'client',
		props: {},
	},
	/** A valid event request was sent to the server. */
	event_request_submit: {
		side: 'client',
		props: {
			has_message: bool,
			lead_time: bucket(LEAD_TIME_BUCKETS),
		},
	},
	/** The event creation request was stored. */
	event_request_success: {
		side: 'client',
		props: {
			has_message: bool,
			lead_time: bucket(LEAD_TIME_BUCKETS),
		},
	},
	/** The event request was refused by client validation or could not be created. */
	event_request_error: {
		side: 'client',
		props: {
			kind: oneOf([
				'validation',
				'unauthenticated',
				'user_not_found',
				'invalid_input',
				'create_failed',
				'exception',
				'request_failed',
			]),
			field: oneOf(['none', 'name', 'location', 'date']),
		},
	},

	// ---- Content and error pages ----

	/** A visitor started interacting with the contact form. */
	contact_form_start: {
		side: 'client',
		props: {
			prefilled: bool,
		},
	},
	/** A visitor submitted the contact form. */
	contact_form_submit: {
		side: 'client',
		props: {
			prefilled: bool,
		},
	},
	/** The contact message was accepted and delivered to the team. */
	contact_form_success: {
		side: 'client',
		props: {
			prefilled: bool,
		},
	},
	/** Sending the contact message failed. */
	contact_form_error: {
		side: 'client',
		props: {
			kind: oneOf(['invalid_input', 'delivery_failed', 'exception']),
			prefilled: bool,
		},
	},
	/** A visitor clicked an article card in the blog list. */
	article_click: {
		side: 'client',
		props: {
			position: int(50),
			article_id: id('article'),
		},
	},
	/** A reader reached a scroll-depth milestone of the article body. */
	article_read: {
		side: 'client',
		props: {
			depth: oneOf(['25', '50', '75', '100']),
			elapsed: bucket(ELAPSED_BUCKETS),
			read_time: bucket(READ_TIME_BUCKETS),
			article_id: id('article'),
		},
	},
	/** A reader clicked a link placed inside the article body. */
	article_link_click: {
		side: 'client',
		props: {
			target: oneOf(ARTICLE_LINK_TARGETS),
			article_id: id('article'),
		},
	},
	/** A reader clicked one of the share controls of the article sidebar. */
	article_share_click: {
		side: 'client',
		props: {
			network: oneOf(['twitter', 'linkedin', 'instagram', 'facebook', 'copy_link']),
		},
	},
	/** The 404 page was displayed. */
	not_found_view: {
		side: 'client',
		props: {
			section: oneOf(SECTIONS),
			source: oneOf(REFERRER_SOURCES),
		},
	},
	/** An error boundary replaced the page with the error screen. A non-existent bib id also lands here (section=marketplace, origin=server): see ownerNotes. */
	error_view: {
		side: 'client',
		props: {
			scope: oneOf(['segment', 'global']),
			origin: oneOf(['server', 'client']),
			section: oneOf(SECTIONS),
		},
	},
} as const satisfies Record<string, EventSpec>

// ---- Derived types ----

export type PriceBucket = (typeof PRICE_BUCKETS)[number]
export type CountBucket = (typeof COUNT_BUCKETS)[number]
export type Sport = (typeof SPORTS)[number]
export type Listing = (typeof LISTINGS)[number]
export type Viewer = (typeof VIEWERS)[number]
export type WizardStep = (typeof WIZARD_STEPS)[number]
export type Section = (typeof SECTIONS)[number]
export type AuthMethod = (typeof AUTH_METHODS)[number]
export type AuthErrorKind = (typeof AUTH_ERROR_KINDS)[number]
export type Cta = (typeof CTAS)[number]
export type CtaWhere = (typeof CTA_WHERES)[number]
export type NavItem = (typeof NAV_ITEMS)[number]
export type NavWhere = (typeof NAV_WHERES)[number]
export type OutboundTarget = (typeof OUTBOUND_TARGETS)[number]
export type OutboundWhere = (typeof OUTBOUND_WHERES)[number]
export type WaitlistWhere = (typeof WAITLIST_WHERES)[number]
export type VerifiedEmailWhere = (typeof VERIFIED_EMAIL_WHERES)[number]
export type VerifiedEmailKind = (typeof VERIFIED_EMAIL_KINDS)[number]
export type PurchaseErrorKind = (typeof PURCHASE_ERROR_KINDS)[number]
export type FundingSource = (typeof FUNDING_SOURCES)[number]
export type DaysToEventBucket = (typeof DAYS_TO_EVENT_BUCKETS)[number]
export type LeadTimeBucket = (typeof LEAD_TIME_BUCKETS)[number]
export type ElapsedBucket = (typeof ELAPSED_BUCKETS)[number]
export type ReadTimeBucket = (typeof READ_TIME_BUCKETS)[number]
export type ArticleLinkTarget = (typeof ARTICLE_LINK_TARGETS)[number]
export type WaitlistMode = (typeof WAITLIST_MODES)[number]
export type EmailSource = (typeof EMAIL_SOURCES)[number]
export type ListWhere = (typeof LIST_WHERES)[number]
export type SignInIntent = (typeof SIGN_IN_INTENTS)[number]
export type ListingUpdateAction = (typeof LISTING_UPDATE_ACTIONS)[number]
export type PriceVsOriginal = (typeof PRICE_VS_ORIGINAL)[number]
export type ReferrerSource = (typeof REFERRER_SOURCES)[number]
export type LandingSection = (typeof LANDING_SECTIONS)[number]

/** Every event name of the catalogue. */
export type EventName = keyof typeof EVENTS

/** Events sent from the browser (track, trackView, umamiAttrs, TrackClick, TrackView). */
export type ClientEventName = {
	[N in EventName]: (typeof EVENTS)[N]['side'] extends 'client' ? N : never
}[EventName]

/** Events sent by the server (trackServer). */
export type ServerEventName = Exclude<EventName, ClientEventName>

interface IdByKind {
	bib: BibId
	event: EventId
	article: ArticleId
}

type SpecsOf<N extends EventName> = (typeof EVENTS)[N]['props']

type ValueOf<S> = S extends { readonly type: 'enum' | 'bucket'; readonly values: readonly (infer V)[] }
	? V
	: S extends { readonly type: 'boolean' }
		? boolean
		: S extends { readonly type: 'int' }
			? number
			: S extends { readonly type: 'id'; readonly kind: infer K extends IdKind }
				? IdByKind[K]
				: never

type OptionalKeys<P> = { [K in keyof P]: P[K] extends { readonly optional: true } ? K : never }[keyof P]

type Simplify<T> = { [K in keyof T]: T[K] } & {}

/** The properties of one event: required ones, then the optional ones. */
export type EventProps<N extends EventName> = Simplify<
	{ readonly [K in Exclude<keyof SpecsOf<N>, OptionalKeys<SpecsOf<N>>>]: ValueOf<SpecsOf<N>[K]> } & {
		readonly [K in OptionalKeys<SpecsOf<N>>]?: ValueOf<SpecsOf<N>[K]>
	}
>

/** True when T is a union of several types. */
type IsUnion<T, U = T> = T extends unknown ? ([U] extends [T] ? false : true) : never

/**
 * The trailing argument list of track(name, ...), trackView, umamiAttrs and trackServer:
 * nothing for an event without properties, an optional object when every property is optional,
 * a required object otherwise.
 *
 * The name must be ONE literal. With a union of names (`cond ? 'a_click' : 'b_click'`) only the
 * properties common to the members would be asked for, and the event would be dropped at run
 * time for a missing one: a union is refused, branch with if / else instead.
 */
export type PropsArg<N extends EventName> =
	IsUnion<N> extends true
		? [props: never]
		: keyof SpecsOf<N> extends never
			? []
			: Record<never, never> extends EventProps<N>
				? [props?: EventProps<N>]
				: [props: EventProps<N>]

/** The `props` field of <TrackClick> and <TrackView>, following the same rule as PropsArg. */
export type PropsField<N extends EventName> =
	IsUnion<N> extends true
		? { readonly props: never }
		: PropsArg<N> extends []
			? { readonly props?: undefined }
			: [] extends PropsArg<N>
				? { readonly props?: EventProps<N> }
				: { readonly props: EventProps<N> }

/** A sanitised property bag, as it travels to Umami. */
export type EventData = Record<string, string | number | boolean>

export const EVENT_NAME_MAX_LENGTH = 50
export const EVENT_MAX_PROPS = 6
export const EVENT_VERBS = [
	'view',
	'click',
	'open',
	'select',
	'change',
	'start',
	'step',
	'submit',
	'success',
	'error',
	'cancel',
	'expire',
	'read',
] as const
/** Names that predate the verb rule and are kept as they are. */
export const EVENT_NAME_EXCEPTIONS: readonly string[] = ['show_special_tooltip']

/** Runtime lookup that does not trust the name: own keys only. */
export function getEventSpec(name: unknown): EventSpec | null {
	if (typeof name !== 'string') return null
	if (!Object.hasOwn(EVENTS, name)) return null
	return (EVENTS as Record<string, EventSpec>)[name]
}
