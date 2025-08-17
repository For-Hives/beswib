'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type { Event as EventModel } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'
import type { BibSale } from '@/models/marketplace.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'

import PayPalPurchaseClient from '@/components/marketplace/purchase/PayPalPurchaseClient'
import { PayPalProvider } from '@/components/marketplace/purchase/PayPalProvider'
import TokenValidation from '@/components/marketplace/TokenValidation'

interface MarketplaceItemClientProps {
	bibId: string
	locale: string
	initialToken?: string
	isPrivate: boolean
	bibSale?: BibSale
	sellerUser?: User | null
	user?: User | null
	eventData?: EventModel
	organizerData?: Organizer
	bibData?: Bib & { expand?: { eventId: EventModel; sellerUserId: User } }
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
	bibId,
	locale,
	initialToken,
	isPrivate,
	bibSale,
	sellerUser,
	user,
	eventData,
	organizerData,
	bibData,
	translations: t,
}: MarketplaceItemClientProps) {
	const [hasValidToken, setHasValidToken] = useState(!!initialToken)
	const router = useRouter()

	// Update hasValidToken when initialToken changes (after redirect)
	useEffect(() => {
		setHasValidToken(!!initialToken)
	}, [initialToken])

	// Debug logs
	console.log('MarketplaceItemClient Debug:', {
		bibId,
		initialToken,
		isPrivate,
		hasValidToken,
		hasBibSale: !!bibSale,
		hasEventData: !!eventData,
		bibData: !!bibData,
	})

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
			<TokenValidation
				bibId={bibId}
				locale={locale}
				onValidToken={handleValidToken}
				translations={t.tokenValidation || {}}
			/>
		)
	}

	// If no bib data (invalid token or bib not found), show error
	if (!bibSale || !eventData) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
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

	// Show the normal purchase interface
	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
			<PayPalProvider>
				<PayPalPurchaseClient
					bib={bibSale}
					locale={locale}
					sellerUser={sellerUser ?? null}
					user={user ?? null}
					eventData={eventData}
					organizerData={organizerData}
					bibData={bibData}
				/>
			</PayPalProvider>
		</div>
	)
}
