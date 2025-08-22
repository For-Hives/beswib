import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import SecurityProcess from '@/components/landing/security-process/SecurityProcess'
import JourneyTabs from '@/components/landing/journey-tabs/JourneyTabs'
import HeroAlternative from '@/components/landing/hero/HeroAlternative'
import { generateHomeMetadata } from '@/lib/seo/metadata-generators'
import FeaturesBento from '@/components/landing/features/Features'
import BesWibCTA from '@/components/landing/cta/CTASection'
import { StructuredData } from '@/lib/seo'

// Generate static params for all locales 🌍
export function generateStaticParams() {
	return generateLocaleParams()
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return generateHomeMetadata(locale)
}

export default async function Home({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	return (
		<>
			{/* SEO Structured Data */}
			<StructuredData locale={locale} type="home" />

			<div className="relative">
				{/* Hero Section 🦸 */}
				<HeroAlternative localeParams={params} />
				{/* Stats Section 📊 */}
				{/* TODO : Add stats section later */}
				{/* <BibStats localeParams={params} /> */}
				{/* Journey Section 🚶 */}
				<JourneyTabs localeParams={params} />
				{/* Features Section ✨ */}
				<FeaturesBento localeParams={params} />
				{/* Security Process Section 🛡️ */}
				<SecurityProcess localeParams={params} />
				{/* CTA Section 📣 */}
				<BesWibCTA localeParams={params} />
			</div>
		</>
	)
}
