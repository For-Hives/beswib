import * as React from 'react'
import computeFontSizeAndRender from '@/components/OG/computeFontSize' // Function to dynamically calculate font size to fit text

// Props type definition for the OGImage component
type OGImageProps = {
	title?: string // Optional main title text
	secondary?: string // Optional secondary text
	host: string // Hostname for building absolute URLs for assets
	protocol: string // Protocol for URLs (http/https)
	size: { width: number; height: number } // Dimensions of the OpenGraph image
}

export default function OGImage({ title, secondary, host, protocol, size }: OGImageProps) {
	// Maximum dimensions for the main and secondary text blocks
	const MAX_WIDTH_Main = 440
	const MAX_HEIGHT_Main = 197
	const MAX_WIDTH_Secondary = 440
	const MAX_HEIGHT_Secondary = 88

	// Default text if no title or secondary text is provided
	const titleMain = String(title ?? 'Achetez et vendez vos dossards en toute sérénité.')
	const Secondarydesc = String(secondary ?? "Plateforme d'achats et de revente de dossards sécurisée")

	// Calculate font size for the main title dynamically
	const { fontSize: mainFontSize } = computeFontSizeAndRender({
		text: titleMain,
		maxWidth: MAX_WIDTH_Main,
		maxHeight: MAX_HEIGHT_Main,
		initialFontSize: 36,
	})

	// Calculate font size for the secondary text dynamically
	const { fontSize: secondaryFontSize } = computeFontSizeAndRender({
		text: Secondarydesc,
		maxWidth: MAX_WIDTH_Secondary,
		maxHeight: MAX_HEIGHT_Secondary,
		initialFontSize: 24,
	})

	// Construct absolute URLs for images/assets
	const src = `${protocol}://${host}/openGraph/${encodeURIComponent('fond pattern.png')}`
	const stravaUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('strava.png')}`
	const linkedinUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('linkedin.png')}`
	const instagramUrl = `${protocol}://${host}/openGraph/logos/${encodeURIComponent('instagram.png')}`
	const beswibLogoUrl = `${protocol}://${host}/beswib.svg`
	const mountain = `${protocol}://${host}/openGraph/${encodeURIComponent('mountain-outlined.png')}`

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
					flexDirection: 'column',
					color: '#111E3B', // Dark blue color for text
				}}
			>
				{/* Main title with dynamic font size */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
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
					{titleMain}
				</div>

				{/* Secondary text with dynamic font size */}
				<div
					style={{
						width: MAX_WIDTH_Secondary,
						height: MAX_HEIGHT_Secondary,
						textAlign: 'left',
						whiteSpace: 'pre-wrap',
						overflow: 'hidden',
						fontSize: secondaryFontSize,
						display: 'flex', // Keeps text vertically centered if needed
					}}
				>
					{Secondarydesc}
				</div>
			</div>

			{/* Social media links and website */}
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
				<div
					style={{
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
			</div>

			{/* Decorative mountain image on the right */}
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

			{/* Beswib logo in bottom-right corner */}
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
