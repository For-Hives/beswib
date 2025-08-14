import type { LocalizationResource } from '@clerk/types'

import type { Locale } from '@/lib/i18n-config'

// Import Clerk localization resources
import { deDE, enUS, esES, frFR, itIT, koKR, nlNL, ptBR, roRO } from '@clerk/localizations'

/**
 * Map our app locales to Clerk localization resources
 */
const clerkLocaleMap: Record<Locale, LocalizationResource> = {
	de: deDE,
	en: enUS,
	es: esES,
	fr: frFR,
	it: itIT,
	ko: koKR,
	nl: nlNL,
	pt: ptBR,
	ro: roRO,
}

/**
 * Get the appropriate Clerk localization resource for a given locale
 * @param locale - The locale to get localization for
 * @returns The Clerk localization resource
 */
export function getClerkLocalization(locale: Locale): LocalizationResource {
	return clerkLocaleMap[locale] ?? clerkLocaleMap.en
}