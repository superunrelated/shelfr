import type { Preview } from '@storybook/react-vite';
import '../apps/web/src/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fafafa' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#1c1e2a' },
      ],
    },
  },
};

export default preview;
