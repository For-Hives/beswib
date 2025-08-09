import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Beswib – Achetez et vendez vos dossards simplement et en toute sécurité'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'

export default async function Image() {
	// Load assets
	const bg = await readFile(join(process.cwd(), 'public', 'landing', 'background.jpg'))
	const bgDataUrl = `data:image/jpeg;base64,${Buffer.from(bg).toString('base64')}`
	const logoSvg = await readFile(join(process.cwd(), 'public', 'beswib.svg'), 'utf-8')
	const logoDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					position: 'relative',
					backgroundColor: '#0B0D12',
					display: 'flex',
				}}
			>
				{/* Background image (mountain), dimmed */}
				<img
					src={bgDataUrl}
					alt=""
					style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }}
				/>

				{/* Center watermark logo */}
				<img
					src={logoDataUrl}
					alt=""
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: '70%',
						height: '70%',
						opacity: 0.1,
						objectFit: 'contain',
					}}
				/>

				{/* Dark gradient overlay for readability */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: 'linear-gradient(180deg, rgba(0,0,0,0.48), rgba(0,0,0,0.68))',
					}}
				/>

				{/* Safe zone wrapper (80% centered) */}
				<div
					style={{
						position: 'relative',
						zIndex: 1,
						width: '80%',
						margin: '0 auto',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: 18, gap: 8 }}>
						{/* Top visual anchor: logo + brand text */}
						<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: 18, gap: 8 }}>
							<img src={logoDataUrl} alt="" style={{ width: 56, height: 56, opacity: 0.9 }} />
							<div style={{ fontSize: 62, fontWeight: 700, color: '#B3C8D9', letterSpacing: 0.2 }}>Contact</div>
						</div>
					</div>

					{/* Main content row */}
					<div
						style={{
							display: 'flex',
							flex: 1,
							alignItems: 'center',
							gap: 128,
						}}
					>
						{/* Left: headline + tagline */}
						<div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '55%' }}>
							<div style={{ fontSize: 48, fontWeight: 800, color: '#B3C8D9', lineHeight: 1.1 }}>
								Discutons ensemble !
							</div>
							<div style={{ fontSize: 28, color: '#A0A0AA' }}>
								Que vous soyez coureur avec une question sur la revente d'un dossard, ou organisateur intéressé pour lister votre course sur Bibswib, cette page est faite pour vous.
							</div>
						</div>

						{/* Right: stats stack incl. logo first */}
						<div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '45%' }}>
							{/* Stat 1 */}
							<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
								<div style={{ fontSize: 24, opacity: 0.9 }}>🏅</div>
								<div style={{ display: 'flex', flexDirection: 'column' }}>
									<div style={{ fontSize: 40, fontWeight: 800, color: '#6A4CFF' }}>2500+</div>
									<div style={{ fontSize: 20, color: '#A0A0AA' }}>Dossards vendus</div>
								</div>
							</div>
							{/* Stat 2 */}
							<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
								<div style={{ fontSize: 24, opacity: 0.9 }}>🏃</div>
								<div style={{ display: 'flex', flexDirection: 'column' }}>
									<div style={{ fontSize: 40, fontWeight: 800, color: '#6A4CFF' }}>150+</div>
									<div style={{ fontSize: 20, color: '#A0A0AA' }}>Courses partenaires</div>
								</div>
							</div>
							{/* Stat 3 */}
							<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
								<div style={{ fontSize: 24, opacity: 0.9 }}>⭐</div>
								<div style={{ display: 'flex', flexDirection: 'column' }}>
									<div style={{ fontSize: 40, fontWeight: 800, color: '#6A4CFF' }}>98%</div>
									<div style={{ fontSize: 20, color: '#A0A0AA' }}>Taux de satisfaction</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		),
		{ ...size, emoji: 'twemoji' }
	)
}
