import type { ConsentRootProps, OfflineModeOptions } from '@c15t/nextjs'

// Static configuration of the consent manager (c15t, offline mode: no backend, the choice stays in
// the visitor's browser). Plain data only: the root layout is a Server Component and hands it to
// <ConsentRoot> as props.

/** The category Google Analytics belongs to, and the only optional one the site uses. */
export const ANALYTICS_CATEGORY = 'measurement'

/** What the preferences dialog lists. */
export const CONSENT_CATEGORIES: NonNullable<NonNullable<ConsentRootProps['options']>['consentCategories']> = [
	'necessary',
	ANALYTICS_CATEGORY,
]

/**
 * One rule for every visitor, wherever they are: nothing optional runs before an explicit choice.
 *
 * Without rules c15t falls back on its recommended pack, which asks first in Europe, in Quebec
 * and when the country is unknown, and allows everything in most other places. Offline mode never
 * learns the country today, so the result would be the same, but the gate on Google Analytics must
 * not depend on that. `isDefault` covers a known country, `fallback` an unknown one. The strict
 * scope keeps every category the site does not use (marketing, ...) denied, whatever an older
 * stored record says.
 */
export const CONSENT_POLICY_RULES: NonNullable<OfflineModeOptions['policyRules']> = [
	{
		id: 'beswib_opt_in',
		match: { isDefault: true, fallback: true },
		model: 'opt-in',
		prompt: 'choice',
		categories: [ANALYTICS_CATEGORY],
		scopeMode: 'strict',
	},
]

/**
 * Cookies Google Analytics leaves behind, removed whenever the category is denied: on the first
 * page of a visitor who has not accepted (the previous setup wrote them for everyone) and when a
 * visitor withdraws their consent.
 */
export const CONSENT_CLEAR_ON_REVOCATION: NonNullable<ConsentRootProps['clearOnRevocation']> = {
	[ANALYTICS_CATEGORY]: { cookies: ['_ga', '_ga_*'] },
}
