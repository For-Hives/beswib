import { ImageResponse } from 'next/og'

export function GET() {
	try {
		return new ImageResponse(
			(
				<div
					style={{
						width: '256px',
						justifyContent: 'center',
						height: '32px',
						display: 'flex',
						backgroundImage: 'repeating-linear-gradient(90deg, #444 0px, #444 8px, #333 8px, #333 16px)',
						backgroundColor: '#333',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							textShadow: '0 1px 2px rgba(0,0,0,0.5)',
							fontWeight: 'bold',
							fontSize: '12px',
							color: '#fff',
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
