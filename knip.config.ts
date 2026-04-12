import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: [
        'apps/web/src/main.tsx',
        'apps/extension/src/popup.tsx',
        'apps/web/vite.config.mts',
        'apps/extension/vite.config.ts',
      ],
      project: [
        'apps/web/src/**/*.{ts,tsx}',
        'apps/extension/src/**/*.{ts,tsx}',
        'libs/ui/src/**/*.{ts,tsx}',
        'libs/shared/src/**/*.{ts,tsx}',
      ],
      ignoreDependencies: [
        // Nx plugins — referenced in nx.json/project.json
        '@nx/eslint',
        '@nx/js',
        '@nx/react',
        '@nx/web',
        '@nx/workspace',
        // SWC — used by Nx
        '@swc/cli',
        // ESLint plugins loaded via @nx/eslint-plugin flat configs
        '@eslint/js',
        'eslint-plugin-import',
        'eslint-plugin-jsx-a11y',
        'eslint-plugin-react',
        'eslint-plugin-react-hooks',
        'eslint-plugin-sonarjs',
        // CLI tools not imported in source
        'supabase',
        'pg',
        // Path alias resolved by Vite, not an npm package
        '@shelfr/shared',
        // Types loaded via tsconfig
        '@types/chrome',
      ],
    },
  },
};

export default config;
