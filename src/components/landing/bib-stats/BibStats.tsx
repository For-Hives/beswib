import { LocaleParams } from '@/lib/generation/staticParams'

import BibStatsClient from './BibStatsClient'

export default async function BibStats({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams

	return <BibStatsClient locale={locale} />
}
