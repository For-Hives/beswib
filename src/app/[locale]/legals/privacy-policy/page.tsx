import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generateStaticParams'
import globalTranslations from '@/components/global/locales.json'
import Privacy from '@/components/legals/privacy/Privacy'
import { getTranslations } from '@/lib/getDictionary'

export default function PrivacyPolicyPage({ params }: { params: Promise<LocaleParams> }) {
	return (
		<div className="relative">
			<Privacy localeParams={params} />
		</div>
	)
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return {
		title: t.pages.privacy.title,
		description: t.pages.privacy.description,
	}
}

export function generateStaticParams() {
	return generateLocaleParams()
}
