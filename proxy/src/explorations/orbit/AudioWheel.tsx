import { useRef, useState, type RefObject } from 'react';
import { useAnimationFrame } from 'motion/react';
import type { DockDesign } from './rotary-designs';
import { WheelTrim } from './WheelTrim';
import type { SceneId } from '../../lib/content/schema';
import {
  audioContourPath,
  measureContourAudio,
  quietLevels,
} from './audio-contours';

export function AudioWheel({
  artwork,
  title,
  expanded,
  playing,
  reduced,
  analyser,
  onToggle,
  onFocus,
  onSound,
  ready,
  design = 'classic',
  cardIndex = 0,
  cardDuration = 0.68,
  scene = 'cubes',
}: {
  artwork?: string;
  title: string;
  expanded: boolean;
  playing: boolean;
  reduced: boolean;
  ready: boolean;
  design?: DockDesign;
  cardIndex?: number;
  cardDuration?: number;
  scene?: SceneId;
  analyser: RefObject<AnalyserNode | null>;
  onToggle(): void;
  onFocus(): void;
  onSound(): void;
}) {
  const ring = useRef<SVGSVGElement>(null);
  const bins = useRef(new Uint8Array(128));
  const waveform = useRef(new Uint8Array(256));
  const levels = useRef(quietLevels());
  const last = useRef(0);
  const wasLive = useRef(false);
  const pointerFocus = useRef(false);
  const [failedArtwork, setFailedArtwork] = useState<string>();
  useAnimationFrame((time) => {
    if (time - last.current < 40) return;
    const delta = Math.min(0.1, (time - last.current) / 1000);
    last.current = time;
    if (!ring.current) return;
    const live = playing && !reduced && analyser.current;
    if (!live && !wasLive.current) return;
    if (live) live.getByteFrequencyData(bins.current);
    if (scene === 'horizon') {
      if (live) live.getByteTimeDomainData(waveform.current);
      const target = live
        ? measureContourAudio(bins.current, waveform.current)
        : quietLevels();
      for (const key of ['energy', 'low', 'mid', 'high'] as const) {
        const value = levels.current[key];
        const rate = target[key] > value ? 0.085 : 0.3;
        levels.current[key] = reduced
          ? 0
          : value + (target[key] - value) * (1 - Math.exp(-delta / rate));
        if (levels.current[key] < 0.001) levels.current[key] = 0;
      }
      ring.current.querySelectorAll('path').forEach((path, index) => {
        path.setAttribute(
          'd',
          audioContourPath(index, time / 1000, levels.current),
        );
      });
      wasLive.current = Boolean(live) || levels.current.energy > 0;
      ring.current.dataset.energy = levels.current.energy.toFixed(4);
      return;
    }
    wasLive.current = Boolean(live);
    const bars = ring.current.querySelectorAll('line');
    bars.forEach((bar, index) => {
      const bin = 1 + Math.floor(((index % 32) / 31) * 28);
      const amplitude = live ? (bins.current[bin] ?? 0) / 255 : 0;
      bar.setAttribute('y2', `${12 - amplitude * 10}`);
    });
    ring.current.dataset.energy = live
      ? String(Math.max(...bins.current))
      : '0';
  });
  return (
    <div className="orbit-wheel" data-playing={playing}>
      {design !== 'classic' && scene !== 'horizon' && (
        <WheelTrim
          design={design}
          index={cardIndex}
          duration={cardDuration}
          reduced={reduced}
        />
      )}
      <svg
        key={scene}
        ref={ring}
        className="orbit-spectrum"
        data-form={scene === 'horizon' ? 'contours' : 'bars'}
        data-energy="0"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        {scene === 'horizon' ? (
          Array.from({ length: 4 }, (_, layer) => (
            <path key={layer} d={audioContourPath(layer, 0, quietLevels())} />
          ))
        ) : (
          <>
            <circle cx="100" cy="100" r="84" />
            {Array.from({ length: 64 }, (_, index) => (
              <line
                key={index}
                x1="100"
                y1="15"
                x2="100"
                y2="12"
                transform={`rotate(${(index * 360) / 64} 100 100)`}
              />
            ))}
          </>
        )}
      </svg>
      <div className="orbit-cover-controls">
        <button
          className="orbit-disc"
          aria-label={
            expanded ? 'Close information cards' : 'Open information cards'
          }
          aria-expanded={expanded}
          aria-controls={expanded ? 'orbit-deck' : undefined}
          onPointerDown={() => {
            pointerFocus.current = true;
          }}
          onClick={() => {
            onToggle();
            pointerFocus.current = false;
          }}
          onBlur={() => {
            pointerFocus.current = false;
          }}
          onFocus={(event) => {
            if (
              !pointerFocus.current &&
              event.currentTarget.matches(':focus-visible')
            )
              onFocus();
          }}
        >
          <span className="orbit-disc-grooves" aria-hidden="true" />
          <span className="orbit-artwork">
            {artwork && failedArtwork !== artwork ? (
              <img
                src={artwork}
                alt={`${title} artwork`}
                onError={() => setFailedArtwork(artwork)}
              />
            ) : (
              <span
                className="orbit-artwork-placeholder"
                aria-label={`${title} artwork unavailable`}
              >
                ♫
              </span>
            )}
          </span>
          <span className="orbit-spindle" aria-hidden="true" />
        </button>
        <button
          className="orbit-sound"
          aria-label={playing ? 'Pause music' : 'Play music'}
          disabled={!ready}
          onClick={onSound}
        >
          {playing ? (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M7 4v12M13 4v12" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m7 4 9 6-9 6Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
