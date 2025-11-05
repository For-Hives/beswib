import type { LocaleParams } from '@/lib/generation/staticParams'

import PrivacyClient from './PrivacyClient'

export default async function Privacy({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams
	return <PrivacyClient locale={locale} />
}
