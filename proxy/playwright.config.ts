import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.ts', 'perf/**/*.spec.ts'],
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  timeout: 30000,
  expect: { timeout: 8000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  outputDir: 'test-results/browser',
  use: {
    baseURL: 'http://127.0.0.1:4322',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--disable-dev-shm-usage'] },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/perf/**',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/perf/**',
    },
  ],
  webServer: [
    {
      command: 'python3 -m http.server 4322 --bind 127.0.0.1 --directory dist',
      url: 'http://127.0.0.1:4322',
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'python3 -m http.server 6010 --bind 127.0.0.1 --directory storybook-static',
      url: 'http://127.0.0.1:6010',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
