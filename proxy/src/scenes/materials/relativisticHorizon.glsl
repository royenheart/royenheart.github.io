/**
 * Copyright (c) 2020 Eric Bruneton
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

precision highp float;
precision highp sampler2D;
uniform sampler2D uDeflection;
uniform sampler2D uInverseRadius;
uniform float uTime;
uniform float uAspect;
uniform float uViewHeight;
uniform float uPresence;
uniform float uInclination;
uniform float uTurbulence;
uniform float uSeed;
uniform vec2 uCenter;
varying vec2 vUv;

const float pi = 3.141592653589793;
const float rad = 1.0;
const float INNER_DISC_R = 3.0;
const float OUTER_DISC_R = 12.0;

// Explicit filtering also works on devices without OES_texture_float_linear.
vec4 opticalSample(sampler2D source, vec2 uv) {
  ivec2 size = textureSize(source, 0);
  vec2 p = clamp(uv * vec2(size) - 0.5, vec2(0.0), vec2(size - 1));
  ivec2 p0 = ivec2(floor(p));
  ivec2 p1 = min(p0 + 1, size - 1);
  vec2 f = fract(p);
  return mix(mix(texelFetch(source, p0, 0), texelFetch(source, ivec2(p1.x, p0.y), 0), f.x),
             mix(texelFetch(source, ivec2(p0.x, p1.y), 0), texelFetch(source, p1, 0), f.x), f.y);
}

/* OPTICAL_FUNCTIONS */

float hash(vec3 p) {
  p = fract(p * 0.1031 + uSeed * 0.00013);
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float densityField(vec3 p) {
  return noise(p) * 0.56 + noise(p * 2.03 + 7.1) * 0.28 + noise(p * 4.07 + 19.7) * 0.16;
}

vec3 sky(vec3 direction) {
  vec2 uv = vec2(atan(direction.y, direction.x) / (2.0 * pi) + 0.5,
                 acos(clamp(direction.z, -1.0, 1.0)) / pi);
  vec2 grid = uv * vec2(1000.0, 500.0);
  vec2 cell = floor(grid);
  float random = hash(vec3(cell, 9.0));
  vec2 offset = vec2(hash(vec3(cell, 2.0)), hash(vec3(cell, 3.0))) - 0.5;
  float distance = length(fract(grid) - 0.5 - offset * 0.6);
  float width = max(length(fwidth(grid)), 0.07);
  float star = (1.0 - smoothstep(0.02, 0.02 + width, distance)) / max(width * width, 1.0);
  star *= step(0.996, random) * (0.2 + hash(vec3(cell, 4.0)) * 1.8);
  float cloud = densityField(direction * 4.0);
  return vec3(0.0014, 0.0017, 0.0027) + vec3(0.025, 0.012, 0.005) * pow(cloud, 4.0)
         + vec3(1.0, 0.88, 0.7) * star;
}

vec4 disc(vec2 position, float time, float shift) {
  float radius = length(position);
  float edge = smoothstep(3.0, 3.22, radius) * (1.0 - smoothstep(9.5, 12.0, radius));
  float azimuth = atan(position.y, position.x);
  float orbit = azimuth - time * 0.48 * pow(3.0 / max(radius, 3.0), 1.5);
  vec3 coordinates = vec3(cos(orbit) * 2.7, sin(orbit) * 2.7, radius * 1.8);
  float structures = densityField(coordinates);
  float warpedRadius = radius * 26.0 + structures * 8.0 + sin(orbit * 3.0 + radius) * 1.4;
  float frequency = max(fwidth(warpedRadius), 0.001);
  float filaments = 0.5 + 0.5 * sin(warpedRadius) * exp(-frequency * frequency * 0.2);
  float density = mix(0.65 + structures * 0.5,
                      0.25 + pow(structures, 1.8) * 2.8 + filaments * 0.38, uTurbulence);
  float profile = pow(max(0.0, (1.0 - sqrt(3.0 / max(radius, 3.0))) / pow(radius, 3.0)), 0.25) / 0.21415;
  // Temperature-informed gold art direction, with restrained frequency-shift contrast.
  float temperature = profile * pow(clamp(shift, 0.35, 2.0), 0.35);
  vec3 amber = vec3(1.0, 0.22, 0.028), gold = vec3(1.0, 0.65, 0.28);
  vec3 color = mix(amber, gold, smoothstep(0.35, 0.86, temperature));
  color = mix(color, vec3(1.0, 0.94, 0.78), smoothstep(0.83, 1.16, temperature));
  float emission = 1.8 * pow(profile, 3.0) * density * pow(clamp(shift, 0.35, 2.0), 2.0);
  return vec4(color * emission * edge, edge * 0.96);
}

// Static observer specialization of Bruneton's SceneColor (BSD-3-Clause).
// The basis and received/source frequency ratio follow model.glsl at the pinned revision.
vec3 sceneColor(vec2 screen) {
  float cameraRadius = 30.0;
  vec3 radial = vec3(0.0, -cos(uInclination), sin(uInclination));
  vec3 right = vec3(1.0, 0.0, 0.0);
  vec3 up = cross(right, -radial);
  vec3 direction = normalize(-radial * cameraRadius + right * screen.x + up * screen.y);
  vec3 normal = normalize(cross(radial, direction) + vec3(1e-10));
  vec3 tangent = normalize(cross(normal, radial));
  vec3 crossing = normalize(cross(vec3(0,0,1), normal) + vec3(1e-10));
  if (dot(crossing, tangent) < 0.0) crossing = -crossing;
  float alpha = acos(clamp(dot(radial, crossing), -1.0, 1.0));
  float delta = acos(clamp(dot(radial, direction), -0.9999999, 0.9999999));
  float u = 1.0 / cameraRadius, velocity = -u / tan(delta);
  float energySquared = velocity * velocity + u * u * (1.0 - u);
  float energy = -sqrt(energySquared);
  float u0, phi0, t0, a0, u1, phi1, t1, a1;
  float deflection = TraceRay(uDeflection, uInverseRadius, u, velocity, energySquared,
    delta, alpha, 1.0 / INNER_DISC_R, 1.0 / OUTER_DISC_R, u0, phi0, t0, a0, u1, phi1, t1, a1);
  float escapeAngle = delta + max(deflection, 0.0);
  vec3 escapeDirection = cos(escapeAngle) * radial + sin(escapeAngle) * tangent;
  vec3 color = deflection >= 0.0 ? sky(escapeDirection) : vec3(0.0);
  float receiver = energy / sqrt(1.0 - u);
  if (u1 > 0.0 && a1 > 0.0) {
    float source = energy * sqrt(2.0 / (2.0 - 3.0 * u1)) - u1 * sqrt(u1 / (2.0 - 3.0 * u1)) * normal.z;
    vec3 intersection = (radial * cos(phi1) + tangent * sin(phi1)) / u1;
    vec4 emission = disc(intersection.xy, uTime - t1 * 0.015, receiver / source);
    color = color * (1.0 - emission.a * a1) + emission.rgb * a1;
  }
  if (u0 > 0.0 && a0 > 0.0) {
    float source = energy * sqrt(2.0 / (2.0 - 3.0 * u0)) - u0 * sqrt(u0 / (2.0 - 3.0 * u0)) * normal.z;
    vec3 intersection = (radial * cos(phi0) + tangent * sin(phi0)) / u0;
    vec4 emission = disc(intersection.xy, uTime - t0 * 0.015, receiver / source);
    color = color * (1.0 - emission.a * a0) + emission.rgb * a0;
  }
  return color;
}

void main() {
  if (uPresence < 0.001) { gl_FragColor = vec4(0.0); return; }
  float scale = mix(0.22, 1.0, uPresence);
  vec2 screen = (vUv - uCenter) * vec2(uAspect, 1.0) * uViewHeight / scale;
  gl_FragColor = vec4(sceneColor(screen), uPresence);
}
