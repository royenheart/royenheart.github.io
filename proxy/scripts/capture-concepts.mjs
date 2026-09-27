import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve, join, sep, isAbsolute } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(
  process.argv[2] ?? join(tmpdir(), 'proxy-style-previews'),
);
const relativeOutput = relative(repository, output);
if (
  relativeOutput !== '..' &&
  !relativeOutput.startsWith(`..${sep}`) &&
  !isAbsolute(relativeOutput)
) {
  throw new Error(
    'Design review screenshots must be written outside the repository',
  );
}
const base = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006';
const concepts = [
  [
    'orbital-console',
    'A',
    'Orbital Console',
    'Machined edges · recessed transport · cyan to amber',
  ],
  [
    'liquid-chrome',
    'B',
    'Liquid Chrome',
    'Pearlescent surfaces · spring hover · floating player',
  ],
  [
    'quiet-gallery',
    'C',
    'Quiet Gallery',
    'Editorial serif · open space · restrained transitions',
  ],
  [
    'pop-circuit',
    'D',
    'Pop Circuit',
    'Ink outlines · hard shadows · tactile button presses',
  ],
];
const sizes = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const evidence = [];
try {
  for (const [id] of concepts) {
    for (const size of sizes) {
      const page = await browser.newPage({
        viewport: size,
        deviceScaleFactor: 1,
      });
      await page.goto(
        `${base}/iframe.html?id=explorations-design-directions--${id}&viewMode=story&capture=1`,
      );
      await expect(page.locator('.scene-experience')).toHaveAttribute(
        'data-renderer',
        'webgl',
      );
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('.scene-canvas')).toHaveCSS('opacity', '1');
      for (const scene of ['cubes', 'horizon']) {
        if (scene === 'horizon')
          await page.getByRole('button', { name: 'Switch scene' }).click();
        await page.waitForFunction(
          (expected) => window.__sceneMetrics?.scene === expected,
          scene,
        );
        await page.evaluate(
          () =>
            new Promise((done) =>
              requestAnimationFrame(() => requestAnimationFrame(done)),
            ),
        );
        const file = `${id}-${size.name}-${scene}.png`;
        await page.screenshot({
          path: join(output, file),
          fullPage: true,
          animations: 'disabled',
        });
        evidence.push({
          file,
          viewport: size,
          metrics: await page.evaluate(() => window.__sceneMetrics),
        });
      }
      await page.close();
    }
    console.log(`Captured ${id}: both scenes on desktop, phone and tablet`);
  }
  const styles = `*{box-sizing:border-box}body{margin:0;padding:28px;background:#edf1f5;color:#1c2a40;font-family:system-ui,sans-serif}h1{margin:0;font-size:30px;letter-spacing:-1px}header p{color:#526175;margin:8px 0 24px;font-size:14px}section{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}article{min-width:0;background:white;border:1px solid #cbd4df}h2{margin:0;padding:14px 16px 4px;font-size:18px}article p{margin:0;padding:0 16px 14px;font-size:11px;color:#556578}img{display:block;width:100%}a{color:inherit}nav{display:flex;gap:20px;margin:20px 0}body[data-size=phone] section{grid-template-columns:repeat(4,minmax(0,1fr))}body[data-size=phone] h2{font-size:16px}body[data-size=phone] article p{min-height:45px}article>a{display:block}footer{margin-top:20px;color:#556578;font-size:12px}@media(max-width:800px){section,body[data-size=phone] section{grid-template-columns:1fr}}`;
  for (const [size, scene] of [
    ['desktop', 'cubes'],
    ['desktop', 'horizon'],
    ['phone', 'cubes'],
    ['tablet', 'horizon'],
  ]) {
    const name = `${size}-${scene}`;
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RoyenHeart / Design directions</title><style>${styles}</style><body data-size="${size}"><header><h1>Four ways to feel at home.</h1><p>RoyenHeart · ${size} · ${scene === 'cubes' ? 'Blue cube cloud' : 'Golden event horizon'} · Real Storybook captures</p></header><section>${concepts.map(([id, letter, title, description]) => `<article><h2>${letter} / ${title}</h2><p>${description}</p><a href="${id}-${size}-${scene}.png"><img src="${id}-${size}-${scene}.png" alt="${title} on ${size}"></a></article>`).join('')}</section><footer>Same navigation, two original scenes, one shared player. Images are review artifacts outside the repository.</footer></body></html>`;
    await writeFile(join(output, `${name}.html`), html);
    const board = await browser.newPage({
      viewport: { width: size === 'phone' ? 1700 : 2000, height: 1100 },
      deviceScaleFactor: 1,
    });
    await board.goto(`file://${join(output, `${name}.html`)}`);
    await board.evaluate(() =>
      Promise.all(Array.from(document.images, (img) => img.decode())),
    );
    await board.screenshot({
      path: join(output, `${name}-comparison.png`),
      fullPage: true,
    });
    await board.close();
  }
  await writeFile(
    join(output, 'capture-evidence.json'),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        browser: browser.version(),
        captures: evidence,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
console.log(`Review artifacts: ${output}`);
