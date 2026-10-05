import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ShaderMaterial, Vector2, Vector3 } from 'three';
import type { SceneProps, SceneSignal } from './CubeCloud';
import { loadOpticalTextures, type OpticalTextures } from './relativity/tables';
import { TABLE_SIZES } from './relativity/optics';
import {
  HORIZON_CENTER,
  HORIZON_VIEW_HEIGHT,
  horizonViewHeight,
  type HorizonTreatment,
} from './relativity/framing';
import definitions from './relativity/bruneton-definitions.glsl?raw';
import functions from './relativity/bruneton-functions.glsl?raw';
import fragment from './materials/relativisticHorizon.glsl?raw';

export type DiskStyle = 'silk' | 'turbulent';
const opticalFunctions = `
${definitions}
#define IN(x) x
#define OUT(x) out x
#define RAY_DEFLECTION_TEXTURE_WIDTH ${TABLE_SIZES.deflection[0]}
#define RAY_DEFLECTION_TEXTURE_HEIGHT ${TABLE_SIZES.deflection[1]}
#define RAY_INVERSE_RADIUS_TEXTURE_WIDTH ${TABLE_SIZES.inverseRadius[0]}
#define RAY_INVERSE_RADIUS_TEXTURE_HEIGHT ${TABLE_SIZES.inverseRadius[1]}
${functions.replaceAll('texture(', 'opticalSample(')}
`;

export function RelativisticHorizon({
  settings,
  time,
  presence,
  diskStyle,
  inclination,
  treatment,
  onReady,
  onFailure,
}: SceneProps & {
  presence: SceneSignal;
  diskStyle: DiskStyle;
  inclination: number;
  treatment: HorizonTreatment;
  onReady(): void;
  onFailure(): void;
}) {
  const { size, camera, invalidate } = useThree();
  const [textures, setTextures] = useState<OpticalTextures | null>(null);
  const ready = useRef(false);
  const center = useMemo(() => new Vector3(), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader:
          'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }',
        fragmentShader: fragment.replace(
          '/* OPTICAL_FUNCTIONS */',
          opticalFunctions,
        ),
        uniforms: {
          uDeflection: { value: null },
          uInverseRadius: { value: null },
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uViewHeight: { value: HORIZON_VIEW_HEIGHT },
          uPresence: { value: 0 },
          uInclination: { value: 0.2 },
          uTurbulence: { value: 1 },
          uLimb: { value: 0 },
          uSeed: { value: settings.seed },
          uCenter: { value: new Vector2(0.5, 0.5) },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
      }),
    [settings.seed],
  );
  useEffect(() => {
    const controller = new AbortController();
    let resource: OpticalTextures | null = null;
    loadOpticalTextures(controller.signal)
      .then((loaded) => {
        resource = loaded;
        if (controller.signal.aborted) {
          loaded.dispose();
          return;
        }
        material.uniforms.uDeflection!.value = loaded.deflection;
        material.uniforms.uInverseRadius!.value = loaded.inverseRadius;
        setTextures(loaded);
        invalidate();
      })
      .catch(() => {
        if (!controller.signal.aborted) onFailure();
      });
    return () => {
      controller.abort();
      resource?.dispose();
    };
  }, [material, onFailure, invalidate]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    material.uniforms.uTime!.value = time.current;
    material.uniforms.uPresence!.value = presence.get();
    material.uniforms.uAspect!.value = size.width / size.height;
    material.uniforms.uViewHeight!.value = horizonViewHeight(
      size.width,
      size.height,
      treatment,
    );
    material.uniforms.uInclination!.value = (inclination * Math.PI) / 180;
    material.uniforms.uTurbulence!.value = diskStyle === 'silk' ? 0.12 : 1;
    material.uniforms.uLimb!.value = treatment === 'limb' ? 1 : 0;
    center.set(...HORIZON_CENTER).project(camera);
    material.uniforms.uCenter!.value.set(
      center.x * 0.5 + 0.5,
      center.y * 0.5 + 0.5,
    );
  }, -2);
  return (
    textures && (
      <mesh
        material={material}
        frustumCulled={false}
        renderOrder={-100}
        onAfterRender={() => {
          if (!ready.current) {
            ready.current = true;
            onReady();
          }
        }}
      >
        <planeGeometry args={[2, 2]} />
      </mesh>
    )
  );
}
