import type { Metadata } from 'next'
import globalTranslations from '@/components/global/locales.json'
import DataDeletion from '@/components/legals/data-deletion/DataDeletion'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { generateSimplePageMetadata } from '@/lib/seo/metadata-generators'

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

	return generateSimplePageMetadata(
		locale,
		t.pages.dataDeletion.title,
		t.pages.dataDeletion.description,
		'/legals/data-deletion'
	)
}

export function generateStaticParams() {
	return generateLocaleParams()
}
