import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicTrack, TrackResolver } from '../../lib/music/sources';

export function useOrbitAudio(
  track: MusicTrack,
  resolve: TrackResolver,
  onEnded: () => void,
) {
  const element = useRef<HTMLAudioElement | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const context = useRef<AudioContext | null>(null);
  const source = useRef<MediaElementAudioSourceNode | null>(null);
  const request = useRef(0);
  const ended = useRef(onEnded);
  const [status, setStatus] = useState<{
    id: string;
    ready: boolean;
    playing: boolean;
    error: string | null;
    time: number;
    duration: number;
  }>({
    id: '',
    ready: false,
    playing: false,
    error: null,
    time: 0,
    duration: 0,
  });
  useEffect(() => {
    ended.current = onEnded;
  }, [onEnded]);
  useEffect(() => {
    const controller = new AbortController();
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    element.current = audio;
    const update = (values: Partial<typeof status>) => {
      if (!controller.signal.aborted)
        setStatus((old) => ({ ...old, id: track.id, ...values }));
    };
    const ready = () =>
      update({
        ready: true,
        error: null,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    const playing = () => update({ playing: true, error: null });
    const paused = () => update({ playing: false });
    const tick = () => update({ time: audio.currentTime });
    const finish = () => {
      paused();
      ended.current();
    };
    const failed = () =>
      update({
        playing: false,
        ready: false,
        error: 'Sound is unavailable. You can continue quietly.',
      });
    const listeners = {
      canplay: ready,
      playing,
      pause: paused,
      timeupdate: tick,
      ended: finish,
      error: failed,
    };
    for (const [name, handler] of Object.entries(listeners))
      audio.addEventListener(name, handler);
    update({ ready: false, playing: false, error: null, time: 0, duration: 0 });
    const timeout = window.setTimeout(() => {
      if (audio.readyState < 3) failed();
    }, 8000);
    resolve(track, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.playback.kind !== 'audio') {
          clearTimeout(timeout);
          update({
            ready: false,
            playing: false,
            error: result.playback.message,
          });
          return;
        }
        audio.src = result.playback.url;
        audio.load();
      })
      .catch(failed);
    return () => {
      controller.abort();
      clearTimeout(timeout);
      for (const [name, handler] of Object.entries(listeners))
        audio.removeEventListener(name, handler);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      source.current?.disconnect();
      source.current = null;
      if (element.current === audio) element.current = null;
    };
  }, [track, resolve]);
  useEffect(
    () => () => {
      void context.current?.close();
      context.current = null;
      analyser.current = null;
    },
    [],
  );
  const pause = useCallback(() => {
    request.current++;
    element.current?.pause();
  }, []);
  const play = useCallback(async () => {
    const audio = element.current;
    if (!audio || audio.readyState < 3) return false;
    const intent = ++request.current;
    try {
      if (!context.current) {
        context.current = new AudioContext();
        analyser.current = context.current.createAnalyser();
        analyser.current.fftSize = 256;
        analyser.current.smoothingTimeConstant = 0.8;
        analyser.current.connect(context.current.destination);
      }
      if (!source.current) {
        source.current = context.current.createMediaElementSource(audio);
        source.current.connect(analyser.current!);
      }
      await Promise.all([context.current.resume(), audio.play()]);
      if (request.current !== intent || element.current !== audio) {
        audio.pause();
        return false;
      }
      return true;
    } catch {
      if (request.current === intent && element.current === audio)
        setStatus((old) => ({
          ...old,
          playing: false,
          error: 'Press play to enable sound, or continue quietly.',
        }));
      return false;
    }
  }, []);
  const current =
    status.id === track.id
      ? status
      : { ready: false, playing: false, error: null, time: 0, duration: 0 };
  return { ...current, element, analyser, play, pause };
}
