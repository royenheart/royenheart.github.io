import { expect, test } from '@playwright/test';

// Simulate the Windows/VM path where Chrome has no accelerated canvas.
test.use({
  launchOptions: {
    args: [
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--enable-unsafe-swiftshader',
    ],
  },
});

test('software rendering uses the animated poster instead of mounting a heavy canvas', async ({
  page,
}) => {
  await page.goto('/?scene=cubes&skipIntro=1');
  const main = page.locator('main');
  await expect(main).toHaveAttribute('data-software-renderer', 'true');
  await expect(main).toHaveAttribute('data-renderer', 'poster');
  await expect(page.locator('.orbit-webgl')).toHaveCount(0);
  await expect(page.locator('.orbit-damage')).toBeVisible();
  await expect(page.locator('.orbit-damage-pane')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.orbit-render-guard')).toHaveAttribute(
    'data-mode',
    'still',
  );

  await page.keyboard.press('Shift+D');
  const hud = page.locator('.orbit-diagnostics');
  await expect(hud).toBeVisible();
  await expect(hud).toContainText('CPU · software fallback');
  await page.keyboard.press('Shift+D');
});
