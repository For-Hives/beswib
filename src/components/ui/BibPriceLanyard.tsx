'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import {
	BallCollider,
	CuboidCollider,
	Physics,
	RigidBody,
	useRopeJoint,
	useSphericalJoint,
	type RigidBodyProps,
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'

// Extend Three.js elements for React Three Fiber
extend({ MeshLineGeometry, MeshLineMaterial })

// Type declarations for custom geometry and material
declare module '@react-three/fiber' {
	namespace JSX {
		interface IntrinsicElements {
			meshLineGeometry: any
			meshLineMaterial: any
		}
	}
}

interface BibPriceLanyardProps {
	price: number
	originalPrice?: number
	currency?: string
	position?: [number, number, number]
	gravity?: [number, number, number]
	fov?: number
	transparent?: boolean
	className?: string
}

interface BandProps {
	maxSpeed?: number
	minSpeed?: number
	priceTextureUrl: string
}

// Note: Using any types for RigidBody refs due to complex Rapier type system

// Segment properties for physics bodies
const segmentProps: Partial<RigidBodyProps> = {
	type: 'dynamic',
	canSleep: true,
	colliders: false,
	angularDamping: 4,
	linearDamping: 4,
}

export default function BibPriceLanyard({
	price,
	originalPrice,
	currency = 'EUR',
	position = [0, 0, 30],
	gravity = [0, -40, 0],
	fov = 20,
	transparent = true,
	className = '',
}: Readonly<BibPriceLanyardProps>) {
	const priceTextureUrl = `/api/lanyard/price?price=${price}&originalPrice=${originalPrice ?? ''}&currency=${currency}`

	return (
		<div className={`fixed top-8 right-8 z-[9999] h-[400px] w-[300px] ${className}`}>
			<Canvas
				camera={{ position, fov }}
				gl={{ alpha: transparent }}
				onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
			>
				<ambientLight intensity={Math.PI} />
				<Physics gravity={gravity} timeStep={1 / 60}>
					<Band priceTextureUrl={priceTextureUrl} />
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

function Band({ maxSpeed = 50, minSpeed = 0, priceTextureUrl }: Readonly<BandProps>) {
	// Refs for physics bodies and visual elements
	const band = useRef<THREE.Mesh>(null)
	const fixed = useRef<any>(null)
	const j1 = useRef<any>(null)
	const j2 = useRef<any>(null)
	const j3 = useRef<any>(null)
	const card = useRef<any>(null)

	// Three.js vectors for calculations
	const vec = new THREE.Vector3()
	const ang = new THREE.Vector3()
	const rot = new THREE.Vector3()
	const dir = new THREE.Vector3()

	// Load 3D assets and textures
	const gltf = useGLTF('/models/card.glb')
	const nodes = gltf.nodes as any
	const materials = gltf.materials as any
	const lanyardTexture = useTexture('/models/lanyard.png')
	const priceTexture = useTexture(priceTextureUrl)

	// Curve for rope visualization
	const [curve] = useState(
		() =>
			new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
	)

	// State for drag interaction
	const [dragged, setDragged] = useState<false | THREE.Vector3>(false)
	const [hovered, setHovered] = useState(false)

	// Responsive design state
	const [isSmall, setIsSmall] = useState<boolean>(() => {
		if (typeof window !== 'undefined') {
			return window.innerWidth < 1024
		}
		return false
	})

	// Handle window resize
	useEffect(() => {
		const handleResize = (): void => {
			setIsSmall(window.innerWidth < 1024)
		}

		window.addEventListener('resize', handleResize)
		return (): void => window.removeEventListener('resize', handleResize)
	}, [])

	// Physics joints setup
	useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
	useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
	useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
	useSphericalJoint(j3, card, [
		[0, 0, 0],
		[0, 1.45, 0],
	])

	// Handle cursor changes on hover
	useEffect(() => {
		if (hovered) {
			document.body.style.cursor = dragged !== false ? 'grabbing' : 'grab'
			return () => {
				document.body.style.cursor = 'auto'
			}
		}
		return undefined
	}, [hovered, dragged])

	// Animation frame loop
	useFrame((state, delta) => {
		// Handle drag interaction
		if (dragged !== false && dragged instanceof THREE.Vector3) {
			vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
			dir.copy(vec).sub(state.camera.position).normalize()
			vec.add(dir.multiplyScalar(state.camera.position.length()))

			// Wake up all physics bodies
			const refs = [card, j1, j2, j3, fixed]
			refs.forEach(ref => {
				if (ref.current?.wakeUp) {
					ref.current.wakeUp()
				}
			})

			// Update card position
			if (card.current?.setNextKinematicTranslation) {
				card.current.setNextKinematicTranslation({
					x: vec.x - dragged.x,
					y: vec.y - dragged.y,
					z: vec.z - dragged.z,
				})
			}
		}

		// Update rope physics and visualization
		if (fixed.current?.translation) {
			const joints = [j1, j2]
			joints.forEach(ref => {
				if (ref.current?.translation) {
					// Initialize lerped position if not exists
					if (!ref.current.lerped) {
						ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
					}

					// Calculate smooth interpolation
					const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
					ref.current.lerped.lerp(
						ref.current.translation(),
						delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
					)
				}
			})

			// Update curve points for rope visualization
			if (j3.current?.translation && j2.current?.lerped && j1.current?.lerped) {
				curve.points[0]?.copy(j3.current.translation())
				curve.points[1]?.copy(j2.current.lerped)
				curve.points[2]?.copy(j1.current.lerped)
				curve.points[3]?.copy(fixed.current.translation())

				// Update mesh line geometry
				const geometry = band.current?.geometry as THREE.BufferGeometry & {
					setPoints?: (points: THREE.Vector3[]) => void
				}
				if (geometry?.setPoints) {
					geometry.setPoints(curve.getPoints(32))
				}
			}

			// Apply angular damping to card
			if (card.current?.angvel && card.current?.rotation && card.current?.setAngvel) {
				ang.copy(card.current.angvel())
				rot.copy(card.current.rotation())
				card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
			}
		}
	})

	// Configure curve and texture wrapping
	curve.curveType = 'chordal'
	lanyardTexture.wrapS = THREE.RepeatWrapping
	lanyardTexture.wrapT = THREE.RepeatWrapping

	// Event handlers for drag interaction
	const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
		const target = e.target as HTMLElement
		if (target?.releasePointerCapture) {
			target.releasePointerCapture(e.pointerId)
		}
		setDragged(false)
	}

	const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
		const target = e.target as HTMLElement
		if (target?.setPointerCapture) {
			target.setPointerCapture(e.pointerId)
		}

		if (e.point && card.current?.translation) {
			const cardTranslation = card.current.translation()
			setDragged(new THREE.Vector3().copy(e.point).sub(vec.copy(cardTranslation)))
		}
	}

	return (
		<>
			<group position={[0, 4, 0]}>
				{/* Fixed anchor point */}
				<RigidBody ref={fixed} {...segmentProps} type="fixed" />

				{/* Joint segments */}
				<RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
					<BallCollider args={[0.1]} />
				</RigidBody>

				{/* Card with price display */}
				<RigidBody
					position={[2, 0, 0]}
					ref={card}
					{...segmentProps}
					type={dragged !== false ? 'kinematicPosition' : 'dynamic'}
				>
					<CuboidCollider args={[0.8, 1.125, 0.01]} />
					<group
						scale={2.25}
						position={[0, -1.2, -0.05]}
						onPointerOver={() => setHovered(true)}
						onPointerOut={() => setHovered(false)}
						onPointerUp={handlePointerUp}
						onPointerDown={handlePointerDown}
					>
						{/* Card with custom price texture */}
						<mesh geometry={nodes.card.geometry}>
							<meshPhysicalMaterial
								map={priceTexture}
								map-anisotropy={16}
								clearcoat={1}
								clearcoatRoughness={0.15}
								roughness={0.3}
								metalness={0.1}
							/>
						</mesh>
						<mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
						<mesh geometry={nodes.clamp.geometry} material={materials.metal} />
					</group>
				</RigidBody>
			</group>

			{/* Rope visualization using MeshLine */}
			<mesh ref={band}>
				{/* @ts-expect-error -- meshLineGeometry is extended via extend() */}
				<meshLineGeometry />
				{/* @ts-expect-error -- meshLineMaterial is extended via extend() */}
				<meshLineMaterial
					color="white"
					depthTest={false}
					resolution={isSmall ? [1000, 2000] : [1000, 1000]}
					useMap
					map={lanyardTexture}
					repeat={[-4, 1]}
					lineWidth={1}
				/>
			</mesh>
		</>
	)
}

// Preload 3D model for better performance
useGLTF.preload('/models/card.glb')
