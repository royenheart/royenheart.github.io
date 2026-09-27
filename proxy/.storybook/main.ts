import type { StorybookConfig } from '@storybook/react-vite';
import tailwind from '@tailwindcss/vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), tailwind()],
  }),
};
export default config;
