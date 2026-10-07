import { expect, test } from '@playwright/test';
import { routeAudioFixture } from '../support/audio-fixture';
test('audio advances and drives ambient response; pause and reduced motion settle it', async ({
  page,
}) => {
  await routeAudioFixture(page);
  await page.route('**/HomeCanvas.*.js', (route) => route.abort());
  await page.addInitScript(() => {
    Math.random = () =>
      sessionStorage.getItem('start-scene') === 'horizon' ? 0.9 : 0.1;
    const probe = { media: [] as HTMLAudioElement[], sources: 0 };
    (window as unknown as { audioProbe: typeof probe }).audioProbe = probe;
    const NativeAudio = window.Audio;
    window.Audio = class extends NativeAudio {
      constructor() {
        super();
        this.loop = true;
        probe.media.push(this);
      }
    };
    const original = AudioContext.prototype.createMediaElementSource;
    AudioContext.prototype.createMediaElementSource = function (el) {
      probe.sources++;
      return original.call(this, el);
    };
  });
  for (const scene of ['cubes', 'horizon']) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('main')).toHaveAttribute('data-scene', scene);
    const deck = page.getByRole('region', { name: 'Information slots' });
    await deck.press('End');
    await expect(deck).toHaveAttribute('data-card-index', '3');
    await expect(deck).toHaveAttribute('data-moving', 'false');
    const play = page.getByRole('button', { name: 'Play music', exact: true });
    if (await play.count()) await play.click();
    await expect(page.locator('.orbit-wheel')).toHaveAttribute(
      'data-playing',
      'true',
    );
    await expect
      .poll(() =>
        page.evaluate(() =>
          Math.max(
            ...(
              window as unknown as { audioProbe: { media: HTMLAudioElement[] } }
            ).audioProbe.media.map((a) => a.currentTime),
          ),
        ),
      )
      .toBeGreaterThan(0.2);
    const ring = page.locator('.orbit-spectrum');
    await expect(ring).toHaveAttribute('data-response', 'ambient');
    const shape = () =>
      ring.evaluate((el) =>
        [...el.querySelectorAll('path,line')].map(
          (node) => node.getAttribute('d') ?? node.getAttribute('y2'),
        ),
      );
    const before = await shape();
    await expect.poll(shape).not.toEqual(before);
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { audioProbe: { sources: number } }).audioProbe
            .sources,
      ),
    ).toBe(0);
    await page
      .getByRole('button', { name: 'Pause music', exact: true })
      .click();
    await expect(ring).toHaveAttribute('data-response', 'rest');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Play music', exact: true }).click();
    await expect(ring).toHaveAttribute('data-response', 'rest');
    await page.evaluate(() => sessionStorage.setItem('start-scene', 'horizon'));
  }
});
