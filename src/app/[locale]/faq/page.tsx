import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { generateFAQMetadata } from '@/lib/seo/metadata-generators'
import BesWibCTA from '@/components/landing/cta/CTASection'
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
	return generateFAQMetadata(locale)
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}
