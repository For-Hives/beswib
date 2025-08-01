import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generateStaticParams'
import globalTranslations from '@/components/global/locales.json'
import BesWibCTA from '@/components/landing/cta/CTASection'
import { getTranslations } from '@/lib/getDictionary'
import FAQ from '@/components/landing/faq/FAQ'

export default function FAQPage({ params }: { params: Promise<LocaleParams> }) {
	// Locale will be used when components are updated for i18n
	// const { locale } = await params

	return (
		<div className="relative">
			<FAQ localeParams={params} />
			<BesWibCTA localeParams={params} />
		</div>
	)
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return {
		title: t.pages.faq.title,
		description: t.pages.faq.description,
	}
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}
