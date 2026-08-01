import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const RESULTS_DIR = path.resolve('test-results/perf');
const FRAME_SAMPLE_COUNT = 90;

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    count: values.length,
    avg: Number((sum / values.length).toFixed(3)),
    min: Number(sorted[0].toFixed(3)),
    max: Number(sorted[sorted.length - 1].toFixed(3)),
    p50: Number(percentile(0.5).toFixed(3)),
    p95: Number(percentile(0.95).toFixed(3)),
    over16ms: values.filter((value) => value > 16.7).length,
    over33ms: values.filter((value) => value > 33.4).length
  };
}

async function collectFrameStats(page, frameCount = FRAME_SAMPLE_COUNT) {
  return page.evaluate((count) => {
    return new Promise((resolve) => {
      const frameDeltas = [];
      const longTasks = [];
      let fallbackTicks = 0;
      let observer = null;
      const deadline = performance.now() + 8_000;

      if ('PerformanceObserver' in window) {
        try {
          observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              longTasks.push({
                startTime: entry.startTime,
                duration: entry.duration
              });
            }
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch {
          observer = null;
        }
      }

      function finish() {
        if (observer) observer.disconnect();
        resolve({
          frameDeltas,
          fallbackTicks,
          longTasks,
          endTime: performance.now()
        });
      }

      let last = null;
      function step(now, usedFallback) {
        if (usedFallback) fallbackTicks += 1;
        if (last !== null) {
          frameDeltas.push(now - last);
        }
        last = now;

        if (frameDeltas.length >= count || performance.now() >= deadline) {
          finish();
          return;
        }

        queueStep();
      }

      function queueStep() {
        let resolved = false;
        const fallback = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          step(performance.now(), true);
        }, 50);

        requestAnimationFrame((now) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(fallback);
          step(performance.now(), false);
        });
      }

      queueStep();
    });
  }, frameCount);
}

async function collectResizeMetrics(page, viewport) {
  const start = await page.evaluate(() => performance.now());
  await page.setViewportSize(viewport);
  const result = await page.evaluate(() => {
    return new Promise((resolve) => {
      let ticks = 0;
      let fallbackTicks = 0;

      function queueTick() {
        let resolved = false;
        const fallback = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          fallbackTicks += 1;
          tick();
        }, 50);

        requestAnimationFrame(() => {
          if (resolved) return;
          resolved = true;
          clearTimeout(fallback);
          tick();
        });
      }

      function tick() {
        ticks += 1;
        if (ticks < 2) {
          queueTick();
          return;
        }

        const canvas = document.getElementById('cube-field-layer');
        const container = document.getElementById('canvas-container');
        const canvasRect = canvas.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        resolve({
          end: performance.now(),
          fallbackTicks,
          canvasCssWidth: Math.round(canvasRect.width),
          canvasCssHeight: Math.round(canvasRect.height),
          containerWidth: Math.round(containerRect.width),
          containerHeight: Math.round(containerRect.height),
          canvasBitmapWidth: canvas.width,
          canvasBitmapHeight: canvas.height
        });
      }

      queueTick();
    });
  });

  return {
    viewport,
    twoRafMs: Number((result.end - start).toFixed(3)),
    fallbackTicks: result.fallbackTicks,
    canvasCssWidth: result.canvasCssWidth,
    canvasCssHeight: result.canvasCssHeight,
    containerWidth: result.containerWidth,
    containerHeight: result.containerHeight,
    canvasBitmapWidth: result.canvasBitmapWidth,
    canvasBitmapHeight: result.canvasBitmapHeight
  };
}

async function collectPageMetrics(page, route) {
  const wallStart = performance.now();
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  const domContentLoadedWallMs = performance.now() - wallStart;

  await expect(page.locator('#app-frame')).toBeVisible();
  await expect(page.locator('#cube-field-layer')).toBeVisible();

  const firstFrameMs = await page.evaluate(() => {
    const start = performance.now();
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve(performance.now() - start));
    });
  });

  const navigation = await page.evaluate(() => {
    const entry = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
      loadEventEnd: entry.loadEventEnd,
      responseEnd: entry.responseEnd,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize
    };
  });

  const sceneState = await page.evaluate(() => {
    const canvas = document.getElementById('cube-field-layer');
    const container = document.getElementById('canvas-container');
    const appFrame = document.getElementById('app-frame');
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const appRect = appFrame.getBoundingClientRect();
    return {
      appWidth: Math.round(appRect.width),
      appHeight: Math.round(appRect.height),
      canvasCssWidth: Math.round(canvasRect.width),
      canvasCssHeight: Math.round(canvasRect.height),
      containerWidth: Math.round(containerRect.width),
      containerHeight: Math.round(containerRect.height),
      canvasBitmapWidth: canvas.width,
      canvasBitmapHeight: canvas.height,
      webglLayerCount: document.querySelectorAll('canvas.webgl-layer').length,
      musicIframeCount: document.querySelectorAll('.music-panel iframe').length,
      proxyPerf: window.__proxyPerf ?? null
    };
  });

  const frameSample = await collectFrameStats(page);
  const resize = [
    await collectResizeMetrics(page, { width: 1024, height: 768 }),
    await collectResizeMetrics(page, { width: 1440, height: 900 })
  ];

  const metrics = {
    route,
    status: response?.status() ?? null,
    domContentLoadedWallMs: Number(domContentLoadedWallMs.toFixed(3)),
    firstFrameMs: Number(firstFrameMs.toFixed(3)),
    navigation,
    sceneState,
    animationFrames: summarize(frameSample.frameDeltas),
    animationFrameFallbackTicks: frameSample.fallbackTicks,
    longTasks: {
      count: frameSample.longTasks.length,
      totalDuration: Number(
        frameSample.longTasks.reduce((total, task) => total + task.duration, 0).toFixed(3)
      ),
      maxDuration: Number(
        Math.max(0, ...frameSample.longTasks.map((task) => task.duration)).toFixed(3)
      )
    },
    resize
  };

  expect(metrics.status).toBe(200);
  expect(metrics.sceneState.canvasCssWidth).toBeGreaterThan(0);
  expect(metrics.sceneState.canvasCssHeight).toBeGreaterThan(0);
  expect(metrics.animationFrames.count).toBe(FRAME_SAMPLE_COUNT);

  return metrics;
}

async function collectSecondSceneMetrics(page, route) {
  const wallStart = performance.now();
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  const domContentLoadedWallMs = performance.now() - wallStart;

  await expect(page.locator('#app-frame')).toBeVisible();
  await expect(page.locator('#cube-field-layer')).toBeVisible();
  await page.locator('#switch-btn').click();
  await page.waitForTimeout(3_300);

  const sceneState = await page.evaluate(() => {
    const canvas = document.getElementById('cube-field-layer');
    const container = document.getElementById('canvas-container');
    const appFrame = document.getElementById('app-frame');
    const webglCanvas = document.querySelector('canvas.webgl-layer');
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const appRect = appFrame.getBoundingClientRect();
    const webglRect = webglCanvas?.getBoundingClientRect();
    return {
      appWidth: Math.round(appRect.width),
      appHeight: Math.round(appRect.height),
      canvasCssWidth: Math.round(canvasRect.width),
      canvasCssHeight: Math.round(canvasRect.height),
      containerWidth: Math.round(containerRect.width),
      containerHeight: Math.round(containerRect.height),
      canvasBitmapWidth: canvas.width,
      canvasBitmapHeight: canvas.height,
      webglLayerCount: document.querySelectorAll('canvas.webgl-layer').length,
      webglCssWidth: webglRect ? Math.round(webglRect.width) : 0,
      webglCssHeight: webglRect ? Math.round(webglRect.height) : 0,
      webglBitmapWidth: webglCanvas?.width ?? 0,
      webglBitmapHeight: webglCanvas?.height ?? 0,
      musicIframeCount: document.querySelectorAll('.music-panel iframe').length,
      proxyPerf: window.__proxyPerf ?? null
    };
  });

  const frameSample = await collectFrameStats(page);
  const metrics = {
    route: `${route}#scene2`,
    status: response?.status() ?? null,
    domContentLoadedWallMs: Number(domContentLoadedWallMs.toFixed(3)),
    sceneState,
    animationFrames: summarize(frameSample.frameDeltas),
    animationFrameFallbackTicks: frameSample.fallbackTicks,
    longTasks: {
      count: frameSample.longTasks.length,
      totalDuration: Number(
        frameSample.longTasks.reduce((total, task) => total + task.duration, 0).toFixed(3)
      ),
      maxDuration: Number(
        Math.max(0, ...frameSample.longTasks.map((task) => task.duration)).toFixed(3)
      )
    }
  };

  expect(metrics.status).toBe(200);
  expect(metrics.sceneState.webglCssWidth).toBeGreaterThan(0);
  expect(metrics.sceneState.webglCssHeight).toBeGreaterThan(0);
  expect(metrics.animationFrames.count).toBe(FRAME_SAMPLE_COUNT);

  return metrics;
}

test.describe('proxy page performance', () => {
  test('measures first scene without music iframe', async ({ page }) => {
    const metrics = await collectPageMetrics(page, '/no-music');
    expect(metrics.sceneState.proxyPerf.renderMode).toBe('gpu');
    expect(metrics.sceneState.proxyPerf.gpuCubeInstanceCount).toBeGreaterThanOrEqual(650);
    expect(metrics.sceneState.proxyPerf.gpuLayerRatios.far).toBeLessThan(0.5);
    expect(metrics.sceneState.proxyPerf.gpuVerticalDensityPower).toBeGreaterThanOrEqual(1.4);
    expect(metrics.sceneState.proxyPerf.gpuPileHoldStart).toBeLessThan(metrics.sceneState.proxyPerf.gpuPileFadeStart);
    expect(metrics.sceneState.proxyPerf.gpuLightContrast).toBeGreaterThanOrEqual(1);
    await mkdir(RESULTS_DIR, { recursive: true });
    await writeFile(
      path.join(RESULTS_DIR, 'proxy-no-music.json'),
      `${JSON.stringify(metrics, null, 2)}\n`,
      'utf8'
    );
    console.log(`PERF no-music ${JSON.stringify(metrics)}`);
  });

  test('measures canvas fallback without music iframe', async ({ page }) => {
    const metrics = await collectPageMetrics(page, '/no-music?renderer=canvas');
    expect(metrics.sceneState.proxyPerf.renderMode).toBe('canvas');
    await mkdir(RESULTS_DIR, { recursive: true });
    await writeFile(
      path.join(RESULTS_DIR, 'proxy-canvas-fallback.json'),
      `${JSON.stringify(metrics, null, 2)}\n`,
      'utf8'
    );
    console.log(`PERF canvas-fallback ${JSON.stringify(metrics)}`);
  });

  test('measures second scene without music iframe', async ({ page }) => {
    const metrics = await collectSecondSceneMetrics(page, '/no-music');
    expect(metrics.sceneState.proxyPerf.renderMode).toBe('gpu');
    expect(metrics.sceneState.proxyPerf.scene2RenderPath).toBe('direct');
    expect(metrics.animationFrames.p95).toBeLessThan(80);
    expect(metrics.longTasks.maxDuration).toBeLessThan(120);
    await mkdir(RESULTS_DIR, { recursive: true });
    await writeFile(
      path.join(RESULTS_DIR, 'proxy-scene2.json'),
      `${JSON.stringify(metrics, null, 2)}\n`,
      'utf8'
    );
    console.log(`PERF scene2 ${JSON.stringify(metrics)}`);
  });

  test('measures full page shell with music iframe', async ({ page }) => {
    const metrics = await collectPageMetrics(page, '/');
    await mkdir(RESULTS_DIR, { recursive: true });
    await writeFile(
      path.join(RESULTS_DIR, 'proxy-full.json'),
      `${JSON.stringify(metrics, null, 2)}\n`,
      'utf8'
    );
    console.log(`PERF full ${JSON.stringify(metrics)}`);
  });
});
