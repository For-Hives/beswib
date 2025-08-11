/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

import React, { useRef, useState } from 'react'

interface Position {
	x: number
	y: number
}

interface SpotlightCardProps extends React.PropsWithChildren {
	className?: string
	/**
	 * CSS color for the spotlight radial gradient. Defaults to theme variable
	 * `--interactive-bubble` which is tuned for both light and dark.
	 */
	spotlightColor?: string
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
	spotlightColor = 'var(--interactive-bubble)',
	className = '',
	children,
}) => {
	const divRef = useRef<HTMLDivElement>(null)
	const [position, setPosition] = useState<Position>({ y: 0, x: 0 })
	const [opacity, setOpacity] = useState<number>(0)

	const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
		if (!divRef.current) return

		const rect = divRef.current.getBoundingClientRect()
		setPosition({ y: e.clientY - rect.top, x: e.clientX - rect.left })
	}

	const handleMouseEnter = () => {
		setOpacity(0.6)
	}

	const handleMouseLeave = () => {
		setOpacity(0)
	}

	return (
		<div
			ref={divRef}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={`border-border bg-card relative overflow-hidden rounded-3xl border p-8 ${className}`}
			aria-label="Interactive card with spotlight effect"
		>
			<div
				className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
				style={{
					opacity,
					background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
				}}
			/>
			{children}
		</div>
	)
}

export default SpotlightCard
