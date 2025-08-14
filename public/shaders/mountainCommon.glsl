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
