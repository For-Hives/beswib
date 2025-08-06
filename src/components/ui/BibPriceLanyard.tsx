// the main component is from a component library, so we need to ignore some types.
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client'
import { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { useTexture, Environment, Lightformer } from '@react-three/drei'
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

// Import texture from public directory
const lanyardTexture = '/models/lanyard.png'

extend({ MeshLineGeometry, MeshLineMaterial })

interface LanyardProps {
	position?: [number, number, number]
	gravity?: [number, number, number]
	fov?: number
	transparent?: boolean
}

export default function Lanyard({
	position = [0, 0, 24],
	gravity = [0, -32, 0],
	fov = 16,
	transparent = true,
}: LanyardProps) {
	return (
		<div className="fixed top-16 right-8 z-10 h-[80vh] w-[32vw] origin-center scale-80 transform">
			<Canvas
				camera={{ position, fov }}
				gl={{ alpha: transparent }}
				onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
			>
				<ambientLight intensity={Math.PI} />
				<Physics gravity={gravity} timeStep={1 / 60}>
					<Suspense fallback={<FallbackBand />}>
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

function FallbackBand() {
	const band = useRef<any>(null)
	const fixed = useRef<any>(null)
	const j1 = useRef<any>(null)
	const j2 = useRef<any>(null)
	const j3 = useRef<any>(null)
	const card = useRef<any>(null)

	const segmentProps: any = {
		type: 'dynamic' as RigidBodyProps['type'],
		canSleep: true,
		colliders: false,
		angularDamping: 4,
		linearDamping: 4,
	}

	const [dragged, drag] = useState<false | THREE.Vector3>(false)
	const [hovered, hover] = useState(false)

	useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
	useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
	useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
	useSphericalJoint(j3, card, [
		[0, 0, 0],
		[0, 1.45, 0],
	])

	return (
		<>
			<group position={[0, 4, 0]}>
				<RigidBody ref={fixed} {...segmentProps} type={'fixed' as RigidBodyProps['type']} />
				<RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody
					position={[2, 0, 0]}
					ref={card}
					{...segmentProps}
					type={dragged ? ('kinematicPosition' as RigidBodyProps['type']) : ('dynamic' as RigidBodyProps['type'])}
				>
					<CuboidCollider args={[0.8, 1.125, 0.01]} />
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
							drag(new THREE.Vector3().copy(e.point))
						}}
					>
						<mesh>
							<boxGeometry args={[1.6, 2.25, 0.02]} />
							<meshPhysicalMaterial
								color="#ffffff"
								clearcoat={1}
								clearcoatRoughness={0.15}
								roughness={0.9}
								metalness={0.8}
							/>
						</mesh>
					</group>
				</RigidBody>
			</group>
		</>
	)
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

	// Create a realistic braided grey rope texture
	const [ropeTexture] = useState(() => {
		const canvas = document.createElement('canvas')
		canvas.width = 1024
		canvas.height = 64
		const ctx = canvas.getContext('2d')!
		
		// Clear with transparent background
		ctx.clearRect(0, 0, 1024, 64)
		
		// Base rope color - natural grey
		ctx.fillStyle = '#595959' // Medium grey base
		ctx.fillRect(0, 0, 1024, 64)
		
		// Create 6 braided strands for authentic rope look
		const numStrands = 6
		const centerY = 32
		const radius = 14
		
		for (let strand = 0; strand < numStrands; strand++) {
			// Natural grey/charcoal color palette
			const strandColors = [
				'#6B6B6B', // Light grey
				'#4A4A4A', // Dark grey  
				'#2F2F2F', // Charcoal
				'#808080', // Silver grey
				'#363636', // Very dark grey
				'#565656'  // Medium dark grey
			]
			
			for (let x = 0; x < 1024; x++) {
				// Braided pattern - each strand follows a different phase
				const angle = (x * 0.015) + (strand * Math.PI / 3)
				const twist = Math.sin(angle) * radius * (0.8 + Math.sin(x * 0.003) * 0.2)
				const y = centerY + twist
				
				// Create individual braided strand
				const strandRadius = 6
				
				for (let dy = -strandRadius; dy <= strandRadius; dy++) {
					const distance = Math.abs(dy) / strandRadius
					const alpha = Math.cos((distance * Math.PI) / 2) // Smooth round strand
					
					if (alpha > 0) {
						// Base strand color
						ctx.fillStyle = strandColors[strand]
						ctx.globalAlpha = alpha * 0.85
						ctx.fillRect(x, y + dy, 1, 1)
						
						// Highlight for roundness
						if (dy < -strandRadius/2) {
							ctx.fillStyle = '#9E9E9E' // Light grey highlight
							ctx.globalAlpha = alpha * 0.3
							ctx.fillRect(x, y + dy, 1, 1)
						}
						
						// Shadow for depth
						if (dy > strandRadius/3) {
							ctx.fillStyle = '#1C1C1C' // Very dark shadow
							ctx.globalAlpha = alpha * 0.4
							ctx.fillRect(x, y + dy, 1, 1)
						}
					}
				}
				ctx.globalAlpha = 1.0
			}
		}
		
		// Add fine fiber texture for realism
		ctx.globalAlpha = 0.12
		for (let i = 0; i < 2000; i++) {
			const x = Math.random() * 1024
			const y = Math.random() * 64
			const fiber = Math.random() > 0.5 ? '#ADADAD' : '#333333'
			ctx.fillStyle = fiber
			ctx.fillRect(x, y, 1, Math.random() > 0.7 ? 2 : 1)
		}
		ctx.globalAlpha = 1.0
		
		const texture = new THREE.CanvasTexture(canvas)
		texture.wrapS = THREE.RepeatWrapping
		texture.wrapT = THREE.RepeatWrapping
		texture.generateMipmaps = true
		texture.minFilter = THREE.LinearMipmapLinearFilter
		texture.magFilter = THREE.LinearFilter
		texture.needsUpdate = true
		return texture
	})

	const [curve] = useState(
		() =>
			new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
	)
	const [dragged, drag] = useState<false | THREE.Vector3>(false)
	const [hovered, hover] = useState(false)

	const [isSmall, setIsSmall] = useState<boolean>(() => {
		if (typeof window !== 'undefined') {
			return window.innerWidth < 1024
		}
		return false
	})

	useEffect(() => {
		const handleResize = (): void => {
			setIsSmall(window.innerWidth < 1024)
		}

		window.addEventListener('resize', handleResize)
		return (): void => window.removeEventListener('resize', handleResize)
	}, [])

	useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
	useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
	useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
	useSphericalJoint(j3, card, [
		[0, 0, 0],
		[0, 1.45, 0],
	])

	useEffect(() => {
		if (hovered) {
			document.body.style.cursor = dragged ? 'grabbing' : 'grab'
			return () => {
				document.body.style.cursor = 'auto'
			}
		}
	}, [hovered, dragged])

	useFrame((state, delta) => {
		if (dragged && typeof dragged !== 'boolean') {
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
		if (fixed.current) {
			;[j1, j2].forEach(ref => {
				if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
				const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
				ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
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
			<group position={[0, 4, 0]}>
				<RigidBody ref={fixed} {...segmentProps} type={'fixed' as RigidBodyProps['type']} />
				<RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody
					position={[2, 0, 0]}
					ref={card}
					{...segmentProps}
					type={dragged ? ('kinematicPosition' as RigidBodyProps['type']) : ('dynamic' as RigidBodyProps['type'])}
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
					color="#4A4A4A"
					depthTest={false}
					resolution={isSmall ? [1400, 2800] : [1400, 1400]}
					useMap={true}
					map={ropeTexture}
					repeat={[-10, 1]}
					lineWidth={1.4}
					opacity={0.98}
					transparent={true}
					roughness={0.8}
					metalness={0.05}
				/>
			</mesh>
		</>
	)
}
