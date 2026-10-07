import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor';
import { ACESFilmicToneMapping, SRGBColorSpace, MathUtils } from 'three';
import type { AccretionStyle, CubeArrivalStyle } from '../../scenes/accretion';
import type { GlitchDiagnostic } from '../../scenes/glitch';
import type { MotionValue } from 'motion/react';
import {
  Bloom,
  EffectComposer,
  EffectGroup,
  ToneMapping,
} from '@react-three/postprocessing';
import {
  BlendFunction,
  ToneMappingMode,
  type BloomEffect,
  type ToneMappingEffect,
  type EffectPass,
} from 'postprocessing';
import { CubeCloud } from '../../scenes/CubeCloud';
import {
  RelativisticHorizon,
  type DiskStyle,
  type HorizonDiagnostic,
  type RuptureStyle,
} from '../../scenes/RelativisticHorizon';
import { scenes } from '../../lib/content/load';
import type { MotionStudy } from './sequence';
import type { HorizonTreatment } from '../../scenes/relativity/framing';
import { orbitPixelRatio } from '../../scenes/render-budget';

declare global {
  interface Window {
    __orbitScene?: {
      blend: number;
      entrance: number;
      formation: number;
      direction: number;
      frames: number;
      calls: number;
      geometries: number;
      study: MotionStudy;
      horizonRenderer: 'baseline' | 'relativistic';
      textures: number;
      quality: number;
      pixelRatio: number;
      time: number;
      bufferWidth: number;
      bufferHeight: number;
    };
  }
}
export interface HomeCanvasProps {
  blend: MotionValue<number>;
  entrance: MotionValue<number>;
  direction?: MotionValue<number>;
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
  horizonDiagnostic: HorizonDiagnostic;
  transitionDiagnostic?: 'beauty' | 'material' | 'waves';
  ruptureStyle?: RuptureStyle;
  glitchDiagnostic?: GlitchDiagnostic;
  waveMode?: 'planar' | 'spatial';
  streamingWaves?: boolean;
  accretionStyle?: AccretionStyle;
  cubeArrival?: CubeArrivalStyle;
  sceneTime?: MotionValue<number>;
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
  const pass = useRef<EffectPass>(null);
  const warmed = useRef(false);
  useFrame(() => {
    if (effect.current) effect.current.intensity = amount * presence.get();
    if (toneMapping.current)
      toneMapping.current.blendMode.opacity.value = presence.get();
    if (pass.current) {
      // Prepare this pass once, then skip its blur pyramid when it contributes
      // nothing. Keeping the pass mounted avoids first-transition compilation.
      pass.current.enabled = !warmed.current || presence.get() > 0;
      warmed.current = true;
    }
  }, -1);
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <EffectGroup ref={pass}>
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
      </EffectGroup>
    </EffectComposer>
  );
}
function RenderBudget({
  quality,
  capture,
}: {
  quality: number;
  capture: boolean;
}) {
  const { size, setDpr, viewport } = useThree();
  useLayoutEffect(() => {
    const ratio = capture
      ? 1.2
      : orbitPixelRatio(
          size.width,
          size.height,
          window.devicePixelRatio,
          quality,
        );
    // Canvas configuration can reset DPR after initialization or a parent update.
    // Observe the actual renderer value as well as the requested quality.
    if (viewport.dpr !== ratio) setDpr(ratio);
  }, [size.width, size.height, viewport.dpr, quality, capture, setDpr]);
  return null;
}
function World(props: HomeCanvasProps & { quality: number }) {
  const { camera, invalidate, gl } = useThree();
  const { blend, entrance, onFailure } = props;
  const [initialTime] = useState(() => {
    if (!props.capture) return 12;
    const requested = Number(
      new URLSearchParams(window.location.search).get('sceneTime') ?? '12',
    );
    return Number.isFinite(requested)
      ? MathUtils.clamp(requested, 0, 3600)
      : 12;
  });
  const time = useRef(initialTime);
  const frames = useRef(0);
  const [opticsReady, setOpticsReady] = useState(false);
  const announced = useRef(false);
  const onOpticsReady = useCallback(() => setOpticsReady(true), []);
  const choreography =
    props.horizonRenderer === 'relativistic' &&
    props.horizonTreatment === 'limb';
  const expressive = choreography && props.study === 'collapse';
  const accretionStyle = props.accretionStyle ?? 'orbit';
  const depositing = expressive && accretionStyle !== 'legacy';
  const ruptureStyle = props.ruptureStyle ?? 'glitch';
  const mirror = ruptureStyle !== 'material';
  const direction = props.direction;
  const formation = useMemo(
    () => ({
      get: () =>
        Math.min(
          entrance.get(),
          expressive
            ? direction?.get() === -1
              ? 1
              : depositing
                ? blend.get()
                : MathUtils.smoothstep(blend.get(), 0.44, 0.94)
            : MathUtils.smoothstep(blend.get(), 0.3, 0.98),
        ),
    }),
    [entrance, blend, expressive, direction, depositing],
  );
  const reveal = useMemo(
    () => ({
      get: () =>
        (expressive && direction?.get() === -1
          ? 1 -
            MathUtils.smoothstep(
              1 - props.blend.get(),
              mirror ? 0.92 : 0.3,
              mirror ? 1 : 0.66,
            )
          : MathUtils.smoothstep(
              props.blend.get(),
              depositing ? 0.18 : expressive ? 0.4 : choreography ? 0.3 : 0.5,
              depositing ? 0.4 : expressive ? 0.68 : choreography ? 0.62 : 0.88,
            )) *
        (choreography
          ? MathUtils.smoothstep(props.entrance.get(), 0, 0.16)
          : props.entrance.get()),
    }),
    [
      props.blend,
      props.entrance,
      choreography,
      expressive,
      direction,
      mirror,
      depositing,
    ],
  );
  useEffect(() => {
    const a = blend.on('change', () => invalidate());
    const b = entrance.on('change', () => invalidate());
    const c = direction?.on('change', () => invalidate());
    const d = props.sceneTime?.on('change', () => invalidate());
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => {
      a();
      b();
      c?.();
      d?.();
      gl.domElement.removeEventListener('webglcontextlost', lost);
    };
  }, [blend, entrance, direction, props.sceneTime, onFailure, invalidate, gl]);
  useFrame((_, delta) => {
    if (props.sceneTime) time.current = props.sceneTime.get();
    else if (!props.paused && !props.capture)
      time.current += Math.min(delta, 0.05);
    const mix = props.blend.get();
    // The master material clock is linear; the camera arrives with zero velocity.
    const pose = depositing ? MathUtils.smootherstep(mix, 0, 1) : mix;
    camera.position.set(
      Math.sin(time.current * 0.08) * 0.7,
      1.2 + pose * 0.2,
      18 + pose * 4,
    );
    camera.lookAt(0, pose * 1.4, -25 - pose * 13);
    camera.updateMatrixWorld();
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
      entrance: entrance.get(),
      formation: formation.get(),
      direction: direction?.get() ?? 1,
      frames: frames.current,
      calls: gl.info.render.calls,
      geometries: gl.info.memory.geometries,
      study: props.study,
      horizonRenderer: props.horizonRenderer,
      textures: gl.info.memory.textures,
      quality: props.quality,
      pixelRatio: gl.getPixelRatio(),
      time: time.current,
      bufferWidth: gl.domElement.width,
      bufferHeight: gl.domElement.height,
    };
    gl.info.reset();
  }, -3);
  return (
    <>
      <RelativisticHorizon
        settings={scenes}
        time={time}
        presence={reveal}
        formation={formation}
        transition={blend}
        direction={direction}
        ruptureStyle="glitch"
        spatialWaves
        accretionStyle="orbit"
        diskStyle="turbulent"
        inclination={props.inclination}
        treatment="limb"
        diagnostic="beauty"
        onReady={onOpticsReady}
        onFailure={onFailure}
      />
      <CubeCloud
        settings={scenes}
        time={time}
        quality={props.quality}
        collapse={props.blend}
        presence={props.entrance}
        swirl={0}
        linearOutput
        horizonTreatment="limb"
        choreography
        accretionStyle="orbit"
        cubeArrival="gravity"
        expressive
        mirrorRupture
        glitchRupture
        direction={direction}
        inclination={props.inclination}
      />
      {props.horizonRenderer === 'relativistic' && (
        <OpticalPostprocessing
          presence={reveal}
          amount={props.horizonDiagnostic === 'beauty' ? props.bloom : 0}
        />
      )}
    </>
  );
}
function HomeCanvas(props: HomeCanvasProps) {
  const [quality, setQuality] = useState(1);
  const lowerQuality = useCallback(
    () => setQuality((current) => Math.max(0.45, current - 0.25)),
    [],
  );
  return (
    <Canvas
      camera={{ fov: 62, near: 0.1, far: 160, position: [0, 1.2, 18] }}
      dpr={props.capture ? 1.2 : 1}
      frameloop={props.paused || props.capture ? 'demand' : 'always'}
      gl={{
        // Keep the default framebuffer antialiased: disabling it leaves the
        // first demand frame blank in the tested Linux WebKit compositor.
        // Postprocessing targets still use multisampling={0}.
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
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
      <RenderBudget quality={quality} capture={props.capture} />
      {!props.capture && !props.paused && (
        <PerformanceMonitor
          bounds={() => [45, 58]}
          ms={200}
          iterations={6}
          onDecline={lowerQuality}
        />
      )}
      <World {...props} quality={quality} />
    </Canvas>
  );
}

// Song progress updates must not invalidate an otherwise idle scene canvas.
export default memo(HomeCanvas);
