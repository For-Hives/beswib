import type { LocalizationResource } from '@clerk/types'

// Import Clerk localization resources
import { deDE, enUS, esES, frFR, itIT, koKR, nlNL, ptBR, roRO } from '@clerk/localizations'

import type { Locale } from '@/lib/i18n/config'

/**
 * Map our app locales to Clerk localization resources
 * Ordered according to i18n config for consistency
 */
const clerkLocaleMap: Record<Locale, LocalizationResource> = {
	ro: roRO,
	pt: ptBR,
	nl: nlNL,
	ko: koKR,
	it: itIT,
	fr: frFR,
	es: esES,
	en: enUS,
	de: deDE,
}

/**
 * Get the appropriate Clerk localization resource for a given locale
 * @param locale - The locale to get localization for
 * @returns The Clerk localization resource
 */
export function getClerkLocalization(locale: Locale): LocalizationResource {
	return clerkLocaleMap[locale] ?? clerkLocaleMap.en
}
