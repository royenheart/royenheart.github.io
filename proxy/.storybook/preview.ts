import type { Preview } from '@storybook/react-vite';
import '../src/styles/global.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
    viewport: {
      options: {
        phone: {
          name: 'Phone',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        compact: {
          name: 'Compact phone',
          styles: { width: '320px', height: '568px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
        short: {
          name: 'Short landscape',
          styles: { width: '844px', height: '390px' },
          type: 'mobile',
        },
      },
    },
  },
};
export default preview;
