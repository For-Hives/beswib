import type { LocaleParams } from '@/lib/generation/staticParams'

import HeaderClient from './HeaderClient'

export default async function Header({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams

	return <HeaderClient locale={locale} />
}
