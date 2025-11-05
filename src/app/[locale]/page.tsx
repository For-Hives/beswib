import type { Metadata } from 'next'
import BesWibCTA from '@/components/landing/cta/CTASection'
import FeaturesBento from '@/components/landing/features/Features'
import HeroAlternative from '@/components/landing/hero/HeroAlternative'
import JourneyTabs from '@/components/landing/journey-tabs/JourneyTabs'
import SecurityProcess from '@/components/landing/security-process/SecurityProcess'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { generateHomeMetadata } from '@/lib/seo/metadata-generators'

// Generate static params for all locales 🌍
export function generateStaticParams() {
	return generateLocaleParams()
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return generateHomeMetadata(locale)
}

export default function Home({ params }: { params: Promise<LocaleParams> }) {
	return (
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
	)
}
