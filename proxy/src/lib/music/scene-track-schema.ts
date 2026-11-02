import { z } from 'zod';
import { parseMusicSource } from './sources';

const httpsUrl = z.url().refine((url) => url.startsWith('https://'));
const entry = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  artist: z.string().min(1),
  duration: z.number().positive(),
  artwork: httpsUrl,
  sourceUrl: z.string().min(1),
  audioFile: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.mp3$/)
    .optional(),
  links: z.array(z.object({ label: z.string().min(1), href: httpsUrl })),
});

export const sceneMusicSchema = z.object({ cubes: entry, horizon: entry });

export function loadSceneTracks(
  input: unknown,
  audioAssets: Record<string, string>,
) {
  const content = sceneMusicSchema.parse(input);
  const track = ({
    sourceUrl,
    audioFile,
    ...metadata
  }: z.infer<typeof entry>) => {
    const playbackUrl = audioFile ? audioAssets[audioFile] : undefined;
    if (audioFile && !playbackUrl)
      throw new Error(`Missing scene audio file: ${audioFile}`);
    return {
      ...metadata,
      source: parseMusicSource(sourceUrl),
      ...(playbackUrl ? { playbackUrl } : {}),
    };
  };
  return { cubes: track(content.cubes), horizon: track(content.horizon) };
}
