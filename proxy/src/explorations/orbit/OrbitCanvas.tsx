import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor';
import { ACESFilmicToneMapping, SRGBColorSpace, MathUtils } from 'three';
import type { MotionValue } from 'motion/react';
import {
  Bloom,
  EffectComposer,
  ToneMapping,
} from '@react-three/postprocessing';
import {
  BlendFunction,
  ToneMappingMode,
  type BloomEffect,
  type ToneMappingEffect,
} from 'postprocessing';
import { CubeCloud } from '../../scenes/CubeCloud';
import { EventHorizon } from '../../scenes/EventHorizon';
import {
  RelativisticHorizon,
  type DiskStyle,
} from '../../scenes/RelativisticHorizon';
import { scenes } from '../../lib/content/load';
import { motionStudies, type MotionStudy } from './sequence';
import type { HorizonTreatment } from '../../scenes/relativity/framing';

declare global {
  interface Window {
    __orbitScene?: {
      blend: number;
      frames: number;
      calls: number;
      geometries: number;
      study: MotionStudy;
      horizonRenderer: 'baseline' | 'relativistic';
      textures: number;
      quality: number;
      pixelRatio: number;
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
  horizonRenderer: 'baseline' | 'relativistic';
  diskStyle: DiskStyle;
  inclination: number;
  bloom: number;
  horizonTreatment: HorizonTreatment;
}
function OpticalPostprocessing({
  presence,
  amount,
}: {
  presence: { get(): number };
  amount: number;
}) {
  const effect = useRef<BloomEffect>(null);
  const toneMapping = useRef<ToneMappingEffect>(null);
  useFrame(() => {
    if (effect.current) effect.current.intensity = amount * presence.get();
    if (toneMapping.current)
      toneMapping.current.blendMode.opacity.value = presence.get();
  }, -1);
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        ref={effect}
        intensity={amount}
        luminanceThreshold={1.2}
        luminanceSmoothing={0.2}
        mipmapBlur
        levels={4}
        radius={0.5}
        resolutionScale={0.5}
      />
      <ToneMapping
        ref={toneMapping}
        mode={ToneMappingMode.ACES_FILMIC}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
function World(props: OrbitCanvasProps & { quality: number }) {
  const { camera, invalidate, gl } = useThree();
  const { blend, entrance, onFailure } = props;
  const time = useRef(12);
  const frames = useRef(0);
  const [opticsReady, setOpticsReady] = useState(false);
  const announced = useRef(false);
  const onOpticsReady = useCallback(() => setOpticsReady(true), []);
  const reveal = useMemo(
    () => ({
      get: () =>
        MathUtils.smoothstep(props.blend.get(), 0.5, 0.88) *
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
    if (
      !announced.current &&
      (props.horizonRenderer === 'baseline' || opticsReady)
    ) {
      announced.current = true;
      props.onReady();
    }
    window.__orbitScene = {
      blend: mix,
      frames: frames.current,
      calls: gl.info.render.calls,
      geometries: gl.info.memory.geometries,
      study: props.study,
      horizonRenderer: props.horizonRenderer,
      textures: gl.info.memory.textures,
      quality: props.quality,
      pixelRatio: gl.getPixelRatio(),
    };
    gl.info.reset();
  }, -3);
  return (
    <>
      {props.horizonRenderer === 'baseline' ? (
        <EventHorizon settings={scenes} time={time} presence={reveal} />
      ) : (
        <RelativisticHorizon
          settings={scenes}
          time={time}
          presence={reveal}
          diskStyle={props.diskStyle}
          inclination={props.inclination}
          treatment={props.horizonTreatment}
          onReady={onOpticsReady}
          onFailure={onFailure}
        />
      )}
      <CubeCloud
        settings={scenes}
        time={time}
        quality={props.quality}
        collapse={props.blend}
        presence={props.entrance}
        swirl={motionStudies[props.study].swirl}
        linearOutput={props.horizonRenderer === 'relativistic'}
        horizonTreatment={props.horizonTreatment}
      />
      {props.horizonRenderer === 'relativistic' && (
        <OpticalPostprocessing presence={reveal} amount={props.bloom} />
      )}
    </>
  );
}
export default function OrbitCanvas(props: OrbitCanvasProps) {
  const [quality, setQuality] = useState(1);
  const lowerQuality = useCallback(
    () => setQuality((current) => Math.max(0.45, current - 0.25)),
    [],
  );
  const minimumQuality = useCallback(() => setQuality(0.45), []);
  return (
    <Canvas
      camera={{ fov: 62, near: 0.1, far: 160, position: [0, 1.2, 18] }}
      dpr={quality === 1 ? 1.2 : quality > 0.5 ? 0.9 : 0.7}
      frameloop={props.paused || props.capture ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.info.autoReset = false;
        if (
          props.horizonRenderer === 'relativistic' &&
          !gl.extensions.has('EXT_color_buffer_float')
        ) {
          props.onFailure();
          return;
        }
        gl.debug.onShaderError = (context, _program, vertex, fragment) => {
          console.error(
            'Orbit shader failed',
            context.getShaderInfoLog(vertex),
            context.getShaderInfoLog(fragment),
          );
          props.onFailure();
        };
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
          onFallback={minimumQuality}
        />
      )}
      <World {...props} quality={quality} />
    </Canvas>
  );
}
