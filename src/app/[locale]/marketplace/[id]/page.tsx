import type { Metadata } from 'next'

import React from 'react'

import { auth } from '@clerk/nextjs/server'

import type { Event as EventModel } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'
import type { Organizer } from '@/models/organizer.model'

import { fetchBibById, fetchPrivateBibByToken } from '@/services/bib.services'
import PayPalPurchaseClient from '@/components/marketplace/purchase/PayPalPurchaseClient'
import { PayPalProvider } from '@/components/marketplace/purchase/PayPalProvider'
import { mapEventTypeToBibSaleType } from '@/lib/bibTransformers'
import { BibSale } from '@/components/marketplace/CardMarket'
import { fetchUserByClerkId } from '@/services/user.services'
import { fetchOrganizerById } from '@/services/organizer.services'
import { Locale } from '@/lib/i18n-config'

export const metadata: Metadata = {
	title: 'Purchase Bib',
	description: 'Complete your purchase.',
}

interface MarketplaceItemPageProps {
	params: Promise<{
		id: string
		locale: Locale
	}>
	searchParams: Promise<{
		tkn?: string
	}>
}

export default async function MarketplaceItemPage({ searchParams, params }: MarketplaceItemPageProps) {
	const { locale, id } = await params
	const { tkn } = await searchParams
	const { userId } = await auth()

	let user: null | User = null
	if (userId !== null && userId !== undefined) {
		user = await fetchUserByClerkId(userId)
	}

	let bib: (Bib & { expand?: { eventId: EventModel; sellerUserId: User } }) | null

	if (tkn != null) {
		bib = await fetchPrivateBibByToken(id, tkn)
	} else {
		bib = await fetchBibById(id)
	}

	if (!bib || !bib.expand?.eventId) {
		return <div>Bib not found or event data missing</div>
	}

	// Fetch organizer information
	let organizer: Organizer | null = null
	try {
		if (bib.expand.eventId.organizer) {
			organizer = await fetchOrganizerById(bib.expand.eventId.organizer)
		}
	} catch (error) {
		console.warn('Could not fetch organizer data:', error)
	}

	// Function to map status
	const mapStatus = (status: string): 'available' | 'sold' => {
		switch (status) {
			case 'available':
				return 'available'
			case 'sold':
				return 'sold'
			default:
				return 'available' // default to available for other statuses
		}
	}

	const bibSale: BibSale = {
		user: {
			lastName: bib.expand.sellerUserId.lastName ?? 'Unknown',
			id: bib.sellerUserId,
			firstName: bib.expand.sellerUserId.firstName ?? 'Unknown',
		},
		status: mapStatus(bib.status),
		price: bib.price,
		originalPrice: bib.originalPrice ?? 0,
		id: bib.id,
		event: {
			type: mapEventTypeToBibSaleType(bib.expand.eventId.typeCourse),
			participantCount: bib.expand.eventId.participants ?? 0,
			name: bib.expand.eventId.name,
			location: bib.expand.eventId.location,
			image: '/beswib.svg',
			id: bib.expand.eventId.id,
			distanceUnit: 'km' as const,
			distance: bib.expand.eventId.distanceKm ?? 0,
			date: new Date(bib.expand.eventId.eventDate),
		},
		lockedAt: bib.lockedAt ? new Date(bib.lockedAt) : null,
	} satisfies BibSale

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
			<PayPalProvider>
				<PayPalPurchaseClient
					bib={bibSale}
					locale={locale}
					sellerUser={bib.expand?.sellerUserId ?? null}
					user={user}
					eventData={bib.expand.eventId}
					organizerData={organizer ?? undefined}
					bibData={bib}
				/>
			</PayPalProvider>
		</div>
	)
}
