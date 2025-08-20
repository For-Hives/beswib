import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'

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
					host="localhost"
					protocol="http"
					size={size}
					bib={null}
					bibsale={null}
					locale={locale}
				/>
			),
			size
		)
	}

	// Transform bib to bibsale object
	const bibsales: BibSale[] = transformBibsToBibSales([bib])
	const bibsale = bibsales[0] ?? null

	// Build the OG title and secondary text
	const ogTitle = bib.expand.eventId.name
	const ogSecondary = `${bib.price}€ • ${bib.expand.eventId.distanceKm ?? 0} km • ${bib.expand.eventId.location}`

	// Build host and protocol for the OG image
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

	// Return the OG image with all props
	return new ImageResponse(
		(
			<OGImage
				title={ogTitle}
				secondary={ogSecondary}
				bib={bib}
				bibsale={bibsale}
				locale={locale}
				host={host}
				protocol={protocol}
				size={size}
			/>
		),
		size
	)
}
