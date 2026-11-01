'use client'

import { useEffect, useState } from 'react'
import { TrackView } from '@/components/analytics/TrackView'
import BibDetailClient from '@/components/marketplace/BibDetailClient'
import TokenValidation from '@/components/marketplace/TokenValidation'
import type { Locale } from '@/lib/i18n/config'
import type { Event as EventModel } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'
import type { Organizer } from '@/models/organizer.model'

interface MarketplaceItemClientProps {
	bibId: string
	locale: string
	initialToken?: string
	isPrivate: boolean
	bibSale?: BibSale
	eventData?: EventModel
	organizerData?: Organizer
	translations: {
		bibNotFound?: string
		saleClosedTitle?: string
		saleClosedBody?: string
		tokenValidation?: {
			title?: string
			description?: string
			tokenLabel?: string
			tokenPlaceholder?: string
			validateButton?: string
			invalidToken?: string
			requiredToken?: string
			backToMarketplace?: string
		}
	}
}

export default function MarketplaceItemClient({
	translations: t,
	organizerData,
	locale,
	isPrivate,
	initialToken,
	eventData,
	bibSale,
	bibId,
}: MarketplaceItemClientProps) {
	const [hasValidToken, setHasValidToken] = useState(initialToken != null)

	// Update hasValidToken when initialToken changes (after redirect)
	useEffect(() => {
		setHasValidToken(initialToken != null)
	}, [initialToken])

	const handleValidToken = (token: string) => {
		// Redirect to the same page with the token as a query parameter
		const url = new URL(window.location.href)
		url.searchParams.set('tkn', token)

		// Force a complete page reload to ensure server-side processing
		window.location.href = url.toString()
	}

	// If it's a private bib and no valid token, show the validation form
	if (isPrivate && !hasValidToken) {
		return (
			<>
				<TrackView name="bib_view" props={{ state: 'token_required', listing: 'private', viewer: 'unknown' }} />
				<TokenValidation
					bibId={bibId}
					locale={locale}
					onValidToken={handleValidToken}
					translations={t.tokenValidation ?? {}}
				/>
			</>
		)
	}

	// If no bib data (invalid token or bib not found), show error
	if (!bibSale || !eventData) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
				{isPrivate ? (
					<TrackView name="bib_view" props={{ state: 'token_invalid', listing: 'private', viewer: 'unknown' }} />
				) : (
					<TrackView name="bib_view" props={{ state: 'unavailable', listing: 'public', viewer: 'unknown' }} />
				)}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
				<div className="relative pt-32 pb-12">
					<div className="container mx-auto max-w-2xl p-6">
						<div className="mb-12 space-y-2 text-center">
							<h1 className="text-foreground text-4xl font-bold tracking-tight">
								{t.bibNotFound ?? 'Dossard introuvable ou données manquantes'}
							</h1>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Beswib is archived: the page of a bib shows the race, and no way to pay
	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
			<BibDetailClient bib={bibSale} locale={locale as Locale} eventData={eventData} organizerData={organizerData} />
		</div>
	)
}
