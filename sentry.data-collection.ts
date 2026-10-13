// What the Sentry SDK may collect on its own: one policy for the server, the edge runtime and the browser.
//
// Sentry 11 replaced `sendDefaultPii` (off unless asked for) with `dataCollection`, where every category is ON unless
// it is switched off. Left unset, the SDK attaches cookies, request and response bodies, the visitor's IP address,
// GenAI prompts and answers to what it sends. Every category is therefore spelled out here, with the choice that
// sends the least. Do not remove a line because it looks like a default: the default is the permissive one.
//
// The lists below are deny lists: a header or a query parameter is masked when its name contains one of the terms,
// whatever the case. A name nobody listed leaves as it came, so a new URL that carries a person needs its
// parameter added here.

import type * as Sentry from '@sentry/nextjs'

// Header and query-parameter names that carry a visitor's address or identity: the list Sentry 10 applied while
// `sendDefaultPii` was off. Names that look like a secret (auth, token, cookie, key, session, password...) are
// masked by the SDK whatever is configured here.
const ADDRESS_AND_IDENTITY_NAMES = ['forwarded', '-ip', 'remote-', 'via', '-user']

// The query parameters that put a person in a URL the SDK records, whether the request comes in or goes out:
// - `email`: the waiting-list confirmation, /events/<id>?waitlist_success=true&email=...
// - `name`, `email`, `message`: the account-deletion request prefilled from the profile, /contact?name=...
// - `userId`: the Clerk id in /api/paypal/merchant-status?userId=...
// - `trackingId` (the Clerk id again), then `merchantId` and `merchantIdInPayPal` added by PayPal when it sends a
//   seller back from its onboarding
// - `phone`: in no URL today; listed because a profile holds one
// - `filter`: what the server asks PocketBase, such as filter=userId = "..." && email = "...", recorded with every
//   outgoing request. The collection, the sort and the page of the query stay readable.
const PERSONAL_QUERY_PARAMS = ['mail', 'name', 'message', 'user', 'tracking', 'merchant', 'phone', 'filter']

type DataCollection = NonNullable<Parameters<typeof Sentry.init>[0]['dataCollection']>

// `Required`: a category added by a later SDK version fails the type check until it is decided here, instead of
// starting to collect unseen (Renovate merges Sentry minors on its own). `frameContextLines` is only the number of
// source lines shown around a stack frame.
export const dataCollection: Required<Omit<DataCollection, 'frameContextLines'>> = {
	// No user id, e-mail or IP address taken from the request
	userInfo: false,
	// Cookies hold the Clerk session
	cookies: false,
	httpHeaders: {
		// `x-clerk-*`: the Clerk middleware copies the full request URL, query string included, into a header.
		// `referer`: the full URL of the previous page, so its query string one request later (the `tkn` of a
		// private listing, the `email` of the waiting list). A header is masked whole: the page a failing request
		// came from is no longer shown in Sentry.
		request: { deny: [...ADDRESS_AND_IDENTITY_NAMES, 'x-clerk', 'referer'] },
		response: { deny: ADDRESS_AND_IDENTITY_NAMES },
	},
	// No body, incoming or outgoing: forms carry runners' identities, webhooks carry payments
	httpBodies: [],
	// `tkn` opens a private listing, Clerk hands over sign-in tickets as `__clerk_*`, and a redirect URL can embed
	// both. This masks them in the URLs the SDK records itself. Next.js's own `http.target` span attribute is out
	// of reach of this policy and still carries the query string as it came, as it did with Sentry 10.
	urlQueryParams: { deny: [...ADDRESS_AND_IDENTITY_NAMES, ...PERSONAL_QUERY_PARAMS, 'tkn', '__clerk', 'redirect'] },
	// Prompts and answers of the article generation (src/services/gemini.services.ts)
	genAI: { inputs: false, outputs: false },
	// Nothing in the app uses these today; set so that a library added later does not start sending its payloads
	graphQL: { document: false, variables: false },
	databaseQueryData: false,
	queues: false,
	// Local variables of a failing function hold whatever the request carried
	stackFrameVariables: false,
}
