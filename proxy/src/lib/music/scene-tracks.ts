import data from '../../content/scene-music.json';
import type { SceneId } from '../content/schema';
import type { MusicTrack } from './sources';
import { loadSceneTracks } from './scene-track-schema';

// Vite emits content-addressed audio assets alongside the existing static chunks.
const files = import.meta.glob<string>('../../assets/audio/*.mp3', {
  eager: true,
  query: '?url&no-inline',
  import: 'default',
});
const audioAssets = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').at(-1)!, url]),
);

export type SceneMusicTrack = MusicTrack & {
  links?: { label: string; href: string }[];
};
export type SceneTracks = Record<SceneId, SceneMusicTrack>;
export const sceneTracks: SceneTracks = loadSceneTracks(data, audioAssets);
