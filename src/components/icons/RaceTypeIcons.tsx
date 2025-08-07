import React from 'react'
import { cn } from '@/lib/utils'

interface IconProps {
	className?: string
	size?: number
}

// Triathlon Icon - Combines swimming, cycling, running symbols
export const TriathlonIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={cn('inline-block', className)}
	>
		{/* Swimming waves */}
		<path d="M2 12c1.5-1 3.5-1 5 0s3.5 1 5 0 3.5-1 5 0 3.5 1 5 0" />
		<path d="M2 8c1.5-1 3.5-1 5 0s3.5 1 5 0 3.5-1 5 0 3.5 1 5 0" />

		{/* Bike wheel */}
		<circle cx="12" cy="17" r="3" />
		<path d="M12 14v6" />
		<path d="M9.5 16.5l5-5" />

		{/* Running figure */}
		<circle cx="18" cy="6" r="2" />
		<path d="M16 10l2-2 2 2" />
		<path d="M18 8v4" />
	</svg>
)

// Trail Icon - Mountain path with runner
export const TrailIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={cn('inline-block', className)}
	>
		{/* Mountains */}
		<path d="M3 20l4-8 4 4 6-12 4 8H3z" />
		<path d="M7 16l2-4 3 3 4-8" />

		{/* Trail path */}
		<path d="M2 22c4-2 8-2 12 0s8 2 12 0" strokeDasharray="2 2" />

		{/* Runner figure */}
		<circle cx="15" cy="8" r="1.5" />
		<path d="M14 10l1-1 1 1" />
		<path d="M15 9v2" />
	</svg>
)

// Route Icon - Road with distance markers
export const RouteIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={cn('inline-block', className)}
	>
		{/* Road/path */}
		<path d="M3 12h18" />
		<path d="M3 8h18" />
		<path d="M3 16h18" />

		{/* Distance markers */}
		<line x1="6" y1="6" x2="6" y2="18" />
		<line x1="12" y1="6" x2="12" y2="18" />
		<line x1="18" y1="6" x2="18" y2="18" />

		{/* Runner */}
		<circle cx="9" cy="12" r="1.5" />
		<path d="M7.5 13.5l1.5-1.5 1.5 1.5" />
		<path d="M8 10l2 2" />
	</svg>
)

// Ultra Icon - Endurance symbol with infinity and mountains
export const UltraIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={cn('inline-block', className)}
	>
		{/* Infinity symbol for endurance */}
		<path d="M12 12c-2-2.67-4-4-6-4s-4 1.33-4 4 2 4 4 4c2 0 4-1.33 6-4" />
		<path d="M12 12c2 2.67 4 4 6 4s4-1.33 4-4-2-4-4-4c-2 0-4 1.33-6 4" />

		{/* Mountain peaks for ultra terrain */}
		<path d="M2 20l3-6 2 2 3-6 2 2 3-6 2 2 3-6 2 2" />

		{/* Endurance path */}
		<path d="M1 22c3-1 6-1 9 0s6 1 9 0" strokeDasharray="1 1" opacity="0.7" />
	</svg>
)

// All types icon for the "all" filter
export const AllTypesIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={cn('inline-block', className)}
	>
		{/* Grid/all symbol */}
		<rect x="3" y="3" width="7" height="7" rx="1" />
		<rect x="14" y="3" width="7" height="7" rx="1" />
		<rect x="3" y="14" width="7" height="7" rx="1" />
		<rect x="14" y="14" width="7" height="7" rx="1" />

		{/* Center connection */}
		<path d="M10.5 6.5h3" />
		<path d="M6.5 10.5v3" />
		<path d="M10.5 17.5h3" />
		<path d="M17.5 10.5v3" />
	</svg>
)

// Export all race type icons
export const raceTypeIcons = {
	triathlon: TriathlonIcon,
	trail: TrailIcon,
	route: RouteIcon,
	ultra: UltraIcon,
	all: AllTypesIcon,
} as const

export type RaceType = keyof typeof raceTypeIcons
