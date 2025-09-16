import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { generateSimplePageMetadata } from '@/lib/seo/metadata-generators'
import globalTranslations from '@/components/global/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import Aup from '@/components/legals/aup/Aup'

export default function AupPage({ params }: { params: Promise<LocaleParams> }) {
	return (
		<div className="relative">
			<Aup localeParams={params} />
		</div>
	)
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return generateSimplePageMetadata(locale, t.pages.aup.title, t.pages.aup.description, '/legals/aup')
}

export function generateStaticParams() {
	return generateLocaleParams()
}
