import type { Metadata } from 'next'

import { Suspense } from 'react'

import type { BibSale } from '@/components/marketplace/CardMarket'

import { generateLocaleParams, type LocaleParams } from '@/lib/generateStaticParams'
import MarketplaceClient from '@/components/marketplace/MarketplaceClient'
import { fetchAvailableBibsForMarketplace } from '@/services/bib.services'
import { transformBibsToBibSales } from '@/lib/bibTransformers'
import { getTranslations } from '@/lib/getDictionary'

import marketplaceTranslations from './locales.json'

// Metadata for the page (SEO, title, description)
export const metadata: Metadata = {
	title: 'Marketplace | Beswib',
	description: 'Browse and buy race bibs from our marketplace.',
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Main server component for the marketplace page
export default async function MarketplacePage({ params }: { params: Promise<LocaleParams> }) {
	// Get the current locale (for translations)
	const { locale } = await params
	// Get translation function for the current locale
	const t = getTranslations(locale, marketplaceTranslations)

	// Fetch real bibs from the database
	const availableBibs = await fetchAvailableBibsForMarketplace()
	const bibs: BibSale[] = transformBibsToBibSales(availableBibs)

	return (
		<div className="min-h-screen">
			{/* Page header with title and description */}
			<header className="border-border bg-card/50 border-b px-6 py-4">
				<div className="mx-auto max-w-7xl">
					<h1 className="text-2xl font-bold">{t.title}</h1>
					<p className="text-muted-foreground text-sm">{t.description}</p>
				</div>
			</header>

			{/* Client component that handles filtering, sorting, and displaying bibs */}
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

// Marketplace page: server component
// Loads translations, mock data, and renders the MarketplaceClient
