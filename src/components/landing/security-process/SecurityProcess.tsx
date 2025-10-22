import type { LocaleParams } from '@/lib/generation/staticParams'

import SecurityProcessClient from './SecurityProcessClient'

export default async function SecurityProcess({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams

	return <SecurityProcessClient locale={locale} />
}
