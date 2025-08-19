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

// 👇 Config OG
export const alt = 'Beswib Open Graph Image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
	return generateLocaleParams()
}

export default async function Image({ params }: { params: Promise<LocaleParams & { id?: string; tkn?: string }> }) {
	const { tkn, locale, id } = await params

	// 📌 Récupération du dossard
	let bib: (Bib & { expand?: { eventId: Event; sellerUserId: User } }) | null = null
	if (id !== undefined && id !== null) {
		if (tkn !== undefined) {
			bib = await fetchPrivateBibByToken(id, tkn)
		} else {
			bib = await fetchBibById(id)
		}
	}

	// 📌 Fallback si pas de bib trouvé
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

	const bibsales: BibSale[] = transformBibsToBibSales([bib])
	const bibsale = bibsales[0] ?? null

	// 📌 Construction du titre / sous-titre à afficher
	const ogTitle = bib.expand.eventId.name
	const ogSecondary = `${bib.price}€ • ${bib.expand.eventId.distanceKm ?? 0} km • ${bib.expand.eventId.location}`

	// 📌 Host & protocole pour l'OG
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

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
