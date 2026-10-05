import { chromium, expect } from '@playwright/test';
import { mkdir, rename, writeFile, readFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(process.argv[2] ?? '/tmp/proxy-rotary-study/final');
const local = relative(repository, output);
if (!local.startsWith('..') && !isAbsolute(local))
  throw new Error('Keep review artifacts outside Git.');
const base = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006';
const variants = [
  {
    id: 'tangent',
    story: 'tangent-glass',
    name: 'A / Tangent glass',
    detail: 'Top tangent · softened taper · radial sweep',
  },
  {
    id: 'drum',
    story: 'velvet-drum',
    name: 'B / Velvet drum',
    detail: 'Centered capsule · brushed texture · cylindrical roll',
  },
  {
    id: 'orbit',
    story: 'orbital-ribbon',
    name: 'C / Orbital ribbon',
    detail: 'Slender curved edge · flowing grain · banked orbit',
  },
];
const url = (variant, scene) =>
  `${base}/iframe.html?id=explorations-rotary-directions--${variant.story}&capture=1&args=initialScene:${scene};cardDuration:0.85`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const recipe = {
  variants,
  frames: [],
  movies: [],
  backgroundTime: 12,
  cardDuration: 0.85,
  selected: 'drum',
  audio: 'Media requests disabled; no artist recording substituted',
};
async function ready(scope) {
  await expect(scope.locator('main')).toHaveAttribute(
    'data-renderer',
    'webgl',
    { timeout: 20000 },
  );
  await expect(scope.locator('.rotary-deck')).toHaveAttribute(
    'data-moving',
    'false',
  );
}
try {
  const page = await browser.newPage();
  await page.route('**/song/media/outer/**', (r) => r.abort());
  for (const scene of ['cubes', 'horizon']) {
    for (const variant of variants) {
      for (const size of [
        { width: 1440, height: 900 },
        { width: 390, height: 844 },
        { width: 390, height: 400 },
      ]) {
        await page.setViewportSize(size);
        await page.goto(url(variant, scene));
        await ready(page);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(800);
        const file = `${variant.id}-${scene}-${size.width}x${size.height}.png`;
        await page.screenshot({ path: resolve(output, file) });
        const measurements = await page.evaluate(() => {
          const r = (selector) => {
            const box = document
              .querySelector(selector)
              .getBoundingClientRect();
            return { x: box.x, y: box.y, width: box.width, height: box.height };
          };
          return {
            wheel: r('.orbit-wheel'),
            artwork: r('.orbit-artwork'),
            card: r('.rotary-card-active'),
            lines: [
              ...document.querySelectorAll(
                '.rotary-card-active .orbit-ribbon-copy > *',
              ),
            ].map((line) => ({
              text: line.textContent,
              inset: line.dataset.contourInset,
            })),
          };
        });
        recipe.frames.push({
          variant: variant.id,
          scene,
          file,
          ...size,
          measurements,
        });
        if (size.width === 1440) {
          await page.screenshot({
            path: resolve(output, `${variant.id}-${scene}-detail.png`),
            clip: { x: 910, y: 580, width: 530, height: 280 },
          });
        }
      }
    }
  }
  await page.close();
  for (const scene of ['cubes', 'horizon']) {
    const context = await browser.newContext({
      viewport: { width: 1800, height: 640 },
      recordVideo: { dir: output, size: { width: 1800, height: 640 } },
    });
    await context.route('**/song/media/outer/**', (r) => r.abort());
    const comparison = await context.newPage();
    await comparison.setContent(
      `<html lang="en"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#080c12;color:#e7e8e8;font:14px system-ui}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}header{height:64px;padding:12px 18px}header small{display:block;color:#a7b1bd;margin-top:5px}iframe{border:0;width:100%;height:576px}</style><div class="grid">${variants.map((v) => `<section><header>${v.name}<small>${v.detail}</small></header><iframe id="${v.id}" title="${v.name}" src="${url(v, scene)}"></iframe></section>`).join('')}</div></html>`,
    );
    const frames = variants.map((v) => comparison.frameLocator('#' + v.id));
    await Promise.all(frames.map((frame) => ready(frame)));
    await comparison.waitForTimeout(1000);
    for (const direction of [
      'Next card',
      'Next card',
      'Next card',
      'Previous card',
      'Previous card',
      'Previous card',
    ]) {
      await Promise.all(
        frames.map((frame) =>
          frame.getByRole('button', { name: direction, exact: true }).click(),
        ),
      );
      await Promise.all(
        frames.map((frame) =>
          expect(frame.locator('.rotary-deck')).toHaveAttribute(
            'data-moving',
            'false',
          ),
        ),
      );
      await comparison.waitForTimeout(450);
    }
    await comparison.waitForTimeout(600);
    const video = await comparison.video().path();
    await context.close();
    const file = `${scene}-motion.webm`;
    await rename(video, resolve(output, file));
    recipe.movies.push(file);
  }
  await writeFile(
    resolve(output, 'recipe.json'),
    JSON.stringify(recipe, null, 2) + '\n',
  );
  const gallery = (scene) =>
    variants
      .map(
        (v) =>
          `<figure><img src="${v.id}-${scene}-detail.png" alt="${v.name} in ${scene}"><figcaption>${v.name}<small>${v.detail}</small></figcaption><a href="${v.id}-${scene}-1440x900.png">Desktop</a> · <a href="${v.id}-${scene}-390x844.png">Phone</a> · <a href="${v.id}-${scene}-390x400.png">Short screen</a> · <a href="${url(v, scene)}">Interactive story</a></figure>`,
      )
      .join('');
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rotary directions</title><style>*{box-sizing:border-box}body{background:#090d13;color:#e8e7e3;font:15px/1.6 system-ui;padding:28px;margin:0}main{max-width:1680px;margin:auto}h1,h2{font-weight:500}p{color:#aeb9c7;max-width:90ch}a{color:#d9b783}section{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}figure{margin:0}img,video{width:100%;display:block}figcaption{font-size:17px;margin-top:10px}small{display:block;color:#99a8b9;font-size:12px}video{margin-bottom:32px;border:1px solid #3c424c}button,select{font:inherit;color:inherit;background:#182333;border:1px solid #52617a;padding:8px 14px;border-radius:8px;cursor:pointer}iframe{width:100%;height:500px;border:1px solid #303b4b}#live{margin:20px 0}#live:empty{display:none}@media(max-width:900px){section{grid-template-columns:1fr}}</style><main><h1>Three rotary directions</h1><p>The upper-left brand is removed. Each candidate uses a different silhouette, proportion and circular motion. Text insets are sampled from the painted SVG contour, so each line follows the edge. B / Velvet drum is the user-selected direction: a rounded capsule with cylindrical card travel. A and C remain available for comparison.</p><h2>Blue hour</h2><section>${gallery('cubes')}</section><h2>Event horizon</h2><section>${gallery('horizon')}</section><h2>Motion, side by side</h2><p>The same six forward/reverse inputs run in all three candidates. Background time is fixed; card motion is actual browser playback.</p><video controls playsinline muted loop src="cubes-motion.webm"></video><video controls playsinline muted loop src="horizon-motion.webm"></video><h2>Interactive comparison</h2><select id="scene"><option value="horizon">Event horizon</option><option value="cubes">Blue hour</option></select> <button id="open">Load all three</button><section id="live"></section><p>Use the arrows or scroll over a card. Arrow keys work while the deck has focus; Escape closes it. The final card retains adjacent-scene navigation. Audio was disabled for the recordings. <a href="recipe.json">Recipe and measured geometry</a></p></main><script>const variants=${JSON.stringify(variants)};document.querySelector('#open').onclick=()=>{const scene=document.querySelector('#scene').value;document.querySelector('#live').innerHTML=variants.map(v=>'<iframe title="'+v.name+'" src="${base}/iframe.html?id=explorations-rotary-directions--'+v.story+'&capture=1&args=initialScene:'+scene+'"></iframe>').join('')};</script></html>`;
  await writeFile(resolve(output, 'index.html'), html);
  const sheet = await browser.newPage({
    viewport: { width: 1680, height: 980 },
  });
  const embedded = await Promise.all(
    ['cubes', 'horizon'].map(async (scene) => ({
      scene,
      images: await Promise.all(
        variants.map(async (v) => ({
          name: v.name,
          data: (
            await readFile(resolve(output, `${v.id}-${scene}-detail.png`))
          ).toString('base64'),
        })),
      ),
    })),
  );
  await sheet.setContent(
    `<html lang="en"><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#090d13;color:#eee;font:18px system-ui}h1{font-size:24px;font-weight:500;margin:0 0 14px}h2{font-size:15px;font-weight:400;color:#a4b1c1;margin:22px 0 10px}section{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}figure{margin:0}img{width:100%}figcaption{padding:9px 0;font-size:15px}</style><h1>Rotary directions · contour-aware type</h1>${embedded.map((row) => `<h2>${row.scene === 'cubes' ? 'BLUE HOUR' : 'EVENT HORIZON'}</h2><section>${row.images.map((i) => `<figure><img src="data:image/png;base64,${i.data}"><figcaption>${i.name}</figcaption></figure>`).join('')}</section>`).join('')}</html>`,
  );
  await sheet.screenshot({
    path: resolve(output, 'comparison.png'),
    fullPage: true,
  });
  await sheet.close();
  process.stdout.write(output + '/index.html\n');
} finally {
  await browser.close();
}
