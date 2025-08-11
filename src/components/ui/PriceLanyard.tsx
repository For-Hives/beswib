/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

'use client'

import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import React, { useEffect, useRef, useState } from 'react'

import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'

// Extend fiber to recognize MeshLine components
extend({ MeshLineMaterial, MeshLineGeometry })

interface PriceLanyardProps {
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

export default function PriceLanyard({
	transparent = true,
	price,
	position = [0, 0, 30],
	originalPrice,
	gravity = [0, -40, 0],
	fov = 20,
	currency = 'EUR',
	className = '',
}: PriceLanyardProps) {
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

function Band({ priceTextureUrl, minSpeed = 0, maxSpeed = 50 }: BandProps) {
	// Refs with explicit types for mesh and physics bodies
	const band = useRef<any>(null)
	const fixed = useRef<any>(null)
	const j1 = useRef<any>(null)
	const j2 = useRef<any>(null)
	const j3 = useRef<any>(null)
	const card = useRef<any>(null)

	// THREE.js vector objects for calculations
	const vec = new THREE.Vector3()
	const ang = new THREE.Vector3()
	const rot = new THREE.Vector3()
	const dir = new THREE.Vector3()

	// Physics properties for rigid body segments
	const segmentProps = {
		type: 'dynamic' as const,
		linearDamping: 4,
		canSleep: true,
		angularDamping: 4,
	}

	// Load 3D assets
	const { nodes, materials } = useGLTF('/models/card.glb') as any
	const lanyardTexture = useTexture('/models/lanyard.png')
	const priceTexture = useTexture(priceTextureUrl)

	// Curve for the lanyard rope
	const [curve] = useState(
		() =>
			new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
	)

	// Interaction states
	const [dragged, drag] = useState<false | THREE.Vector3>(false)
	const [hovered, hover] = useState(false)
	const [isSmall, setIsSmall] = useState<boolean>(() => {
		if (typeof window !== 'undefined') {
			return window.innerWidth < 1024
		}
		return false
	})

	// Physics joints connecting the rope segments
	useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
	useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
	useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
	useSphericalJoint(j3, card, [
		[0, 0, 0],
		[0, 1.45, 0],
	])

	// Update cursor style when hovering
	useEffect(() => {
		if (hovered) {
			document.body.style.cursor = dragged ? 'grabbing' : 'grab'
			return () => {
				document.body.style.cursor = 'auto'
			}
		}
	}, [hovered, dragged])

	// Handle window resize for responsive behavior
	useEffect(() => {
		const handleResize = (): void => {
			setIsSmall(window.innerWidth < 1024)
		}
		window.addEventListener('resize', handleResize)
		return (): void => window.removeEventListener('resize', handleResize)
	}, [])

	// Animation frame loop for physics and rope simulation
	useFrame((state, delta) => {
		// Handle dragging interaction
		if (dragged && typeof dragged !== 'boolean') {
			vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
			dir.copy(vec).sub(state.camera.position).normalize()
			vec.add(dir.multiplyScalar(state.camera.position.length()))
			// Wake up all physics bodies when dragging
			;[card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp())
			card.current?.setNextKinematicTranslation({
				z: vec.z - dragged.z,
				y: vec.y - dragged.y,
				x: vec.x - dragged.x,
			})
		}

		// Update rope simulation
		if (fixed.current) {
			// Smoothly interpolate rope segment positions
			;[j1, j2].forEach(ref => {
				if (!ref.current.lerped) {
					ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
				}
				const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
				ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
			})

			// Update curve points for rope visualization
			curve.points[0].copy(j3.current.translation())
			curve.points[1].copy(j2.current.lerped)
			curve.points[2].copy(j1.current.lerped)
			curve.points[3].copy(fixed.current.translation())
			band.current?.geometry.setPoints(curve.getPoints(32))

			// Apply angular velocity dampening to card rotation
			ang.copy(card.current.angvel())
			rot.copy(card.current.rotation())
			card.current.setAngvel({
				z: ang.z,
				y: ang.y - rot.y * 0.25,
				x: ang.x,
			})
		}
	})

	// Configure curve and texture settings
	curve.curveType = 'chordal'
	lanyardTexture.wrapS = lanyardTexture.wrapT = THREE.RepeatWrapping

	return (
		<>
			<group position={[0, 4, 0]}>
				{/* Fixed anchor point */}
				<RigidBody ref={fixed} {...segmentProps} type="fixed" />

				{/* Rope segments with physics colliders */}
				<RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
					<BallCollider args={[0.1]} />
				</RigidBody>

				{/* Price card with interactive physics */}
				<RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
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
							drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
						}}
					>
						{/* Card mesh with dynamic price texture */}
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
						{/* Metal clip and clamp components */}
						<mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
						<mesh geometry={nodes.clamp.geometry} material={materials.metal} />
					</group>
				</RigidBody>
			</group>

			{/* Rope visualization using MeshLine */}
			<mesh ref={band}>
				{React.createElement('meshLineGeometry', {})}
				{React.createElement('meshLineMaterial', {
					useMap: true,
					resolution: isSmall ? [1000, 2000] : [1000, 1000],
					repeat: [-4, 1],
					map: lanyardTexture,
					lineWidth: 1,
					depthTest: false,
					color: 'white',
				})}
			</mesh>
		</>
	)
}

// Preload assets to prevent loading issues
useGLTF.preload('/models/card.glb')
