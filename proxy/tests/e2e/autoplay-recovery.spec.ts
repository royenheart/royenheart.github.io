import { expect, test } from '@playwright/test';
import { routeAudioFixture } from '../support/audio-fixture';

test('deferred preload can start on a real gesture and an explicit pause stays paused', async ({
  page,
}) => {
  await routeAudioFixture(page);
  await page.addInitScript(() => {
    const scope = window as unknown as {
      attempts: number;
      decks: HTMLAudioElement[];
    };
    scope.attempts = 0;
    scope.decks = [];
    const NativeAudio = window.Audio;
    const nativePlay = HTMLMediaElement.prototype.play;
    const readyState = Object.getOwnPropertyDescriptor(
      HTMLMediaElement.prototype,
      'readyState',
    )!;
    window.Audio = class extends NativeAudio {
      constructor() {
        super();
        this.loop = true;
        Object.defineProperty(this, 'preload', {
          get: () => 'none',
          set: () => {
            this.setAttribute('preload', 'none');
          },
        });
        Object.defineProperty(this, 'readyState', {
          get: () => (this.dataset.started ? readyState.get!.call(this) : 0),
        });
        scope.decks.push(this);
      }
    };
    HTMLMediaElement.prototype.play = function () {
      scope.attempts++;
      // Force the blocked policy even when automation permits initial autoplay.
      if (scope.attempts === 1 || !navigator.userActivation.isActive)
        return Promise.reject(
          new DOMException('A gesture is required', 'NotAllowedError'),
        );
      this.dataset.started = 'true';
      return nativePlay.call(this);
    };
  });
  await page.route('**/HomeCanvas.*.js', (route) => route.abort());
  await page.addInitScript(() => {
    Math.random = () => 0.1;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute(
    'data-audio-ready',
    'true',
  );
  await expect(page.locator('main')).toHaveAttribute(
    'data-audio-blocked',
    'true',
  );
  const attempts = () =>
    page.evaluate(() => (window as unknown as { attempts: number }).attempts);
  expect(await attempts()).toBe(1);
  // A synthetic event must not pretend to unlock browser permission.
  await page.evaluate(() =>
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })),
  );
  expect(await attempts()).toBe(1);
  await page.mouse.click(30, 30);
  await expect(page.locator('.orbit-wheel')).toHaveAttribute(
    'data-playing',
    'true',
  );
  await expect(page.locator('main')).toHaveAttribute(
    'data-audio-blocked',
    'false',
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { decks: HTMLAudioElement[] }).decks[0]!
            .currentTime,
      ),
    )
    .toBeGreaterThan(0.2);
  await page.locator('.rotary-deck').press('End');
  await page.getByRole('button', { name: 'Pause music', exact: true }).click();
  const pausedAttempts = await attempts();
  await page.mouse.click(30, 30);
  await page.locator('.rotary-deck').press('Home');
  await expect(page.locator('.orbit-wheel')).toHaveAttribute(
    'data-playing',
    'false',
  );
  expect(await attempts()).toBe(pausedAttempts);
});
