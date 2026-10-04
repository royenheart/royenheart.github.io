import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor';
import { ACESFilmicToneMapping, SRGBColorSpace, MathUtils } from 'three';
import type { MotionValue } from 'motion/react';
import { CubeCloud } from '../../scenes/CubeCloud';
import { EventHorizon } from '../../scenes/EventHorizon';
import { scenes } from '../../lib/content/load';
import { motionStudies, type MotionStudy } from './sequence';

declare global {
  interface Window {
    __orbitScene?: {
      blend: number;
      frames: number;
      calls: number;
      geometries: number;
      study: MotionStudy;
    };
  }
}
export interface OrbitCanvasProps {
  blend: MotionValue<number>;
  entrance: MotionValue<number>;
  study: MotionStudy;
  paused: boolean;
  capture: boolean;
  onReady(): void;
  onFailure(): void;
}
function World(props: OrbitCanvasProps & { quality: number }) {
  const { camera, invalidate, gl } = useThree();
  const { blend, entrance, onFailure } = props;
  const time = useRef(12);
  const frames = useRef(0);
  const reveal = useMemo(
    () => ({
      get: () =>
        MathUtils.smoothstep(props.blend.get(), 0.36, 0.96) *
        props.entrance.get(),
    }),
    [props.blend, props.entrance],
  );
  useEffect(() => {
    const a = blend.on('change', () => invalidate());
    const b = entrance.on('change', () => invalidate());
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => {
      a();
      b();
      gl.domElement.removeEventListener('webglcontextlost', lost);
    };
  }, [blend, entrance, onFailure, invalidate, gl]);
  useFrame((_, delta) => {
    if (!props.paused && !props.capture) time.current += Math.min(delta, 0.05);
    const mix = props.blend.get();
    camera.position.set(
      Math.sin(time.current * 0.08) * 0.7,
      1.2 + mix * 0.2,
      18 + mix * 4,
    );
    camera.lookAt(0, mix * 1.4, -25 - mix * 13);
    frames.current++;
    if (frames.current === 1) props.onReady();
    window.__orbitScene = {
      blend: mix,
      frames: frames.current,
      calls: gl.info.render.calls,
      geometries: gl.info.memory.geometries,
      study: props.study,
    };
  }, -3);
  return (
    <>
      <EventHorizon settings={scenes} time={time} presence={reveal} />
      <CubeCloud
        settings={scenes}
        time={time}
        quality={props.quality}
        collapse={props.blend}
        presence={props.entrance}
        swirl={motionStudies[props.study].swirl}
      />
    </>
  );
}
export default function OrbitCanvas(props: OrbitCanvasProps) {
  const [quality, setQuality] = useState(1);
  const lowerQuality = useCallback(() => setQuality(0.65), []);
  return (
    <Canvas
      camera={{ fov: 62, near: 0.1, far: 160, position: [0, 1.2, 18] }}
      dpr={quality === 1 ? 1.35 : 1}
      frameloop={props.paused || props.capture ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.82;
        gl.setClearColor('#030a12');
      }}
      fallback={<span>Still view</span>}
    >
      {!props.capture && !props.paused && (
        <PerformanceMonitor
          flipflops={2}
          onDecline={lowerQuality}
          onFallback={lowerQuality}
        />
      )}
      <World {...props} quality={quality} />
    </Canvas>
  );
}
