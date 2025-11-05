import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import React from 'react'
import marketplaceTranslations from '@/components/marketplace/locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { generateAlternateLanguages, generateCanonicalUrl } from '@/lib/seo/utils/seo-generators'
import { mapEventTypeToBibSaleType } from '@/lib/transformers/bib'
import { getEventImageUrl } from '@/lib/utils/images'
import type { Bib } from '@/models/bib.model'
import type { Event as EventModel } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'
import type { Organizer } from '@/models/organizer.model'
import type { User } from '@/models/user.model'
import { checkBibListingStatus, fetchPrivateBibByToken, fetchPublicBibById } from '@/services/bib.services'
import { fetchOrganizerById } from '@/services/organizer.services'
import { fetchUserByClerkId } from '@/services/user.services'

import MarketplaceItemClient from './MarketplaceItemClient'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string; locale: Locale }>
}): Promise<Metadata> {
	const { locale, id } = await params

	try {
		// Try to fetch bib data for better SEO
		const bibStatus = await checkBibListingStatus(id)
		if (bibStatus?.exists === true && bibStatus.available) {
			const bib = await fetchPublicBibById(id)

			if (bib?.expand?.eventId) {
				const eventName = bib.expand.eventId.name
				const location = bib.expand.eventId.location
				const price = bib.price

				const title = location
					? `${eventName} Bib in ${location} | €${price} | Race Bib Transfer | Beswib`
					: `${eventName} Race Bib | €${price} | Buy Secure Transfer | Beswib`

				const description = `Purchase ${eventName}${location ? ` in ${location}` : ''} race bib for €${price}. Secure PayPal payment, organizer approved transfer, instant confirmation. Legal race bib marketplace with verified sellers.`

				return {
					title: title.length > 60 ? `${eventName} Race Bib | €${price} | Beswib` : title,
					openGraph: {
						type: 'website',
						title: `${eventName} Race Bib - €${price}`,
						description: `Secure race bib transfer for ${eventName}${location ? ` in ${location}` : ''}`,
					},
					description: description.length > 160 ? description.substring(0, 157) + '...' : description,
					alternates: {
						languages: generateAlternateLanguages(`/marketplace/${id}`),
						canonical: generateCanonicalUrl(locale, `/marketplace/${id}`),
					},
				}
			}
		}
	} catch (error) {
		console.warn('Could not generate dynamic metadata for marketplace item:', error)
	}

	// Fallback metadata if we can't fetch bib data
	return {
		title: 'Race Bib Purchase | Secure Transfer | Beswib Marketplace',
		openGraph: {
			type: 'website',
			title: 'Race Bib Purchase | Beswib',
			description: 'Secure race bib marketplace with verified sellers',
		},
		description:
			'Purchase verified race bibs from trusted sellers. Secure PayPal payments, organizer approved transfers, instant confirmation. Legal marketplace for running, trail, triathlon events.',
		alternates: {
			languages: generateAlternateLanguages(`/marketplace/${id}`),
			canonical: generateCanonicalUrl(locale, `/marketplace/${id}`),
		},
	}
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
	const t = getTranslations(locale, marketplaceTranslations)
	const { tkn } = await searchParams
	const { userId } = await auth()

	let user: null | User = null
	if (userId != null && userId !== undefined) {
		user = await fetchUserByClerkId(userId)
	}

	// First, check if the bib exists and if it's private or public
	const bibStatus = await checkBibListingStatus(id)

	if (bibStatus?.exists == null) {
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

	// If it's not available, show error
	if (!bibStatus.available) {
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

	let bib: (Bib & { expand?: { eventId: EventModel; sellerUserId: User } }) | null = null
	let isPrivate = false

	// Handle private bibs
	if (bibStatus.listed === 'private') {
		isPrivate = true
		if (tkn != null) {
			// Try to fetch with the provided token
			bib = await fetchPrivateBibByToken(id, tkn)
		}
		// If no token or invalid token, bib will remain null and we'll show the validation form
	} else if (bibStatus.listed === 'public') {
		// Fetch public bib
		bib = await fetchPublicBibById(id)
	}

	// If we have bib data, process it
	let bibSale: BibSale | undefined
	let organizer: Organizer | null = null

	if (bib?.expand?.eventId) {
		// Block access if event has passed or transfer window closed
		const now = new Date()
		const eventDate = new Date(bib.expand.eventId.eventDate)
		const transferDeadline = bib.expand.eventId.transferDeadline ? new Date(bib.expand.eventId.transferDeadline) : null
		const isSaleOpen = transferDeadline != null ? transferDeadline >= now : eventDate >= now

		if (!isSaleOpen) {
			return (
				<div className="mx-auto max-w-lg p-6 text-center">
					<p className="mb-4 text-lg font-semibold">{t.saleClosedTitle ?? 'Sale closed for this event.'}</p>
					<p className="text-muted-foreground text-sm">
						{t.saleClosedBody ?? 'The event has already passed or the transfer deadline is over.'}
					</p>
				</div>
			)
		}

		// Fetch organizer information
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

		bibSale = {
			user: {
				lastName: bib.expand.sellerUserId.lastName ?? 'Unknown',
				id: bib.sellerUserId,
				firstName: bib.expand.sellerUserId.firstName ?? 'Unknown',
			},
			status: mapStatus(bib.status),
			price: bib.price,
			originalPrice: bib.originalPrice ?? 0,
			lockedAt: bib.lockedAt != '' && bib.lockedAt != null ? new Date(bib.lockedAt) : null,
			id: bib.id,
			event: {
				type: mapEventTypeToBibSaleType(bib.expand.eventId.typeCourse),
				participantCount: bib.expand.eventId.participants ?? 0,
				name: bib.expand.eventId.name,
				location: bib.expand.eventId.location,
				image: getEventImageUrl(
					{
						expand: {
							organizer: organizer ?? undefined,
						},
					},
					bib.id
				),
				id: bib.expand.eventId.id,
				distanceUnit: 'km' as const,
				distance: bib.expand.eventId.distanceKm ?? 0,
				date: new Date(bib.expand.eventId.eventDate),
			},
		} satisfies BibSale
	}

	return (
		<MarketplaceItemClient
			bibId={id}
			locale={locale}
			initialToken={tkn}
			isPrivate={isPrivate}
			bibSale={bibSale}
			sellerUser={bib?.expand?.sellerUserId ?? null}
			user={user}
			eventData={bib?.expand?.eventId}
			organizerData={organizer ?? undefined}
			bibData={bib ?? undefined}
			translations={t}
		/>
	)
}
