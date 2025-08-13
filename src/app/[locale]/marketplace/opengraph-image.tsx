import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { getTranslations } from '@/lib/getDictionary'
import * as React from 'react'
import { type LocaleParams } from '@/lib/generateStaticParams'
import pageTranslations from './locales.json'

/**
 * Open Graph image route for localized pages.
 *
 * Renders a 1200x630 image using Next.js `ImageResponse` (Satori).
 * Satori fetches external assets over HTTP, so we must reference images/fonts
 * with absolute URLs. The background PNG lives in `/public/openGraph`.
 */

/**
 * Alt text for the generated OG image.
 */
export const alt = 'Beswib Open Graph Image'
/**
 * Standard Open Graph dimensions.
 *
 */
export const size = {
	width: 1200,
	height: 630,
}
/**
 * Output MIME type for the generated image.
 */
export const contentType = 'image/png'

/**
 * Generates the Open Graph image.
 *
 * - Derives protocol/host from request headers to build absolute URLs (works behind proxies)
 * - Attempts to load Bodoni Moda and Inter from Google Fonts CDN; falls back to system fonts if unavailable
 * - Composes the image with background, titles, social icons, and brand logo
 * - Returns a PNG response sized to standard OG dimensions
 */
export default async function Image({ params }: { params: Promise<LocaleParams> }) {
	// Resolve locale from the dynamic segment
	const { locale } = await params
	const pageLocales = pageTranslations as unknown as Record<string, Record<string, string>>
	const t = getTranslations(locale, pageLocales)
	const tEn = getTranslations('en', pageLocales)

	// Narrow the translation shape we need for this OG image
	type OgTexts = {
		title?: string
		descriptionOG?: string
	}

	// Build absolute URLs using request headers (works behind proxies like Vercel).
	// Required by Satori for fetching external assets.
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

	// Absolute URL to the background PNG served from `/public/openGraph`
	const fileName = 'OG image beswib.png'
	const src = `${protocol}://${host}/openGraph/${encodeURIComponent(fileName)}`

	// We no longer embed custom fonts here; use system defaults for simplicity

	// Titles and secondary text from translations (OG namespace) with English fallback per key
	const tOg = t as OgTexts
	const tOgEn = tEn as OgTexts

	const titleRaw = tOg.title ?? tOgEn.title ?? 'Marketplace'
	const titleLines = titleRaw
		.replace(/<br\s*\/?>/gi, '\n')
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)

	const secondaryRaw = tOg.descriptionOG ?? tOgEn.descriptionOG ?? ''
	const secondaryLines = secondaryRaw
		.replace(/<br\s*\/?>/gi, '\n')
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)

	// Render helper: color words wrapped in **...** with #94b3b4 while keeping bold
	function renderColoredBold(text: string) {
		const parts = text.split(/(\*\*.+?\*\*)/g)
		const elements: React.ReactNode[] = []
		let cursor = 0
		for (const part of parts) {
			const key = `${part}-${cursor}`
			if (part.startsWith('**') && part.endsWith('**')) {
				const inner = part.slice(2, -2)
				elements.push(
					<span key={key} style={{ color: '#94b3b4', fontWeight: 700, whiteSpace: 'pre' }}>
						{inner}
					</span>
				)
			} else {
				elements.push(
					<span key={key} style={{ whiteSpace: 'pre' }}>
						{part}
					</span>
				)
			}
			cursor += part.length
		}
		return elements
	}

	// External icon URLs (served from `/public/openGraph/logos` and `/public`)
	const facebookUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('white facebook.png')}`
	const instagramUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('white instagram.png')}`
	const linkedinUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('white linkedin.png')}`
	const xUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('white X.png')}`
	const beswibLogoUrl = `${protocol}://${host}/beswib.svg`

	return new ImageResponse(
		(
			<div
				style={{
					width: `${size.width}px`,
					height: `${size.height}px`,
					display: 'flex',
					flexDirection: 'column',
					backgroundColor: '#000000',
					position: 'relative',
				}}
			>
				{/* Background image */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={src} width={size.width} height={size.height} alt="" style={{ objectFit: 'cover' }} />

				{/* Text overlay container */}
				<div
					style={{
						position: 'absolute',
						left: 70,
						top: 169,
						display: 'flex',
						flexDirection: 'column',
						color: '#ffffff',
					}}
				>
					{/* Localized main title (multiple lines) */}
					{titleLines.map((line, idx) => (
						<div
							key={line}
							style={{
								display: 'flex',
								fontSize: 50,
								fontWeight: 700,
								lineHeight: 1.1,
								marginBottom: idx === titleLines.length - 1 ? 40 : 16,
							}}
						>
							{line}
						</div>
					))}

					{/* Localized secondary text (one or more lines) */}
					{secondaryLines.length > 0
						? secondaryLines.map(line => (
								<div
									key={`secondary-${line}`}
									style={{ display: 'flex', fontSize: 25, fontWeight: 500, opacity: 0.9, marginTop: 2 }}
								>
									{renderColoredBold(line)}
								</div>
							))
						: null}
				</div>

				{/* Bottom-left social logos */}
				<div
					style={{
						position: 'absolute',
						left: 70,
						top: 516,
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						zIndex: 10,
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={facebookUrl} width={30} height={30} alt="Facebook" style={{ marginRight: 16 }} />
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={instagramUrl} width={30} height={30} alt="Instagram" style={{ marginRight: 16 }} />
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={linkedinUrl} width={30} height={30} alt="LinkedIn" style={{ marginRight: 16 }} />
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={xUrl} width={30} height={30} alt="X" />
				</div>

				{/* Top-right Beswib logo */}
				<div
					style={{
						position: 'absolute',
						left: 1089,
						top: 57,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={beswibLogoUrl} width={40} height={40} alt="Beswib" />
				</div>

				{/* Bottom-right domain text */}
				<div
					style={{
						position: 'absolute',
						left: 1018,
						top: 516,
						color: '#ffffff',
						fontSize: 20,
						fontWeight: 600,
					}}
				>
					beswib.com
				</div>
			</div>
		),
		{ ...size }
	)
}
