import { type ConsentRootProps, offline } from '@c15t/nextjs'

import type { Locale } from '@/lib/i18n/config'

import { CONSENT_CATEGORIES, CONSENT_CLEAR_ON_REVOCATION, CONSENT_POLICY_RULES } from './config'
import { getConsentI18n } from './messages'

/**
 * Everything <ConsentRoot> is given, for the page of one locale. Serializable on purpose: the root
 * layout is a Server Component. Kept out of the layout so the tests mount the consent manager
 * exactly as production does.
 *
 * `offline()` is explicit: without a mode c15t expects a backend and throws.
 */
export function getConsentRootProps(locale: Locale): Pick<ConsentRootProps, 'options' | 'clearOnRevocation'> {
	return {
		options: {
			mode: offline({ policyRules: CONSENT_POLICY_RULES }),
			consentCategories: CONSENT_CATEGORIES,
			i18n: getConsentI18n(locale),
		},
		clearOnRevocation: CONSENT_CLEAR_ON_REVOCATION,
	}
}
