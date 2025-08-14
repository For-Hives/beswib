'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

import * as THREE from 'three'

interface MountainShaderProps {
	className?: string
	debug?: boolean
}

// Composant interne pour la scène Three.js
function MountainScene() {
	const meshRef = useRef<THREE.Mesh>(null)
	const [vertexShader, setVertexShader] = useState('')
	const [fragmentShader, setFragmentShader] = useState('')

	// Charger les shaders
	useEffect(() => {
		// Shader vertex standard
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

		// Shader fragment EXACTEMENT de mountainImage.glsl mais adapté WebGL
		const fragmentShaderCode = `
			// TOUS les uniforms Shadertoy déclarés explicitement
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
			
			// Fonctions utilitaires de mountainCommon.glsl
			float rand2(vec2 p) {
				return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
			}
			
			vec2 hash21(float p) {
				vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
				p3 += dot(p3, p3.yzx + 33.33);
				return fract((p3.xx+p3.yz)*p3.zy);
			}
			
			// Noise optimisé de mountainCommon.glsl
			vec4 glslmod(vec4 x, vec4 y) { return x - y * floor(x / y); }
			vec3 glslmod(vec3 x, vec3 y) { return x - y * floor(x / y); }
			vec2 glslmod(vec2 x, vec2 y) { return x - y * floor(x / y); }
			vec3 permute_optimizedSnoise2D(in vec3 x) { return glslmod(x*x*34.0 + x, vec3(289.0)); }
			
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
			
			// Fonction sdgCircle de mountainCommon.glsl
			vec3 sdgCircle( in vec2 p, in float r ) {
				float d = length(p); 
				return vec3( d-r, p/d ); 
			}
			
			// Fonction getH EXACTEMENT de mountainImage.glsl
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
			
			// MAIN EXACTEMENT de mountainImage.glsl mais adapté WebGL
			void main() {
				// Convertir vUv en fragCoord pour garder la logique originale
				vec2 fragCoord = vUv * iResolution;
				
				// Code EXACT de mainImage mais avec main() au lieu de mainImage()
				float mx = max(iResolution.x, iResolution.y);
				vec2 uv = fragCoord.xy / mx;
				vec2 nuv = fragCoord.xy / iResolution.xy;
				vec2 pos = uv - (iResolution.xy)*0.5/mx;
				
				float col = 1.0;

				float sNoise = optimizedSnoise(vec2(pos.x*15.0, 0.0));

				// Sun.
				vec3 circle = sdgCircle(pos + vec2(0.2, -0.05), 0.1);
				col *= clamp(400.0*abs(circle.x) - 1.0*(0.5 + sin(sNoise*5.0 + 0.5*iTime)), 0.0, 1.0);
				col *= clamp(1.3 - clamp(-circle.x*800.0 - 7.0, 0.0, 1.0)*cos(circle.x*800.0 - 1.0*(1.0 + cos(sNoise*5.0+0.5*iTime))), 0.0, 1.0);

				// DÉFORMATION SUPPRIMÉE pour éviter le skew
				// pos -= 0.5*vec2(pos.y, - pos.x);

				// Horizontal scroll.
				pos.x += iTime*0.01;

				float scaleX = 5.0;
				vec2 from, to; 
				float blend;
				float noise = getH(
					scaleX*pos.x, // In
					from, to, blend // Out
				);
				
				// Additional wiggle to the lines.
				noise -= 0.05*sNoise;

				float posY = 0.3;
				float scaleY = 1.0 / scaleX;

				float scaledNoise = scaleY*noise;
				float mountHeight = posY + scaledNoise;

				float hatchLength = length(to - from);
				float hatchWidth = mix(0.5, 3.0, 1.0 - clamp(blend, 0.0, 1.0));
				col = min(col, iResolution.y*(abs(nuv.y - mountHeight) - hatchWidth/iResolution.y));
				
				// Hatching inside mountains.
				float mountGrad = clamp(scaledNoise - nuv.y + posY, 0.0, 1.0) / scaledNoise;
				if((nuv.y < mountHeight - 0.0025) && (nuv.y > posY)) {
					col = ((
						+ mix(0.5, 3.0, mountGrad)*abs(cos((1.0-pow(0.025*sNoise + mountGrad, 0.5))*(mix(1.0, noise, 0.8))*3.14159265359*25.0))
						+ clamp(3.0 + 10.0*cos(pos.x * 32.0 - cos(pow(mountGrad, 1.25)*13.0)), 0.0, 1.0)
						- clamp(3.0 + 10.0*cos(2.0 + pos.x * 32.0 - cos(pow(mountGrad, 1.25)*13.0)), 0.0, 1.0)
					));
				}

				// Horizon.
				float belowHorizon = clamp(1.0 - (posY - nuv.y) / posY + 0.01*sNoise, 0.0, 1.0);
				float aboveHorizonMask = clamp(iResolution.y*(belowHorizon - 1.0 + 1.0/iResolution.y), 0.0, 1.0);
				col = min(col, max(aboveHorizonMask, clamp(max(
					clamp(1.1 - belowHorizon*belowHorizon, 0.0, 1.0),
					clamp(abs(cos(0.2*belowHorizon*belowHorizon*3.14159265359*450.0*posY)), 0.0, 1.0)
					+ clamp(0.5 + cos(pos.x * 27.0 + cos(belowHorizon*belowHorizon*belowHorizon*13.0)), 0.0, 1.0)
					- clamp(-0.5 + cos(pos.x * 32.0 + cos(belowHorizon*belowHorizon*belowHorizon*13.0)), 0.0, 1.0)
				), 0.0, 1.0)));
				
				// Clouds.
				float clouds = clamp(
					2.0*abs(optimizedSnoise(nuv * vec2(2.0, 4.0) + vec2(0.05*iTime, 0.0)) - 0.5)
					+ 1.0*optimizedSnoise(nuv * vec2(5.0, 16.0) + vec2(0.2*iTime, 0.0)), 0.0, 1.0
				);
				col = max(col, clamp((nuv.y + 0.25)*clouds*clouds - 1.0 + clouds, 0.0, 1.0));
				
				// Colorize.
				vec3 color = mix(
					vec3(0.0, 0.2, 0.45),
					vec3(0.8, 0.85, 0.89),
					1.0-col
				);

				// Grains.
				color += 1.5*0.75*((rand2(uv)-0.5)*0.07);
				
				// Vigente.
				vec2 vigenteSize = 0.3*iResolution.xy;
				float sdf = -length(fragCoord.xy - iResolution.xy*0.5) / vigenteSize.x;
				float percent = 0.8;
				sdf = (clamp(percent + sdf, 0.0, 1.0) - percent) / (1.0 - percent);
				sdf = mix(1.0, sdf, 0.05);
				color *= sdf;
				
				gl_FragColor = vec4(color, 1.0);
			}
		`
		setFragmentShader(fragmentShaderCode)
	}, [])

	// Mise à jour du temps
	useFrame(state => {
		if (meshRef.current?.material) {
			const material = meshRef.current.material as THREE.ShaderMaterial
			const uniforms = material.uniforms as { iTime?: { value: number } }
			if (uniforms.iTime) {
				uniforms.iTime.value = state.clock.getElapsedTime()
			}
		}
	})

	// Uniforms pour le shader - TOUS les uniforms Shadertoy
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
				value: new THREE.Vector2(1920, 1080), // Résolution 16:9
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
		[]
	)

	if (!vertexShader || !fragmentShader) return null

	return (
		<mesh ref={meshRef}>
			{/* Géométrie 16:9 pour éviter la déformation */}
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

export default function MountainShader({ debug = false, className = '' }: MountainShaderProps) {
	return (
		<div className={className}>
			<Canvas
				camera={{ position: [6, -2, 15], fov: 20 }}
				style={{ width: '100%', height: '100%' }}
				gl={{ preserveDrawingBuffer: true }}
			>
				<MountainScene />
			</Canvas>
		</div>
	)
}
