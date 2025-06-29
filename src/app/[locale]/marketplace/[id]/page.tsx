import type { Metadata } from 'next'

import React from 'react'

import { auth } from '@clerk/nextjs/server'

import type { Event as EventModel } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'

import { fetchAvailableBibsForEvent, fetchBibById, fetchPrivateBibByToken } from '@/services/bib.services'
import { StripeProvider } from '@/components/marketplace/purchase/StripeProvider'
import PurchaseClient from '@/components/marketplace/purchase/PurchaseClient'
import { mapEventTypeToBibSaleType } from '@/lib/bibTransformers'
import { createPaymentIntent } from '@/services/stripe.services'
import { BibSale } from '@/components/marketplace/CardMarket'
import { fetchUserById } from '@/services/user.services'
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
		user = await fetchUserById(userId)
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
	} satisfies BibSale

	// Fetch other available bibs for the same event
	const otherBibsData = await fetchAvailableBibsForEvent(bib.expand.eventId.id)

	// Transform other bibs to BibSale format
	const otherBibs: BibSale[] = otherBibsData
		.filter(otherBib => otherBib.expand?.eventId && otherBib.expand?.sellerUserId)
		.map(otherBib => ({
			user: {
				lastName: otherBib.expand!.sellerUserId.lastName ?? 'Unknown',
				id: otherBib.sellerUserId,
				firstName: otherBib.expand!.sellerUserId.firstName ?? 'Unknown',
			},
			status: mapStatus(otherBib.status),
			price: otherBib.price,
			originalPrice: otherBib.originalPrice ?? 0,
			id: otherBib.id,
			event: {
				type: mapEventTypeToBibSaleType(otherBib.expand!.eventId.typeCourse),
				participantCount: otherBib.expand!.eventId.participants ?? 0,
				name: otherBib.expand!.eventId.name,
				location: otherBib.expand!.eventId.location,
				image: '/beswib.svg',
				id: otherBib.expand!.eventId.id,
				distanceUnit: 'km' as const,
				distance: otherBib.expand!.eventId.distanceKm ?? 0,
				date: new Date(otherBib.expand!.eventId.eventDate),
			},
		}))

	const paymentIntent = await createPaymentIntent(id)

	return (
		<div className="container mx-auto px-4 py-8">
			<StripeProvider clientSecret={paymentIntent}>
				<PurchaseClient bib={bibSale} locale={locale} otherBibs={otherBibs} paymentIntent={paymentIntent} user={user} />
			</StripeProvider>
		</div>
	)
}
