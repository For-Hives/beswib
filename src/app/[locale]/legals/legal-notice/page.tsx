import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { generateSimplePageMetadata } from '@/lib/seo/metadata-generators'
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

	return generateSimplePageMetadata(
		locale,
		t.pages.legalNotice.title,
		t.pages.legalNotice.description,
		'/legals/legal-notice'
	)
}

export function generateStaticParams() {
	return generateLocaleParams()
}
