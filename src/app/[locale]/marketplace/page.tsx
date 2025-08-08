import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { BibSale } from '@/components/marketplace/CardMarket'
import { generateLocaleParams } from '@/lib/generateStaticParams'
import type { Locale } from '@/lib/i18n-config'
import MarketplaceClient from '@/components/marketplace/MarketplaceClient'
import { fetchAvailableBibsForMarketplace, unlockExpiredBibs } from '@/services/bib.services'
import { transformBibsToBibSales } from '@/lib/bibTransformers'
import { getTranslations } from '@/lib/getDictionary'
import marketplaceTranslations from './locales.json'

export const metadata: Metadata = {
	title: 'Marketplace | Beswib',
	description: 'Browse and buy race bibs from our marketplace.',
}

export function generateStaticParams() {
	return generateLocaleParams()
}

export default async function MarketplacePage({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	const t = getTranslations(locale, marketplaceTranslations)
	await unlockExpiredBibs()
	const availableBibs = await fetchAvailableBibsForMarketplace()
	const bibs: BibSale[] = transformBibsToBibSales(availableBibs)
	return (
		<div className="min-h-screen">
			<header className="border-border bg-card/50 border-b px-6 py-4">
				<div className="w-full">
					<h1 className="text-2xl font-bold">{t.title}</h1>
					<p className="text-muted-foreground text-sm">{t.description}</p>
				</div>
			</header>
			<Suspense
				fallback={
					<div className="flex h-64 items-center justify-center">
						<div className="text-center">
							<div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
							<p className="text-muted-foreground">Loading marketplace...</p>
						</div>
					</div>
				}
			>
				<MarketplaceClient bibs={bibs} locale={locale} />
			</Suspense>
		</div>
	)
}
