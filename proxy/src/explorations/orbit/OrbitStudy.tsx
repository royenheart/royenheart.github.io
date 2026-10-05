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
import avatar from '../../assets/avatar.webp?url';
import cubesPoster from '../../assets/cubes.webp?url';
import horizonPoster from '../../assets/horizon.webp?url';
import { AudioWheel } from './AudioWheel';
import { CardDeck, type OrbitCard } from './CardDeck';
import { RotaryDeck } from './RotaryDeck';
import type { DockDesign } from './rotary-designs';
import { useOrbitAudio } from './useOrbitAudio';
import {
  adjacentScene,
  motionStudies,
  randomScene,
  sceneBlend,
  type MotionStudy,
} from './sequence';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/instrument-serif/400.css';
import './orbit.css';
import './rotary.css';
import type {
  DiskStyle,
  HorizonDiagnostic,
} from '../../scenes/RelativisticHorizon';
import type { HorizonTreatment } from '../../scenes/relativity/framing';

const OrbitCanvas = lazy(() => import('./OrbitCanvas'));
const titles = { cubes: 'Blue hour', horizon: 'Event horizon' };
const posters = { cubes: cubesPoster, horizon: horizonPoster };
const timestamp = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`;
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

export interface OrbitStudyProps {
  study?: MotionStudy;
  initialScene?: SceneId;
  graphics?: 'auto' | 'poster';
  skipEntrance?: boolean;
  startOpen?: boolean;
  resolve?: TrackResolver;
  tracks?: SceneTracks;
  horizonRenderer?: 'baseline' | 'relativistic';
  diskStyle?: DiskStyle;
  inclination?: number;
  bloom?: number;
  dockDesign?: DockDesign;
  cardDuration?: number;
  horizonTreatment?: HorizonTreatment;
  horizonDiagnostic?: HorizonDiagnostic;
}

export function OrbitStudy({
  study = 'gather',
  initialScene,
  graphics = 'auto',
  skipEntrance = false,
  startOpen = false,
  resolve = resolvePublicAudio,
  tracks = sceneTracks,
  horizonRenderer = 'relativistic',
  diskStyle = 'turbulent',
  inclination = 12,
  bloom = 0.28,
  dockDesign = 'drum',
  cardDuration = 0.68,
  horizonTreatment = 'limb',
  horizonDiagnostic = 'beauty',
}: OrbitStudyProps) {
  const [scene, setScene] = useState<SceneId>(
    () => initialScene ?? randomScene(),
  );
  const [entered, setEntered] = useState(skipEntrance);
  const [expanded, setExpanded] = useState(startOpen && skipEntrance);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(graphics === 'poster');
  const [failure, setFailure] = useState(false);
  const [introDone, setIntroDone] = useState(skipEntrance);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [capture] = useState(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('capture') === '1',
  );
  const reduced = useReducedMotionPreference();
  const blend = useMotionValue(sceneBlend(scene));
  const entrance = useMotionValue(skipEntrance ? 1 : 0);
  const accent = useTransform(blend, [0, 1], ['#94dfff', '#f5cc84']);
  const glow = useTransform(blend, [0, 1], ['#527eb933', '#b8813833']);
  const transition = useRef<AnimationPlaybackControls | null>(null);
  const locked = useRef(false);
  const wanted = useRef(false);
  const resumed = useRef('');
  const root = useRef<HTMLElement>(null);
  const ignoreFocus = useRef(false);
  const onReady = useCallback(() => setGraphicsReady(true), []);
  const onFailure = useCallback(() => {
    setFailure(true);
    setGraphicsReady(true);
  }, []);
  const next = useRef<() => void>(() => {});
  const audio = useOrbitAudio(tracks[scene], resolve, () => next.current());
  const { pause, play, ready: audioReady } = audio;
  const navigate = useCallback(
    (direction: 1 | -1) => {
      if (locked.current || !entered) return;
      locked.current = true;
      setBusy(true);
      setExpanded(false);
      pause();
      const target = adjacentScene(scene, direction);
      transition.current?.stop();
      transition.current = animate(blend, sceneBlend(target), {
        duration:
          reduced || failure || graphics === 'poster'
            ? 0.2
            : motionStudies[study].duration,
        ease: [0.65, 0, 0.35, 1],
        onComplete: () => {
          setScene(target);
          setIndex(0);
          resumed.current = '';
          locked.current = false;
          setBusy(false);
        },
      });
    },
    [pause, blend, entered, failure, graphics, reduced, scene, study],
  );
  useEffect(() => {
    next.current = () => navigate(1);
  }, [navigate]);
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
          : scene === 'cubes'
            ? 2.2
            : 2.8,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => setIntroDone(true),
    });
    return () => control.stop();
  }, [entrance, failure, graphics, graphicsReady, introDone, reduced, scene]);
  useEffect(() => {
    if (
      !entered ||
      busy ||
      !audioReady ||
      !wanted.current ||
      resumed.current === scene
    )
      return;
    resumed.current = scene;
    void play();
  }, [play, audioReady, busy, entered, scene]);
  const close = () => {
    setExpanded(false);
    ignoreFocus.current = true;
    root.current?.querySelector<HTMLButtonElement>('.orbit-disc')?.focus();
    queueMicrotask(() => {
      ignoreFocus.current = false;
    });
  };
  const toggleSound = () => {
    if (audio.playing) {
      wanted.current = false;
      pause();
    } else {
      wanted.current = true;
      resumed.current = scene;
      void play();
    }
  };
  const enter = (sound: boolean) => {
    wanted.current = sound;
    resumed.current = scene;
    if (sound) void play();
    setEntered(true);
  };
  const cards: OrbitCard[] = [
    {
      id: 'identity',
      label: 'A little about me',
      content: (
        <div className="orbit-ribbon-copy orbit-profile">
          <img
            src={avatar}
            alt={`${site.name}'s avatar`}
            width="32"
            height="32"
          />
          <h2 title={site.name}>{site.name}</h2>
        </div>
      ),
    },
    {
      id: 'scene',
      label: 'Inside this scene',
      content: (
        <>
          <div className="orbit-ribbon-copy">
            <p className="orbit-eyebrow">This scene</p>
            <h2 title={titles[scene]}>{titles[scene]}</h2>
          </div>
          <button
            className="orbit-ribbon-action"
            aria-label={paused ? 'Resume background' : 'Pause background'}
            onClick={() => setPaused((value) => !value)}
            disabled={reduced || failure || graphics === 'poster'}
          >
            {paused ? '▷' : 'Ⅱ'}
          </button>
        </>
      ),
    },
    {
      id: 'music',
      label: 'On the turntable',
      content: (
        <>
          <div className="orbit-ribbon-copy">
            <p className="orbit-eyebrow" title={tracks[scene].artist}>
              {tracks[scene].artist}
            </p>
            <h2 title={tracks[scene].title}>{tracks[scene].title}</h2>
          </div>
          <progress
            className="orbit-ribbon-progress"
            max={audio.duration || tracks[scene].duration || 1}
            value={audio.time}
            aria-label={`Song progress: ${timestamp(audio.time)}`}
          />
        </>
      ),
    },
    ...(tracks[scene].links ?? []).map((link) => ({
      id: `source-${link.label}`,
      label: `Listen on ${link.label}`,
      content: (
        <a
          className="orbit-ribbon-link"
          href={link.href}
          aria-label={`Open on ${link.label}`}
        >
          <div className="orbit-ribbon-copy">
            <p className="orbit-eyebrow">Listen on</p>
            <h2>{link.label}</h2>
          </div>
          <span aria-hidden="true">↗</span>
        </a>
      ),
    })),
    ...site.links.map((link) => ({
      id: `profile-${link.label}`,
      label: link.label,
      content: (
        <a
          className="orbit-ribbon-link"
          href={link.href}
          aria-label={link.label}
        >
          <div className="orbit-ribbon-copy">
            <p className="orbit-eyebrow">Elsewhere</p>
            <h2>{link.label}</h2>
          </div>
          <span aria-hidden="true">↗</span>
        </a>
      ),
    })),
    {
      id: 'next',
      label: 'Beyond this scene',
      content: (
        <>
          <div className="orbit-ribbon-copy orbit-destination">
            <p className="orbit-eyebrow">Up next</p>
            <h2>{titles[adjacentScene(scene, 1)]}</h2>
          </div>
          <div className="orbit-scene-actions">
            <button
              className="orbit-ribbon-action"
              aria-label="Previous scene"
              title="Previous scene"
              onClick={() => navigate(-1)}
              disabled={busy}
            >
              ←
            </button>
            <button
              className="orbit-ribbon-action"
              aria-label="Next scene"
              title="Next scene"
              onClick={() => navigate(1)}
              disabled={busy}
            >
              →
            </button>
          </div>
        </>
      ),
    },
  ];
  return (
    <MotionConfig reducedMotion="user">
      <motion.main
        ref={root}
        className="orbit-study"
        data-scene={scene}
        data-study={study}
        data-dock-design={dockDesign}
        data-horizon-treatment={horizonTreatment}
        data-entered={entered}
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
                  <OrbitCanvas
                    blend={blend}
                    entrance={entrance}
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
          <span className="orbit-scene-number">
            {scene === 'cubes' ? '01' : '02'} <span>/ 02</span>
          </span>
        </header>
        {!entered && (
          <section className="orbit-arrival" aria-label="Enter the scene">
            <div
              className={`orbit-arrival-mark orbit-arrival-${scene}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </div>
            <p className="orbit-eyebrow">
              {scene === 'cubes'
                ? 'Finding a little order'
                : 'Following the last light'}
            </p>
            <h2>{titles[scene]}</h2>
            <p role="status">
              {!introDone
                ? 'Forming your space…'
                : audio.ready
                  ? 'Your space is ready.'
                  : (audio.error ?? 'Preparing the music…')}
            </p>
            <button
              className="orbit-enter"
              onClick={() => enter(true)}
              disabled={!introDone || !audio.ready}
            >
              Enter with sound <span aria-hidden="true">↗</span>
            </button>
            <button
              className="orbit-quiet"
              onClick={() => enter(false)}
              disabled={!introDone}
            >
              Enter quietly
            </button>
          </section>
        )}
        {entered && (
          <>
            <motion.div
              className="orbit-dock"
              initial={{ opacity: 0, y: reduced ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.7 }}
            >
              <div className="orbit-wheel-anchor" inert={busy}>
                <AudioWheel
                  key={scene}
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
                  onToggle={() => setExpanded((value) => !value)}
                  onFocus={() => {
                    if (!ignoreFocus.current) setExpanded(true);
                  }}
                  onSound={toggleSound}
                />
              </div>
              {expanded && !busy && dockDesign === 'classic' && (
                <CardDeck
                  cards={cards}
                  index={index}
                  onIndex={setIndex}
                  reduced={reduced}
                  onClose={close}
                />
              )}
              {expanded && !busy && dockDesign !== 'classic' && (
                <RotaryDeck
                  cards={cards}
                  index={index}
                  onIndex={setIndex}
                  reduced={reduced}
                  onClose={close}
                  design={dockDesign}
                  duration={cardDuration}
                />
              )}
            </motion.div>
            {audio.error && (
              <p className="sr-only" role="status">
                {audio.error}
              </p>
            )}
          </>
        )}
        <footer className="orbit-footer">
          {site.registrations.map((registration) => (
            <a key={registration.href} href={registration.href}>
              {registration.label}
            </a>
          ))}
        </footer>
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
