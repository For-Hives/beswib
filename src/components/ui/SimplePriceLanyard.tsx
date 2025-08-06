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
	const [isVisible, setIsVisible] = useState(true)

	// Animation d'apparition
	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 500)
		return () => clearTimeout(timer)
	}, [])

	// URL de l'image générée
	const imageUrl = `/api/lanyard/price?price=${price}&originalPrice=${originalPrice}&currency=${currency}`

	return (
		<div className={`relative z-50 ${className}`}>
			{/* Container avec animation swing */}
			<div
				className={`transform transition-all duration-1000 ease-out ${
					isVisible
						? 'translate-y-0 scale-100 rotate-2 opacity-100'
						: 'translate-y-[-50px] scale-95 rotate-12 opacity-0'
				}`}
				style={{
					transformOrigin: 'top center',
					animation: isVisible ? 'gentle-swing 4s ease-in-out infinite' : undefined,
				}}
			>
				{/* Corde du lanyard */}
				<div className="mx-auto mb-4 h-16 w-1 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600 shadow-md" />

				{/* Image de prix générée dynamiquement */}
				<div className="relative">
					<Image
						src={imageUrl}
						alt={`Prix: ${price} ${currency}`}
						width={200}
						height={280}
						className="mx-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
						unoptimized // Pour les images générées dynamiquement
					/>

					{/* Effet de brillance au survol */}
					<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity duration-300 hover:opacity-10" />
				</div>
			</div>

			{/* CSS pour l'animation de balancement */}
			<style jsx>{`
				@keyframes gentle-swing {
					0%,
					100% {
						transform: rotate(2deg);
					}
					50% {
						transform: rotate(-2deg);
					}
				}
			`}</style>
		</div>
	)
}
