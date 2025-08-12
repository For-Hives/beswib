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
  precision mediump int;

  uniform vec2 iResolution;
  uniform float iTime;

  #define M_PI 3.14159265359

#define float2 vec2
#define float3 vec3
#define float4 vec4

#define saturate(x) clamp(x, 0.0, 1.0)
#define pack(x) (x*0.5+0.5)
#define unpack(x) (x*2.0 - 1.0)
#define lerp(a,b,x) mix(a,b,x)
#define rgb(r, g, b) (vec3(r, g, b)*0.0039215686)

// Directions
const ivec2 center = ivec2(0, 0);
const ivec2 up = ivec2(0, 1);
const ivec2 down = ivec2(0, -1);
const ivec2 right = ivec2(1, 0);
const ivec2 left = ivec2(-1, 0);
const ivec2 upRight = up + right;
const ivec2 upLeft = up + left;
const ivec2 downRight = down + right;
const ivec2 downLeft = down + left;

const vec2 centerf = vec2(0, 0);
const vec2 upf = vec2(0, 1);
const vec2 downf = vec2(0, -1);
const vec2 rightf = vec2(1, 0);
const vec2 leftf = vec2(-1, 0);
const vec2 upRightf = normalize(upf + rightf);
const vec2 upLeftf = normalize(upf + leftf);
const vec2 downRightf = normalize(downf + rightf);
const vec2 downLeftf = normalize(downf + leftf);

float smootherstep(float a, float b, float x)
{
    x = saturate((x - a) / (b - a));
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

float segment(float value, float segments)
{
    return float(int(value*segments))/segments;
}

vec3 sdgCircle( in vec2 p, in float r )
{ float d = length(p); return vec3( d-r, p/d ); }

float sdCircle( vec2 p, float r )
{ return length(p) - r; }

float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r )
{
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

float pcurve(float x, float a, float b)
{
    float k = pow(a+b,a+b)/(pow(a,a)*pow(b,b));
    return k*pow(x,a)*pow(1.0-x,b);
}

float rand2(vec2 p) {
    return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 hash21(float p)
{
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec2 hash2(vec2 p)
{
    return fract(sin(vec2(
        dot(p, vec2(127.1, 311.7)),
        dot(p, vec2(269.5, 183.3))
    ))*43758.5453);
}


//==== Optimized Ashima Simplex noise2D by @makio64 https://www.shadertoy.com/view/4sdGD8 ====//
// Original shader : https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
// snoise return a value between 0 & 1
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
float getH(
    float pos,
    out vec2 from, out vec2 to, out float blend
)
{
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

    if(pos < c.x)
    {
        from = l;
        to = c;
    }
    else
    {
        from = c;
        to = r;
    }

    // Make 90-degree angle mountains
    // between from-to points by creating mid point.
    //if(false)
    {
        float tl = 0.5*(to.x - from.x - to.y + from.y);
        vec2 mid = to + vec2(-1.0, 1.0)*tl;

        if(pos < mid.x)
        {
            to = mid;
        }
        else
        {
            from = mid;
        }
    }

    // Linearly interpolate between from-to points.
    blend = ((pos - from.x) / (to.x - from.x));
    n = lerp(from.y, to.y, blend);

    return n;
}



void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //fragCoord.y -= -0.1*iResolution.y + 0.1*iResolution.y*cos((fragCoord.x / iResolution.x - 0.5)*M_PI*0.5);


    float mx = max(iResolution.x, iResolution.y);
    vec2 uv = fragCoord.xy / mx;
    vec2 nuv = fragCoord.xy / iResolution.xy;
    vec2 pos = uv - (iResolution.xy)*0.5/mx;
    
    float col = 1.0;

    float sNoise = optimizedSnoise(vec2(pos.x*15.0, 0.0));

    // Sun.
    vec3 circle = sdgCircle(pos + vec2(0.2, -0.05), 0.1);
    col *= saturate(400.0*abs(circle.x) - 1.0*(0.5 + sin(sNoise*5.0 + 0.5*iTime)));
    col *= saturate(1.3 - saturate(-circle.x*800.0 - 7.0)*cos(circle.x*800.0 - 1.0*(1.0 + cos(sNoise*5.0+0.5*iTime))));

    // Deform.
    pos -= 0.5*vec2(pos.y, - pos.x);

    // Horizontal scroll.
    pos.x += iTime*0.01;

    // Wiggle animation.
    /*
    float t = 0.25*sin(iTime*0.25);
    vec2 newX = vec2(cos(t), sin(t));
    vec2 newY = vec2(-newX.y, newX.x);
    pos = newX*pos.x + newY*pos.y;
    //*/

    float scaleX = 5.0;
    vec2 from, to; float blend;
    float noise = getH(
        scaleX*pos.x, // In
        from, to, blend // Out
    );
    
    
    
    // Additional wiggle to the lines.
    noise -= 0.05*sNoise;

    float posY = 0.3;
    float scaleY = 1.0 / scaleX; //0.05;

    float scaledNoise = scaleY*noise;
    float mountHeight = posY + scaledNoise;

    float hatchLength = length(to - from);
    float hatchWidth = lerp(0.5, 3.0, 1.0 - saturate(pcurve(blend, 2.0*hatchLength, 2.0))); //lerp(1.5, 5.0, 1.0 - saturate(pcurve(blend, 2.0*hatchLength, 2.0))) / iResolution.y;
    //hatchWidth = lerp(0.0, 1.0, blend);
    col = min(col, iResolution.y*(abs(nuv.y - mountHeight) - hatchWidth/iResolution.y));
    
    

    // Hatching inside mountains.
    float mountGrad = saturate(scaledNoise - nuv.y + posY) / scaledNoise;
    if(
        //false &&
        (nuv.y < mountHeight - 0.0025) && (nuv.y > posY)
    )
    {
        col = ((
            + lerp(0.5, 3.0, mountGrad)*abs(cos((1.0-pow(0.025*sNoise + mountGrad, 0.5))*(lerp(1.0, noise, 0.8))*M_PI*25.0))
            + saturate(3.0 + 10.0*cos(pos.x * 32.0 - cos(pow(mountGrad, 1.25)*13.0)))
            - saturate(3.0 + 10.0*cos(2.0 + pos.x * 32.0 - cos(pow(mountGrad, 1.25)*13.0)))
        ));
    }

    
    // Horizon.
    float belowHorizon = saturate(1.0 - (posY - nuv.y) / posY + 0.01*sNoise);
    float aboveHorizonMask = saturate(iResolution.y*(belowHorizon - 1.0 + 1.0/iResolution.y));
    col = min(col, max(aboveHorizonMask, saturate(max(
        saturate(1.1 - belowHorizon*belowHorizon),
        saturate(abs(cos(0.2*belowHorizon*belowHorizon*M_PI*450.0*posY)))
        + saturate(0.5 + cos(pos.x * 27.0 + cos(belowHorizon*belowHorizon*belowHorizon*13.0)))
        - saturate(-0.5 + cos(pos.x * 32.0 + cos(belowHorizon*belowHorizon*belowHorizon*13.0)))
    ))));
    
    
    // Clouds.
    //if(false)
    {
        float clouds = saturate(
            2.0*abs(optimizedSnoise(nuv * vec2(2.0, 4.0) + vec2(0.05*iTime, 0.0)) - 0.5)
            + 1.0*optimizedSnoise(nuv * vec2(5.0, 16.0) + vec2(0.2*iTime, 0.0))
        );
        col = max(col, saturate((nuv.y + 0.25)*clouds*clouds - 1.0 + clouds));
    }
    
    // Colorize.
    fragColor.a = 1.0;
    //fragColor.rgb = vec3(col);
    /*
    fragColor.rgb = lerp(
        vec3(0.3, 0.0, 0.5),
        vec3(0.7, 0.75, 0.79),
        col
    );
    //*/
    //*
    fragColor.rgb = lerp(
        vec3(0.0, 0.2, 0.45),
        //vec3(0.7, 0.75, 0.79),
        //vec3(0.9),
        vec3(0.8, 0.85, 0.89),
        1.0-col
    );
    //*/

    // Grains.
    fragColor.rgb += 1.5*0.75*((rand2(uv)-.5)*.07);
    
    // Vigente.
    vec2 vigenteSize = 0.3*iResolution.xy;
    float sdf = -sdRoundedBox(fragCoord.xy - iResolution.xy*0.5, vigenteSize, vec4(0.25*min(iResolution.x, iResolution.y))) / vigenteSize.x;
    float percent = 0.8;
    sdf = (saturate(percent + sdf) - percent) / (1.0 - percent);
    sdf = lerp(1.0, sdf, 0.05);
    fragColor.rgb *= sdf;
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
		// Fallback: render nothing so parent can show an image behind
		return <div className={`h-full w-full ${className}`} />
	}

	return <canvas ref={canvasRef} className={`h-full w-full ${className}`} style={{ display: 'block' }} />
}
