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
export default function OGImage({ title, size, secondary, protocol, host }: Readonly<OGImageProps>) {
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
				width: `${size.width}px`,
				position: 'relative',
				height: `${size.height}px`,
				flexDirection: 'column',
				display: 'flex',
				backgroundColor: 'white',
			}}
		>
			{/* Background image */}
			<img
				src={src}
				width={size.width}
				height={size.height}
				alt=""
				style={{ opacity: 0.5, objectFit: 'cover', display: 'flex' }}
			/>

			{/* Main text container */}
			<div
				style={{
					top: 108,
					position: 'absolute',
					left: 58,
					gap: 20,
					flexDirection: 'column',
					display: 'flex',
					color: '#111E3B',
				}}
			>
				{/* Main title */}
				<div
					style={{
						width: MAX_WIDTH_Main,
						whiteSpace: 'pre-wrap',
						textAlign: 'left',
						overflow: 'hidden',
						lineHeight: 1.1,
						justifyContent: 'flex-start',
						fontWeight: 'bold',
						fontSize: mainFontSize,
						fontFamily: 'BowlbyOneSC',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{/* Render highlighted text parts */}
					{titleParts.map(part => (
						<span key={part.text} style={{ color: part.color }}>
							{part.text}
						</span>
					))}
				</div>

				{/* Secondary description */}
				<div
					style={{
						width: MAX_WIDTH_Main,
						whiteSpace: 'pre-wrap',
						textAlign: 'left',
						overflow: 'hidden',
						lineHeight: 1.1,
						fontWeight: 'bold',
						fontSize: secondaryFontSize,
						fontFamily: 'Geist',
						flexWrap: 'wrap', // wrap if needed
						flexDirection: 'row', // keep spans on the same line
						display: 'flex', // required for @vercel/og
					}}
				>
					{/* Render highlighted text parts */}
					{secondaryParts.map(part => (
						<span key={part.text} style={{ color: part.color }}>
							{part.text}
						</span>
					))}
				</div>
			</div>

			{/* Footer with social links */}
			<div
				style={{
					zIndex: 10,
					top: 494,
					position: 'absolute',
					left: 58,
					flexDirection: 'column',
					display: 'flex',
					alignItems: 'flex-start',
				}}
			>
				<p style={{ fontSize: 16, fontFamily: 'Geist' }}>beswib.com</p>
				<div style={{ zIndex: 10, flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
					<div
						style={{
							width: 16,
							marginRight: 16,
							justifyContent: 'flex-start',
							height: 16,
							gap: 16,
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							id="Layer_1"
							width={32}
							height={32}
							data-name="Layer 1"
							viewBox="0 0 24 24"
						>
							<rect
								width={21}
								height={21}
								x={1.5}
								y={1.5}
								className="cls-1"
								rx={3.82}
								style={{ strokeWidth: 1.91, strokeMiterlimit: 10, stroke: '#111E3B', fill: 'none' }}
							/>
							<circle
								cx={12}
								cy={12}
								r={4.77}
								className="cls-1"
								style={{ strokeWidth: 1.91, strokeMiterlimit: 10, stroke: '#111E3B', fill: 'none' }}
							/>
							<circle
								cx={18.2}
								cy={5.8}
								r={1.43}
								style={{
									fill: '#111E3B',
								}}
							/>
						</svg>
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 14 14">
							<path
								fill="#111E3B"
								d="M8.694 9.972 7.649 7.914H6.117L8.694 13l2.574-5.086H9.736m-3.503-2.8 1.418 2.8h2.086L6.23 1l-3.5 6.914h2.085"
							></path>
						</svg>
						<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="-5.5 0 32 32">
							<path
								fill="#111E3B"
								d="M0 8.219v15.563a2.6 2.6 0 0 0 2.625 2.625h15.563c.719 0 1.406-.344 1.844-.781.469-.469.781-1.063.781-1.844V8.219a2.6 2.6 0 0 0-2.625-2.625H2.625c-.781 0-1.375.313-1.844.781C.343 6.813 0 7.5 0 8.219m2.813 2.062c0-1 .813-1.875 1.813-1.875 1.031 0 1.875.875 1.875 1.875 0 1.031-.844 1.844-1.875 1.844-1 0-1.813-.813-1.813-1.844m5.031 12.844v-9.531c0-.219.219-.406.375-.406h2.656c.375 0 .375.438.375.719.75-.75 1.719-.938 2.719-.938 2.438 0 4 1.156 4 3.719v6.438c0 .219-.188.406-.375.406h-2.75c-.219 0-.375-.219-.375-.406v-5.813c0-.969-.281-1.5-1.375-1.5-1.375 0-1.719.906-1.719 2.125v5.188c0 .219-.219.406-.438.406H8.218c-.156 0-.375-.219-.375-.406zm-4.969 0v-9.531c0-.219.219-.406.375-.406h2.719c.25 0 .406.156.406.406v9.531a.414.414 0 0 1-.406.406H3.25c-.188 0-.375-.219-.375-.406"
							></path>
						</svg>
					</div>
				</div>
			</div>

			{/* Mountain image */}
			<div
				style={{
					zIndex: 10,
					top: 50,
					position: 'absolute',
					left: 550,
					flexDirection: 'row',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<img
					src={mountain}
					width={600}
					height={450}
					alt="mountain"
					style={{ opacity: 0.75, objectFit: 'cover', display: 'flex' }}
				/>
			</div>

			{/* Beswib logo */}
			<div
				style={{
					top: 528,
					position: 'absolute',
					left: 1070,
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<img src={beswibLogoUrl} width={72} height={72} alt="Beswib" />
			</div>
		</div>
	)
}
