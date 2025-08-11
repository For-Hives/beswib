import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'

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
						width: '100%',
						position: 'relative',
						justifyContent: 'center',
						height: '100%',
						fontFamily: 'Inter, system-ui, sans-serif',
						flexDirection: 'column',
						display: 'flex',
						color: 'white',
						borderRadius: '12px',
						border: '3px solid #2d3748',
						backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						backgroundColor: '#ffffff',
						alignItems: 'center',
					}}
				>
					{/* Badge de réduction en haut à droite */}
					{hasDiscount === true && discountPercentage != null && (
						<div
							style={{
								top: '8px',
								right: '8px',
								position: 'absolute',
								padding: '4px 8px',
								justifyContent: 'center',
								fontWeight: 'bold',
								fontSize: '12px',
								display: 'flex',
								color: 'white',
								borderRadius: '8px',
								border: '1px solid #ef4444',
								backgroundColor: '#dc2626',
								alignItems: 'center',
							}}
						>
							-{discountPercentage}%
						</div>
					)}

					{/* Prix principal */}
					<div
						style={{
							gap: '4px',
							flexDirection: 'column',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						{/* Prix barré si discount */}
						{hasDiscount === true && originalPrice != null && (
							<div
								style={{
									textDecoration: 'line-through',
									opacity: 0.7,
									justifyContent: 'center',
									fontSize: '14px',
									display: 'flex',
									color: '#666',
								}}
							>
								{parseFloat(originalPrice).toFixed(2)} {currency}
							</div>
						)}

						{/* Prix actuel */}
						<div
							style={{
								textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
								marginBottom: '4px',
								justifyContent: 'center',
								fontWeight: 'bold',
								fontSize: '32px',
								display: 'flex',
								color: '#ffffff',
							}}
						>
							€{parseFloat(price).toFixed(0)}
						</div>

						{/* Devise et étiquette */}
						<div
							style={{
								textTransform: 'uppercase',
								letterSpacing: '1px',
								justifyContent: 'center',
								fontWeight: '600',
								fontSize: '14px',
								display: 'flex',
								color: 'rgba(255, 255, 255, 0.9)',
							}}
						>
							Race Bib
						</div>
					</div>

					{/* Logo Beswib */}
					<div
						style={{
							transform: 'translateX(-50%)',
							textTransform: 'uppercase',
							position: 'absolute',
							padding: '4px 8px',
							letterSpacing: '1px',
							left: '50%',
							justifyContent: 'center',
							fontWeight: 'bold',
							fontSize: '10px',
							display: 'flex',
							color: '#ffffff',
							bottom: '12px',
							borderRadius: '4px',
							backgroundColor: 'rgba(255, 255, 255, 0.2)',
							alignItems: 'center',
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
