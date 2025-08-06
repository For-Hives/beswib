'use client'

import React, { useEffect, useRef, useState } from 'react'
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

// Enhanced RigidBody reference interface with Rapier API methods
interface EnhancedRigidBodyRef {
	wakeUp?: () => void
	setNextKinematicTranslation?: (translation: { x: number; y: number; z: number }) => void
	translation?: () => THREE.Vector3
	angvel?: () => THREE.Vector3
	rotation?: () => THREE.Vector3
	setAngvel?: (angularVelocity: { x: number; y: number; z: number }) => void
	lerped?: THREE.Vector3
}

// Type for GLTF assets with specific node structure
interface BibLanyardGLTF {
	nodes: {
		card: THREE.Mesh
		clip: THREE.Mesh
		clamp: THREE.Mesh
	}
	materials: {
		metal: THREE.Material
	}
}

// Enhanced MeshLine geometry interface
interface MeshLineGeometryType extends THREE.BufferGeometry {
	setPoints: (points: THREE.Vector3[]) => void
}

// Component props interfaces
interface BibPriceLanyardProps {
	readonly price: number
	readonly originalPrice?: number
	readonly currency?: string
	readonly position?: [number, number, number]
	readonly gravity?: [number, number, number]
	readonly fov?: number
	readonly transparent?: boolean
	readonly className?: string
}

interface BandProps {
	readonly maxSpeed?: number
	readonly minSpeed?: number
	readonly priceTextureUrl: string
}

// Physics body configuration - using as const for better type inference
const PHYSICS_SEGMENT_PROPS = {
	type: 'dynamic' as const,
	canSleep: true,
	colliders: false,
	angularDamping: 4,
	linearDamping: 4,
} satisfies Partial<RigidBodyProps>

// Physics joint configuration constants
const JOINT_POSITIONS = {
	FIXED: [0, 4, 0] as const,
	J1: [0.5, 0, 0] as const,
	J2: [1, 0, 0] as const,
	J3: [1.5, 0, 0] as const,
	CARD: [2, 0, 0] as const,
} as const

const ROPE_JOINT_CONFIG: [[number, number, number], [number, number, number], number] = [[0, 0, 0], [0, 0, 0], 1]
const SPHERICAL_JOINT_CONFIG: [[number, number, number], [number, number, number]] = [
	[0, 0, 0],
	[0, 1.45, 0],
]

export default function BibPriceLanyard({
	price,
	originalPrice,
	currency = 'EUR',
	position = [0, 0, 30],
	gravity = [0, -40, 0],
	fov = 20,
	transparent = true,
	className = '',
}: BibPriceLanyardProps) {
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

function Band({ maxSpeed = 50, minSpeed = 0, priceTextureUrl }: BandProps) {
	// Typed refs for physics bodies and visual elements
	const bandRef = useRef<THREE.Mesh>(null)
	const fixedRef = useRef<EnhancedRigidBodyRef>(null)
	const j1Ref = useRef<EnhancedRigidBodyRef>(null)
	const j2Ref = useRef<EnhancedRigidBodyRef>(null)
	const j3Ref = useRef<EnhancedRigidBodyRef>(null)
	const cardRef = useRef<EnhancedRigidBodyRef>(null)

	// Three.js vectors for calculations - using readonly to prevent mutation
	const vectorCache = {
		vec: new THREE.Vector3(),
		ang: new THREE.Vector3(),
		rot: new THREE.Vector3(),
		dir: new THREE.Vector3(),
	} as const

	// Load 3D assets with proper typing
	const gltf = useGLTF('/models/card.glb') as unknown as BibLanyardGLTF
	const { nodes, materials } = gltf

	// Load textures
	const lanyardTexture = useTexture('/models/lanyard.png')
	const priceTexture = useTexture(priceTextureUrl)

	// Curve for rope visualization with proper initialization
	const [curve] = useState(() => {
		const initialPoints = Array.from({ length: 4 }, () => new THREE.Vector3())
		return new THREE.CatmullRomCurve3(initialPoints)
	})

	// State for drag interaction with proper typing
	const [dragState, setDragState] = useState<
		| {
				isDragging: false
				dragVector: null
		  }
		| {
				isDragging: true
				dragVector: THREE.Vector3
		  }
	>({
		isDragging: false,
		dragVector: null,
	})

	const [isHovered, setIsHovered] = useState(false)
	const [isSmallScreen, setIsSmallScreen] = useState(() => {
		return typeof window !== 'undefined' ? window.innerWidth < 1024 : false
	})

	// Window resize handler with proper cleanup
	useEffect(() => {
		const handleResize = () => {
			setIsSmallScreen(window.innerWidth < 1024)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Physics joints setup with proper type casting for Rapier compatibility
	useRopeJoint(fixedRef as React.RefObject<never>, j1Ref as React.RefObject<never>, ROPE_JOINT_CONFIG)
	useRopeJoint(j1Ref as React.RefObject<never>, j2Ref as React.RefObject<never>, ROPE_JOINT_CONFIG)
	useRopeJoint(j2Ref as React.RefObject<never>, j3Ref as React.RefObject<never>, ROPE_JOINT_CONFIG)
	useSphericalJoint(j3Ref as React.RefObject<never>, cardRef as React.RefObject<never>, SPHERICAL_JOINT_CONFIG)

	// Cursor management effect
	useEffect(() => {
		if (isHovered) {
			const cursor = dragState.isDragging ? 'grabbing' : 'grab'
			document.body.style.cursor = cursor
			return () => {
				document.body.style.cursor = 'auto'
			}
		}
	}, [isHovered, dragState.isDragging])

	// Main animation loop with improved type safety
	useFrame((state, delta) => {
		const { vec, ang, rot, dir } = vectorCache

		// Handle drag interaction
		if (dragState.isDragging && dragState.dragVector) {
			vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
			dir.copy(vec).sub(state.camera.position).normalize()
			vec.add(dir.multiplyScalar(state.camera.position.length()))

			// Wake up physics bodies
			const physicsRefs = [cardRef, j1Ref, j2Ref, j3Ref, fixedRef]
			physicsRefs.forEach(ref => {
				const current = ref.current
				if (current?.wakeUp) {
					current.wakeUp()
				}
			})

			// Update card position
			const cardCurrent = cardRef.current
			if (cardCurrent?.setNextKinematicTranslation) {
				cardCurrent.setNextKinematicTranslation({
					x: vec.x - dragState.dragVector.x,
					y: vec.y - dragState.dragVector.y,
					z: vec.z - dragState.dragVector.z,
				})
			}
		}

		// Update rope physics and visualization
		const fixedCurrent = fixedRef.current
		if (fixedCurrent?.translation) {
			// Update joint interpolation
			const jointRefs = [j1Ref, j2Ref]
			jointRefs.forEach(ref => {
				const current = ref.current
				if (current?.translation) {
					const translation = current.translation()

					// Initialize lerped position using nullish coalescing
					current.lerped ??= new THREE.Vector3().copy(translation)

					// Calculate smooth interpolation with proper bounds
					const distance = current.lerped.distanceTo(translation)
					const clampedDistance = Math.max(0.1, Math.min(1, distance))
					const interpolationSpeed = delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))

					current.lerped.lerp(translation, interpolationSpeed)
				}
			})

			// Update curve points for rope visualization
			const j3Current = j3Ref.current
			const j2Current = j2Ref.current
			const j1Current = j1Ref.current

			if (j3Current?.translation && j2Current?.lerped && j1Current?.lerped && fixedCurrent.translation) {
				const j3Translation = j3Current.translation()
				const fixedTranslation = fixedCurrent.translation()

				// Update curve points safely
				const points = curve.points
				if (points.length >= 4) {
					points[0].copy(j3Translation)
					points[1].copy(j2Current.lerped)
					points[2].copy(j1Current.lerped)
					points[3].copy(fixedTranslation)
				}

				// Update mesh line geometry with type safety
				const band = bandRef.current
				if (band?.geometry) {
					const geometry = band.geometry as MeshLineGeometryType
					if ('setPoints' in geometry && typeof geometry.setPoints === 'function') {
						geometry.setPoints(curve.getPoints(32))
					}
				}
			}

			// Apply angular damping to card
			const cardCurrent = cardRef.current
			if (cardCurrent?.angvel && cardCurrent.rotation && cardCurrent.setAngvel) {
				const angularVelocity = cardCurrent.angvel()
				const rotation = cardCurrent.rotation()

				ang.copy(angularVelocity)
				rot.copy(rotation)

				cardCurrent.setAngvel({
					x: ang.x,
					y: ang.y - rot.y * 0.25,
					z: ang.z,
				})
			}
		}
	})

	// Configure curve and texture properties
	useEffect(() => {
		curve.curveType = 'chordal'
		lanyardTexture.wrapS = THREE.RepeatWrapping
		lanyardTexture.wrapT = THREE.RepeatWrapping
	}, [curve, lanyardTexture])

	// Event handlers with improved type safety
	const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
		const target = event.target as Element

		if (target && 'releasePointerCapture' in target && typeof target.releasePointerCapture === 'function') {
			target.releasePointerCapture(event.pointerId)
		}

		setDragState({ isDragging: false, dragVector: null })
	}

	const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
		const target = event.target as Element

		if (target && 'setPointerCapture' in target && typeof target.setPointerCapture === 'function') {
			target.setPointerCapture(event.pointerId)
		}

		const cardCurrent = cardRef.current
		if (event.point && cardCurrent?.translation) {
			const cardTranslation = cardCurrent.translation()
			const dragVector = new THREE.Vector3().copy(event.point).sub(vectorCache.vec.copy(cardTranslation))

			setDragState({ isDragging: true, dragVector })
		}
	}

	// Determine rigid body type based on drag state
	const rigidBodyType: RigidBodyProps['type'] = dragState.isDragging ? 'kinematicPosition' : 'dynamic'

	return (
		<>
			<group position={JOINT_POSITIONS.FIXED}>
				{/* Fixed anchor point */}
				<RigidBody ref={fixedRef as React.RefObject<never>} {...PHYSICS_SEGMENT_PROPS} type="fixed" />

				{/* Joint segments */}
				<RigidBody
					position={JOINT_POSITIONS.J1}
					ref={j1Ref as React.RefObject<never>}
					{...PHYSICS_SEGMENT_PROPS}
					type="dynamic"
				>
					<BallCollider args={[0.1]} />
				</RigidBody>

				<RigidBody
					position={JOINT_POSITIONS.J2}
					ref={j2Ref as React.RefObject<never>}
					{...PHYSICS_SEGMENT_PROPS}
					type="dynamic"
				>
					<BallCollider args={[0.1]} />
				</RigidBody>

				<RigidBody
					position={JOINT_POSITIONS.J3}
					ref={j3Ref as React.RefObject<never>}
					{...PHYSICS_SEGMENT_PROPS}
					type="dynamic"
				>
					<BallCollider args={[0.1]} />
				</RigidBody>

				{/* Card with price display */}
				<RigidBody
					position={JOINT_POSITIONS.CARD}
					ref={cardRef as React.RefObject<never>}
					{...PHYSICS_SEGMENT_PROPS}
					type={rigidBodyType}
				>
					<CuboidCollider args={[0.8, 1.125, 0.01]} />
					<group
						scale={2.25}
						position={[0, -1.2, -0.05]}
						onPointerOver={() => setIsHovered(true)}
						onPointerOut={() => setIsHovered(false)}
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
								roughness={0.9}
								metalness={0.8}
							/>
						</mesh>
						<mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
						<mesh geometry={nodes.clamp.geometry} material={materials.metal} />
					</group>
				</RigidBody>
			</group>

			{/* Rope visualization using MeshLine */}
			<mesh ref={bandRef}>
				{React.createElement('meshLineGeometry')}
				{React.createElement('meshLineMaterial', {
					color: 'white',
					depthTest: false,
					resolution: isSmallScreen ? [1000, 2000] : [1000, 1000],
					useMap: true,
					map: lanyardTexture,
					repeat: [-4, 1],
					lineWidth: 1,
				})}
			</mesh>
		</>
	)
}

// Preload 3D model for better performance
useGLTF.preload('/models/card.glb')
