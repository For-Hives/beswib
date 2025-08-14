import { LocaleParams } from '@/lib/generation/staticParams'

import LegalNoticeClient from './LegalNoticeClient'

export default async function LegalNotice({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams
	return <LegalNoticeClient locale={locale} />
}
