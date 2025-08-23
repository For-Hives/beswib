import type { Metadata } from 'next'

import { Suspense } from 'react'

import type { BibSale } from '@/models/marketplace.model'
import type { Locale } from '@/lib/i18n/config'

import {
	fetchAvailableBibsForMarketplace,
	unlockExpiredBibs,
	updateExpiredBibsToWithdrawn,
} from '@/services/bib.services'
import { generateMarketplaceMetadata } from '@/lib/seo/metadata-generators'
import MarketplaceClient from '@/components/marketplace/MarketplaceClient'
import { generateLocaleParams } from '@/lib/generation/staticParams'
import { transformBibsToBibSales } from '@/lib/transformers/bib'
import { getTranslations } from '@/lib/i18n/dictionary'

import marketplaceTranslations from './locales.json'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
	const { locale } = await params
	return generateMarketplaceMetadata(locale)
}

export function generateStaticParams() {
	return generateLocaleParams()
}

export default async function MarketplacePage({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	const t = getTranslations(locale, marketplaceTranslations)

	// Clean up expired bibs and unlock locked bibs
	try {
		const [expiredCount] = await Promise.all([
			updateExpiredBibsToWithdrawn(), // Update expired bibs to withdrawn
			unlockExpiredBibs(), // Unlock bibs that were locked too long
		])
		if (expiredCount > 0) {
			console.info(`Marketplace: Updated ${expiredCount} expired bibs to withdrawn status`)
		}
	} catch (error) {
		console.error('Marketplace: Failed to clean up expired bibs:', error)
		// Don't block the page load if this fails
	}

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
							<p className="text-muted-foreground">{t.loading}</p>
						</div>
					</div>
				}
			>
				<MarketplaceClient bibs={bibs} locale={locale} />
			</Suspense>
		</div>
	)
}

export const dynamic = 'force-dynamic'
