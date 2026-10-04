import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { ShaderMaterial } from 'three';
import { createCubeGeometry } from './cubeGeometry';
import vertexShader from './materials/gpuCubeVertexShader.glsl?raw';
import fragmentShader from './materials/gpuCubeFragmentShader.glsl?raw';
import atmosphereVertex from './materials/gpuAtmosphereVertexShader.glsl?raw';
import atmosphereFragment from './materials/gpuAtmosphereFragmentShader.glsl?raw';
import type { SceneSettings } from '../lib/content/schema';

export interface SceneProps {
  settings: SceneSettings;
  time: { current: number };
}
export interface SceneSignal {
  get(): number;
}
export function CubeCloud({
  settings,
  time,
  quality,
  collapse,
  presence,
  swirl = 0,
}: SceneProps & {
  quality: number;
  collapse?: SceneSignal;
  presence?: SceneSignal;
  swirl?: number;
}) {
  const size = useThree((state) => state.size);
  const count = Math.round(settings.cubeCount * quality);
  const geometry = useMemo(
    () => createCubeGeometry(count, settings.seed),
    [count, settings.seed],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  const cubes = useRef<ShaderMaterial>(null);
  const backdrop = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFallTop: { value: 23 },
      uFallBottom: { value: -17 },
      uVerticalDensityPower: { value: 1.85 },
      uPileHoldStart: { value: 0.72 },
      uPileFadeStart: { value: 0.94 },
      uLightContrast: { value: 1.34 },
      uCollapse: { value: 0 },
      uPresence: { value: 1 },
      uSwirl: { value: 0 },
    }),
    [],
  );
  const atmosphere = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uPresence: { value: 1 },
    }),
    [],
  );
  useFrame(() => {
    const blend = collapse?.get() ?? 0;
    const entry = presence?.get() ?? 1;
    if (cubes.current) {
      cubes.current.uniforms.uTime!.value = time.current;
      cubes.current.uniforms.uCollapse!.value = blend;
      cubes.current.uniforms.uPresence!.value = entry;
      cubes.current.uniforms.uSwirl!.value = swirl;
    }
    if (backdrop.current) {
      backdrop.current.uniforms.uTime!.value = time.current;
      backdrop.current.uniforms.uAspect!.value = size.width / size.height;
      backdrop.current.uniforms.uPresence!.value = entry * (1 - blend);
    }
  });
  return (
    <group>
      <mesh position={[0, 0, -94]}>
        <planeGeometry args={[320, 190]} />
        <shaderMaterial
          ref={backdrop}
          uniforms={atmosphere}
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          depthWrite={false}
          transparent
        />
      </mesh>
      <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={cubes}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite
        />
      </mesh>
    </group>
  );
}
