import { expect, test } from '@playwright/test';
import { inspectRotaryLayout } from '../support/rotary-layout';
import { inspectOrbitLayout } from '../support/orbit-layout';
import { inspectSlotCard } from '../support/slot-layout';
import { viewports } from '../support/viewports';

for (const [story, title, art] of [
  ['axolotl', 'Axolotl', 'foil'],
  ['event-horizon', 'Event horizon', 'relief'],
]) {
  test(`${title}: responsive slots, attached cards and progress`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.route('**/song/media/outer/**', (route) => route.abort());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:6010/iframe.html?id=homepage--${story}`);
    const deck = page.getByRole('region', { name: 'Information slots' });
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toHaveCount(1);
    for (const { width, height } of viewports) {
      await page.setViewportSize({ width, height });
      await deck.press('Home');
      for (let i = 0; i < 4; i++) {
        await expect(deck).toHaveAttribute('data-card-index', String(i));
        await expect(deck).toHaveAttribute('data-moving', 'false');
        await expect.poll(() => page.evaluate(inspectOrbitLayout)).toEqual([]);
        await expect.poll(() => page.evaluate(inspectRotaryLayout)).toEqual([]);
        if (i < 3) await deck.press('ArrowDown');
      }
    }
    await deck.press('ArrowUp');
    const blog = page.getByRole('button', { name: 'Blog', exact: true });
    const github = page.getByRole('button', { name: 'GitHub', exact: true });
    await expect(github.locator('.elsewhere-mark')).toHaveAttribute(
      'data-mark',
      'editorial',
    );
    await blog.click();
    const card = page.getByRole('group', { name: 'Current card' });
    await expect(card).toHaveAttribute('data-state', 'open');
    await expect(card.locator('.scene-card-art')).toHaveAttribute(
      'data-art',
      art!,
    );
    await expect.poll(() => page.evaluate(inspectSlotCard)).toEqual([]);
    await github.click();
    await blog.click();
    await github.click();
    await expect(card).toContainText('@royenheart');
    await page.keyboard.press('Escape');
    await expect(card).toHaveCount(0);
    await page.setViewportSize({ width: 320, height: 320 });
    await github.click();
    await expect(card).toHaveAttribute('data-state', 'open');
    await expect.poll(() => page.evaluate(inspectSlotCard)).toEqual([]);
    await deck.press('End');
    await expect(card).toHaveCount(0);
    await page.getByRole('button', { name: 'Next scene', exact: true }).click();
    await expect(deck).toHaveAttribute('data-card-index', '0');
    await expect(page.locator('main')).toHaveAttribute(
      'data-transitioning',
      'false',
    );
  });
}

test('root serves the selected homepage and gracefully recovers from unavailable graphics', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.1;
  });
  await page.route('**/song/media/outer/**', (route) => route.abort());
  await page.route('**/HomeCanvas.*.js', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page).toHaveTitle("RoyenHeart's Space");
  await expect(
    page.getByRole('heading', { name: 'Axolotl', exact: true }),
  ).toBeAttached();
  await expect(page.locator('main')).toHaveAttribute(
    'data-renderer',
    'fallback',
  );
  await expect(
    page.getByRole('region', { name: 'Information slots' }),
  ).toBeVisible();
  await expect(page.locator('.orbit-arrival,.orbit-scene-number')).toHaveCount(
    0,
  );
  await page.locator('.rotary-deck').press('End');
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await expect(page.locator('main')).toHaveAttribute('data-scene', 'horizon');
  await expect(page.locator('.rotary-card-active')).toHaveAttribute(
    'aria-label',
    'RoyenHeart on Event horizon',
  );
});

test('static page retains links without JavaScript and excludes comparison routes', async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'GitHub', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/royenheart');
  await expect(
    page.getByRole('link', { name: '浙ICP备2020042582号' }),
  ).toHaveAttribute('href', 'https://beian.miit.gov.cn/');
  expect((await request.get('/preview/')).status()).toBe(404);
  expect((await request.get('/preview-covers/')).status()).toBe(404);
  expect((await request.get('/licenses/octicons-LICENSE.txt')).status()).toBe(
    200,
  );
  await context.close();
});
