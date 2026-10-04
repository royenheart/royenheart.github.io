attribute vec3 instanceOffset;
attribute vec3 instanceScale;
attribute vec3 instancePile;
attribute vec4 instanceMotion;
attribute vec4 instanceRotation;
attribute vec3 instanceTint;
attribute vec3 instanceAccent;
attribute float instanceAlpha;

uniform float uTime;
uniform float uFallTop;
uniform float uFallBottom;
uniform float uVerticalDensityPower;
uniform float uPileHoldStart;
uniform float uPileFadeStart;
uniform highp float uCollapse;
uniform float uPresence;
uniform float uSwirl;
uniform float uHorizonRadius;
uniform vec3 uHorizonCenter;

varying vec3 vNormal;
varying vec3 vTint;
varying vec3 vAccent;
varying vec3 vWorldPosition;
varying float vAlpha;
varying float vDepth;
varying float vPileProgress;

mat3 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

mat3 rotateZ(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
}

void main() {
    float cycle = fract(instanceMotion.w + uTime * instanceMotion.x);
    float normalizedFall = clamp(cycle / uPileHoldStart, 0.0, 1.0);
    float densityFallProgress = 1.0 - pow(1.0 - normalizedFall, uVerticalDensityPower);
    float pileProgress = smoothstep(uPileHoldStart - 0.08, uPileHoldStart + 0.12, cycle);
    float fadeProgress = smoothstep(uPileFadeStart, 1.0, cycle);
    float fallY = mix(uFallTop, uFallBottom, densityFallProgress);
    float pileY = uFallBottom + instancePile.y;
    float driftX = sin(uTime * 0.28 + instanceMotion.z) * instanceMotion.y * (1.0 - pileProgress * 0.72);
    float spin = uTime * instanceRotation.w * (1.0 - pileProgress * 0.48);
    mat3 rotationMatrix =
        rotateZ(instanceRotation.z + spin) *
        rotateY(instanceRotation.y + spin * 0.64) *
        rotateX(instanceRotation.x + spin * 0.48);
    vec3 fallingOffset = instanceOffset + vec3(driftX, fallY, 0.0);
    vec3 pileOffset = vec3(instancePile.x, pileY, instancePile.z);
    pileOffset.y += sin(uTime * 0.9 + instanceMotion.z) * 0.08 * pileProgress * (1.0 - fadeProgress);
    vec3 baseWorldOffset = mix(fallingOffset, pileOffset, pileProgress);
    float lowerDensity = 1.0 - smoothstep(-14.0, 16.0, baseWorldOffset.y);
    float verticalDensityScale = mix(0.72, 1.08, lowerDensity);
    vec3 localPosition = rotationMatrix * (position * instanceScale * verticalDensityScale);
    float collapse = smoothstep(0.02, 0.66, uCollapse);
    float angle = instanceMotion.z + collapse * uSwirl * 6.283185 + uTime * 0.08;
    float radius = mix(uHorizonRadius * 1.8, uHorizonRadius, collapse);
    radius += sin(instanceMotion.z * 5.0) * mix(2.0, 0.15, collapse);
    vec3 center = uHorizonCenter;
    vec3 orbit = center + vec3(cos(angle) * radius, sin(angle) * radius, 0.0);
    vec3 gatheredOffset = mix(baseWorldOffset, orbit, pow(collapse, 0.7));
    vec3 worldPosition = mix(center, gatheredOffset, uPresence) + localPosition * mix(1.0, 0.16, collapse) * uPresence;

    float topFade = smoothstep(0.0, 0.08, cycle);
    float bottomFade = 1.0 - fadeProgress;
    float verticalDensityAlpha = mix(0.46, 1.18, lowerDensity);
    vAlpha = instanceAlpha * topFade * bottomFade * verticalDensityAlpha;
    vAlpha *= uPresence * (1.0 - smoothstep(0.72, 0.96, uCollapse));
    vNormal = normalize(normalMatrix * rotationMatrix * normal);
    vTint = instanceTint;
    vAccent = instanceAccent;
    vWorldPosition = worldPosition;
    vDepth = smoothstep(-42.0, -4.0, instanceOffset.z);
    vPileProgress = pileProgress;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 1.0);
}
        
