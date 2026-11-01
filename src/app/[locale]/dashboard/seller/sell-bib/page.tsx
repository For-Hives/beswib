import type { Metadata } from 'next'
import Link from 'next/link'
import { ArchivedClosedCard } from '@/components/archive/ArchivedClosedCard'
import translations from '@/components/global/locales.json'
import type { LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { generateAlternateLanguages } from '@/lib/seo/utils/seo-generators'
import { getPublicBaseUrl } from '@/lib/utils/url'

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return {
		title: 'Sell Bib | Beswib',
		alternates: {
			languages: generateAlternateLanguages('/dashboard/seller/sell-bib'),
			canonical: `${getPublicBaseUrl()}/${locale}/dashboard/seller/sell-bib`,
		},
	}
}

// Beswib is archived. Every "sell a bib" link of the site still leads here, signed in or not (see
// the middleware), and this page says why no bib can be listed any more.
export default async function SellBibPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params
	const t = getTranslations(locale, translations).archive

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
			<div className="relative pt-32 pb-12">
				<div className="container mx-auto max-w-xl p-6">
					<ArchivedClosedCard locale={locale} flow="sell">
						<Link
							href={`/${locale}/marketplace`}
							className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
						>
							{t.browse}
						</Link>
					</ArchivedClosedCard>
				</div>
			</div>
		</div>
	)
}
