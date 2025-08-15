import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import globalTranslations from '@/components/global/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import DataDeletion from '@/components/legals/data-deletion/DataDeletion'

export default function DataDeletionPage({ params }: { params: Promise<LocaleParams> }) {
	return (
		<div className="relative">
			<DataDeletion localeParams={params} />
		</div>
	)
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return {
		title: t.pages.dataDeletion.title,
		description: t.pages.dataDeletion.description,
	}
}

export function generateStaticParams() {
	return generateLocaleParams()
}