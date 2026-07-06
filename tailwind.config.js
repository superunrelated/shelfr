const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'apps/web/src/**/*.{ts,tsx,html}'),
    join(__dirname, 'apps/extension/src/**/*.{ts,tsx,html}'),
    join(__dirname, 'apps/extension/popup.html'),
    join(__dirname, 'apps/presentation/src/**/*.{ts,tsx,html}'),
    join(__dirname, 'apps/presentation/index.html'),
    join(__dirname, 'libs/ui/src/**/*.{ts,tsx,html}'),
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Georgia'", "'Times New Roman'", 'serif'],
      },
    },
  },
  plugins: [],
};
