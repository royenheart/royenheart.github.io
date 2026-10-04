import { chromium } from '@playwright/test';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(process.argv[2] ?? '/tmp/proxy-orbit-study');
const local = relative(repository, output);
if (!local.startsWith('..') && !isAbsolute(local))
  throw new Error('Keep review captures outside the repository.');
const base = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006';
const story = (scene) =>
  `${base}/iframe.html?id=explorations-orbit-study--selected-${scene}&args=skipEntrance:true;startOpen:true&capture=1`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  // Review visual layout without depending on remote playback availability.
  await page.route('**/song/media/outer/**', (route) => route.abort());
  const shots = [];
  for (const scene of ['cubes', 'horizon']) {
    for (const size of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 390, height: 400 },
    ]) {
      await page.setViewportSize(size);
      await page.goto(story(scene));
      await page.locator('main[data-renderer="webgl"]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1000);
      const file = `trapezoid-${scene}-${size.width}x${size.height}.png`;
      await page.screenshot({ path: resolve(output, file) });
      const geometry = await page.evaluate(() => ({
        card: document
          .querySelector('.orbit-card-front')
          .getBoundingClientRect().height,
        artwork: document
          .querySelector('.orbit-artwork')
          .getBoundingClientRect().height,
        outline: getComputedStyle(document.querySelector('.orbit-card-front'))
          .clipPath,
      }));
      if (Math.abs(geometry.card / geometry.artwork - 0.4) > 0.01)
        throw new Error('The ribbon does not match the artwork proportion.');
      shots.push({ scene, ...size, file, geometry });
    }
  }
  await page.close();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: output, size: { width: 1280, height: 800 } },
  });
  const motion = await context.newPage();
  await motion.route('**/song/media/outer/**', (route) => route.abort());
  await motion.goto(story('horizon'));
  await motion.locator('main[data-renderer="webgl"]').waitFor();
  await motion.waitForTimeout(1200);
  for (let index = 0; index < 3; index++) {
    await motion
      .getByRole('button', { name: 'Next card', exact: true })
      .click();
    await motion.waitForTimeout(1100);
  }
  for (let index = 0; index < 3; index++) {
    await motion
      .getByRole('button', { name: 'Previous card', exact: true })
      .click();
    await motion.waitForTimeout(800);
  }
  const recording = await motion.video().path();
  await context.close();
  await rename(recording, resolve(output, 'card-motion.webm'));
  await writeFile(
    resolve(output, 'recipe.json'),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        backgroundTime: 12,
        screenshots: shots,
        cardShape:
          'Trapezoid; top wider than bottom; scene-independent silhouette',
        cardHeight:
          '40% of the actual artwork diameter; right seam occluded by artwork',
        motion: 'Actual browser recording; fixed background time',
        soundtrack:
          'Requested artist metadata; no substituted recording; audio requests aborted for this visual capture',
        blackHole:
          'Existing baseline. Relativistic replacement researched, not implemented.',
      },
      null,
      2,
    ),
  );
  await writeFile(
    resolve(output, 'index.html'),
    `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Orbit study — compact trapezoid cards</title>
<style>body{margin:0;padding:clamp(20px,4vw,60px);background:#0a101a;color:#e5eef5;font:16px/1.6 system-ui}main{max-width:1400px;margin:auto}h1{font-weight:500}a{color:#92ddfc}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px}figure{margin:0 0 32px}img,video{display:block;width:100%;border:1px solid #27394e}figcaption{padding:10px 0;color:#b5c5d5}button{background:#173048;color:white;border:1px solid #53748f;padding:12px 20px;font:inherit;cursor:pointer}small{display:block;margin-bottom:30px}video{max-height:75vh}</style>
<main><h1>Compact trapezoid cards</h1><p>The entire card is a trapezoid. The silhouette stays the same in both scenes; only the palette and internal surface change. Each ribbon is 40% of the artwork diameter, and its right seam is occluded by that artwork circle.</p>
<small>The black hole shown here is the existing baseline. Optical reconstruction is the next study. Remote music playback is disabled in these visual captures; the requested track metadata is retained.</small>
<figure><video id="motion" controls playsinline muted loop src="card-motion.webm"></video><figcaption>Actual card exchange, forward and backward. Fixed background time for comparison.</figcaption><button onclick="const v=document.getElementById('motion');v.currentTime=0;v.play()">Replay card motion</button></figure>
<section>${shots.map((shot) => `<figure><a href="${shot.file}"><img src="${shot.file}" alt="${shot.scene} scene, compact trapezoid card, ${shot.width} by ${shot.height}"></a><figcaption>${shot.scene} · ${shot.width} × ${shot.height} · ribbon ${shot.geometry.card}px / artwork ${shot.geometry.artwork}px</figcaption></figure>`).join('')}</section>
<p><a href="${story('cubes')}">Open live cube study</a> · <a href="${story('horizon')}">Open live horizon study</a> · <a href="recipe.json">Capture recipe</a></p></main></html>`,
  );
  process.stdout.write(`${output}/index.html\n`);
} finally {
  await browser.close();
}
