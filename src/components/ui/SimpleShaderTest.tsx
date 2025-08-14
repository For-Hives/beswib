'use client'

import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import * as THREE from 'three'

function SimpleBox() {
	return (
		<mesh>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color="orange" />
		</mesh>
	)
}

export default function SimpleShaderTest({ className = '' }: { className?: string }) {
	return (
		<div className={className}>
			<Canvas camera={{ position: [0, 0, 3], fov: 75 }} style={{ width: '100%', height: '100%' }}>
				<ambientLight intensity={0.5} />
				<pointLight position={[10, 10, 10]} />
				<SimpleBox />
				<OrbitControls />
			</Canvas>
		</div>
	)
}
