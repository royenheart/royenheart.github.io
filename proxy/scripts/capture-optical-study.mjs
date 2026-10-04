import { chromium, expect } from '@playwright/test';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { relative, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(process.argv[2] ?? '/tmp/proxy-optical-study/review');
const local = relative(repository, output);
if (!local.startsWith('..') && !isAbsolute(local))
  throw new Error('Keep review artifacts outside Git.');
const base = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006';
const story = (name, fixed = true, extra = '') =>
  `${base}/iframe.html?id=explorations-orbit-study--${name}&args=skipEntrance:true${extra}${fixed ? '&capture=1' : ''}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const metadata = {
  comparisons: [],
  recordings: [],
  backgroundTime: 12,
  audio: 'Media requests disabled; no artist recording substituted',
};
async function prepare(page, url) {
  await page.route('**/song/media/outer/**', (route) => route.abort());
  await page.goto(url);
  await expect(page.locator('main')).toHaveAttribute('data-renderer', 'webgl', {
    timeout: 15000,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
}
async function lastCard(page) {
  await page.locator('.orbit-disc').click();
  const count = Number(
    await page.locator('.orbit-deck').getAttribute('data-card-count'),
  );
  for (let i = 1; i < count; i++)
    await page.getByRole('button', { name: 'Next card', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next scene' })).toBeVisible();
}
async function saveVideo(context, page, file) {
  const path = await page.video().path();
  await context.close();
  await rename(path, resolve(output, file));
  metadata.recordings.push(file);
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  for (const name of [
    'horizon-baseline',
    'horizon-silk',
    'horizon-turbulent',
  ]) {
    await prepare(page, story(name));
    const file = `${name}.png`;
    await page.screenshot({ path: resolve(output, file) });
    metadata.comparisons.push({ name, file, width: 1440, height: 900 });
  }
  for (const scene of ['cubes', 'horizon']) {
    for (const size of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 390, height: 400 },
    ]) {
      await page.setViewportSize(size);
      await prepare(page, story(`selected-${scene}`, true, ';startOpen:true'));
      const file = `compact-${scene}-${size.width}x${size.height}.png`;
      await page.screenshot({ path: resolve(output, file) });
      const dimensions = await page.evaluate(() =>
        Object.fromEntries(
          ['wheel', 'artwork', 'card-front'].map((name) => {
            const r = document
              .querySelector(`.orbit-${name}`)
              .getBoundingClientRect();
            return [name, { width: r.width, height: r.height }];
          }),
        ),
      );
      metadata.comparisons.push({
        name: `Compact ${scene}`,
        file,
        ...size,
        dimensions,
      });
    }
  }
  await page.close();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: output, size: { width: 1280, height: 800 } },
  });
  const sequence = await context.newPage();
  await prepare(sequence, story('selected-cubes'));
  await lastCard(sequence);
  await sequence
    .getByRole('button', { name: 'Next scene', exact: true })
    .click();
  await expect(sequence.locator('main')).toHaveAttribute(
    'data-scene',
    'horizon',
    { timeout: 10000 },
  );
  await sequence.waitForTimeout(1000);
  await lastCard(sequence);
  await sequence
    .getByRole('button', { name: 'Previous scene', exact: true })
    .click();
  await expect(sequence.locator('main')).toHaveAttribute(
    'data-scene',
    'cubes',
    { timeout: 10000 },
  );
  await sequence.waitForTimeout(1000);
  await saveVideo(context, sequence, 'scene-sequence.webm');

  const runtimeContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: output, size: { width: 1280, height: 800 } },
  });
  const runtime = await runtimeContext.newPage();
  await prepare(runtime, story('selected-horizon', false));
  await runtime.waitForTimeout(6500);
  metadata.runtime = await runtime.evaluate(() => window.__orbitScene);
  await saveVideo(runtimeContext, runtime, 'disk-motion.webm');
  await writeFile(
    resolve(output, 'recipe.json'),
    JSON.stringify(metadata, null, 2) + '\n',
  );
  await writeFile(
    resolve(output, 'index.html'),
    `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Compact orbit and curved light</title>
<style>body{background:#080b10;color:#e9e3d7;font:15px/1.7 system-ui;margin:0;padding:clamp(18px,4vw,56px)}main{max-width:1500px;margin:auto}h1,h2{font-weight:500}a{color:#f3c887}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px}figure{margin:0 0 28px}img,video{width:100%;display:block;border:1px solid #31302b}figcaption{padding:8px 0;color:#bcb6a9}video{max-height:70vh}</style>
<main><h1>Compact orbit · curved light</h1><p>The sketch defines overlap and silhouette. Control sizes adapt to the screen: a 124px phone wheel, a maximum 164px desktop wheel, and 44–54px information ribbons.</p>
<h2>Black hole comparison</h2><p>The old baseline, a quieter disk and a filament-rich disk share the same page layout. New variants use precomputed Schwarzschild light paths; disk density and gold grading are artistic models, not a fluid simulation.</p><section>${metadata.comparisons
      .slice(0, 3)
      .map(
        (shot) =>
          `<figure><a href="${shot.file}"><img src="${shot.file}" alt="${shot.name}"></a><figcaption>${shot.name}</figcaption></figure>`,
      )
      .join('')}</section>
<h2>Actual motion</h2><section><figure><video controls playsinline muted loop src="disk-motion.webm"></video><figcaption>Live differential disk rotation and curved light.</figcaption></figure><figure><video controls playsinline muted loop src="scene-sequence.webm"></video><figcaption>Adjacent scene traversal, forward and backward. Fixed background time isolates the transition.</figcaption></figure></section>
<h2>Compact layout</h2><section>${metadata.comparisons
      .slice(3)
      .map(
        (shot) =>
          `<figure><a href="${shot.file}"><img src="${shot.file}" alt="${shot.name}"></a><figcaption>${shot.name} · ${shot.width} × ${shot.height}</figcaption></figure>`,
      )
      .join('')}</section>
<p>Music requests were disabled for this visual review. Artwork and source links identify the requested recordings. No audio recording was substituted.</p><p><a href="${story('selected-horizon', false)}">Live horizon</a> · <a href="${story('selected-cubes', false)}">Live cubes</a> · <a href="recipe.json">Recipe and dimensions</a></p></main></html>`,
  );
  process.stdout.write(`${output}/index.html\n`);
} finally {
  await browser.close();
}
