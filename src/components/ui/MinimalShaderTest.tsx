'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function MinimalScene() {
	const meshRef = useRef<THREE.Mesh>(null)

	// Shader minimal pour tester
	const vertexShader = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`

	const fragmentShader = `
		uniform float iTime;
		varying vec2 vUv;
		
		void main() {
			vec2 uv = vUv;
			float time = iTime;
			
			// Couleur de base qui change avec le temps
			vec3 color = vec3(
				0.5 + 0.5 * sin(time + uv.x * 3.14159),
				0.5 + 0.5 * sin(time * 0.7 + uv.y * 3.14159),
				0.5 + 0.5 * sin(time * 0.3)
			);
			
			// Ajout d'un motif simple
			float pattern = sin(uv.x * 20.0 + time) * sin(uv.y * 20.0 + time * 0.5);
			color += pattern * 0.2;
			
			gl_FragColor = vec4(color, 1.0);
		}
	`

	// Mise à jour du temps
	useFrame(state => {
		if (meshRef.current?.material) {
			const material = meshRef.current.material as THREE.ShaderMaterial
			if (material.uniforms?.iTime) {
				material.uniforms.iTime.value = state.clock.getElapsedTime()
			}
		}
	})

	const uniforms = useMemo(() => ({
		iTime: { value: 0.0, type: 'f' }
	}), [])

	return (
		<mesh ref={meshRef}>
			<planeGeometry args={[2, 2]} />
			<shaderMaterial
				vertexShader={vertexShader}
				fragmentShader={fragmentShader}
				uniforms={uniforms}
			/>
		</mesh>
	)
}

export default function MinimalShaderTest({ className = '' }: { className?: string }) {
	return (
		<div className={className}>
			<Canvas camera={{ position: [0, 0, 1], fov: 75 }} style={{ width: '100%', height: '100%' }}>
				<MinimalScene />
			</Canvas>
		</div>
	)
}
