'use client'

import { useState, useEffect } from 'react'

import Image from 'next/image'

interface SimplePriceLanyardProps {
	price: number
	originalPrice?: number
	currency?: string
	className?: string
}

export default function SimplePriceLanyard({
	price,
	originalPrice,
	currency = 'EUR',
	className = '',
}: SimplePriceLanyardProps) {
	const [isVisible, setIsVisible] = useState(false)
	const [imageError, setImageError] = useState(false)

	// Animation d'apparition
	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 500)
		return () => clearTimeout(timer)
	}, [])

	// URL de l'image générée
	const imageUrl = `/api/lanyard/price?price=${price}&originalPrice=${originalPrice}&currency=${currency}`

	return (
		<div className={`fixed top-8 right-8 z-[9999] ${className}`}>
			{/* Container avec animation swing */}
			<div
				className={`transform transition-all duration-1000 ease-out ${
					isVisible
						? 'translate-y-0 scale-100 rotate-2 opacity-100'
						: 'translate-y-[-100px] scale-95 rotate-12 opacity-0'
				}`}
				style={{
					transformOrigin: 'top center',
					animation: isVisible ? 'swing 4s ease-in-out infinite' : undefined,
				}}
			>
				{/* Corde du lanyard */}
				<div className="mx-auto mb-4 h-20 w-1 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600 shadow-md" />

				{/* Image de prix ou fallback */}
				<div className="relative">
					{!imageError ? (
						<Image
							src={imageUrl}
							alt={`Prix: ${price} ${currency}`}
							width={200}
							height={280}
							className="mx-auto rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
							unoptimized // Pour les images générées dynamiquement
							onError={() => setImageError(true)}
						/>
					) : (
						// Fallback si l'image API ne fonctionne pas
						<div className="relative mx-auto h-[280px] w-[200px] rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-4 text-center text-white shadow-xl">
							<div className="flex h-full flex-col items-center justify-center">
								{/* Badge réduction en haut à droite */}
								{originalPrice != null && originalPrice > price && (
									<div className="absolute -top-2 -right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold">
										-{Math.round(((originalPrice - price) / originalPrice) * 100)}%
									</div>
								)}

								{/* Prix barré si discount */}
								{originalPrice != null && originalPrice > price && (
									<div className="mb-1 text-sm line-through opacity-70">
										{originalPrice.toFixed(2)} {currency}
									</div>
								)}

								{/* Prix principal */}
								<div className="mb-2 text-3xl font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
									€{price}
								</div>

								{/* Label */}
								<div className="text-sm font-semibold tracking-wide uppercase opacity-90">Race Bib</div>

								{/* Logo */}
								<div className="mt-4 rounded bg-white/20 px-3 py-1 text-xs font-bold tracking-wide uppercase">
									BESWIB
								</div>
							</div>
						</div>
					)}

					{/* Effet de brillance au survol */}
					<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity duration-300 hover:opacity-10" />
				</div>
			</div>

			{/* Ajout du CSS d'animation au head */}
			{typeof window !== 'undefined' && isVisible && (
				<style
					dangerouslySetInnerHTML={{
						__html: `
							@keyframes swing {
								0%, 100% { transform: rotate(2deg); }
								50% { transform: rotate(-2deg); }
							}
						`,
					}}
				/>
			)}
		</div>
	)
}
