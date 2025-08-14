import { LocaleParams } from '@/lib/generation/staticParams'

import FAQClient from './FAQClient'

export default async function FAQ({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams

	return <FAQClient locale={locale} />
}
