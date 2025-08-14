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