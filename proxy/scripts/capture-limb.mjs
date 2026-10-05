import { chromium, expect } from '@playwright/test';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(process.argv[2] ?? '/tmp/proxy-limb-study/final');
const local = relative(repository, output);
if (!local.startsWith('..') && !isAbsolute(local))
  throw new Error('Keep review artifacts outside Git.');
const base = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006';
const url = (scene, fixed = true) =>
  `${base}/iframe.html?id=explorations-orbit-study--selected-${scene}&args=skipEntrance:true;startOpen:true${fixed ? '&capture=1' : ''}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const recipe = {
  treatment: 'limb',
  dock: 'drum',
  screenshots: [],
  video: 'interaction.webm',
  audio: 'Artist media requests disabled; no substitute recording',
  backgroundTime: 12,
  cardDuration: 0.68,
  motionCapture: 'Normal runtime; wall-clock browser recording',
};
async function ready(page) {
  await expect(page.locator('main')).toHaveAttribute('data-renderer', 'webgl', {
    timeout: 25000,
  });
  await expect(page.locator('main')).toHaveAttribute(
    'data-horizon-treatment',
    'limb',
  );
  await expect(page.locator('.rotary-deck')).toHaveAttribute(
    'data-moving',
    'false',
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.querySelectorAll('img')].map((image) =>
        image.decode().catch(() => {}),
      ),
    );
  });
  await page.waitForTimeout(800);
}
try {
  const page = await browser.newPage();
  await page.route('**/song/media/outer/**', (route) => route.abort());
  for (const scene of ['cubes', 'horizon']) {
    for (const size of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 390, height: 400 },
    ]) {
      await page.setViewportSize(size);
      await page.goto(url(scene));
      await ready(page);
      await page.mouse.move(20, 20);
      await expect(page.locator('.orbit-sound')).toHaveCSS('opacity', '0');
      const file = `${scene}-${size.width}x${size.height}.png`;
      await page.screenshot({ path: resolve(output, file) });
      recipe.screenshots.push({
        file,
        scene,
        ...size,
        renderer: await page.locator('main').getAttribute('data-renderer'),
      });
      if (size.width === 1440) {
        await page.locator('.orbit-disc').hover({ position: { x: 12, y: 50 } });
        await expect(page.locator('.orbit-sound')).toHaveCSS('opacity', '1');
        await page.screenshot({
          path: resolve(output, `${scene}-hover.png`),
          clip: { x: 940, y: 650, width: 490, height: 235 },
        });
      }
    }
  }
  await page.close();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: output, size: { width: 1280, height: 800 } },
  });
  await context.route('**/song/media/outer/**', (route) => route.abort());
  const movie = await context.newPage();
  await movie.goto(url('horizon', false));
  await ready(movie);
  await movie.waitForTimeout(800);
  await movie.locator('.orbit-disc').hover({ position: { x: 12, y: 50 } });
  await movie.waitForTimeout(900);
  for (const [index, delta] of [
    [1, 220],
    [2, 220],
    [1, -220],
    [0, -220],
  ]) {
    const box = await movie.locator('.rotary-card-active').boundingBox();
    await movie.mouse.move(box.x + 80, box.y + box.height / 2);
    await movie.mouse.wheel(0, delta);
    await expect(movie.locator('.rotary-deck')).toHaveAttribute(
      'data-card-index',
      String(index),
    );
    await expect(movie.locator('.rotary-deck')).toHaveAttribute(
      'data-moving',
      'false',
    );
    await movie.waitForTimeout(450);
  }
  await movie.mouse.move(30, 30);
  await movie.waitForTimeout(800);
  const video = await movie.video().path();
  await context.close();
  await rename(video, resolve(output, recipe.video));
  await writeFile(
    resolve(output, 'recipe.json'),
    JSON.stringify(recipe, null, 2) + '\n',
  );
  const gallery = (scene) =>
    `<section><h2>${scene === 'cubes' ? 'Blue hour' : 'Event horizon'}</h2><img src="${scene}-1440x900.png" alt="${scene} desktop"><div class="details"><img src="${scene}-hover.png" alt="Artwork hover control"><a href="${scene}-390x844.png"><img class="phone" src="${scene}-390x844.png" alt="Phone preview"></a></div><p><a href="${url(scene, false)}">Interactive preview</a> · <a href="${scene}-390x400.png">Short viewport</a></p></section>`;
  await writeFile(
    resolve(output, 'index.html'),
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Limb glow and quiet controls</title><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#080c11;color:#e9e5df;font:16px/1.6 system-ui}main{max-width:1280px;margin:auto}h1,h2{font-weight:500}p{color:#b7c1cc;max-width:85ch}a{color:#e1bc80}img,video{display:block;width:100%;border-radius:6px}.details{display:flex;gap:30px;align-items:start;margin-top:24px}.details>img{width:55%}.details>a{width:30%}section{margin:60px 0}.phone{max-width:390px}video{margin:24px 0}@media(max-width:650px){body{padding:16px}.details{flex-direction:column}.details>img,.details>a{width:100%}}</style><main><h1>Limb glow and quiet controls</h1><p>B / Velvet drum is retained. Scroll over a card to browse. Playback appears over the artwork on hover or keyboard focus; on touch screens, tap the artwork first. The horizon combines a thin upper rim with a procedural foreground disk extending to the bottom.</p>${gallery('horizon')}${gallery('cubes')}<h2>Actual motion</h2><p>Normal background animation, cover hover and four wheel gestures. Artist media requests were disabled for this recording; it demonstrates visual interaction.</p><video controls playsinline muted loop src="interaction.webm"></video><p><a href="recipe.json">Capture recipe</a></p></main></html>`,
  );
  console.log(output);
} finally {
  await browser.close();
}
