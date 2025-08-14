'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RadialOrbitalTimelineProps {
	readonly timelineData: TimelineItem[]
}

interface TimelineItem {
	category: string
	content: string
	date: string
	energy: number
	icon: React.ComponentType<{ size?: number }>
	id: number
	relatedIds: number[]
	status: 'completed' | 'in-progress' | 'pending'
	title: string
}

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
	// State to manage timeline item expansion
	const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})

	// Current rotation angle of the orbit (in degrees)
	const [rotationAngle, setRotationAngle] = useState<number>(0)

	// Controls whether the orbit rotates automatically or is stopped
	const [autoRotate, setAutoRotate] = useState<boolean>(true)

	// Pulse effect for items related to the active element
	const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({})

	// ID of the currently active/expanded element
	const [activeNodeId, setActiveNodeId] = useState<null | number>(null)

	// Detects if we're on mobile to adjust orbit size
	const [isMobile, setIsMobile] = useState<boolean>(false)

	// DOM element references for interactions
	const containerRef = useRef<HTMLDivElement>(null) // Main container
	const orbitRef = useRef<HTMLDivElement>(null) // Orbit container
	const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({}) // Individual node references

	// Click handler for the main container (closes all expanded items)
	const handleContainerClick = (e: React.KeyboardEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
		// If we click on the main container or orbit (not on a node)
		if (e.target === containerRef.current || e.target === orbitRef.current) {
			setExpandedItems({}) // Closes all expanded items
			setActiveNodeId(null) // Deactivates the active node
			setPulseEffect({}) // Stops all pulse effects
			setAutoRotate(true) // Restarts automatic rotation
		}
	}

	// Toggles the expansion state of a timeline item
	const toggleItem = (id: number) => {
		setExpandedItems(prev => {
			const newState = { ...prev }

			// Closes all other items (only one can be expanded at a time)
			Object.keys(newState).forEach(key => {
				if (parseInt(key) !== id) {
					newState[parseInt(key)] = false
				}
			})

			// Toggles the clicked item's state
			newState[id] = !prev[id]

			if (!prev[id]) {
				// If we're opening the item
				setActiveNodeId(id) // Sets this item as active
				setAutoRotate(false) // Stops automatic rotation

				// Gets related items and activates pulse effect
				const relatedItems = getRelatedItems(id)
				const newPulseEffect: Record<number, boolean> = {}
				relatedItems.forEach(relId => {
					newPulseEffect[relId] = true
				})
				setPulseEffect(newPulseEffect)

				// Centers the view on the selected node
				centerViewOnNode(id)
			} else {
				// If we're closing the item
				setActiveNodeId(null) // Deactivates the active node
				setAutoRotate(true) // Restarts automatic rotation
				setPulseEffect({}) // Stops all pulse effects
			}

			return newState
		})
	}

	// Hook to detect screen size and adjust orbit
	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 768) // Considers mobile below 768px
		}

		// Check on component mount
		checkIsMobile()

		// Listen to resize events
		window.addEventListener('resize', checkIsMobile)

		return () => {
			window.removeEventListener('resize', checkIsMobile)
		}
	}, [])

	// Hook to manage automatic orbit rotation
	useEffect(() => {
		let rotationTimer: NodeJS.Timeout

		if (autoRotate) {
			// Creates an interval that updates rotation angle every 50ms
			rotationTimer = setInterval(() => {
				setRotationAngle(prev => {
					// Increments angle by 0.3 degrees and keeps within [0, 360[ range
					const newAngle = (prev + 0.3) % 360
					// Rounds to 3 decimal places to avoid floating point precision errors
					return Number(newAngle.toFixed(3))
				})
			}, 50) // 50ms = 20 FPS for smooth rotation
		}

		return () => {
			clearInterval(rotationTimer) // Cleans up the interval
		}
	}, [autoRotate])

	// Centers the view on a specific node by calculating the optimal angle
	const centerViewOnNode = (nodeId: number) => {
		const nodeRef = nodeRefs.current[nodeId]
		if (!nodeRef) return

		// Finds the node index in the data array
		const nodeIndex = timelineData.findIndex(item => item.id === nodeId)
		const totalNodes = timelineData.length

		// Calculates target angle: divides circle into equal parts based on number of nodes
		const targetAngle = (nodeIndex / totalNodes) * 360

		// Adjusts angle to center the node (270° = top of circle)
		setRotationAngle(270 - targetAngle)
	}

	// Calculates the exact position of each node on the orbit
	const calculateNodePosition = (index: number, total: number) => {
		// Calculates this node's angle based on its position and current rotation
		const angle = ((index / total) * 360 + rotationAngle) % 360

		// Orbit radius (smaller on mobile to fit small screens)
		const radius = isMobile ? 160 : 200

		// Converts angle to radians for trigonometric calculations
		const radian = (angle * Math.PI) / 180

		// Calculates X and Y coordinates using trigonometry
		// X = radius × cosine(angle), Y = radius × sine(angle)
		// Rounds to 3 decimal places to avoid rendering issues
		const x = Number((radius * Math.cos(radian)).toFixed(3))
		const y = Number((radius * Math.sin(radian)).toFixed(3))

		// Calculates z-index to create 3D depth effect
		// The more the node is "in front" (positive cosine), the higher the z-index
		const zIndex = Math.round(100 + 50 * Math.cos(radian))

		// Calculates opacity to create visual depth effect
		// Nodes "in front" are more opaque, those "behind" are more transparent
		const opacity = Number(Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))).toFixed(3))

		return { zIndex, y, x, opacity, angle }
	}

	// Gets the list of IDs of items related to a given item
	const getRelatedItems = (itemId: number): number[] => {
		const currentItem = timelineData.find(item => item.id === itemId)
		return currentItem ? currentItem.relatedIds : []
	}

	// Checks if an item is related to the currently active element
	const isRelatedToActive = (itemId: number): boolean => {
		if (activeNodeId === null) return false
		const relatedItems = getRelatedItems(activeNodeId)
		return relatedItems.includes(itemId)
	}

	// Determines the CSS style of a node based on its state
	const getNodeStyling = (isExpanded: boolean, isRelated: boolean): string => {
		if (isExpanded) {
			// Style for expanded item: primary border, semi-transparent background, shadow
			return 'border-primary bg-primary/70 text-primary-foreground shadow-primary/50 scale-115 shadow-lg'
		}
		if (isRelated) {
			// Style for related items: primary border, semi-transparent background, pulse
			return 'border-primary bg-primary/70 text-primary-foreground animate-pulse'
		}
		// Default style: muted border, semi-transparent background
		return 'border-muted bg-card/90 text-muted-foreground'
	}

	return (
		<div
			aria-label="Close expanded timeline items"
			className="bg-background z-40 flex min-h-128 w-full -translate-x-2 flex-col items-center justify-center md:translate-x-0"
			onClick={handleContainerClick}
			onKeyDown={e => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					handleContainerClick(e)
				}
			}}
			ref={containerRef}
			role="button"
			tabIndex={0}
		>
			<div className="relative flex h-full w-full max-w-6xl items-center justify-center md:scale-100">
				{/* Main orbit container with 3D optimizations */}
				<div
					className="absolute flex h-full w-full items-center justify-center"
					ref={orbitRef}
					style={{
						willChange: 'transform', // Tells browser that transform property will change
						transformStyle: 'preserve-3d', // Optimizes 3D transformations
						perspective: '1000px', // Creates 3D depth effect
					}}
				>
					{/* Orbit center with logo and pulse rings */}
					<div className="z-10 flex h-20 w-20 items-center justify-center rounded-full">
						<Image alt="logo" height={100} src="/beswib.svg" width={100} />
						{/* First pulse ring (closer to center) */}
						<div className="border-primary-foreground/20 absolute h-24 w-24 animate-[ping_2s_ease-in-out_infinite] rounded-full border opacity-70"></div>
						{/* Second pulse ring (further from center) */}
						<div className="border-primary-foreground/10 absolute h-28 w-28 animate-[ping_2s_ease-in-out_infinite] rounded-full border opacity-50"></div>
					</div>

					{/* Orbit ring (reference circle) */}
					<div
						className={`border-border/30 absolute rounded-full border ${isMobile ? 'h-72 w-72' : 'h-96 w-96'}`}
					></div>

					{/* Rendering of all timeline nodes */}
					{timelineData.map((item, index) => {
						// Calculates the exact position of this node on the orbit
						const position = calculateNodePosition(index, timelineData.length)

						// Determines the state of this node
						const isExpanded = expandedItems[item.id]
						const isRelated = isRelatedToActive(item.id)
						const isPulsing = Boolean(pulseEffect[item.id])
						const Icon = item.icon

						// Dynamic node style with performance optimizations
						const nodeStyle = {
							zIndex: isExpanded ? 200 : position.zIndex, // High z-index for expanded element
							willChange: 'transform, opacity' as const, // Tells browser which properties will change
							transformStyle: 'preserve-3d' as const, // Optimizes 3D transformations
							transform: `translate3d(${position.x}px, ${position.y}px, 0px)`, // 3D position with hardware acceleration
							opacity: isExpanded ? 1 : position.opacity, // Maximum opacity for expanded element
							backfaceVisibility: 'hidden' as const, // Hides back faces to optimize performance
						}

						return (
							<div
								aria-expanded={isExpanded}
								aria-label={`Timeline item: ${item.title}. ${item.content}`}
								className="absolute cursor-pointer transition-all duration-700"
								key={item.id}
								onClick={e => {
									e.stopPropagation() // Prevents container from closing
									toggleItem(item.id)
								}}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										e.stopPropagation()
										toggleItem(item.id)
									}
								}}
								ref={el => {
									nodeRefs.current[item.id] = el // Stores DOM reference
								}}
								role="button"
								suppressHydrationWarning
								style={nodeStyle}
								tabIndex={0}
							>
								{/* Pulse effect around the node (for related items) */}
								<div
									className={`absolute -inset-1 rounded-full ${isPulsing ? 'animate-pulse duration-1000' : ''}`}
									style={{
										// Dynamic size based on item energy
										width: `${item.energy * 0.5 + 50}px`,
										top: `-${(item.energy * 0.5 + 50 - 40) / 2}px`, // Centers effect on node
										left: `-${(item.energy * 0.5 + 50 - 40) / 2}px`,
										height: `${item.energy * 0.5 + 50}px`,
										// Radial gradient for pulse effect
										background: `radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, hsl(var(--primary) / 0) 70%)`,
									}}
								></div>

								{/* Main node with icon */}
								<div
									className={`flex h-12 w-12 transform items-center justify-center rounded-full border-2 transition-all duration-300 ${getNodeStyling(
										isExpanded,
										isRelated
									)}`}
								>
									<Icon size={20} />
								</div>

								{/* Node title (always visible) */}
								<div
									className={`absolute top-14 text-center text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ${isExpanded ? 'text-foreground scale-125' : 'text-muted-foreground'}`}
								>
									{item.title}
								</div>

								{/* Expansion card with details (only visible if expanded) */}
								{isExpanded && (
									<Card className="border-primary/30 bg-card/95 shadow-primary/20 absolute top-20 left-1/2 w-72 -translate-x-1/2 overflow-visible shadow-xl backdrop-blur-lg">
										{/* Connection line between node and card */}
										<div className="bg-primary/50 absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2"></div>
										<CardHeader className="pb-2">
											<div className="flex items-center justify-between">
												<CardTitle className="text-foreground mt-2 text-sm">{item.title}</CardTitle>
												<span className="text-muted-foreground font-mono text-xs">{item.date}</span>
											</div>
										</CardHeader>
										<CardContent className="text-muted-foreground text-xs">
											<p>{item.content}</p>
										</CardContent>
									</Card>
								)}
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
