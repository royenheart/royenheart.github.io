import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  MathUtils,
  Vector3,
  type ShaderMaterial,
  type PerspectiveCamera,
} from 'three';
import { HORIZON_CENTER, horizonCaptureRadius } from './relativity/framing';
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
  linearOutput = false,
}: SceneProps & {
  quality: number;
  collapse?: SceneSignal;
  presence?: SceneSignal;
  swirl?: number;
  linearOutput?: boolean;
}) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);
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
      uLinearOutput: { value: false },
      uHorizonRadius: { value: 12 },
      uHorizonCenter: { value: new Vector3(...HORIZON_CENTER) },
    }),
    [],
  );
  const atmosphere = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uPresence: { value: 1 },
      uLinearOutput: { value: false },
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
      cubes.current.uniforms.uLinearOutput!.value = linearOutput;
      cubes.current.uniforms.uHorizonRadius!.value = horizonCaptureRadius(
        size.width,
        size.height,
        camera.position.z - HORIZON_CENTER[2],
        (camera as PerspectiveCamera).fov ?? 62,
      );
    }
    if (backdrop.current) {
      backdrop.current.uniforms.uTime!.value = time.current;
      backdrop.current.uniforms.uAspect!.value = size.width / size.height;
      backdrop.current.uniforms.uLinearOutput!.value = linearOutput;
      backdrop.current.uniforms.uPresence!.value =
        entry * (1 - MathUtils.smoothstep(blend, 0.06, 0.62));
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
