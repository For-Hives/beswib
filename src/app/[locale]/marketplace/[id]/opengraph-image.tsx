import * as React from 'react'

import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { readFileSync } from 'fs'
import { join } from 'path'

import type { BibSale } from '@/models/marketplace.model'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { fetchBibById, fetchPrivateBibByToken } from '@/services/bib.services'
import { transformBibsToBibSales } from '@/lib/transformers/bib'
import OGImage from '@/components/OG/ogImageBib.component'

// 👇 OG image configuration
export const alt = 'Beswib Open Graph Image' // Alt text for the OG image
export const size = { width: 1200, height: 630 } // OG image size
export const contentType = 'image/png' // OG image content type

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Default export: async function to generate the OG image
export default async function Image({ params }: { params: Promise<LocaleParams & { id?: string; tkn?: string }> }) {
	const { tkn, locale, id } = await params

	// Retrieve the bib (race bib) by id and token if provided
	let bib: (Bib & { expand?: { eventId: Event; sellerUserId: User } }) | null = null
	if (id !== undefined && id !== null) {
		if (tkn !== undefined) {
			bib = await fetchPrivateBibByToken(id, tkn)
		} else {
			bib = await fetchBibById(id)
		}
	}

	// Fallback if no bib or event found
	if (!bib || !bib.expand?.eventId) {
		return new ImageResponse(
			(
				<OGImage
					title="Dossard introuvable"
					secondary="Aucun événement lié"
					size={size}
					bib={null}
					locale={locale}
					bibEventName="Événement inconnu"
					bibPrice={0}
					bibEventDistance={0}
					bibEventLocation="Lieu inconnu"
					bibSeller="inconnu"
					bibEventDate={new Date()}
					bibEventParticipants={0}
					discount={0}
				/>
			),
			size
		)
	}

	// Transform bib to bibsale object
	const bibsales: BibSale[] = transformBibsToBibSales([bib])
	const bibsale = bibsales[0] ?? null

	const bibEventName = bibsale.event.name
	const bibPrice = bibsale.price
	const bibEventDistance = bibsale.event.distance
	const bibEventLocation = bibsale.event.location
	const bibSeller = bibsale.user.firstName
	const bibEventDate = bibsale.event.date
	const bibEventParticipants = bibsale.event.participantCount
	// if bibsale.originalPrice is defined and greater than bibsale.price, calculate the discount
	let discount = 0
	if (bibsale.originalPrice && bibsale.price < bibsale.originalPrice) {
		// Calculate the percentage discount
		discount = Math.round(((bibsale.originalPrice - bibsale.price) / bibsale.originalPrice) * 100)
	}

	// Build the OG title and secondary text
	const ogTitle = bib.expand.eventId.name
	const ogSecondary = `${bib.price}€ • ${bib.expand.eventId.distanceKm ?? 0} km • ${bib.expand.eventId.location}`

	try {
		// Load custom fonts from the filesystem
		const bowlbyFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/BowlbyOneSC-Regular.ttf'))
		const geistFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/Geist-Regular.ttf'))

		// Return the Open Graph image with custom fonts
		return new ImageResponse(
			(
				<OGImage
					title={ogTitle}
					secondary={ogSecondary}
					bib={bib}
					locale={locale}
					size={size}
					bibEventName={bibEventName}
					bibPrice={bibPrice}
					bibEventDistance={bibEventDistance}
					bibEventLocation={bibEventLocation}
					bibSeller={bibSeller}
					bibEventDate={bibEventDate}
					bibEventParticipants={bibEventParticipants}
					discount={discount}
				/>
			),
			{
				...size,
				fonts: [
					{
						weight: 400,
						style: 'normal',
						name: 'BowlbyOneSC',
						data: bowlbyFont,
					},
					{
						weight: 400,
						style: 'normal',
						name: 'Geist',
						data: geistFont,
					},
				],
			}
		)
	} catch (error) {
		// Log error if font loading fails
		console.error('Error loading fonts:', error)
		// Fallback: return the image without custom fonts
		return new ImageResponse(
			(
				<OGImage
					title={ogTitle}
					secondary={ogSecondary}
					bib={bib}
					locale={locale}
					size={size}
					bibEventName={bibEventName}
					bibPrice={bibPrice}
					bibEventDistance={bibEventDistance}
					bibEventLocation={bibEventLocation}
					bibSeller={bibSeller}
					bibEventDate={bibEventDate}
					bibEventParticipants={bibEventParticipants}
					discount={discount}
				/>
			),
			size
		)
	}
}
