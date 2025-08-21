import type { Metadata } from 'next'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getBaseMetadata } from '@/lib/seo/metadata'
import SecurityProcess from '@/components/landing/security-process/SecurityProcess'
import JourneyTabs from '@/components/landing/journey-tabs/JourneyTabs'
import HeroAlternative from '@/components/landing/hero/HeroAlternative'
import FeaturesBento from '@/components/landing/features/Features'
// import BibStats from '@/components/landing/bib-stats/BibStats'
import BesWibCTA from '@/components/landing/cta/CTASection'
// import Hero from '@/components/landing/hero/Hero'

// Generate static params for all locales 🌍
export function generateStaticParams() {
	return generateLocaleParams()
}

// Métadonnées SEO dynamiques par langue
export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return getBaseMetadata(locale)
}

export default async function Home({ params }: { params: Promise<LocaleParams> }) {
	// Locale will be used when components are updated for i18n 🗺️
	await params

	return (
		<div className="relative">
			{/* Hero Section 🦸 */}
			<HeroAlternative localeParams={params} />
			{/* Stats Section 📊 */}
			{/* TODO: Add stats section later */}
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
	)
}
