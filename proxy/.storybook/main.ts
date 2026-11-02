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
  staticDirs: ['../public'],
  viteFinal: async (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), tailwind()],
    optimizeDeps: {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include ?? []),
        'react-dom',
        '@react-three/drei/core/Fbo',
        '@react-three/drei/core/Line',
        '@react-three/drei/core/OrbitControls',
      ],
    },
    server: {
      ...config.server,
      watch: {
        ...config.server?.watch,
        ignored: [
          '**/playwright-report/**',
          '**/test-results/**',
          '**/storybook-static/**',
        ],
      },
    },
  }),
};
export default config;
