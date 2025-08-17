import * as React from 'react'

type OGImageProps = {
	title?: string
	secondary?: string
	host: string
	protocol: string
	size: { width: number; height: number }
}

export default function OGImage({ title, secondary, host, protocol, size }: OGImageProps) {
	// Formatage des textes
	// const titleLines = (title ?? 'Achetez et vendez\nvos dossards\nen toute sérénité.')
	// 	.replace(/<br\s*\/?>/gi, '\n')
	// 	.split('\n')
	// 	.map(line => line.trim())
	// 	.filter(Boolean)

	const secondaryLines = (secondary ?? '')
		.replace(/<br\s*\/?>/gi, '\n')
		.split('\n')

		.map(line => line.trim())
		.filter(Boolean)

	function renderColoredBold(text: string) {
		const regex = /(\*\*[^*]+\*\*)/g
		const parts = text.split(regex)

		return parts.map((part, idx) => {
			if (part.startsWith('**') && part.endsWith('**')) {
				const match = part.slice(2, -2)
				return (
					<span key={idx} style={{ color: '#94b3b4', fontWeight: 'bold', whiteSpace: 'pre' }}>
						{match}
					</span>
				)
			}
			return (
				<span key={idx} style={{ whiteSpace: 'pre' }}>
					{part}
				</span>
			)
		})
	}

	// Construction des URLs
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
				{/* {titleLines.map((line, idx) => (
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
				))} */}

				<div
					style={{
						display: 'block',
						fontWeight: 'bold',
						lineHeight: 1.1,
						fontSize: 50,
					}}
				>
					{title}
				</div>

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

			{/* Réseaux sociaux */}
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

			{/* Montagne */}
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

			{/* Logo Beswib */}
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
