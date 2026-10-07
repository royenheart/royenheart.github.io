import { describe, expect, it } from 'vitest';
import { siteSchema, scenesSchema } from '../../src/lib/content/schema';
import { site, scenes } from '../../src/lib/content/load';
import { seededRandom } from '../../src/scenes/random';
describe('build-time content contracts', () => {
  it('preserves the current track, links, and two scenes', () => {
    expect(site.links.map((link) => link.href)).toContain(
      'https://royenheart.github.io',
    );
    expect(scenes.defaultScene).toBe('cubes');
    expect(scenes.horizon.background).toBe('#1a0b00');
  });
  it('rejects executable URLs, arbitrary embeds, invalid colors and budgets', () => {
    expect(
      siteSchema.safeParse({
        ...site,
        links: [{ label: 'Bad link', href: 'javascript:alert(1)' }],
      }).success,
    ).toBe(false);
    expect(
      scenesSchema.safeParse({ ...scenes, cubeCount: 100000 }).success,
    ).toBe(false);
    expect(
      scenesSchema.safeParse({
        ...scenes,
        cubes: { ...scenes.cubes, background: 'url(x)' },
      }).success,
    ).toBe(false);
  });
  it('has reproducible art without shared random state', () => {
    const first = seededRandom(82371);
    const second = seededRandom(82371);
    expect(Array.from({ length: 20 }, first.random)).toEqual(
      Array.from({ length: 20 }, second.random),
    );
    expect(() => first.pick([])).toThrow();
  });
});
