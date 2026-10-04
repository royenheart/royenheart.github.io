import { z } from 'zod';
import data from '../../content/scene-music.json';
import type { SceneId } from '../content/schema';
import { parseMusicSource, type MusicTrack } from './sources';

const httpsUrl = z.url().refine((url) => url.startsWith('https://'));
const entry = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    artist: z.string().min(1),
    duration: z.number().positive(),
    artwork: httpsUrl,
    sourceUrl: z.string().min(1),
    links: z.array(z.object({ label: z.string().min(1), href: httpsUrl })),
  })
  .transform(({ sourceUrl, ...track }) => ({
    ...track,
    source: parseMusicSource(sourceUrl),
  }));

export type SceneMusicTrack = MusicTrack & {
  links?: { label: string; href: string }[];
};
export type SceneTracks = Record<SceneId, SceneMusicTrack>;
export const sceneTracks: SceneTracks = z
  .object({ cubes: entry, horizon: entry })
  .parse(data);
