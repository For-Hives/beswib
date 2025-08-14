'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

// Composant mémorisé pour chaque nœud orbital - évite les re-renders inutiles
const OrbitalNode = memo(
	({
		total,
		onToggle,
		item,
		isRelated,
		isPulsing,
		isMobile,
		isExpanded,
		index,
		globalElapsed,
		frozenRotation,
		autoRotate,
	}: {
		item: TimelineItem
		index: number
		total: number
		isExpanded: boolean
		isRelated: boolean
		isPulsing: boolean
		isMobile: boolean
		onToggle: (id: number) => void
		autoRotate: boolean
		globalElapsed: number
		frozenRotation: number
	}) => {
		const Icon = item.icon
		const nodeRef = useRef<HTMLDivElement>(null)

		// Position initiale calculée une seule fois
		const initialAngle = useMemo(() => (index / total) * 360, [index, total])
		const radius = isMobile ? 160 : 200

		// Calcul unique des positions initiales
		const { y, x } = useMemo(() => {
			const radian = (initialAngle * Math.PI) / 180
			return {
				y: radius * Math.sin(radian),
				x: radius * Math.cos(radian),
			}
		}, [initialAngle, radius])

		// Propriétés visuelles simplifiées - pas de gestion du temps local
		const [visualProps, setVisualProps] = useState({ zIndex: 100, opacity: 1 })

		useEffect(() => {
			if (!autoRotate) {
				// Si pas d'auto-rotation, on fixe les propriétés visuelles et on reset
				setVisualProps({ zIndex: isExpanded ? 200 : 100, opacity: 1 })
				return
			}

			// Animation frame pour calculer les propriétés visuelles pendant la rotation CSS
			let animationId: number

			const updateVisualProps = () => {
				// Utilise le temps global pour calculer l'angle actuel
				const currentAngle = (initialAngle + globalElapsed * 3) % 360 // 3deg/s exactement comme l'animation CSS

				const cosValue = Math.cos((currentAngle * Math.PI) / 180)
				const sinValue = Math.sin((currentAngle * Math.PI) / 180)

				const zIndex = Math.round(100 + 50 * cosValue)
				const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + sinValue) / 2)))

				setVisualProps({ zIndex, opacity })

				if (autoRotate) {
					animationId = requestAnimationFrame(updateVisualProps)
				}
			}

			updateVisualProps()

			return () => {
				if (animationId) cancelAnimationFrame(animationId)
			}
		}, [autoRotate, initialAngle, isExpanded, globalElapsed])

		const getNodeStyling = useCallback(() => {
			if (isExpanded) {
				return 'border-primary bg-primary/70 text-primary-foreground shadow-primary/50 scale-115 shadow-lg'
			}
			if (isRelated) {
				return 'border-primary bg-primary/70 text-primary-foreground animate-pulse'
			}
			return 'border-muted bg-card/90 text-muted-foreground'
		}, [isExpanded, isRelated])

		const handleClick = useCallback(
			(e: React.MouseEvent) => {
				e.stopPropagation()
				// eslint-disable-next-line no-console
				console.log('🔥 Click sur:', item.title) // Debug pour vérifier les clics
				onToggle(item.id)
			},
			[item.id, onToggle]
		)

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					e.stopPropagation()
					onToggle(item.id)
				}
			},
			[item.id, onToggle]
		)

		return (
			<div
				ref={nodeRef}
				className={`absolute transition-opacity duration-700 ${autoRotate ? 'orbital-node' : ''}`}
				style={
					{
						zIndex: visualProps.zIndex,
						willChange: 'transform, opacity',
						transform: `translate3d(${x}px, ${y}px, 0) rotate(${autoRotate ? -globalElapsed * 3 : -frozenRotation}deg)`, // Garde la rotation figée quand arrêté
						opacity: isExpanded ? 1 : visualProps.opacity,
						'--y-position': `${y}px`,
						'--x-position': `${x}px`,
						'--orbit-radius': `${radius}px`,
						'--initial-angle': `${initialAngle}deg`,
					} as React.CSSProperties
				}
			>
				{/* Pulse effect */}
				{isPulsing && (
					<div
						className="absolute -inset-1 animate-pulse rounded-full duration-1000"
						style={{
							width: `${item.energy * 0.5 + 50}px`,
							top: `-${(item.energy * 0.5 + 50 - 40) / 2}px`,
							left: `-${(item.energy * 0.5 + 50 - 40) / 2}px`,
							height: `${item.energy * 0.5 + 50}px`,
							background: `radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, hsl(var(--primary) / 0) 70%)`,
						}}
					/>
				)}

				{/* Node with icon */}
				<div
					className={`flex h-12 w-12 transform cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-300 ${getNodeStyling()}`}
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					role="button"
					tabIndex={0}
					aria-label={`Icon for ${item.title}`}
					style={{
						pointerEvents: 'auto',
						boxShadow: '0 0 0 2px rgba(0, 255, 0, 0.3)', // Debug: bordure verte temporaire
					}}
				>
					<div style={{ pointerEvents: 'none' }}>
						<Icon size={20} />
					</div>
				</div>

				{/* Node title */}
				<div
					className={`absolute top-14 cursor-pointer text-center text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ${
						isExpanded ? 'text-foreground scale-125' : 'text-muted-foreground'
					}`}
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					role="button"
					tabIndex={0}
					aria-label={`Title: ${item.title}`}
					style={{
						pointerEvents: 'auto',
						padding: '4px 8px', // Zone de clic plus large
						minWidth: '60px',
						backgroundColor: 'rgba(255, 0, 0, 0.1)', // Debug: fond rouge temporaire
					}}
				>
					{item.title}
				</div>

				{/* Expansion card */}
				{isExpanded && (
					<Card
						className="border-primary/30 bg-card/95 shadow-primary/20 absolute left-1/2 w-72 -translate-x-1/2 overflow-visible shadow-xl backdrop-blur-lg"
						style={{
							top: '5rem', // Position fixe en bas du nœud
							// Pas de rotation - la popup reste toujours droite
						}}
					>
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
	},
	(prevProps, nextProps) => {
		// Comparaison personnalisée pour éviter les re-renders inutiles
		return (
			prevProps.isExpanded === nextProps.isExpanded &&
			prevProps.isRelated === nextProps.isRelated &&
			prevProps.isPulsing === nextProps.isPulsing &&
			prevProps.isMobile === nextProps.isMobile &&
			prevProps.autoRotate === nextProps.autoRotate &&
			prevProps.item.id === nextProps.item.id &&
			prevProps.globalElapsed === nextProps.globalElapsed &&
			prevProps.frozenRotation === nextProps.frozenRotation
		)
	}
)

OrbitalNode.displayName = 'OrbitalNode'

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
	// Données de test par défaut si aucune donnée n'est fournie
	const defaultTimelineData: TimelineItem[] = [
		{
			title: 'Sécurité',
			status: 'completed' as const,
			relatedIds: [2, 3],
			id: 1,
			icon: () => <div className="text-2xl">🔒</div>,
			energy: 80,
			date: '2024',
			content: 'Protection des données et transactions sécurisées',
			category: 'security',
		},
		{
			title: 'Confiance',
			status: 'completed' as const,
			relatedIds: [1, 4],
			id: 2,
			icon: () => <div className="text-2xl">👥</div>,
			energy: 75,
			date: '2024',
			content: 'Système de validation et vérification des utilisateurs',
			category: 'trust',
		},
		{
			title: 'Recherche',
			status: 'in-progress' as const,
			relatedIds: [1, 5],
			id: 3,
			icon: () => <div className="text-2xl">🔍</div>,
			energy: 90,
			date: '2024',
			content: 'Moteur de recherche avancé pour les événements',
			category: 'search',
		},
		{
			title: 'Rentabilité',
			status: 'completed' as const,
			relatedIds: [2, 6],
			id: 4,
			icon: () => <div className="text-2xl">💰</div>,
			energy: 85,
			date: '2024',
			content: 'Optimisation des prix et gestion des commissions',
			category: 'profitability',
		},
	]

	const finalTimelineData = timelineData.length > 0 ? timelineData : defaultTimelineData

	const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})
	const [autoRotate, setAutoRotate] = useState<boolean>(true)
	const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({})
	const [activeNodeId, setActiveNodeId] = useState<null | number>(null)
	const [isMobile, setIsMobile] = useState<boolean>(false)
	// Système de temps simple - reset complet
	const [globalElapsed, setGlobalElapsed] = useState<number>(0)
	// État pour figer la rotation au moment du clic
	const [frozenRotation, setFrozenRotation] = useState<number>(0)

	const containerRef = useRef<HTMLDivElement>(null)
	const orbitRef = useRef<HTMLDivElement>(null)

	// Gestion du mobile
	useEffect(() => {
		const checkIsMobile = () => setIsMobile(window.innerWidth < 768)
		checkIsMobile()

		const handleResize = () => checkIsMobile()
		window.addEventListener('resize', handleResize, { passive: true })
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Référence du temps de démarrage pour synchronisation avec l'animation CSS
	const startTimeRef = useRef<number>(Date.now())

	// Système de temps synchronisé avec l'animation CSS
	useEffect(() => {
		if (!autoRotate) {
			return
		}

		// Si c'est la première fois ou si on a un frozenRotation, on ajuste
		if (frozenRotation > 0) {
			// Reprendre de la rotation figée
			startTimeRef.current = Date.now() - (frozenRotation / 3) * 1000
		} else if (globalElapsed === 0) {
			// Premier démarrage ou refresh - synchroniser avec l'animation CSS
			startTimeRef.current = Date.now()
		}
		// Sinon on garde le startTime existant pour éviter les sauts

		const interval = setInterval(() => {
			const elapsed = (Date.now() - startTimeRef.current) / 1000
			setGlobalElapsed(elapsed)
		}, 16) // ~60fps

		// Reset le frozenRotation après 2 secondes de rotation normale
		const resetTimeout = setTimeout(() => {
			if (frozenRotation > 0) {
				setFrozenRotation(0)
			}
		}, 2000)

		return () => {
			clearInterval(interval)
			clearTimeout(resetTimeout)
		}
	}, [autoRotate, frozenRotation])

	// Handler optimisé avec useCallback
	const handleContainerClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
			// Ne fermer que si on clique vraiment sur le fond
			const target = e.target as HTMLElement
			const isBackgroundClick =
				target === containerRef.current ||
				target === orbitRef.current ||
				target.classList.contains('orbital-container') ||
				target.classList.contains('bg-background')

			// eslint-disable-next-line no-console
			console.log('🎯 Container click:', { target: target.className, isBackgroundClick }) // Debug

			if (isBackgroundClick) {
				setExpandedItems({})
				setActiveNodeId(null)
				setPulseEffect({})
				// Pas de reset brutal - on reprend juste la rotation normale
				setAutoRotate(true)
				// Le frozenRotation reste jusqu'à la prochaine rotation
			}
		},
		[]
	)

	// Toggle optimisé
	const toggleItem = useCallback(
		(id: number) => {
			setExpandedItems(prev => {
				const newState: Record<number, boolean> = {}
				const wasExpanded = prev[id]

				if (!wasExpanded) {
					newState[id] = true
					setActiveNodeId(id)
					// Figer la rotation actuelle au moment du clic
					setFrozenRotation(globalElapsed * 3)
					setAutoRotate(false)

					const item = finalTimelineData.find(i => i.id === id)
					if (item) {
						const newPulseEffect: Record<number, boolean> = {}
						item.relatedIds.forEach(relId => {
							newPulseEffect[relId] = true
						})
						setPulseEffect(newPulseEffect)
					}
				} else {
					setActiveNodeId(null)
					setAutoRotate(true)
					setPulseEffect({})
				}

				return newState
			})
		},
		[finalTimelineData, globalElapsed]
	)

	// Mémoisation des relations
	const relatedItemsMap = useMemo(() => {
		const map = new Map<number, Set<number>>()
		finalTimelineData.forEach(item => {
			map.set(item.id, new Set(item.relatedIds))
		})
		return map
	}, [finalTimelineData])

	const isRelatedToActive = useCallback(
		(itemId: number): boolean => {
			if (activeNodeId === null) return false
			const relatedSet = relatedItemsMap.get(activeNodeId)
			return relatedSet?.has(itemId) ?? false
		},
		[activeNodeId, relatedItemsMap]
	)

	return (
		<>
			<style jsx global>{`
				.orbital-node {
					transform: rotate(var(--initial-angle)) translateX(var(--orbit-radius))
						rotate(calc(-1 * var(--initial-angle)));
					transform-origin: center;
				}
			`}</style>

			<div
				ref={containerRef}
				className="bg-background z-40 flex min-h-128 w-full -translate-x-2 flex-col items-center justify-center md:translate-x-0"
				onClick={handleContainerClick}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						handleContainerClick(e)
					}
				}}
				role="button"
				tabIndex={0}
				aria-label="Close expanded timeline items"
			>
				<div className="relative flex h-full w-full max-w-6xl items-center justify-center md:scale-100">
					<div
						ref={orbitRef}
						className="absolute flex h-full w-full items-center justify-center"
						style={{
							transition: 'transform 0.1s linear',
							transformStyle: 'preserve-3d',
							transform: autoRotate ? `rotate(${globalElapsed * 3}deg)` : `rotate(${frozenRotation}deg)`,
							perspective: '1000px',
						}}
					>
						{/* Center logo */}
						<div
							className="z-10 flex h-20 w-20 items-center justify-center rounded-full"
							style={{
								transition: 'transform 0.1s linear',
								transform: autoRotate ? `rotate(${-globalElapsed * 3}deg)` : `rotate(${-frozenRotation}deg)`, // Garde la rotation figée
							}}
						>
							<Image alt="logo" height={100} src="/beswib.svg" width={100} />
							<div className="border-primary-foreground/20 absolute h-24 w-24 animate-[ping_2s_ease-in-out_infinite] rounded-full border opacity-70"></div>
							<div className="border-primary-foreground/10 absolute h-28 w-28 animate-[ping_2s_ease-in-out_infinite] rounded-full border opacity-50"></div>
						</div>

						{/* Orbit ring */}
						<div className={`border-border/30 absolute rounded-full border ${isMobile ? 'h-72 w-72' : 'h-96 w-96'}`} />

						{/* Nodes */}
						{finalTimelineData.map((item, index) => (
							<OrbitalNode
								key={item.id}
								item={item}
								index={index}
								total={finalTimelineData.length}
								isExpanded={expandedItems[item.id] || false}
								isRelated={isRelatedToActive(item.id)}
								isPulsing={pulseEffect[item.id] || false}
								isMobile={isMobile}
								onToggle={toggleItem}
								autoRotate={autoRotate}
								globalElapsed={globalElapsed}
								frozenRotation={frozenRotation}
							/>
						))}
					</div>
				</div>
			</div>
		</>
	)
}
