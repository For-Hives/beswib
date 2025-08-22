import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import globalTranslations from '@/components/global/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { generateSimplePageMetadata } from '@/lib/seo/metadata-generators'
import Terms from '@/components/legals/terms/Terms'

export default function TermsPage({ params }: { params: Promise<LocaleParams> }) {
	return (
		<div className="relative">
			<Terms localeParams={params} />
		</div>
	)
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return generateSimplePageMetadata(
		locale,
		t.pages.terms.title,
		t.pages.terms.description,
		'/legals/terms'
	)
}

export function generateStaticParams() {
	return generateLocaleParams()
}
