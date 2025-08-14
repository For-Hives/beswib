import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generateStaticParams'
import LegalNotice from '@/components/legals/legal-notice/LegalNotice'
import globalTranslations from '@/components/global/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

export default function LegalNoticePage({ params }: { params: Promise<LocaleParams> }) {
	return (
		<div className="relative">
			<LegalNotice localeParams={params} />
		</div>
	)
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return {
		title: t.pages.legalNotice.title,
		description: t.pages.legalNotice.description,
	}
}

export function generateStaticParams() {
	return generateLocaleParams()
}
