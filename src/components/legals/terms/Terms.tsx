import { LocaleParams } from '@/lib/generation/staticParams'

import TermsClient from './TermsClient'

export default async function Terms({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams
	return <TermsClient locale={locale} />
}
