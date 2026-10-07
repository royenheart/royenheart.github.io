import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MotionValue } from 'motion/react';
import { MathUtils } from 'three';
import type { SceneId } from '../../lib/content/schema';
import type { SceneTracks } from '../../lib/music/scene-tracks';
import type { TrackResolver } from '../../lib/music/sources';
import { useOrbitAudio } from './useOrbitAudio';

/** Keep both sources prepared while the same scene canvas remains mounted. */
export function useOrbitSoundtrack(
  tracks: SceneTracks,
  resolve: TrackResolver,
  scene: SceneId,
  target: SceneId | null,
  blend: MotionValue<number>,
  onEnded: () => void,
) {
  const [wanted, setWanted] = useState(false);
  const cubes = useOrbitAudio(tracks.cubes, resolve, () => {
    if (scene === 'cubes' && !target) onEnded();
  });
  const horizon = useOrbitAudio(tracks.horizon, resolve, () => {
    if (scene === 'horizon' && !target) onEnded();
  });
  const controls = useMemo(
    () => ({
      cubes: {
        play: cubes.play,
        pause: cubes.pause,
        prime: cubes.prime,
        setGain: cubes.setGain,
        element: cubes.element,
      },
      horizon: {
        play: horizon.play,
        pause: horizon.pause,
        prime: horizon.prime,
        setGain: horizon.setGain,
        element: horizon.element,
      },
    }),
    [
      cubes.play,
      cubes.pause,
      cubes.prime,
      cubes.setGain,
      cubes.element,
      horizon.play,
      horizon.pause,
      horizon.prime,
      horizon.setGain,
      horizon.element,
    ],
  );
  const play = useCallback(() => {
    setWanted(true);
    // Resume both contexts in the user gesture, without playing the spare deck.
    for (const deck of Object.values(controls))
      void deck.prime().catch(() => {});
    return controls[scene].play();
  }, [controls, scene]);
  const autoplay = useCallback(async () => {
    // A denied automatic attempt must not become a persistent playback intent.
    const started = await controls[scene].play();
    if (started) setWanted(true);
    return started;
  }, [controls, scene]);
  const pause = useCallback(() => {
    setWanted(false);
    for (const deck of Object.values(controls)) deck.pause();
  }, [controls]);
  useEffect(() => {
    if (!wanted) return;
    const source = controls[scene];
    const destination = controls[scene === 'cubes' ? 'horizon' : 'cubes'];
    const ready = { cubes: cubes.ready, horizon: horizon.ready };
    if (!target) {
      destination.pause();
      destination.setGain(0);
      if (destination.element.current?.readyState)
        destination.element.current.currentTime = 0;
      source.setGain(1);
      if (ready[scene]) void source.play();
      return;
    }
    let disposed = false;
    let started = false;
    const ended = source.element.current?.ended ?? false;
    destination.setGain(0);
    const update = () => {
      const progress = scene === 'cubes' ? blend.get() : 1 - blend.get();
      const weight = MathUtils.smoothstep(
        progress,
        ended ? 0 : 0.35,
        ended ? 0.12 : 1,
      );
      // Keep the source audible if the incoming source is delayed or unavailable.
      source.setGain(started ? Math.cos((weight * Math.PI) / 2) : 1);
      destination.setGain(started ? Math.sin((weight * Math.PI) / 2) : 0);
    };
    if (ready[target])
      void destination.play().then((playing) => {
        if (disposed) return;
        started = playing;
        update();
      });
    update();
    const unsubscribe = blend.on('change', update);
    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [wanted, scene, target, blend, controls, cubes.ready, horizon.ready]);
  return { ...(scene === 'cubes' ? cubes : horizon), play, pause, autoplay };
}
