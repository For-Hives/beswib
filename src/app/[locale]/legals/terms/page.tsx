import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generateStaticParams'
import globalTranslations from '@/components/global/locales.json'
import { getTranslations } from '@/lib/getDictionary'

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

	return {
		title: t.pages.terms.title,
		description: t.pages.terms.description,
	}
}

export function generateStaticParams() {
	return generateLocaleParams()
}
