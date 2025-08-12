'use client'

import { useEffect, useRef, useState } from 'react'

const vertexShaderSource = `
  attribute vec2 a_position;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision mediump float;
  
  uniform vec2 iResolution;
  uniform float iTime;
  
  // Implement tanh function for WebGL compatibility
  vec4 tanh_vec4(vec4 x) {
    vec4 e2x = exp(2.0 * x);
    return (e2x - 1.0) / (e2x + 1.0);
  }
  
  float tanh_float(float x) {
    float e2x = exp(2.0 * x);
    return (e2x - 1.0) / (e2x + 1.0);
  }
  
  void mainImage(out vec4 O, in vec2 I) {
    // Resolution for scaling
    vec2 r = iResolution.xy;
    // Centered, ratio corrected, coordinates
    vec2 p = (I + I - r) / r.y;
    // Z depth
    float z = 4.0 - 4.0 * abs(0.7 - dot(p, p));
    // Iterator (x=0)
    vec2 i = vec2(0.0, 0.0);
    // Fluid coordinates
    vec2 f = p * z;
    
    // Clear frag color and loop 8 times
    O = vec4(0.0);
    for(int idx = 0; idx < 8; idx++) {
      i.y += 1.0;
      // Set color waves and line brightness
      vec4 waves = vec4(sin(f).xyxy) + 1.0;
      waves.z = waves.x;
      waves.w = waves.y;
      O += waves * abs(f.x - f.y);
      // Add fluid waves
      f += cos(f.yx * i.y + i + iTime) / i.y + 0.7;
    }
    
    // Tonemap, fade edges and color gradient
    vec4 tonemap = 3.5 * exp(z - 4.0 - p.y * vec4(-1.0, 1.0, 2.0, 0.0));
    // Avoid division by zero
    O = max(O, vec4(0.001));
    tonemap = tonemap / O;
    
    // Apply tanh tonemap
    O = tanh_vec4(tonemap);
    // Subtle light-blue tint and slight desaturation for a sober look
    O.rgb *= vec3(0.75, 0.85, 1.0);
    O.rgb = mix(O.rgb, vec3(1.0), 0.15);
  }
  
  void main() {
    vec4 fragColor;
    mainImage(fragColor, gl_FragCoord.xy);
    gl_FragColor = fragColor;
  }
`

interface PlasmaShaderProps {
	className?: string
}

export default function PlasmaShader({ className = '' }: Readonly<PlasmaShaderProps>) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationFrameRef = useRef<number>(0)
	const [isSupported, setIsSupported] = useState(true)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const gl = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
		if (!gl) {
			setIsSupported(false)
			return
		}

		// Create shader function
		const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
			const shader = gl.createShader(type)
			if (!shader) {
				console.error('Failed to create shader')
				return null
			}

			gl.shaderSource(shader, source)
			gl.compileShader(shader)

			const isCompiled = Boolean(gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			if (!isCompiled) {
				const error = gl.getShaderInfoLog(shader)
				console.error('Shader compile error:', error)
				console.error('Shader source:', source)
				gl.deleteShader(shader)
				setIsSupported(false)
				return null
			}

			return shader
		}

		// Create program function
		const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
			const program = gl.createProgram()
			if (program === null) return null

			gl.attachShader(program, vertexShader)
			gl.attachShader(program, fragmentShader)
			gl.linkProgram(program)

			const isLinked = Boolean(gl.getProgramParameter(program, gl.LINK_STATUS))
			if (!isLinked) {
				console.error('Program link error:', gl.getProgramInfoLog(program))
				gl.deleteProgram(program)
				return null
			}

			return program
		}

		// Create shaders
		const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

		if (!vertexShader || !fragmentShader) {
			setIsSupported(false)
			return
		}

		// Create program
		const program = createProgram(gl, vertexShader, fragmentShader)
		if (!program) {
			setIsSupported(false)
			return
		}

		// Get attribute and uniform locations
		const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
		const resolutionUniformLocation = gl.getUniformLocation(program, 'iResolution')
		const timeUniformLocation = gl.getUniformLocation(program, 'iTime')

		// Create buffer for full-screen quad
		const positionBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)

		let startTime = Date.now()

		const render = () => {
			// Set canvas size to match display size
			const rect = canvas.getBoundingClientRect()
			canvas.width = rect.width * window.devicePixelRatio
			canvas.height = rect.height * window.devicePixelRatio

			gl.viewport(0, 0, canvas.width, canvas.height)

			// Clear canvas
			gl.clearColor(0, 0, 0, 1)
			gl.clear(gl.COLOR_BUFFER_BIT)

			// Use our shader program
			gl.useProgram(program)

			// Set up position attribute
			gl.enableVertexAttribArray(positionAttributeLocation)
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
			gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

			// Set uniforms
			gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)
			gl.uniform1f(timeUniformLocation, (Date.now() - startTime) / 1000)

			// Draw
			gl.drawArrays(gl.TRIANGLES, 0, 6)

			animationFrameRef.current = requestAnimationFrame(render)
		}

		// Handle resize
		const handleResize = () => {
			const rect = canvas.getBoundingClientRect()
			canvas.width = rect.width * window.devicePixelRatio
			canvas.height = rect.height * window.devicePixelRatio
		}

		window.addEventListener('resize', handleResize)
		handleResize()

		// Start rendering
		render()

		// Cleanup
		return () => {
			window.removeEventListener('resize', handleResize)
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}
			gl.deleteProgram(program)
			gl.deleteShader(vertexShader)
			gl.deleteShader(fragmentShader)
			gl.deleteBuffer(positionBuffer)
		}
	}, [])

	if (!isSupported) {
		// Fallback animated gradient for devices that don't support WebGL
		return (
			<div className={`relative h-full w-full overflow-hidden ${className}`}>
				<div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-200 to-cyan-200 opacity-70" />
				<div className="absolute inset-0 animate-pulse bg-gradient-to-tr from-sky-200 via-cyan-200 to-blue-300 opacity-30" />
				<div
					className="absolute inset-0 bg-gradient-to-bl from-blue-100 via-sky-200 to-cyan-300 opacity-20"
					style={{ animation: 'gradientShift 6s ease-in-out infinite alternate' }}
				/>
				<div className="absolute inset-0 bg-white/20" />
				<style>{`
					@keyframes gradientShift {
						0% {
							transform: scale(1) rotate(0deg);
							opacity: 0.4;
						}
						100% {
							transform: scale(1.1) rotate(10deg);
							opacity: 0.6;
						}
					}
				`}</style>
			</div>
		)
	}

	return <canvas ref={canvasRef} className={`h-full w-full ${className}`} style={{ display: 'block' }} />
}
