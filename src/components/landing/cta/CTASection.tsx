import { CTASection } from '@/components/landing/cta/CTAWithRectangle'
import type { LocaleParams } from '@/lib/generation/staticParams'

export default async function BesWibCTA({ localeParams }: { localeParams: Promise<LocaleParams> }) {
	const { locale } = await localeParams

	return <CTASection locale={locale} withGlow={true} />
}
