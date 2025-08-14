'use client'

import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'

import { usePathname } from 'next/navigation'
import * as THREE from 'three'

/**
 * Props interface for the MountainShader component
 * @param className - CSS classes to apply to the container div
 */
interface MountainShaderProps {
	className?: string
}

/**
 * Custom hook for automatic camera positioning
 *
 * This hook calculates the optimal camera position to frame the mountain landscape
 * perfectly within the viewport, taking into account the dynamic geometry size and
 * the canvas dimensions.
 *
 * The camera automatically adjusts its Z position to ensure the entire mountain
 * range is visible without distortion, regardless of screen size.
 */
function useAutoCamera() {
	const { size, camera } = useThree()

	useEffect(() => {
		// Calculate optimal camera position based on dynamic geometry and canvas size
		const geometryWidth = 16
		const geometryHeight = 9

		// Calculate required Z distance to frame the entire plane
		const aspectRatio = size.width / size.height
		const fov = 20 // Field of view in degrees
		const fovRadians = (fov * Math.PI) / 180

		// Calculate Z distance for perfect framing
		let distanceZ
		if (aspectRatio > 16 / 9) {
			// Canvas is wider than 16:9 - frame based on height
			distanceZ = geometryHeight / 2 / Math.tan(fovRadians / 2)
		} else {
			// Canvas is taller than 16:9 - frame based on width
			distanceZ = geometryWidth / 2 / Math.tan(fovRadians / 2) / aspectRatio
		}

		// Add larger margin for better visual composition with increased coverage
		// This ensures the larger geometry is properly framed
		distanceZ *= 1.8

		// Y position to center the landscape vertically
		// Mountains are at posY = 0.3, so we lower the camera slightly
		const offsetY = 10

		// Set camera position and orientation
		camera.position.set(0, offsetY, distanceZ)
		camera.lookAt(0, 0, 0)
		camera.updateProjectionMatrix()
	}, [camera, size])

	return null
}

/**
 * Internal component for the Three.js scene
 *
 * This component handles the actual 3D scene setup, shader compilation,
 * and animation loop. It's separated from the main component to keep
 * the Three.js logic isolated and maintainable.
 */
function MountainScene({ containerSize }: { containerSize: { width: number; height: number } }) {
	const meshRef = useRef<THREE.Mesh>(null)
	const [vertexShader, setVertexShader] = useState('')
	const [fragmentShader, setFragmentShader] = useState('')

	// Use the automatic camera positioning hook
	useAutoCamera()

	/**
	 * Load and compile the shader code
	 *
	 * This effect runs once on component mount to set up the vertex and
	 * fragment shaders. The fragment shader contains the complex mountain
	 * generation algorithm converted from Shadertoy format to WebGL.
	 */
	useEffect(() => {
		// Standard vertex shader for 2D plane rendering
		const vertexShaderCode = `
			varying vec2 vUv;
			void main() {
				vec4 modelPosition = modelMatrix * vec4(position, 1.0);
				vec4 viewPosition = viewMatrix * modelPosition;
				vec4 projectionPosition = projectionMatrix * viewPosition;
				gl_Position = projectionPosition;
				vUv = uv;
			}
		`
		setVertexShader(vertexShaderCode)

		/**
		 * Fragment shader: Mountain landscape generation algorithm
		 *
		 * This shader creates an animated mountain landscape with:
		 * - Procedurally generated mountain ranges using noise functions
		 * - Animated sun with atmospheric effects
		 * - Dynamic cloud formations
		 * - Hatching patterns inside mountains for texture
		 * - Horizon effects and atmospheric perspective
		 * - Grain and vignette for film-like quality
		 *
		 * The algorithm is based on Shadertoy's mountain generation
		 * but adapted for WebGL compatibility and performance.
		 */
		const fragmentShaderCode = `
			// ALL Shadertoy uniforms explicitly declared for compatibility
			uniform float iTime;                 // shader playback time (in seconds)
			uniform float iTimeDelta;            // render time (in seconds)
			uniform float iFrameRate;            // shader frame rate
			uniform int iFrame;                  // shader playback frame
			uniform float iChannelTime[4];       // channel playback time (in seconds)
			uniform vec3 iChannelResolution[4];  // channel resolution (in pixels)
			uniform vec4 iMouse;                 // mouse pixel coords
			uniform vec4 iDate;                  // (year, month, day, time in seconds)
			uniform float iSampleRate;           // sound sample rate
			uniform vec2 iResolution;            // viewport resolution (in pixels)
			uniform sampler2D iChannel0;         // input channel
			uniform sampler2D iChannel1;         // input channel
			uniform sampler2D iChannel2;         // input channel
			uniform sampler2D iChannel3;         // input channel

			varying vec2 vUv;

			// Utility functions from mountainCommon.glsl
			/**
			 * Random number generator based on 2D input
			 * Creates pseudo-random values for procedural generation
			 */
			float rand2(vec2 p) {
				return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
			}

			/**
			 * Hash function for 2D coordinates
			 * Used for consistent random value generation
			 */
			vec2 hash21(float p) {
				vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
				p3 += dot(p3, p3.yzx + 33.33);
				return fract((p3.xx+p3.yz)*p3.zy);
			}

			// Optimized noise functions from mountainCommon.glsl
			/**
			 * Optimized modulo function for better performance
			 * Replaces the standard mod() function with a faster implementation
			 */
			vec4 glslmod(vec4 x, vec4 y) { return x - y * floor(x / y); }
			vec3 glslmod(vec3 x, vec3 y) { return x - y * floor(x / y); }
			vec2 glslmod(vec2 x, vec2 y) { return x - y * floor(x / y); }
			
			/**
			 * Permutation function for Simplex noise
			 * Optimized version for better performance
			 */
			vec3 permute_optimizedSnoise2D(in vec3 x) { return glslmod(x*x*34.0 + x, vec3(289.0)); }

			/**
			 * Optimized Simplex noise function
			 * Generates smooth, continuous noise for natural-looking terrain
			 * This is the core algorithm for creating the mountain shapes
			 */
			float optimizedSnoise(in vec2 v) {
				vec2 i = floor((v.x + v.y)*.36602540378443 + v);
				vec2 x0 = (i.x + i.y)*.211324865405187 + v - i;
				float s = step(x0.x, x0.y);
				vec2 j = vec2(1.0 - s, s);
				vec2 x1 = x0 - j + .211324865405187;
				vec2 x3 = x0 - .577350269189626;
				i = glslmod(i, vec2(289.));
				vec3 p = permute_optimizedSnoise2D(permute_optimizedSnoise2D(i.y + vec3(0, j.y, 1)) + i.x + vec3(0, j.x, 1));
				vec3 m = max(.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x3, x3)), 0.);
				vec3 x = fract(p * .024390243902439) * 2. - 1.;
				vec3 h = abs(x) - .5;
				vec3 a0 = x - floor(x + .5);
				return .5 + 65. * dot(pow(m, vec3(4.0))*(-0.85373472095314*(a0*a0 + h * h) + 1.79284291400159), a0 * vec3(x0.x, x1.x, x3.x) + h * vec3(x0.y, x1.y, x3.y));
			}

			/**
			 * Signed distance function for circles
			 * Used for creating the sun and other circular elements
			 * Returns distance to circle edge and gradient direction
			 */
			vec3 sdgCircle( in vec2 p, in float r ) {
				float d = length(p);
				return vec3( d-r, p/d );
			}

			/**
			 * Mountain height calculation function
			 *
			 * This is the core algorithm that generates the mountain ranges:
			 * 1. Creates a series of connected mountain peaks
			 * 2. Generates 90-degree angle mountains between points
			 * 3. Interpolates heights for smooth transitions
			 * 4. Creates the characteristic jagged mountain silhouette
			 *
			 * @param pos - Current position along the mountain range
			 * @param from - Output: starting point of current mountain segment
			 * @param to - Output: ending point of current mountain segment  
			 * @param blend - Output: interpolation factor between points
			 * @return float - Height at the current position
			 */
			float getH(
				float pos,
				out vec2 from, out vec2 to, out float blend
			) {
				float n;
				float i = floor(pos);
				float f = pos - i;
				vec2 rand = vec2(0.4, 0.95);

				// x is i-offset, y is peak height.
				vec2 sub = vec2(0.5, 0.0);
				vec2 add = vec2(0.5, 1.1 - rand.y);
				vec2 l = (hash21((i-1.0)) - sub) * rand + add;
				vec2 c = (hash21(i) - sub) * rand + add;
				vec2 r = (hash21((i+1.0)) - sub) * rand + add;

				l.x = (i - 1.0) + l.x;
				c.x = i + c.x;
				r.x = (i + 1.0) + r.x;

				if(pos < c.x) {
					from = l;
					to = c;
				} else {
					from = c;
					to = r;
				}

				// Make 90-degree angle mountains
				// between from-to points by creating mid point.
				float tl = 0.5*(to.x - from.x - to.y + from.y);
				vec2 mid = to + vec2(-1.0, 1.0)*tl;

				if(pos < mid.x) {
					to = mid;
				} else {
					from = mid;
				}

				// Linearly interpolate between from-to points.
				blend = ((pos - from.x) / (to.x - from.x));
				n = mix(from.y, to.y, blend);

				return n;
			}

			/**
			 * Main fragment shader function
			 *
			 * This function is called for every pixel and creates the complete
			 * mountain landscape. It combines multiple effects:
			 * - Sun rendering with atmospheric scattering
			 * - Mountain range generation using the getH function
			 * - Hatching patterns inside mountains
			 * - Horizon effects and atmospheric perspective
			 * - Cloud generation using noise
			 * - Color grading and post-processing effects
			 */
			void main() {
				// Convert vUv to fragCoord to maintain original logic
				vec2 fragCoord = vUv * iResolution;

				// EXACT code from mainImage but with main() instead of mainImage()
				float mx = max(iResolution.x, iResolution.y);
				vec2 uv = fragCoord.xy / mx;
				vec2 nuv = fragCoord.xy / iResolution.xy;
				vec2 pos = uv - (iResolution.xy)*0.5/mx;

				float col = 1.0;

				// Generate noise for various effects
				float sNoise = optimizedSnoise(vec2(pos.x*15.0, 0.0));

				// Sun rendering with atmospheric effects
				vec3 circle = sdgCircle(pos + vec2(0.2, -0.05), 0.1);
				col *= clamp(400.0*abs(circle.x) - 1.0*(0.5 + sin(sNoise*5.0 + 0.5*iTime)), 0.0, 1.0);
				col *= clamp(1.3 - clamp(-circle.x*800.0 - 7.0, 0.0, 1.0)*cos(circle.x*800.0 - 1.0*(1.0 + cos(sNoise*5.0+0.5*iTime))), 0.0, 1.0);

				// SKEW REMOVED to avoid distortion
				// pos -= 0.5*vec2(pos.y, - pos.x);

				// Horizontal scroll animation
				pos.x += iTime*0.01;

				// Mountain range generation
				float scaleX = 5.0;
				vec2 from, to;
				float blend;
				float noise = getH(
					scaleX*pos.x, // Input position
					from, to, blend // Output parameters
				);

				// Additional wiggle to the mountain lines for natural variation
				noise -= 0.05*sNoise;

				float posY = 0.3; // Base height for mountains
				float scaleY = 1.0 / scaleX;

				float scaledNoise = scaleY*noise;
				float mountHeight = posY + scaledNoise;

				// Mountain outline rendering
				float hatchLength = length(to - from);
				float hatchWidth = mix(0.5, 3.0, 1.0 - clamp(blend, 0.0, 1.0));
				col = min(col, iResolution.y*(abs(nuv.y - mountHeight) - hatchWidth/iResolution.y));

				// Hatching patterns inside mountains for texture
				float mountGrad = clamp(scaledNoise - nuv.y + posY, 0.0, 1.0) / scaledNoise;
				if((nuv.y < mountHeight - 0.0025) && (nuv.y > posY)) {
					col = ((
						+ mix(0.5, 3.0, mountGrad)*abs(cos((1.0-pow(0.025*sNoise + mountGrad, 0.5))*(mix(1.0, noise, 0.8))*3.14159265359*25.0))
						+ clamp(3.0 + 10.0*cos(pos.x * 32.0 - cos(pow(mountGrad, 1.25)*13.0)), 0.0, 1.0)
						- clamp(3.0 + 10.0*cos(2.0 + pos.x * 32.0 - cos(pow(mountGrad, 1.25)*13.0)), 0.0, 1.0)
					));
				}

				// Horizon effects and atmospheric perspective
				float belowHorizon = clamp(1.0 - (posY - nuv.y) / posY + 0.0*sNoise, 0.0, 1.0);
				float aboveHorizonMask = clamp(iResolution.y*(belowHorizon - 1.0 + 1.0/iResolution.y), 0.0, 1.0);
				col = min(col, max(aboveHorizonMask, clamp(max(
					clamp(1.1 - belowHorizon*belowHorizon, 0.0, 1.0),
					clamp(abs(cos(0.2*belowHorizon*belowHorizon*3.14159265359*450.0*posY)), 0.0, 1.0)
					+ clamp(0.5 + cos(pos.x * 27.0 + cos(belowHorizon*belowHorizon*belowHorizon*13.0)), 0.0, 1.0)
					- clamp(-0.5 + cos(pos.x * 32.0 + cos(belowHorizon*belowHorizon*belowHorizon*13.0)), 0.0, 1.0)
				), 0.0, 1.0)));

				// Cloud generation using multiple noise layers
				float clouds = clamp(
					2.0*abs(optimizedSnoise(nuv * vec2(2.0, 4.0) + vec2(0.05*iTime, 0.0)) - 0.5)
					+ 1.0*optimizedSnoise(nuv * vec2(5.0, 16.0) + vec2(0.2*iTime, 0.0)), 0.0, 1.0
				);
				col = max(col, clamp((nuv.y + 0.25)*clouds*clouds - 1.0 + clouds, 0.0, 1.0));

				// Color grading: blue mountains to light sky
				vec3 color = mix(
					vec3(0.0, 0.2, 0.45),  // Dark blue for mountains
					vec3(0.8, 0.85, 0.89),  // Light blue-gray for sky
					1.0-col
				);

				// Film grain effect for texture
				color += 1.5*0.75*((rand2(uv)-0.5)*0.07);

				// Vignette effect for cinematic look
				vec2 vigenteSize = 0.3*iResolution.xy;
				float sdf = -length(fragCoord.xy - iResolution.xy*0.5) / vigenteSize.x;
				float percent = 0.8;
				sdf = (clamp(percent + sdf, 0.0, 1.0) - percent) / (1.0 - percent);
				sdf = mix(1.0, sdf, 0.05);
				color *= sdf;

				// Output final color
				gl_FragColor = vec4(color, 1.0);
			}
		`
		setFragmentShader(fragmentShaderCode)
	}, [])

	/**
	 * Animation loop update
	 *
	 * This function runs every frame to update the shader uniforms,
	 * specifically the time value that drives all animations.
	 */
	useFrame((state: RootState) => {
		if (meshRef.current?.material) {
			const material = meshRef.current.material as THREE.ShaderMaterial
			const uniforms = material.uniforms as { iTime?: { value: number } }
			if (uniforms.iTime) {
				uniforms.iTime.value = state.clock.getElapsedTime()
			}
		}
	})

	/**
	 * Shader uniforms configuration
	 *
	 * These uniforms provide data to the shader:
	 * - iTime: Current time for animations
	 * - iResolution: Canvas dimensions (now dynamic)
	 * - iMouse: Mouse position for interactive effects
	 * - iChannel*: Texture channels (unused but required for compatibility)
	 *
	 * All uniforms are declared to maintain Shadertoy compatibility
	 * even though some are not actively used in this implementation.
	 */
	const uniforms = useMemo(
		() => ({
			iTimeDelta: {
				value: 0.0,
				type: 'f',
			},
			iTime: {
				value: 0.0,
				type: 'f',
			},
			iSampleRate: {
				value: 44100.0,
				type: 'f',
			},
			iResolution: {
				value: new THREE.Vector2(containerSize.width, containerSize.height), // Dynamic resolution
				type: 'v2',
			},
			iMouse: {
				value: new THREE.Vector4(0, 0, 0, 0),
				type: 'v4',
			},
			iFrameRate: {
				value: 60.0,
				type: 'f',
			},
			iFrame: {
				value: 0,
				type: 'i',
			},
			iDate: {
				value: new THREE.Vector4(2024, 1, 1, 0),
				type: 'v4',
			},
			iChannelTime: {
				value: [0.0, 0.0, 0.0, 0.0],
				type: 'fv1',
			},
			iChannelResolution: {
				value: [new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1)],
				type: 'v3v',
			},
			iChannel3: {
				value: null,
				type: 't',
			},
			iChannel2: {
				value: null,
				type: 't',
			},
			iChannel1: {
				value: null,
				type: 't',
			},
			iChannel0: {
				value: null,
				type: 't',
			},
		}),
		[] // Ne pas dépendre de containerSize pour éviter la recréation du matériau
	)

	/**
	 * Effect to update iResolution uniform when container size changes
	 * This ensures the shader renders correctly after navigation or resize
	 */
	useEffect(() => {
		if (meshRef.current?.material) {
			const material = meshRef.current.material as THREE.ShaderMaterial
			const materialUniforms = material.uniforms as {
				iResolution?: { value: THREE.Vector2 }
				iTime?: { value: number }
			}

			// Update resolution
			if (materialUniforms.iResolution) {
				materialUniforms.iResolution.value.set(containerSize.width, containerSize.height)
			}

			// Ensure iTime is properly initialized for animation continuity
			if (materialUniforms.iTime) {
				materialUniforms.iTime.value = performance.now() / 1000
			}
		}
	}, [containerSize.width, containerSize.height])

	// Don't render until shaders are loaded
	if (!vertexShader || !fragmentShader) return null

	return (
		<mesh ref={meshRef}>
			{/* 16:9 geometry to prevent distortion */}
			<planeGeometry args={[16, 9]} />
			<shaderMaterial
				uniforms={uniforms}
				vertexShader={vertexShader}
				fragmentShader={fragmentShader}
				side={THREE.DoubleSide}
			/>
		</mesh>
	)
}

/**
 * MountainShader - Animated mountain landscape background component
 *
 * This component creates a procedurally generated, animated mountain landscape
 * using WebGL shaders and Three.js. It's designed to provide a visually
 * appealing background for authentication pages.
 *
 * Key features:
 * - Procedurally generated mountain ranges using noise algorithms
 * - Animated sun with atmospheric effects
 * - Dynamic cloud formations
 * - Smooth scrolling animation
 * - Responsive design that adapts to container size
 * - Optimized performance using WebGL shaders
 *
 * The component uses React Three Fiber for React integration and
 * custom GLSL shaders for the mountain generation algorithm.
 *
 * @param className - CSS classes for styling the container
 */
export default function MountainShader({ className = '' }: MountainShaderProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [containerSize, setContainerSize] = useState({ width: 1920, height: 1080 })
	const pathname = usePathname()

	/**
	 * Resize observer to dynamically adapt to container size changes
	 * This ensures the animation always fills 100% of the available space
	 * while maintaining the 16:9 aspect ratio
	 */
	useEffect(() => {
		if (!containerRef.current) return

		const calculateSize = () => {
			if (!containerRef.current) return

			const { width, height } = containerRef.current.getBoundingClientRect()

			// Ne pas recalculer si les dimensions sont 0
			if (width === 0 || height === 0) return

			let finalWidth = width
			let finalHeight = height

			const containerAspect = width / height
			const targetAspect = 16 / 9

			if (containerAspect > targetAspect) {
				finalHeight = height
				finalWidth = height * targetAspect
			} else {
				finalWidth = width
				finalHeight = width / targetAspect
			}

			const coverageMultiplier = 2.6
			setContainerSize({
				width: finalWidth * coverageMultiplier,
				height: finalHeight * coverageMultiplier,
			})
		}

		// Initial calculation
		calculateSize()

		const resizeObserver = new ResizeObserver(calculateSize)
		resizeObserver.observe(containerRef.current)

		return () => {
			resizeObserver.disconnect()
		}
	}, [])

	/**
	 * Effect to handle navigation-based resize
	 * This triggers when pathname changes (sign-in <-> sign-up navigation)
	 */
	useEffect(() => {
		if (!containerRef.current) return

		const calculateSize = () => {
			if (!containerRef.current) return

			const { width, height } = containerRef.current.getBoundingClientRect()

			if (width === 0 || height === 0) return

			let finalWidth = width
			let finalHeight = height

			const containerAspect = width / height
			const targetAspect = 16 / 9

			if (containerAspect > targetAspect) {
				finalHeight = height
				finalWidth = height * targetAspect
			} else {
				finalWidth = width
				finalHeight = width / targetAspect
			}

			const coverageMultiplier = 2.6
			setContainerSize({
				width: finalWidth * coverageMultiplier,
				height: finalHeight * coverageMultiplier,
			})
		}

		// Calculs échelonnés pour s'adapter aux différentes vitesses de rendu
		const timeouts = [setTimeout(calculateSize, 16), setTimeout(calculateSize, 100), setTimeout(calculateSize, 300)]

		return () => {
			timeouts.forEach(clearTimeout)
		}
	}, [pathname])

	return (
		<div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }}>
			{/* 
				Three.js Canvas setup
				- camera: Initial camera position (will be overridden by useAutoCamera)
				- fov: Field of view for perspective projection
				- style: Dynamic dimensions based on container size
				- gl: Preserve drawing buffer for potential screenshots
			*/}
			<Canvas
				key={`${pathname}-${containerSize.width}-${containerSize.height}`} // Force remount sur navigation et resize
				camera={{ position: [0, 0, 25], fov: 10 }}
				style={{
					width: `${containerSize.width}px`,
					height: `${containerSize.height}px`,
				}}
				gl={{ preserveDrawingBuffer: true }}
			>
				<MountainScene containerSize={containerSize} />
			</Canvas>
		</div>
	)
}
