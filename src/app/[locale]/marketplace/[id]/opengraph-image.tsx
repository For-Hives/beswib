// import { getTranslations } from '@/lib/getDictionary'
import * as React from 'react'

import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'

// import { type LocaleParams } from '@/lib/generateStaticParams'
import { fetchBibById } from '@/services/bib.services'

export const size = {
	width: 1200,
	height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
	const bib = await fetchBibById(params.id)
	if (!bib?.expand?.eventId) {
		return new Response('Bib not found', { status: 404 })
	}

	// Build absolute URLs using request headers (works behind proxies like Vercel).
	// Required by Satori for fetching external assets.
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

	// Absolute URL to the background PNG served from `/public/openGraph`
	const fileName = 'fond.png'
	const src = `${protocol}://${host}/openGraph/${encodeURIComponent(fileName)}`

	const event = bib.expand.eventId
	const name = event.name
	const location = event.location
	const date = new Date(event.eventDate).toLocaleDateString('fr-FR')
	const distance = `${event.distanceKm} km`
	const elevation = event.elevationGain ? `${event.elevationGain} m D+` : ''
	const validated = bib.validated

	return new ImageResponse(
		(
			<div
				style={{
					width: `${size.width}px`,
					position: 'relative',
					height: `${size.height}px`,
					flexDirection: 'column',
					display: 'flex',
					backgroundColor: '#000000',
				}}
			>
				{/* Image de fond */}
				<img
					src={src}
					width={size.width}
					height={size.height}
					alt=""
					style={{
						zIndex: 0,
						top: 0,
						position: 'absolute',
						objectFit: 'cover',
						left: 0,
					}}
				/>

				{/* Div Title */}
				<div
					style={{
						zIndex: 1,
						flexDirection: 'column',
						flex: 1,
						display: 'flex',
						color: '#fff',
					}}
				>
					{/* Title */}
					<h1
						style={{
							marginTop: 60, // 🔹 60px du haut
							marginLeft: 60, // 🔹 60px de la gauche
							marginBottom: 20,
							fontSize: 50,
						}}
					>
						{name}
					</h1>
				</div>

				{/* Div Infos */}
				<div
					style={{
						zIndex: 1,
						flexDirection: 'column',
						flex: 1,
						display: 'flex',
						color: '#fff',
					}}
				>
					{/* Infos */}
					<p style={{ marginLeft: 60, fontSize: 40 }}>{location}</p>
					<p style={{ marginLeft: 60, fontSize: 50 }}> {date}</p>
					<p style={{ marginLeft: 60, fontSize: 50 }}>
						{distance}
						{elevation ? ` — ${elevation}` : ''}
					</p>

					{/* Verified or not */}
					{/* Vérification dossard */}
					{/* Statut dossard */}
					{/* Statut dossard */}
					<div
						style={{
							width: 60,
							marginLeft: 60,
							justifyContent: 'center',
							height: 60,
							fontWeight: 'bold',
							fontSize: 24,
							display: 'flex',
							color: '#fff',
							borderRadius: '100%',
							backgroundColor: validated ? '#4CAF50' : '#F44336',
							alignItems: 'center',
						}}
					>
						{validated ? '\u2714' : '\u2716'}
					</div>
				</div>

				{/* Div Run type */}
				{/* <div style={{
			color: '#fff',
			zIndex: 1,
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
		  }}>
			<p style={{ marginLeft: 60 }}>{typeCourse}</p>
		  </div> */}

				{/* Div Price */}
				{/* <div style={{
			color: '#fff',
			zIndex: 1,
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
		  }}>
			<p style={{ marginLeft: 60 }}>
						Prix : {price}
						{originalPrice ? ` (au lieu de ${originalPrice})` : ''}
					</p>
		  </div> */}
			</div>
		),
		{ ...size }
	)
}
