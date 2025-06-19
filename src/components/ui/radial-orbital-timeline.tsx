'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RadialOrbitalTimelineProps {
	timelineData: TimelineItem[]
}

interface TimelineItem {
	category: string
	content: string
	date: string
	energy: number
	icon: React.ElementType
	id: number
	relatedIds: number[]
	status: 'completed' | 'in-progress' | 'pending'
	title: string
}

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
	const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})
	const [rotationAngle, setRotationAngle] = useState<number>(0)
	const [autoRotate, setAutoRotate] = useState<boolean>(true)
	const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({})
	const [activeNodeId, setActiveNodeId] = useState<null | number>(null)
	const [isMobile, setIsMobile] = useState<boolean>(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const orbitRef = useRef<HTMLDivElement>(null)
	const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({})

	const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === containerRef.current || e.target === orbitRef.current) {
			setExpandedItems({})
			setActiveNodeId(null)
			setPulseEffect({})
			setAutoRotate(true)
		}
	}

	const toggleItem = (id: number) => {
		setExpandedItems(prev => {
			const newState = { ...prev }
			Object.keys(newState).forEach(key => {
				if (parseInt(key) !== id) {
					newState[parseInt(key)] = false
				}
			})

			newState[id] = !prev[id]

			if (!prev[id]) {
				setActiveNodeId(id)
				setAutoRotate(false)

				const relatedItems = getRelatedItems(id)
				const newPulseEffect: Record<number, boolean> = {}
				relatedItems.forEach(relId => {
					newPulseEffect[relId] = true
				})
				setPulseEffect(newPulseEffect)

				centerViewOnNode(id)
			} else {
				setActiveNodeId(null)
				setAutoRotate(true)
				setPulseEffect({})
			}

			return newState
		})
	}

	// Hook to detect screen size
	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}

		// Check on mount
		checkIsMobile()

		// Listen to resize events
		window.addEventListener('resize', checkIsMobile)

		return () => {
			window.removeEventListener('resize', checkIsMobile)
		}
	}, [])

	useEffect(() => {
		let rotationTimer: NodeJS.Timeout

		if (autoRotate) {
			rotationTimer = setInterval(() => {
				setRotationAngle(prev => {
					const newAngle = (prev + 0.3) % 360
					return Number(newAngle.toFixed(3))
				})
			}, 50)
		}

		return () => {
			clearInterval(rotationTimer)
		}
	}, [autoRotate])

	const centerViewOnNode = (nodeId: number) => {
		const nodeRef = nodeRefs.current[nodeId]
		if (!nodeRef) return

		const nodeIndex = timelineData.findIndex(item => item.id === nodeId)
		const totalNodes = timelineData.length
		const targetAngle = (nodeIndex / totalNodes) * 360

		setRotationAngle(270 - targetAngle)
	}

	const calculateNodePosition = (index: number, total: number) => {
		const angle = ((index / total) * 360 + rotationAngle) % 360
		const radius = isMobile ? 160 : 200
		const radian = (angle * Math.PI) / 180

		const x = radius * Math.cos(radian)
		const y = radius * Math.sin(radian)

		const zIndex = Math.round(100 + 50 * Math.cos(radian))
		const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)))

		return { zIndex, y, x, opacity, angle }
	}

	const getRelatedItems = (itemId: number): number[] => {
		const currentItem = timelineData.find(item => item.id === itemId)
		return currentItem ? currentItem.relatedIds : []
	}

	const isRelatedToActive = (itemId: number): boolean => {
		if (activeNodeId === null) return false
		const relatedItems = getRelatedItems(activeNodeId)
		return relatedItems.includes(itemId)
	}

	return (
		<div
			className="bg-background z-40 flex min-h-128 w-full flex-col items-center justify-center"
			onClick={handleContainerClick}
			ref={containerRef}
		>
			<div className="relative flex h-full w-full max-w-6xl items-center justify-center md:scale-100">
				<div
					className="absolute flex h-full w-full items-center justify-center"
					ref={orbitRef}
					style={{
						perspective: '1000px',
					}}
				>
					{/* Orbital Center */}
					<div className="z-10 flex h-20 w-20 items-center justify-center rounded-full">
						<Image alt="logo" height={100} src="/beswib.svg" width={100} />
						<div className="border-primary-foreground/20 absolute h-24 w-24 animate-[ping_2s_ease-in-out_infinite] rounded-full border opacity-70"></div>
						<div className="border-primary-foreground/10 absolute h-28 w-28 animate-[ping_2s_ease-in-out_infinite] rounded-full border opacity-50"></div>
					</div>

					{/* Orbit Ring */}
					<div
						className={`border-border/30 absolute rounded-full border ${isMobile ? 'h-72 w-72' : 'h-96 w-96'}`}
					></div>

					{/* Timeline Nodes */}
					{timelineData.map((item, index) => {
						const position = calculateNodePosition(index, timelineData.length)
						const isExpanded = expandedItems[item.id]
						const isRelated = isRelatedToActive(item.id)
						const isPulsing = Boolean(pulseEffect[item.id])
						const Icon = item.icon

						const nodeStyle = {
							zIndex: isExpanded ? 200 : position.zIndex,
							transform: `translate(${position.x}px, ${position.y}px)`,
							opacity: isExpanded ? 1 : position.opacity,
						}

						return (
							<div
								className="absolute cursor-pointer transition-all duration-700"
								key={item.id}
								onClick={e => {
									e.stopPropagation()
									toggleItem(item.id)
								}}
								ref={el => {
									nodeRefs.current[item.id] = el
								}}
								style={nodeStyle}
							>
								{/* Pulse Effect */}
								<div
									className={`absolute -inset-1 rounded-full ${isPulsing ? 'animate-pulse duration-1000' : ''}`}
									style={{
										width: `${item.energy * 0.5 + 50}px`,
										top: `-${(item.energy * 0.5 + 50 - 40) / 2}px`,
										left: `-${(item.energy * 0.5 + 50 - 40) / 2}px`,
										height: `${item.energy * 0.5 + 50}px`,
										background: `radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, hsl(var(--primary) / 0) 70%)`,
									}}
								></div>

								{/* Main Node */}
								<div
									className={`flex h-12 w-12 transform items-center justify-center rounded-full border-2 transition-all duration-300 ${
										isExpanded
											? 'border-primary bg-primary/70 text-primary-foreground shadow-primary/50 scale-115 shadow-lg'
											: isRelated
												? 'border-primary bg-primary/70 text-primary-foreground animate-pulse'
												: 'border-muted bg-card/90 text-muted-foreground'
									}`}
								>
									<Icon size={20} />
								</div>

								{/* Node Title */}
								<div
									className={`absolute top-14 text-center text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ${isExpanded ? 'text-foreground scale-125' : 'text-muted-foreground'}`}
								>
									{item.title}
								</div>

								{/* Expanded Card */}
								{isExpanded && (
									<Card className="border-primary/30 bg-card/95 shadow-primary/20 absolute top-20 left-1/2 w-72 -translate-x-1/2 overflow-visible shadow-xl backdrop-blur-lg">
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
