import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'

/**
 * Open Graph image route for localized pages.
 *
 * This route renders a 1200x630 image using Satori (via `ImageResponse`).
 * We point Satori to a static PNG hosted under `/public/openGraph` using an
 * absolute URL, because Satori fetches external resources over HTTP.
 */

/**
 * Alt text for the generated OG image.
 */
export const alt = 'Beswib Open Graph Image'
/**
 * Standard Open Graph dimensions.
 */
export const size = {
	width: 1200,
	height: 630,
}
/**
 * Output MIME type for the generated image.
 */
export const contentType = 'image/png'

export default async function Image() {
	// Read request headers to construct an absolute URL that works behind proxies
	// (e.g., Vercel/Reverse proxies). Satori needs absolute URLs for external assets.
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

	// Absolute URL to the static OG asset served from /public/openGraph
	const fileName = 'OG image beswib.png'
	const src = `${protocol}://${host}/openGraph/${encodeURIComponent(fileName)}`

	// Preload social icons as data URLs to ensure reliability in OG runtime
	async function toDataUrl(url: string, type: string = 'image/png'): Promise<string | null> {
		try {
			const res = await fetch(url)
			if (!res.ok) return null
			const buf = await res.arrayBuffer()
			const bytes = new Uint8Array(buf)
			let base64: string
			// Use Buffer in Node, fallback to btoa when available (edge)
			// @ts-ignore - Buffer may not exist in edge runtime
			if (typeof Buffer !== 'undefined') {
				// @ts-ignore
				base64 = Buffer.from(bytes).toString('base64')
			} else if (typeof btoa === 'function') {
				let binary = ''
				for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
				base64 = btoa(binary)
			} else {
				return null
			}
			return `data:${type};base64,${base64}`
		} catch {
			return null
		}
	}

	const facebookUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('white facebook.png')}`
	const instagramUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('white instagram.png')}`
	const linkedinUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('white linkedin.png')}`
	const xUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('white X.png')}`
	const beswibLogoUrl = `${protocol}://${host}/beswib.svg`

	const [facebookDataUrl, instagramDataUrl, linkedinDataUrl, xDataUrl, beswibDataUrl] = await Promise.all([
		toDataUrl(facebookUrl),
		toDataUrl(instagramUrl),
		toDataUrl(linkedinUrl),
		toDataUrl(xUrl),
		toDataUrl(beswibLogoUrl, 'image/svg+xml'),
	])

	// No custom font loading to ensure reliability in all runtimes

	return new ImageResponse(
		(
			<div
				style={{
					width: `${size.width}px`,
					height: `${size.height}px`,
					display: 'flex',
					backgroundColor: '#000000',
					position: 'relative',
				}}
			>
				{/*
				 * Satori supports HTML-like markup. We intentionally use a plain <img>
				 * with an absolute URL so that Satori can fetch the PNG. `next/image`
				 * is not supported in this rendering context.
				 */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={src} width={size.width} height={size.height} alt="" style={{ objectFit: 'cover' }} />

				{/* Text overlay container (use simple tags/styles supported by Satori) */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						flexDirection: 'column',
						padding: 0,
						color: '#ffffff',
					}}
				>
					{/* Absolute positioned text block at exact offsets */}
					<div
						style={{
							position: 'absolute',
							left: 70,
							top: 169,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								// fontFamily intentionally omitted for OG reliability
								fontSize: 50,
								fontWeight: 700,
								lineHeight: 1.1,
								marginBottom: 16,
							}}
						>
							<div style={{ marginBottom: 4 }}>Achetez et vendez</div>
							<div style={{ marginBottom: 4 }}>vos dossards</div>
							<div>en toute sérénité.</div>
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								// fontFamily intentionally omitted for OG reliability
								fontSize: 25,
								fontWeight: 500,
								opacity: 0.9,
							}}
						>
							<div style={{ marginBottom: 2 }}>Plateforme d'achat et revente</div>
							<div>de dossards sécurisée</div>
						</div>
					</div>

					{/* Bottom-left social logos at left: 70px, bottom: 77px */}
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
						<img
							src={facebookDataUrl ?? facebookUrl}
							width={30}
							height={30}
							alt="Facebook"
							style={{ marginRight: 16 }}
						/>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={instagramDataUrl ?? instagramUrl}
							width={30}
							height={30}
							alt="Instagram"
							style={{ marginRight: 16 }}
						/>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={linkedinDataUrl ?? linkedinUrl}
							width={30}
							height={30}
							alt="LinkedIn"
							style={{ marginRight: 16 }}
						/>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={xDataUrl ?? xUrl} width={30} height={30} alt="X" />
					</div>

					{/* Top-right beswib logo (30x30) */}
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
						<img src={beswibDataUrl ?? beswibLogoUrl} width={40} height={40} alt="Beswib" />
					</div>

					{/* Bottom-right domain text */}
					<div
						style={{
							position: 'absolute',
							left: 1018,
							top: 516,
							display: 'flex',
							alignItems: 'center',
							color: '#ffffff',
							fontSize: 20,
							fontWeight: 600,
						}}
					>
						beswib.com
					</div>
				</div>
			</div>
		),
		{
			...size,
		}
	)
}
