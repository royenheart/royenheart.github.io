import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  animate,
  motion,
  MotionConfig,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from 'motion/react';
import { site } from '../../lib/content/load';
import type { SceneId } from '../../lib/content/schema';
import { useReducedMotionPreference } from '../../lib/useReducedMotionPreference';
import type { TrackResolver } from '../../lib/music/sources';
import { resolvePublicAudio } from '../../lib/music/sources';
import { sceneTracks, type SceneTracks } from '../../lib/music/scene-tracks';
import cubesPoster from '../../assets/cubes.webp?url';
import horizonPoster from '../../assets/horizon.webp?url';
import { formationTiming } from './formation';
import { AudioWheel } from './AudioWheel';
import { continuousCards, sceneTitles } from './ContinuousCards';
import { randomCoverStudy, type CoverStudy } from './presentation';
import { RegistrationLinks } from './RegistrationLinks';
import { useAutoplayRecovery } from './useAutoplayRecovery';
import { RotaryDeck } from './RotaryDeck';
import { useOrbitSoundtrack } from './useOrbitSoundtrack';
import { adjacentScene, randomScene, sceneBlend } from './sequence';
import './orbit.css';
import './rotary.css';
import './presentation.css';
import './detail-studies.css';
import './card-finishes.css';
import './nameplate-motion.css';
import './elsewhere-preview.css';
const HomeCanvas = lazy(() => import('./HomeCanvas'));
const titles = sceneTitles;
const posters = { cubes: cubesPoster, horizon: horizonPoster };
class GraphicsBoundary extends Component<
  { children: ReactNode; onFailure(): void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export interface HomeExperienceProps {
  initialScene?: SceneId;
  graphics?: 'auto' | 'poster';
  skipEntrance?: boolean;
  resolve?: TrackResolver;
  tracks?: SceneTracks;
}

export function HomeExperience({
  initialScene,
  graphics = 'auto',
  skipEntrance = false,
  resolve = resolvePublicAudio,
  tracks = sceneTracks,
}: HomeExperienceProps) {
  const continuous = true;
  const entered = true;
  const expanded = true;
  const coverStudy = 'random';
  const study = 'collapse';
  const ruptureStyle = 'glitch';
  const horizonRenderer = 'relativistic';
  const horizonTreatment = 'limb';
  const cardFinish = 'nameplate';
  const dockDesign = 'drum';
  const cardDuration = 0.68;
  const paused = false;
  const capture = false;
  const fontStudy = 'plex';
  const surfaceMotion = 'drift';
  const elsewhereStudy = 'tile';
  const identityStudy = 'orbit';
  const elsewhereLinks = site.links;
  const cardExtraction = 'slide';
  const cardMaterial = 'drift';
  const elsewhereMark = 'editorial';
  const diskStyle = 'turbulent';
  const inclination = 12;
  const bloom = 0.28;
  const horizonDiagnostic = 'beauty';
  const [scene, setScene] = useState<SceneId>(
    () => initialScene ?? randomScene(),
  );
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [transitionCover, setTransitionCover] = useState<CoverStudy>('ripple');
  const [targetScene, setTargetScene] = useState<SceneId | null>(null);
  const [graphicsReady, setGraphicsReady] = useState(graphics === 'poster');
  const [failure, setFailure] = useState(false);
  const [introDone, setIntroDone] = useState(skipEntrance);
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotionPreference();
  const choreography =
    horizonRenderer === 'relativistic' && horizonTreatment === 'limb';
  const blend = useMotionValue(sceneBlend(scene));
  const entrance = useMotionValue(skipEntrance ? 1 : 0);
  const direction = useMotionValue(1);
  const accent = useTransform(blend, [0, 1], ['#94dfff', '#f5cc84']);
  const glow = useTransform(blend, [0, 1], ['#527eb933', '#b8813833']);
  const transition = useRef<AnimationPlaybackControls | null>(null);
  const locked = useRef(false);
  const root = useRef<HTMLElement>(null);
  const ignoreFocus = useRef(false);
  const restoreDeckFocus = useRef(false);
  const onReady = useCallback(() => setGraphicsReady(true), []);
  const onFailure = useCallback(() => {
    setFailure(true);
    setGraphicsReady(true);
  }, []);
  const next = useRef<() => void>(() => {});
  const audio = useOrbitSoundtrack(
    tracks,
    resolve,
    scene,
    targetScene,
    blend,
    () => next.current(),
  );
  const { pause, play } = audio;
  const navigate = useCallback(
    (step: 1 | -1) => {
      if (locked.current || !entered || !introDone) return;
      locked.current = true;
      restoreDeckFocus.current =
        continuous &&
        Boolean(
          root.current
            ?.querySelector('.orbit-dock')
            ?.contains(document.activeElement),
        );
      setTransitionCover(randomCoverStudy());
      setBusy(true);
      const target = adjacentScene(scene, step);
      setTargetScene(target);
      direction.set(scene === 'cubes' ? 1 : -1);
      transition.current?.stop();
      transition.current = animate(blend, sceneBlend(target), {
        duration: reduced
          ? 0
          : failure || graphics === 'poster'
            ? 0.2
            : formationTiming[scene === 'cubes' ? 'collapse' : 'glitch'],
        ease: 'linear',
        onComplete: () => {
          setScene(target);
          setIndex(0);
          setTargetScene(null);
          locked.current = false;
          setBusy(false);
        },
      });
    },
    [
      blend,
      continuous,
      introDone,
      entered,
      failure,
      graphics,
      reduced,
      scene,
      direction,
    ],
  );
  useEffect(() => {
    next.current = () => navigate(1);
  }, [navigate]);
  useEffect(() => {
    if (busy || !restoreDeckFocus.current) return;
    restoreDeckFocus.current = false;
    root.current?.querySelector<HTMLElement>('.rotary-deck')?.focus();
  }, [busy, scene]);
  useEffect(
    () => () => {
      transition.current?.stop();
    },
    [],
  );
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    update();
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    if (graphicsReady || graphics === 'poster') return;
    const timeout = window.setTimeout(onFailure, 10000);
    return () => clearTimeout(timeout);
  }, [graphics, graphicsReady, onFailure]);
  useEffect(() => {
    if (!graphicsReady || introDone) return;
    const control = animate(entrance, 1, {
      duration:
        reduced || failure || graphics === 'poster'
          ? 0
          : choreography
            ? formationTiming[scene]
            : scene === 'cubes'
              ? 2.2
              : 2.8,
      ease: choreography ? 'linear' : [0.22, 1, 0.36, 1],
      onComplete: () => setIntroDone(true),
    });
    return () => control.stop();
  }, [
    entrance,
    failure,
    graphics,
    graphicsReady,
    introDone,
    reduced,
    scene,
    choreography,
  ]);
  const close = () => {
    ignoreFocus.current = true;
    root.current?.querySelector<HTMLButtonElement>('.orbit-disc')?.focus();
    queueMicrotask(() => {
      ignoreFocus.current = false;
    });
  };
  const toggleSound = () => {
    if (audio.playing) {
      pause();
    } else {
      void play();
    }
  };
  const cards = continuousCards({
    scene,
    track: tracks[scene],
    identity: identityStudy,
    cardFinish,
    elsewhereStudy,
    elsewhereLinks,
    cardExtraction,
    cardMaterial,
    cardArt: scene === 'horizon' ? 'relief' : 'foil',
    elsewhereMark,
    reduced,
    time: audio.time,
    duration: audio.duration,
    playing: audio.playing,
    ready: audio.ready && !busy,
    onSound: toggleSound,
    onPrevious: () => navigate(-1),
    onNext: () => navigate(1),
  });
  const autoplayAttempted = useRef(false);
  const { autoplay } = audio;
  useAutoplayRecovery(
    continuous && introDone && !busy,
    audio.blocked,
    autoplay,
  );
  useEffect(() => {
    if (!continuous || !introDone || !audio.ready || autoplayAttempted.current)
      return;
    autoplayAttempted.current = true;
    if (!audio.playing) void autoplay();
  }, [continuous, introDone, audio.ready, audio.playing, autoplay]);
  return (
    <MotionConfig reducedMotion="user">
      <motion.main
        ref={root}
        className="orbit-study"
        data-scene={scene}
        data-interface="continuous"
        data-font={fontStudy}
        data-details="flow"
        data-card-finish={cardFinish}
        data-surface-motion={surfaceMotion}
        data-elsewhere={elsewhereStudy}
        data-detail-motion={reduced || !visible ? 'off' : 'on'}
        data-cover-selection={coverStudy}
        data-study={study}
        data-accretion-style="orbit"
        data-dock-design={dockDesign}
        data-horizon-treatment={horizonTreatment}
        data-entered={entered}
        data-intro-done={introDone}
        data-choreography={choreography}
        data-transitioning={busy}
        data-renderer={
          failure
            ? 'fallback'
            : graphics === 'poster'
              ? 'poster'
              : graphicsReady
                ? 'webgl'
                : 'loading'
        }
        data-reduced={reduced}
        data-audio-ready={audio.ready}
        data-audio-blocked={audio.blocked}
        style={
          {
            '--orbit-accent': accent,
            '--orbit-glow': glow,
          } as unknown as CSSProperties
        }
        onKeyDown={(event) => {
          if (event.key === 'Escape') close();
        }}
      >
        <div className="orbit-background" aria-hidden="true">
          <img className="orbit-poster" src={posters[scene]} alt="" />
          {graphics === 'auto' && !failure && (
            <div className="orbit-webgl">
              <GraphicsBoundary onFailure={onFailure}>
                <Suspense fallback={null}>
                  <HomeCanvas
                    blend={blend}
                    entrance={entrance}
                    direction={direction}
                    ruptureStyle={ruptureStyle}
                    study={study}
                    capture={capture}
                    paused={paused || reduced || !visible}
                    onReady={onReady}
                    onFailure={onFailure}
                    horizonRenderer={horizonRenderer}
                    diskStyle={diskStyle}
                    inclination={inclination}
                    bloom={bloom}
                    horizonTreatment={horizonTreatment}
                    horizonDiagnostic={horizonDiagnostic}
                  />
                </Suspense>
              </GraphicsBoundary>
            </div>
          )}
        </div>
        <header className="orbit-heading">
          <h1 className="sr-only">{titles[scene]}</h1>
        </header>
        {entered && (!continuous || introDone) && (
          <>
            <motion.div
              className="orbit-dock"
              initial={{ opacity: 0, y: reduced ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.7 }}
              inert={busy}
            >
              <div className="orbit-wheel-anchor" inert={busy}>
                <AudioWheel
                  persistent={continuous}
                  covers={continuous ? tracks : undefined}
                  blend={blend}
                  coverStudy={transitionCover}
                  playbackControl={!continuous}
                  artwork={tracks[scene].artwork}
                  title={tracks[scene].title}
                  expanded={expanded}
                  playing={audio.playing}
                  reduced={reduced || !visible}
                  scene={scene}
                  ready={audio.ready && !busy}
                  analyser={audio.analyser}
                  design={dockDesign}
                  cardIndex={index}
                  cardDuration={cardDuration}
                  onToggle={() => {
                    setIndex(0);
                    root.current
                      ?.querySelector<HTMLElement>('.rotary-deck')
                      ?.focus();
                  }}
                  onFocus={() => {
                    // Focus leaves the persistent information slots visible.
                  }}
                  onSound={toggleSound}
                />
              </div>
              <RotaryDeck
                cards={cards}
                index={index}
                onIndex={setIndex}
                reduced={reduced}
                onClose={close}
                design={dockDesign}
                persistent
                finish={cardFinish}
                duration={cardDuration}
              />
              {continuous && <RegistrationLinks docked />}
            </motion.div>
            {audio.error && (
              <p className="sr-only" role="status">
                {audio.error}
              </p>
            )}
          </>
        )}
        <p className="sr-only" aria-live="polite">
          {busy ? 'Moving to the adjacent scene' : titles[scene]}
        </p>
        {failure && (
          <p className="orbit-fallback" role="status">
            Still view · graphics unavailable
          </p>
        )}
      </motion.main>
    </MotionConfig>
  );
}
