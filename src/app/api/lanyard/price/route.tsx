import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const price = searchParams.get('price') ?? '0'
		const originalPrice = searchParams.get('originalPrice')
		const currency = searchParams.get('currency') ?? 'EUR'

		// Calculer la réduction si applicable
		const hasDiscount = Boolean(
			originalPrice != null && originalPrice.trim() !== '' && parseFloat(originalPrice) > parseFloat(price)
		)
		const discountPercentage =
			hasDiscount && originalPrice != null
				? Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)
				: null

		return new ImageResponse(
			(
				<div
					style={{
						height: '100%',
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#ffffff',
						backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						color: 'white',
						fontFamily: 'Inter, system-ui, sans-serif',
						borderRadius: '12px',
						position: 'relative',
						border: '3px solid #2d3748',
					}}
				>
					{/* Badge de réduction en haut à droite */}
					{hasDiscount === true && discountPercentage != null && (
						<div
							style={{
								position: 'absolute',
								top: '8px',
								right: '8px',
								backgroundColor: '#dc2626',
								color: 'white',
								borderRadius: '8px',
								padding: '4px 8px',
								fontSize: '12px',
								fontWeight: 'bold',
								border: '1px solid #ef4444',
							}}
						>
							-{discountPercentage}%
						</div>
					)}

					{/* Prix principal */}
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '4px',
						}}
					>
						{/* Prix barré si discount */}
						{hasDiscount === true && originalPrice != null && (
							<div
								style={{
									fontSize: '14px',
									color: '#666',
									textDecoration: 'line-through',
									opacity: 0.7,
								}}
							>
								{parseFloat(originalPrice).toFixed(2)} {currency}
							</div>
						)}

						{/* Prix actuel */}
						<div
							style={{
								fontSize: '32px',
								fontWeight: 'bold',
								color: '#ffffff',
								textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
								marginBottom: '4px',
							}}
						>
							€{parseFloat(price).toFixed(0)}
						</div>

						{/* Devise et étiquette */}
						<div
							style={{
								fontSize: '14px',
								color: 'rgba(255, 255, 255, 0.9)',
								fontWeight: '600',
								textTransform: 'uppercase',
								letterSpacing: '1px',
							}}
						>
							Race Bib
						</div>
					</div>

					{/* Logo Beswib */}
					<div
						style={{
							position: 'absolute',
							bottom: '12px',
							left: '50%',
							transform: 'translateX(-50%)',
							backgroundColor: 'rgba(255, 255, 255, 0.2)',
							color: '#ffffff',
							borderRadius: '4px',
							padding: '4px 8px',
							fontSize: '10px',
							fontWeight: 'bold',
							textTransform: 'uppercase',
							letterSpacing: '1px',
						}}
					>
						BESWIB
					</div>
				</div>
			),
			{
				width: 200,
				height: 280,
				headers: {
					'Cache-Control': 'public, max-age=3600', // Cache pendant 1 heure
				},
			}
		)
	} catch (e) {
		console.error('Erreur génération image lanyard:', e)
		return new Response(`Erreur lors de la génération de l'image`, {
			status: 500,
		})
	}
}
