import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';

/** Serve a real recording with the byte ranges requested by native media decoders. */
export async function routeAudioFixture(page: Page) {
  const bytes = await readFile(
    new URL('../fixtures/audio/steady-tone.mp3', import.meta.url),
  );
  await page.route('**/song/media/outer/**', async (route) => {
    const range = /bytes=(\d+)-(\d*)/.exec(
      route.request().headers().range ?? '',
    );
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2]
      ? Math.min(Number(range[2]), bytes.length - 1)
      : bytes.length - 1;
    if (start > end) {
      await route.fulfill({
        status: 416,
        headers: { 'Content-Range': `bytes */${bytes.length}` },
      });
      return;
    }
    await route.fulfill({
      status: range ? 206 : 200,
      contentType: 'audio/mpeg',
      headers: {
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
        ...(range
          ? { 'Content-Range': `bytes ${start}-${end}/${bytes.length}` }
          : {}),
      },
      body: bytes.subarray(start, end + 1),
    });
  });
}
