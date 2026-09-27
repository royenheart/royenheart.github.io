import { z } from 'zod';

const httpsUrl = z.url({ protocol: /^https$/ });
const link = z
  .object({ label: z.string().trim().min(1), href: httpsUrl })
  .strict();
const color = z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color');
export const sceneIdSchema = z.enum(['cubes', 'horizon']);
export type SceneId = z.infer<typeof sceneIdSchema>;
export const siteSchema = z
  .object({
    title: z.string().min(1),
    name: z.string().min(1),
    links: z.array(link).min(1),
    registrations: z.array(link),
  })
  .strict();
export const trackSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    kind: z.literal('netease-embed'),
    songId: z.string().regex(/^\d+$/),
    label: z.string().trim().min(1),
  })
  .strict();
export const playlistSchema = z
  .object({
    defaultTrackId: z.string().nullable(),
    tracks: z.array(trackSchema),
  })
  .strict()
  .superRefine(({ tracks, defaultTrackId }, ctx) => {
    const ids = new Set<string>();
    tracks.forEach((track, index) => {
      if (ids.has(track.id))
        ctx.addIssue({
          code: 'custom',
          path: ['tracks', index, 'id'],
          message: 'Track IDs must be unique',
        });
      ids.add(track.id);
    });
    if (defaultTrackId !== null && !ids.has(defaultTrackId))
      ctx.addIssue({
        code: 'custom',
        path: ['defaultTrackId'],
        message: 'Default track must exist',
      });
    if (tracks.length > 0 && defaultTrackId === null)
      ctx.addIssue({
        code: 'custom',
        path: ['defaultTrackId'],
        message: 'Choose a default track',
      });
  });
export const scenesSchema = z
  .object({
    defaultScene: sceneIdSchema,
    seed: z.number().int().nonnegative(),
    cubeCount: z.number().int().min(100).max(1200),
    cubes: z
      .object({
        background: color,
        cube: color,
        highlight: color,
        ambient: color,
      })
      .strict(),
    horizon: z
      .object({
        background: color,
        deepOrange: color,
        gold: color,
        paleGold: color,
        whiteGold: color,
      })
      .strict(),
  })
  .strict();
export type SiteContent = z.infer<typeof siteSchema>;
export type Playlist = z.infer<typeof playlistSchema>;
export type Track = z.infer<typeof trackSchema>;
export type SceneSettings = z.infer<typeof scenesSchema>;
