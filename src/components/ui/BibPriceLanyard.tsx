// the main component is from a component library, so we need to ignore some types.
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
'use client'
import { useEffect, useRef, useState, Suspense, useMemo } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
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

extend({ MeshLineGeometry, MeshLineMaterial })

interface LanyardProps {
	position?: [number, number, number]
	gravity?: [number, number, number]
	fov?: number
	transparent?: boolean
}

export default function Lanyard({
	position = [0, 0, 32],
	gravity = [0, -60, 0],
	fov = 32,
	transparent = true,
}: LanyardProps) {
	return (
		<div className="fixed -top-32 right-[35vw] z-10 h-[100vh] w-[100vw] origin-center scale-100 transform">
			<Canvas
				camera={{ position, fov }}
				gl={{ alpha: transparent }}
				onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
			>
				<ambientLight intensity={Math.PI} />
				<Physics gravity={gravity} timeStep={1 / 60}>
					<Suspense>
						<Band />
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
}

function Band({ maxSpeed = 50, minSpeed = 0 }: BandProps) {
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

	// Calculate dynamic rope positions based on screen size
	const ropePositions = useMemo(() => {
		const { width, height, isSmall } = screenSize

		// Base positions for different screen sizes
		const baseY = isSmall ? 6 : 8 // Start higher on mobile
		const segmentSpacing = isSmall ? 1.2 : 1.8 // Closer segments on mobile

		// Adjust card position based on screen height to avoid text overlap
		let cardOffset = -6
		if (height < 600) {
			cardOffset = -3 // Very short screens (mobile landscape)
		} else if (height < 700) {
			cardOffset = -4 // Short screens
		} else if (height < 900) {
			cardOffset = -5 // Medium positioning
		} else if (height > 1200) {
			cardOffset = -8 // Lower card on tall screens
		} else if (height > 1400) {
			cardOffset = -10 // Very tall screens
		}

		// Adjust horizontally for very wide screens to avoid being too far left
		let groupX = 0
		if (width > 1800) {
			groupX = 2 // Move slightly right on very wide screens
		} else if (width > 2400) {
			groupX = 4 // Move further right on ultra-wide screens
		}

		return {
			groupPosition: [groupX, baseY, 0] as [number, number, number],
			j1Position: [0, -segmentSpacing * 0.7, 0] as [number, number, number],
			j2Position: [0, -segmentSpacing * 1.4, 0] as [number, number, number],
			j3Position: [0, -segmentSpacing * 2.2, 0] as [number, number, number],
			cardPosition: [0, cardOffset, 0] as [number, number, number],
			ropeJointLengths: {
				j1: segmentSpacing * 0.8,
				j2: segmentSpacing,
				j3: segmentSpacing,
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
		[0, 1.45, 0],
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

	// Create a simple card component without GLTF
	const SimpleCard = () => (
		<group
			scale={2.25}
			position={[0, -1.2, -0.05]}
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
			{/* Main card body with hole */}
			<mesh>
				<boxGeometry args={[1.6, 2.25, 0.02]} />
				<meshPhysicalMaterial color="#ffffff" clearcoat={1} clearcoatRoughness={0.15} roughness={0.9} metalness={0.8} />
			</mesh>

			{/* Hole in the card for the rope */}
			<mesh position={[0, 1.0, 0]}>
				<cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
				<meshPhysicalMaterial
					color="#000000"
					transmission={1}
					opacity={0.1}
					transparent={true}
					roughness={1}
					metalness={0}
				/>
			</mesh>

			{/* Hole rim - small metallic ring around the hole */}
			<mesh position={[0, 1.0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
				<ringGeometry args={[0.08, 0.12, 16]} />
				<meshStandardMaterial color="#CCCCCC" metalness={0.8} roughness={0.2} />
			</mesh>

			{/* Clip - small metallic piece at top */}
			<mesh position={[0, 0.9, 0.02]}>
				<boxGeometry args={[0.3, 0.2, 0.05]} />
				<meshStandardMaterial color="#666666" metalness={1} roughness={0.3} />
			</mesh>

			{/* Clamp - connector piece */}
			<mesh position={[0, 1.1, 0.01]}>
				<boxGeometry args={[0.15, 0.15, 0.03]} />
				<meshStandardMaterial color="#333333" metalness={1} roughness={0.2} />
			</mesh>
		</group>
	)

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
					<CuboidCollider args={[0.8, 1.125, 0.01]} />
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
					lineWidth={1}
					opacity={0.95}
					transparent={true}
					roughness={0.9}
					metalness={0.02}
				/>
			</mesh>
		</>
	)
}
