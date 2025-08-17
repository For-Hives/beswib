import * as React from 'react'
import computeFontSizeAndRender from '@/components/OG/computeFontSize'

// Function to split the text into parts and apply a special color to words between **
function formatTextWithColor(text: string, highlightColor = '#4C639A') {
	const parts: { text: string; color: string }[] = []
	const regex = /\*\*(.*?)\*\*/g
	let lastIndex = 0
	let match: RegExpExecArray | null

	while ((match = regex.exec(text)) !== null) {
		// Text before the **
		if (match.index > lastIndex) {
			parts.push({ text: text.slice(lastIndex, match.index), color: '#111E3B' })
		}
		// Text inside **
		parts.push({ text: match[1], color: highlightColor })
		lastIndex = regex.lastIndex
	}

	// Text after the last match
	if (lastIndex < text.length) {
		parts.push({ text: text.slice(lastIndex), color: '#111E3B' })
	}

	return parts
}

// Props type definition for the OGImage component
type OGImageProps = {
	title?: string // Optional main title
	secondary?: string // Optional secondary description
	host: string // Hostname for assets
	protocol: string // Protocol (http/https) for assets
	size: { width: number; height: number } // OG image dimensions
}

// Main component for generating an Open Graph image
export default function OGImage({ title, secondary, host, protocol, size }: OGImageProps) {
	const MAX_WIDTH_Main = 440
	const MAX_HEIGHT_Main = 197
	const MAX_WIDTH_Secondary = 440
	const MAX_HEIGHT_Secondary = 88

	// Default text if props are missing
	const titleMain = String(title ?? 'Achetez et vendez vos **dossards** en toute sérénité.')
	const secondaryDesc = String(secondary ?? "Plateforme d'achats et de revente de **dossards** sécurisée")

	// Remove ** before calculating font size
	const plainSecondary = secondaryDesc.replace(/\*\*(.*?)\*\*/g, '$1')

	// Compute the font size for the main title based on container limits
	const { fontSize: mainFontSize } = computeFontSizeAndRender({
		text: titleMain,
		maxWidth: MAX_WIDTH_Main,
		maxHeight: MAX_HEIGHT_Main,
		initialFontSize: 36,
	})

	// Compute the font size for the secondary description
	const { fontSize: secondaryFontSize } = computeFontSizeAndRender({
		text: plainSecondary,
		maxWidth: MAX_WIDTH_Secondary,
		maxHeight: MAX_HEIGHT_Secondary,
		initialFontSize: 24,
	})

	// URLs for images used in the OG image
	const src = `${protocol}://${host}/openGraph/${encodeURIComponent('fond pattern.png')}`
	const stravaUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('strava.png')}`
	const linkedinUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('linkedin.png')}`
	const instagramUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('instagram.png')}`
	const beswibLogoUrl = `${protocol}://${host}/beswib.svg`
	const mountain = `${protocol}://${host}/openGraph/${encodeURIComponent('mountain-outlined.png')}`

	// Split text into parts with color for highlights
	const titleParts = formatTextWithColor(titleMain)
	const secondaryParts = formatTextWithColor(secondaryDesc)

	return (
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

			{/* Main text container */}
			<div
				style={{
					position: 'absolute',
					left: 58,
					top: 108,
					display: 'flex',
					gap: 20,
					flexDirection: 'column',
					color: '#111E3B',
				}}
			>
				{/* Main title */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center',
						width: MAX_WIDTH_Main,
						height: MAX_HEIGHT_Main,
						fontWeight: 'bold',
						lineHeight: 1.1,
						fontSize: mainFontSize,
						textAlign: 'left',
						whiteSpace: 'pre-wrap',
						overflow: 'hidden',
					}}
				>
					{/* Render highlighted text parts */}
					{titleParts.map((part, i) => (
						<span key={i} style={{ color: part.color }}>
							{part.text}
						</span>
					))}
				</div>

				{/* Secondary description */}
				<div
					style={{
						width: MAX_WIDTH_Main,
						height: MAX_HEIGHT_Main,
						fontWeight: 'bold',
						lineHeight: 1.1,
						fontSize: secondaryFontSize,
						textAlign: 'left',
						whiteSpace: 'pre-wrap',
						overflow: 'hidden',
						display: 'flex', // required for @vercel/og
						flexDirection: 'row', // keep spans on the same line
						flexWrap: 'wrap', // wrap if needed
					}}
				>
					{/* Render highlighted text parts */}
					{secondaryParts.map((part, i) => (
						<span key={i} style={{ color: part.color }}>
							{part.text}
						</span>
					))}
				</div>
			</div>

			{/* Footer with social links */}
			<div
				style={{
					position: 'absolute',
					left: 58,
					top: 494,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					zIndex: 10,
				}}
			>
				<p>beswib.com</p>
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', zIndex: 10 }}>
					<img src={instagramUrl} width={50} height={50} alt="Instagram" style={{ marginRight: 16 }} />
					<img src={stravaUrl} width={50} height={50} alt="Strava" style={{ marginRight: 16 }} />
					<img src={linkedinUrl} width={50} height={50} alt="LinkedIn" style={{ marginRight: 16 }} />
				</div>
			</div>

			{/* Mountain image */}
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

			{/* Beswib logo */}
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
	)
}
