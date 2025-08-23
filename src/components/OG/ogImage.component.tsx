import * as React from 'react'

import computeFontSizeAndRender from '@/components/OG/computeFontSize'

import BeswibLogo from './icons/BeswibLogo'
import Pattern from './icons/Pattern'

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
	const mountainUrl = `${protocol}://${host}/openGraph/${encodeURIComponent('mountain-outlined.png')}`

	// Split text into parts with color for highlights
	const titleParts = formatTextWithColor(titleMain)
	const secondaryParts = formatTextWithColor(secondaryDesc)

	return (
		<div
			style={{
				width: `${size.width}px`,
				position: 'relative',
				justifyContent: 'center',
				height: `${size.height}px`,
				display: 'flex',
				backgroundColor: 'white',
				alignItems: 'center',
			}}
		>
			{/* Background pattern */}
			<div
				style={{
					width: '100%',
					top: 0,
					position: 'absolute',
					opacity: 0.15,
					left: 0,
					justifyContent: 'center',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Pattern />
			</div>

			<div
				style={{
					width: '100%',
					position: 'relative',
					padding: '64px',
					justifyContent: 'space-between',
					height: '100%',
					flexDirection: 'row',
					display: 'flex',
				}}
			>
				{/* Left Column - Content */}
				<div
					style={{
						zIndex: 1,
						width: '40%',
						justifyContent: 'space-between',
						height: '100%',
						flexDirection: 'column',
						display: 'flex',
						color: '#111E3B',
					}}
				>
					{/* Top Block - Title and Description */}
					<div
						style={{
							gap: '24px',
							flexDirection: 'column',
							display: 'flex',
						}}
					>
						{/* Main title */}
						<div
							style={{
								whiteSpace: 'pre-wrap',
								textAlign: 'left',
								lineHeight: 1.1,
								fontWeight: 'bold',
								fontSize: mainFontSize,
								fontFamily: 'BowlbyOneSC',
								flexWrap: 'wrap',
								display: 'flex',
							}}
						>
							{titleParts.map((part, index) => (
								<span key={`${part.text}-${index}`} style={{ color: part.color }}>
									{part.text}
								</span>
							))}
						</div>

						{/* Secondary description */}
						<div
							style={{
								whiteSpace: 'pre-wrap',
								textAlign: 'left',
								lineHeight: 1.1,
								fontWeight: 'bold',
								fontSize: secondaryFontSize,
								fontFamily: 'Geist',
								flexWrap: 'wrap',
								display: 'flex',
							}}
						>
							{secondaryParts.map((part, index) => (
								<span key={`${part.text}-${index}`} style={{ color: part.color }}>
									{part.text}
								</span>
							))}
						</div>
					</div>

					{/* Bottom Block - Links and Social Icons */}
					<div
						style={{
							gap: '16px',
							flexDirection: 'column',
							display: 'flex',
						}}
					>
						<p style={{ margin: 0, fontSize: 16, fontFamily: 'Geist' }}>beswib.com</p>
						<div
							style={{
								gap: '16px',
								flexDirection: 'row',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{/* Instagram Icon */}
							<svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24">
								<rect
									width={21}
									height={21}
									x={1.5}
									y={1.5}
									rx={3.82}
									style={{ strokeWidth: 1.91, strokeMiterlimit: 10, stroke: '#111E3B', fill: 'none' }}
								/>
								<circle
									cx={12}
									cy={12}
									r={4.77}
									style={{ strokeWidth: 1.91, strokeMiterlimit: 10, stroke: '#111E3B', fill: 'none' }}
								/>
								<circle cx={18.2} cy={5.8} r={1.43} style={{ fill: '#111E3B' }} />
							</svg>

							{/* Strava Icon */}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 14 14"
								style={{
									marginLeft: '4px',
								}}
							>
								<path
									fill="#111E3B"
									d="M8.694 9.972 7.649 7.914H6.117L8.694 13l2.574-5.086H9.736m-3.503-2.8 1.418 2.8h2.086L6.23 1l-3.5 6.914h2.085"
								/>
							</svg>

							{/* LinkedIn Icon */}
							<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="-5.5 0 32 32">
								<path
									fill="#111E3B"
									d="M0 8.219v15.563a2.6 2.6 0 0 0 2.625 2.625h15.563c.719 0 1.406-.344 1.844-.781.469-.469.781-1.063.781-1.844V8.219a2.6 2.6 0 0 0-2.625-2.625H2.625c-.781 0-1.375.313-1.844.781C.343 6.813 0 7.5 0 8.219m2.813 2.062c0-1 .813-1.875 1.813-1.875 1.031 0 1.875.875 1.875 1.875 0 1.031-.844 1.844-1.875 1.844-1 0-1.813-.813-1.813-1.844m5.031 12.844v-9.531c0-.219.219-.406.375-.406h2.656c.375 0 .375.438.375.719.75-.75 1.719-.938 2.719-.938 2.438 0 4 1.156 4 3.719v6.438c0 .219-.188.406-.375.406h-2.75c-.219 0-.375-.219-.375-.406v-5.813c0-.969-.281-1.5-1.375-1.5-1.375 0-1.719.906-1.719 2.125v5.188c0 .219-.219.406-.438.406H8.218c-.156 0-.375-.219-.375-.406zm-4.969 0v-9.531c0-.219.219-.406.375-.406h2.719c.25 0 .406.156.406.406v9.531a.414.414 0 0 1-.406.406H3.25c-.188 0-.375-.219-.375-.406"
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* Right Column - Images */}
				<div
					style={{
						width: '60%',
						position: 'relative',
						justifyContent: 'center',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{/* Mountain image */}
					<img
						src={mountainUrl}
						width="100%"
						height="100%"
						alt="mountain"
						style={{
							padding: '32px',
							opacity: 0.9,
							objectFit: 'cover',
							maxWidth: '100%',
							maxHeight: '100%',
							marginBottom: '100px',
						}}
					/>

					{/* Beswib logo positioned at bottom right of right column */}
					<div
						style={{
							right: 0,
							position: 'absolute',
							display: 'flex',
							bottom: 0,
							alignItems: 'center',
						}}
					>
						<BeswibLogo />
					</div>
				</div>
			</div>
		</div>
	)
}
