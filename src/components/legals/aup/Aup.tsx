import { LocaleParams } from '@/lib/generation/staticParams'

import AupClient from './AupClient'

export default async function Aup({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams
	return <AupClient locale={locale} />
}
