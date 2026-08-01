import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 90_000,
  expect: {
    timeout: 10_000
  },
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],
  outputDir: 'test-results/artifacts',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4173',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: {
      args: ['--disable-dev-shm-usage']
    }
  },
  webServer: {
    command: 'python3 proxy/dev_preview.py --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/no-music',
    reuseExistingServer: !process.env.CI,
    timeout: 20_000
  }
});
