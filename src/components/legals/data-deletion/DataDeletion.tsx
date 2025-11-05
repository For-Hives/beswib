import type { LocaleParams } from '@/lib/generation/staticParams'

import DataDeletionClient from './DataDeletionClient'

export default async function DataDeletion({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams
	return <DataDeletionClient locale={locale} />
}
