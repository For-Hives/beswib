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
	
	// Personnaliser les métadonnées pour la page FAQ
	return {
		...baseMetadata,
		title: `${t.pages.faq.title} - ${baseMetadata.title?.default || 'Beswib'}`,
		description: t.pages.faq.description,
		openGraph: {
			...baseMetadata.openGraph,
			title: `${t.pages.faq.title} - ${baseMetadata.openGraph?.title || 'Beswib'}`,
			description: t.pages.faq.description,
			url: `https://beswib.com/${locale}/faq`,
		},
		twitter: {
			...baseMetadata.twitter,
			title: `${t.pages.faq.title} - ${baseMetadata.twitter?.title || 'Beswib'}`,
			description: t.pages.faq.description,
		},
		alternates: {
			canonical: `https://beswib.com/${locale}/faq`,
			languages: baseMetadata.alternates?.languages || {},
		},
	}
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}
