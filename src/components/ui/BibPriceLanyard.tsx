// the main component is from a component library, so we need to ignore some types.
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

'use client'
import { useEffect, useRef, useState, Suspense, useMemo } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Html, useGLTF } from '@react-three/drei'
import {
	BallCollider,
	CuboidCollider,
	Physics,
	RigidBody,
	useRopeJoint,
	useSphericalJoint,
	RigidBodyProps,
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'

// URL to the 3D model in public folder
const cardGLB = '/models/card.glb'

extend({ MeshLineGeometry, MeshLineMaterial })

interface LanyardProps {
	position?: [number, number, number]
	gravity?: [number, number, number]
	fov?: number
	transparent?: boolean
	price?: number
	originalPrice?: number
	currency?: string
	discount?: number
}

export default function Lanyard({
	position = [0, 0, 40],
	gravity = [0, -40, 0],
	fov = 16,
	transparent = true,
	price,
	originalPrice,
	currency = 'EUR',
	discount,
}: LanyardProps) {
	return (
		<div className="pointer-events-none fixed top-0 left-0 z-10 h-[100vh] w-[100vw]">
			<Canvas
				camera={{ position, fov }}
				gl={{ alpha: transparent }}
				onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
				style={{ pointerEvents: 'auto' }}
			>
				<ambientLight intensity={Math.PI} />
				<Physics gravity={gravity} timeStep={1 / 60}>
					<Suspense>
						<Band price={price} originalPrice={originalPrice} currency={currency} discount={discount} />
					</Suspense>
				</Physics>
				<Environment blur={0.75}>
					<Lightformer
						intensity={2}
						color="white"
						position={[0, -1, 5]}
						rotation={[0, 0, Math.PI / 3]}
						scale={[100, 0.1, 1]}
					/>
					<Lightformer
						intensity={3}
						color="white"
						position={[-1, -1, 1]}
						rotation={[0, 0, Math.PI / 3]}
						scale={[100, 0.1, 1]}
					/>
					<Lightformer
						intensity={3}
						color="white"
						position={[1, 1, 1]}
						rotation={[0, 0, Math.PI / 3]}
						scale={[100, 0.1, 1]}
					/>
					<Lightformer
						intensity={10}
						color="white"
						position={[-10, 0, 14]}
						rotation={[0, Math.PI / 2, Math.PI / 3]}
						scale={[100, 10, 1]}
					/>
				</Environment>
			</Canvas>
		</div>
	)
}

interface BandProps {
	maxSpeed?: number
	minSpeed?: number
	price?: number
	originalPrice?: number
	currency?: string
	discount?: number
}

function Band({ maxSpeed = 50, minSpeed = 0, price, originalPrice, currency = 'EUR' }: BandProps) {
	// Using "any" for refs since the exact types depend on Rapier's internals
	const band = useRef<any>(null)
	const fixed = useRef<any>(null)
	const j1 = useRef<any>(null)
	const j2 = useRef<any>(null)
	const j3 = useRef<any>(null)
	const card = useRef<any>(null)

	const vec = new THREE.Vector3()
	const ang = new THREE.Vector3()
	const rot = new THREE.Vector3()
	const dir = new THREE.Vector3()

	const segmentProps: any = {
		type: 'dynamic' as RigidBodyProps['type'],
		canSleep: true,
		colliders: false,
		angularDamping: 4,
		linearDamping: 4,
	}

	// Create a realistic diffuse rope texture that wraps properly around the cord
	const [ropeTexture] = useState(() => {
		const canvas = document.createElement('canvas')
		canvas.width = 256 // Reduced for better performance
		canvas.height = 64
		const ctx = canvas.getContext('2d')!

		// Clear canvas
		ctx.clearRect(0, 0, 256, 64)

		// Create gradient from top to bottom for cylindrical lighting
		const gradient = ctx.createLinearGradient(0, 0, 0, 64)
		gradient.addColorStop(0, '#C8C8C8') // Light top
		gradient.addColorStop(0.3, '#A8A8A8') // Medium-light
		gradient.addColorStop(0.5, '#909090') // Medium center
		gradient.addColorStop(0.7, '#787878') // Medium-dark
		gradient.addColorStop(1, '#606060') // Dark bottom

		ctx.fillStyle = gradient
		ctx.fillRect(0, 0, 256, 64)

		// Add braided rope pattern - simplified for better diffusion
		ctx.globalCompositeOperation = 'multiply'

		// Create 3 main twisted strands
		for (let strand = 0; strand < 3; strand++) {
			const strandOffset = (strand * Math.PI * 2) / 3

			for (let x = 0; x < 256; x += 2) {
				// Twisted pattern
				const angle = x * 0.04 + strandOffset
				const twist = Math.sin(angle) * 16 + 32
				const strandWidth = 12

				// Create strand with gradual edges
				for (let dy = -strandWidth; dy <= strandWidth; dy++) {
					const y = twist + dy
					if (y >= 0 && y < 64) {
						const distance = Math.abs(dy) / strandWidth
						const alpha = Math.max(0, 1 - distance) * 0.3

						// Strand color varies by position
						const brightness = 0.8 + Math.sin(angle * 2) * 0.2
						const color = Math.floor(120 * brightness)

						ctx.fillStyle = `rgba(${color}, ${color}, ${color}, ${alpha})`
						ctx.fillRect(x, y, 2, 1)
					}
				}
			}
		}

		// Reset composite operation
		ctx.globalCompositeOperation = 'source-over'

		// Add subtle fiber texture for realism
		ctx.globalAlpha = 0.1
		for (let i = 0; i < 800; i++) {
			const x = Math.random() * 256
			const y = Math.random() * 64
			const size = Math.random() > 0.8 ? 2 : 1
			const brightness = 120 + Math.random() * 60

			ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`
			ctx.fillRect(x, y, size, 1)
		}
		ctx.globalAlpha = 1.0

		// Create texture with proper wrapping
		const texture = new THREE.CanvasTexture(canvas)
		texture.wrapS = THREE.RepeatWrapping
		texture.wrapT = THREE.ClampToEdgeWrapping // Prevent vertical repeating
		texture.generateMipmaps = false
		texture.minFilter = THREE.LinearFilter
		texture.magFilter = THREE.LinearFilter
		texture.flipY = false
		texture.format = THREE.RGBAFormat
		texture.needsUpdate = true
		return texture
	})

	const [curve] = useState(
		() =>
			new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
	)
	const [dragged, drag] = useState<false | THREE.Vector3>(false)
	const [hovered, hover] = useState(false)

	// Dynamic screen size and rope positioning system
	const [screenSize, setScreenSize] = useState<{ width: number; height: number; isSmall: boolean }>(() => {
		if (typeof window !== 'undefined') {
			return {
				width: window.innerWidth,
				height: window.innerHeight,
				isSmall: window.innerWidth < 1024,
			}
		}
		return { width: 1024, height: 768, isSmall: false }
	})

	// Rope positions - starts from top-left and goes to card
	const ropePositions = useMemo(() => {
		const { isSmall } = screenSize

		// Start from top-left area of the 50vw container, slightly spaced from edge
		const startX = isSmall ? -4 : -5
		const startY = isSmall ? 6 : 7

		// Create a path down from top-left
		const spacing = isSmall ? 1.5 : 2

		return {
			groupPosition: [startX, startY, 0] as [number, number, number],
			j1Position: [startX + spacing * 0.3, startY - spacing * 1, 0] as [number, number, number],
			j2Position: [startX + spacing * 0.6, startY - spacing * 2, 0] as [number, number, number],
			j3Position: [startX + spacing * 0.9, startY - spacing * 3, 0] as [number, number, number],
			cardPosition: [startX + spacing * 1.2, startY - spacing * 4, 0] as [number, number, number],
			ropeJointLengths: {
				j1: spacing * 1.2,
				j2: spacing * 1.2,
				j3: spacing * 1.2,
			},
		}
	}, [screenSize])

	useEffect(() => {
		const handleResize = (): void => {
			setScreenSize({
				width: window.innerWidth,
				height: window.innerHeight,
				isSmall: window.innerWidth < 1024,
			})
		}

		window.addEventListener('resize', handleResize)
		return (): void => window.removeEventListener('resize', handleResize)
	}, [])

	useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], ropePositions.ropeJointLengths.j1])
	useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], ropePositions.ropeJointLengths.j2])
	useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], ropePositions.ropeJointLengths.j3])
	useSphericalJoint(j3, card, [
		[0, 0, 0],
		[0, 2.4, 0], // Ajusté pour s'attacher dans le clamp
	])

	useEffect(() => {
		if (hovered) {
			document.body.style.cursor = dragged !== false ? 'grabbing' : 'grab'
			return () => {
				document.body.style.cursor = 'auto'
			}
		}
	}, [hovered, dragged])

	useFrame((state, delta) => {
		if (dragged !== false && typeof dragged !== 'boolean') {
			vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
			dir.copy(vec).sub(state.camera.position).normalize()
			vec.add(dir.multiplyScalar(state.camera.position.length()))
			;[card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp())
			card.current?.setNextKinematicTranslation({
				x: vec.x - dragged.x,
				y: vec.y - dragged.y,
				z: vec.z - dragged.z,
			})
		}
		if (fixed.current != null) {
			;[j1, j2].forEach(ref => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const current = ref.current
				if (current != null && current.lerped == null) {
					current.lerped = new THREE.Vector3().copy(current.translation())
				}
				if (current?.lerped != null) {
					const clampedDistance = Math.max(0.1, Math.min(1, current.lerped.distanceTo(current.translation())))
					current.lerped.lerp(current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
				}
			})
			curve.points[0].copy(j3.current.translation())
			curve.points[1].copy(j2.current.lerped)
			curve.points[2].copy(j1.current.lerped)
			curve.points[3].copy(fixed.current.translation())
			band.current.geometry.setPoints(curve.getPoints(32))
			ang.copy(card.current.angvel())
			rot.copy(card.current.rotation())
			card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
		}
	})

	curve.curveType = 'chordal'

	// Create a simple card component with price display
	const SimpleCard = () => {
		// Load the 3D model with Suspense-compatible error handling
		let nodes: any
		try {
			const gltfData = useGLTF(cardGLB, true) as any
			nodes = gltfData.nodes
		} catch (error) {
			console.warn('GLB model failed to load:', error)
			// Fallback to basic geometries
			nodes = {}
		}
		// Calculate savings and discount percentage
		const hasDiscount = Boolean(originalPrice != null && originalPrice > (price ?? 0))
		const savingsAmount = hasDiscount ? (originalPrice ?? 0) - (price ?? 0) : 0
		const discountPercentage =
			hasDiscount && originalPrice != null ? Math.round((savingsAmount / originalPrice) * 100) : 0

		return (
			<group
				scale={2}
				position={[0, 0, 0]}
				onPointerOver={() => hover(true)}
				onPointerOut={() => hover(false)}
				onPointerUp={(e: any) => {
					e.target.releasePointerCapture(e.pointerId)
					drag(false)
				}}
				onPointerDown={(e: any) => {
					e.target.setPointerCapture(e.pointerId)
					drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
				}}
			>
				{/* Main card body from GLB model */}
				<mesh geometry={nodes.card?.geometry ?? undefined}>
					<meshPhysicalMaterial
						// Désactive complètement la map pour éviter les erreurs de texture blob
						map={null}
						clearcoat={1}
						clearcoatRoughness={0.15}
						roughness={0.9}
						metalness={0.8}
						color="#d0d0d0"
					/>
				</mesh>

				{/* Price Card Content - fit perfectly in card */}
				{price != null && (
					<Html
						transform
						position={[0, -0.2, 0.02]}
						scale={0.22}
						style={{
							pointerEvents: 'none',
							userSelect: 'none',
							width: '100%',
							height: '100%',
						}}
					>
						<div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-br p-3">
							{/* Discount Badge */}
							{hasDiscount && discountPercentage > 0 && (
								<div className="mb-4">
									<span className="inline-flex items-center rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md">
										-{discountPercentage}% OFF
									</span>
								</div>
							)}

							{/* Main Price */}
							<div className="mb-3 text-center">
								<span className="text-4xl font-bold text-gray-900">
									{currency === 'EUR' ? '€' : '$'}
									{price}
								</span>
							</div>

							{/* Original Price */}
							{hasDiscount && (
								<div className="mb-4 text-center">
									<span className="text-xl text-gray-500 line-through">
										{currency === 'EUR' ? '€' : '$'}
										{originalPrice}
									</span>
								</div>
							)}

							{/* Savings Amount */}
							{hasDiscount && savingsAmount > 0 && (
								<div className="text-center">
									<span className="text-base font-medium text-green-600">
										Save {currency === 'EUR' ? '€' : '$'}
										{savingsAmount.toFixed(2)}
									</span>
								</div>
							)}
						</div>
					</Html>
				)}

				{/* Clip - real geometry from GLB model */}
				{nodes.clip?.geometry != null && (
					<mesh geometry={nodes.clip.geometry}>
						<meshStandardMaterial color="#404040" metalness={1} roughness={0.3} />
					</mesh>
				)}

				{/* Clamp - real geometry from GLB model */}
				{nodes.clamp?.geometry != null && (
					<mesh geometry={nodes.clamp.geometry}>
						<meshStandardMaterial color="#333333" metalness={1} roughness={0.2} />
					</mesh>
				)}
			</group>
		)
	}

	return (
		<>
			<group position={ropePositions.groupPosition}>
				{/* Fixed point - rope attachment high up off-screen */}
				<RigidBody ref={fixed} {...segmentProps} type={'fixed' as RigidBodyProps['type']} />

				{/* Rope segments - dynamically positioned based on screen size */}
				<RigidBody
					position={ropePositions.j1Position}
					ref={j1}
					{...segmentProps}
					type={'dynamic' as RigidBodyProps['type']}
				>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody
					position={ropePositions.j2Position}
					ref={j2}
					{...segmentProps}
					type={'dynamic' as RigidBodyProps['type']}
				>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody
					position={ropePositions.j3Position}
					ref={j3}
					{...segmentProps}
					type={'dynamic' as RigidBodyProps['type']}
				>
					<BallCollider args={[0.1]} />
				</RigidBody>

				{/* Card positioned dynamically to avoid text overlap */}
				<RigidBody
					position={ropePositions.cardPosition}
					ref={card}
					{...segmentProps}
					type={
						dragged !== false ? ('kinematicPosition' as RigidBodyProps['type']) : ('dynamic' as RigidBodyProps['type'])
					}
				>
					{/* Card collision - simple box without interference at attachment point */}
					<CuboidCollider args={[0.8, 1.0, 0.01]} position={[0, -0.125, 0]} />
					<SimpleCard />
				</RigidBody>
			</group>
			<mesh ref={band}>
				{/* @ts-expect-error - meshLineGeometry is not typed */}
				<meshLineGeometry />
				{/* @ts-expect-error - meshLineMaterial is not typed */}
				<meshLineMaterial
					color="#F5F5F5"
					depthTest={false}
					resolution={screenSize.isSmall ? [1400, 2800] : [1400, 1400]}
					useMap={true}
					map={ropeTexture}
					repeat={[-6, 1]}
					lineWidth={0.8}
					opacity={0.95}
					transparent={true}
					roughness={0.9}
					metalness={0.02}
				/>
			</mesh>
		</>
	)
}

// Preload the GLB model to avoid texture loading issues
useGLTF.preload(cardGLB)
