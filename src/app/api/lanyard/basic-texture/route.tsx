import { ImageResponse } from 'next/og'

export function GET() {
	try {
		return new ImageResponse(
			(
				<div
					style={{
						width: '256px',
						height: '32px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#333',
						backgroundImage: 'repeating-linear-gradient(90deg, #444 0px, #444 8px, #333 8px, #333 16px)',
					}}
				>
					<div
						style={{
							color: '#fff',
							fontSize: '12px',
							fontWeight: 'bold',
							textShadow: '0 1px 2px rgba(0,0,0,0.5)',
						}}
					>
						BESWIB
					</div>
				</div>
			),
			{
				width: 256,
				height: 32,
				headers: {
					'Cache-Control': 'public, max-age=86400', // Cache pendant 24 heures
				},
			}
		)
	} catch (e) {
		console.error('Erreur génération texture lanyard de base:', e)
		return new Response('Erreur texture', { status: 500 })
	}
}
