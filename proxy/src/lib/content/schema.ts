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
    links: z
      .array(
        link.extend({
          preview: z
            .object({
              identity: z.string().min(1),
              description: z.string().min(1),
              topics: z.array(z.string().min(1)).max(3),
            })
            .strict()
            .optional(),
        }),
      )
      .min(1),
    registrations: z.array(link),
  })
  .strict();
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
export type SceneSettings = z.infer<typeof scenesSchema>;
