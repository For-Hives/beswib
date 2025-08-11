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
	spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
	spotlightColor = 'rgba(255, 255, 255, 0.25)',
	className = '',
	children,
}) => {
	const divRef = useRef<HTMLDivElement>(null)
	const [isFocused, setIsFocused] = useState<boolean>(false)
	const [position, setPosition] = useState<Position>({ y: 0, x: 0 })
	const [opacity, setOpacity] = useState<number>(0)

	const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
		if (!divRef.current || isFocused) return

		const rect = divRef.current.getBoundingClientRect()
		setPosition({ y: e.clientY - rect.top, x: e.clientX - rect.left })
	}

	const handleFocus = () => {
		setIsFocused(true)
		setOpacity(0.6)
	}

	const handleBlur = () => {
		setIsFocused(false)
		setOpacity(0)
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
			onFocus={handleFocus}
			onBlur={handleBlur}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={`relative overflow-hidden rounded-3xl border border-neutral-400 bg-neutral-200 p-8 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
			tabIndex={0}
			role="button"
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
