import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import globalTranslations from '@/components/global/locales.json'
import BesWibCTA from '@/components/landing/cta/CTASection'
import { getTranslations } from '@/lib/i18n/dictionary'
import { getBaseMetadata } from '@/lib/seo/metadata'
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
	const baseMetadata = getBaseMetadata(locale)
	const t = getTranslations(locale, globalTranslations)

	// Customize metadata for the FAQ page
	return {
		...baseMetadata,
		twitter: {
			...baseMetadata.twitter,
			title: `${t.pages.faq.title} - Beswib`,
			description: t.pages.faq.description,
		},
		title: `${t.pages.faq.title} - Beswib`,
		openGraph: {
			...baseMetadata.openGraph,
			url: `https://beswib.com/${locale}/faq`,
			title: `${t.pages.faq.title} - Beswib`,
			description: t.pages.faq.description,
		},
		description: t.pages.faq.description,
		alternates: {
			languages: baseMetadata.alternates?.languages ?? {},
			canonical: `https://beswib.com/${locale}/faq`,
		},
	}
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}
