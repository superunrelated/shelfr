import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';

function copyExtensionAssets() {
  return {
    name: 'copy-extension-assets',
    closeBundle() {
      const outDir = resolve(__dirname, '../../dist/extension');
      mkdirSync(outDir, { recursive: true });

      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(outDir, 'manifest.json')
      );

      // Copy icons
      const iconsDir = resolve(__dirname, 'public/icons');
      const outIcons = resolve(outDir, 'icons');
      mkdirSync(outIcons, { recursive: true });
      for (const file of readdirSync(iconsDir)) {
        copyFileSync(resolve(iconsDir, file), resolve(outIcons, file));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyExtensionAssets()],
  root: __dirname,
  css: {
    postcss: resolve(__dirname, '../..'),
  },
  base: '',
  build: {
    outDir: resolve(__dirname, '../../dist/extension'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@shelfr/shared': resolve(__dirname, '../../libs/shared/src'),
    },
  },
});
