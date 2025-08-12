'use client'

import { useEffect, useRef } from 'react'

interface MountainShaderProps {
	className?: string
	debug?: boolean
}

export default function MountainShader({ debug = false, className = '' }: MountainShaderProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationRef = useRef<number>(0)
	const programRef = useRef<WebGLProgram | null>(null)
	const glRef = useRef<WebGLRenderingContext | null>(null)

	const vertexShaderSource = `
        attribute vec4 position;
        void main() {
            gl_Position = position;
        }
    `

	const fragmentShaderSource = `
        precision mediump float;
        uniform vec2 iResolution;
        uniform float iTime;

        #define M_PI 3.14159265359
        #define saturate(x) clamp(x, 0.0, 1.0)
        #define lerp(a,b,x) mix(a,b,x)

        vec4 glslmod(vec4 x, vec4 y) { return x - y * floor(x / y); }
        vec3 glslmod(vec3 x, vec3 y) { return x - y * floor(x / y); }
        vec2 glslmod(vec2 x, vec2 y) { return x - y * floor(x / y); }

        vec3 permute_optimizedSnoise2D(in vec3 x) { return glslmod(x*x*34.0 + x, vec3(289.0)); }
        
        float optimizedSnoise(in vec2 v) {
            vec2 i = floor((v.x + v.y)*0.36602540378443 + v);
            vec2 x0 = (i.x + i.y)*0.211324865405187 + v - i;
            float s = step(x0.x, x0.y);
            vec2 j = vec2(1.0 - s, s);
            vec2 x1 = x0 - j + 0.211324865405187;
            vec2 x3 = x0 - 0.577350269189626;
            i = glslmod(i, vec2(289.));
            vec3 p = permute_optimizedSnoise2D(permute_optimizedSnoise2D(i.y + vec3(0, j.y, 1)) + i.x + vec3(0, j.x, 1));
            vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x3, x3)), 0.);
            vec3 x = fract(p * 0.024390243902439) * 2. - 1.;
            vec3 h = abs(x) - 0.5;
            vec3 a0 = x - floor(x + 0.5);
            return 0.5 + 65. * dot(pow(m, vec3(4.0))*(-0.85373472095314*(a0*a0 + h * h) + 1.79284291400159), a0 * vec3(x0.x, x1.x, x3.x) + h * vec3(x0.y, x1.y, x3.y));
        }

        vec2 hash21(float p) {
            vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.xx+p3.yz)*p3.zy);
        }

        float rand2(vec2 p) {
            return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        vec3 sdgCircle( in vec2 p, in float r ) { 
            float d = length(p); 
            return vec3( d-r, p/d ); 
        }

        float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r ) {
            r.xy = (p.x>0.0)?r.xy : r.zw;
            r.x  = (p.y>0.0)?r.x  : r.y;
            vec2 q = abs(p)-b+r.x;
            return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
        }

        float pcurve(float x, float a, float b) {
            float k = pow(a+b,a+b)/(pow(a,a)*pow(b,b));
            return k*pow(x,a)*pow(1.0-x,b);
        }

        float getH(float pos, out vec2 from, out vec2 to, out float blend) {
            float n;
            float i = floor(pos);
            float f = pos - i;
            vec2 rand = vec2(0.4, 0.95);

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

            float tl = 0.5*(to.x - from.x - to.y + from.y);
            vec2 mid = to + vec2(-1.0, 1.0)*tl;

            if(pos < mid.x) {
                to = mid;
            } else {
                from = mid;
            }

            blend = ((pos - from.x) / (to.x - from.x));
            n = lerp(from.y, to.y, blend);

            return n;
        }

        void main() {
            vec2 fragCoord = gl_FragCoord.xy;
            
            float mx = max(iResolution.x, iResolution.y);
            vec2 uv = fragCoord.xy / mx;
            vec2 nuv = fragCoord.xy / iResolution.xy;
            vec2 pos = uv - (iResolution.xy)*0.5/mx;
            
            float col = 1.0;

            float sNoise = optimizedSnoise(vec2(pos.x*15.0, 0.0));

            // Sun
            vec3 circle = sdgCircle(pos + vec2(0.2, -0.05), 0.1);
            col *= saturate(400.0*abs(circle.x) - 1.0*(0.5 + sin(sNoise*5.0 + 0.5*iTime)));
            col *= saturate(1.3 - saturate(-circle.x*800.0 - 7.0)*cos(circle.x*800.0 - 1.0*(1.0 + cos(sNoise*5.0+0.5*iTime))));

            // Deform
            pos -= 0.5*vec2(pos.y, - pos.x);

            // Horizontal scroll
            pos.x += iTime*0.01;

            float scaleX = 5.0;
            vec2 from, to; 
            float blend;
            float noise = getH(scaleX*pos.x, from, to, blend);
            
            // Additional wiggle to the lines
            noise -= 0.05*sNoise;

            float posY = 0.3;
            float scaleY = 1.0 / scaleX;

            float scaledNoise = scaleY*noise;
            float mountHeight = posY + scaledNoise;

            float hatchLength = length(to - from);
            float hatchWidth = lerp(0.5, 3.0, 1.0 - saturate(pcurve(blend, 2.0*hatchLength, 2.0)));
            col = min(col, iResolution.y*(abs(nuv.y - mountHeight) - hatchWidth/iResolution.y));

            // Hatching inside mountains
            float mountGrad = saturate(scaledNoise - nuv.y + posY) / scaledNoise;
            if((nuv.y < mountHeight - 0.0025) && (nuv.y > posY)) {
                col = ((
                    + lerp(0.5, 3.0, mountGrad)*abs(cos((1.0-pow(0.025*sNoise + mountGrad, 0.5))*(lerp(1.0, noise, 0.8))*M_PI*25.0))
                    + saturate(3.0 + 10.0*cos(pos.x * 32.0 - cos(pow(mountGrad, 1.25)*13.0)))
                    - saturate(3.0 + 10.0*cos(2.0 + pos.x * 32.0 - cos(pow(mountGrad, 1.25)*13.0)))
                ));
            }

            // Horizon
            float belowHorizon = saturate(1.0 - (posY - nuv.y) / posY + 0.01*sNoise);
            float aboveHorizonMask = saturate(iResolution.y*(belowHorizon - 1.0 + 1.0/iResolution.y));
            col = min(col, max(aboveHorizonMask, saturate(max(
                saturate(1.1 - belowHorizon*belowHorizon),
                saturate(abs(cos(0.2*belowHorizon*belowHorizon*M_PI*450.0*posY)))
                + saturate(0.5 + cos(pos.x * 27.0 + cos(belowHorizon*belowHorizon*belowHorizon*13.0)))
                - saturate(-0.5 + cos(pos.x * 32.0 + cos(belowHorizon*belowHorizon*belowHorizon*13.0)))
            ))));

            // Clouds
            float clouds = saturate(
                2.0*abs(optimizedSnoise(nuv * vec2(2.0, 4.0) + vec2(0.05*iTime, 0.0)) - 0.5)
                + 1.0*optimizedSnoise(nuv * vec2(5.0, 16.0) + vec2(0.2*iTime, 0.0))
            );
            col = max(col, saturate((nuv.y + 0.25)*clouds*clouds - 1.0 + clouds));
            
            // Colorize
            gl_FragColor.rgb = lerp(
                vec3(0.0, 0.2, 0.45),
                vec3(0.8, 0.85, 0.89),
                1.0-col
            );
            gl_FragColor.a = 1.0;

            // Grains
            gl_FragColor.rgb += 1.5*0.75*((rand2(uv)-.5)*0.07);
            
            // Vignette
            vec2 vigenteSize = 0.3*iResolution.xy;
            float sdf = -sdRoundedBox(fragCoord.xy - iResolution.xy*0.5, vigenteSize, vec4(0.25*min(iResolution.x, iResolution.y))) / vigenteSize.x;
            float percent = 0.8;
            sdf = (saturate(percent + sdf) - percent) / (1.0 - percent);
            sdf = lerp(1.0, sdf, 0.05);
            gl_FragColor.rgb *= sdf;
        }
    `

	const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
		const shader = gl.createShader(type)
		if (!shader) return null

		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			if (debug) {
				console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
			}
			gl.deleteShader(shader)
			return null
		}

		return shader
	}

	const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
		const program = gl.createProgram()
		if (!program) return null

		gl.attachShader(program, vertexShader)
		gl.attachShader(program, fragmentShader)
		gl.linkProgram(program)

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			if (debug) {
				console.error('Program linking error:', gl.getProgramInfoLog(program))
			}
			gl.deleteProgram(program)
			return null
		}

		return program
	}

	const setupWebGL = () => {
		const canvas = canvasRef.current
		if (!canvas) return

		const gl = canvas.getContext('webgl')
		if (!gl) {
			if (debug) console.error('WebGL not supported')
			return
		}

		glRef.current = gl

		const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

		if (!vertexShader || !fragmentShader) return

		const program = createProgram(gl, vertexShader, fragmentShader)
		if (!program) return

		programRef.current = program

		// Create buffer for full-screen quad
		const positionBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

		const positionLocation = gl.getAttribLocation(program, 'position')
		gl.enableVertexAttribArray(positionLocation)
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

		gl.useProgram(program)
	}

	const render = (time: number) => {
		const canvas = canvasRef.current
		const gl = glRef.current
		const program = programRef.current

		if (!canvas || !gl || !program) return

		// Update canvas size
		const rect = canvas.getBoundingClientRect()
		canvas.width = rect.width * window.devicePixelRatio
		canvas.height = rect.height * window.devicePixelRatio
		gl.viewport(0, 0, canvas.width, canvas.height)

		// Set uniforms
		const resolutionLocation = gl.getUniformLocation(program, 'iResolution')
		const timeLocation = gl.getUniformLocation(program, 'iTime')

		gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
		gl.uniform1f(timeLocation, time * 0.001)

		// Draw
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

		animationRef.current = requestAnimationFrame(render)
	}

	useEffect(() => {
		setupWebGL()
		animationRef.current = requestAnimationFrame(render)

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [])

	return <canvas ref={canvasRef} className={`h-full w-full ${className}`} style={{ display: 'block' }} />
}
