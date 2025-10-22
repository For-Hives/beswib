import type { LocaleParams } from '@/lib/generation/staticParams'

import JourneyTabsClient from './JourneyTabsClient'

export default async function JourneyTabs({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams

	return <JourneyTabsClient locale={locale} />
}
