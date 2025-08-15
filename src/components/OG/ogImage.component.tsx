import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { getTranslations } from '@/lib/getDictionary'
import * as React from 'react'
import { type LocaleParams } from '@/lib/generateStaticParams'
// import pageTranslations from './locales.json'

// Metadata for the Open Graph image
export const alt = 'Beswib Open Graph Image'
export const size = {
	width: 1200,
	height: 630,
}
export const contentType = 'image/png'

// Main function generating the OG image
export default async function Image({ params }: { params: Promise<LocaleParams> }) {
	// Extract the current locale from route parameters
	const { locale } = await params

	// Load translation data
	const pageLocales = pageTranslations as unknown as Record<string, Record<string, unknown>>
	const t = getTranslations(locale, pageLocales)
	const tEn = getTranslations('en', pageLocales) // Fallback to English

	// Type definition for OG-specific translations
	type OgTexts = {
		OG?: {
			Main?: string
			Secondary?: string
		}
	}

	// Retrieve request headers to detect host and protocol
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

	// Image background source
	const fileName = 'fond pattern.png'
	const src = `${protocol}://${host}/openGraph/${encodeURIComponent(fileName)}`

	// Prepare translations for OG text (main + secondary)
	const tOg = t as OgTexts
	const tOgEn = tEn as OgTexts

	// Get the main title text (fallback to English if missing)
	const titleRaw = tOg.OG?.Main ?? tOgEn.OG?.Main
	const titleLines = (titleRaw ?? 'Achetez et vendez\nvos dossards\nen toute sérénité.')
		.replace(/<br\s*\/?>/gi, '\n') // Replace HTML line breaks with newlines
		.split('\n') // Split into lines
		.map(line => line.trim()) // Remove extra spaces
		.filter(Boolean) // Remove empty lines

	// Get the secondary text (also fallback to English if missing)
	const secondaryRaw = tOg.OG?.Secondary ?? tOgEn.OG?.Secondary ?? ''
	const secondaryLines = secondaryRaw
		.replace(/<br\s*\/?>/gi, '\n')
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)

	/**
	 * Helper function to render text where **bold** parts
	 * are highlighted in a specific color.
	 * Preserves spaces exactly as in the input.
	 */
	function renderColoredBold(text: string) {
		const regex = /(\*\*[^*]+\*\*)/g // Matches **bold** patterns
		const parts = text.split(regex) // Split text into bold and normal parts

		return parts.map((part, idx) => {
			if (part.startsWith('**') && part.endsWith('**')) {
				const match = part.slice(2, -2) // Remove ** markers
				return (
					<span key={idx} style={{ color: '#94b3b4', fontWeight: 'bold', whiteSpace: 'pre' }}>
						{match}
					</span>
				)
			}
			// Non-bold part — preserve spaces
			return (
				<span key={idx} style={{ whiteSpace: 'pre' }}>
					{part}
				</span>
			)
		})
	}

	// URLs for social network logos
	const stravaUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('strava.png')}`
	const linkedinUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('linkedin.png')}`
	const instagramUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('instagram.png')}`
	const beswibLogoUrl = `${protocol}://${host}/beswib.svg`

	// Mountain outlined
	const fileNameMountain = 'mountain-outlined.png'
	const mountain = `${protocol}://${host}/openGraph/${encodeURIComponent(fileNameMountain)}`

	// Generate the Open Graph image response
	return new ImageResponse(
		(
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					position: 'relative',

					backgroundColor: 'black',
					width: `${size.width}px`,
					height: `${size.height}px`,
				}}
			>
				{/* Background image */}
				<img src={src} width={size.width} height={size.height} alt="" style={{ objectFit: 'cover', display: 'flex' }} />

				{/* Main text */}
				<div
					style={{
						position: 'absolute',
						left: 58,
						top: 108,
						display: 'flex',
						flexDirection: 'column',
						color: '#111E3B',
					}}
				>
					{/* Main title lines */}
					{titleLines.map((line, idx) => (
						<div
							key={line}
							style={{
								display: 'block',
								fontWeight: 'bold',
								lineHeight: 1.1,
								fontSize: 50,
								marginBottom: idx === titleLines.length - 1 ? 40 : 16,
							}}
						>
							{line}
						</div>
					))}

					{/* Secondary lines with custom bold coloring */}
					{secondaryLines.length > 0 &&
						secondaryLines.map(line => (
							<div
								key={line}
								style={{
									display: 'flex',
									fontSize: 24,
									fontWeight: 500,
									opacity: 0.9,
									marginTop: 2,
								}}
							>
								{renderColoredBold(line)}
							</div>
						))}
				</div>

				{/* Social media icons */}
				<div
					style={{
						position: 'absolute',
						left: 58,
						top: 494,
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						zIndex: 10,
					}}
				>
					<img src={instagramUrl} width={50} height={50} alt="Instagram" style={{ marginRight: 16 }} />
					<img src={stravaUrl} width={50} height={50} alt="Strava" style={{ marginRight: 16 }} />
					<img src={linkedinUrl} width={50} height={50} alt="LinkedIn" style={{ marginRight: 16 }} />
				</div>

				{/* Mountain outline */}
				<div
					style={{
						position: 'absolute',
						left: 702,
						top: 108,
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						zIndex: 10,
					}}
				>
					<img src={mountain} width={440} height={305} alt="mountain" style={{ objectFit: 'cover', display: 'flex' }} />
				</div>

				{/* Beswib logo in bottom-right */}
				<div
					style={{
						position: 'absolute',
						left: 1070,
						top: 528,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<img src={beswibLogoUrl} width={72} height={72} alt="Beswib" />
				</div>
			</div>
		),
		{ ...size } // Output image size
	)
}
