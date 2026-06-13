import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.vercel'] },

  // Browser app code (src)
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      '@tanstack/query': pluginQuery,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',
      '@tanstack/query/no-unstable-deps': 'error',
      '@tanstack/query/infinite-query-property-order': 'error',
      '@tanstack/query/no-void-query-fn': 'error',
    },
  },

  // Server-side serverless functions (api) — Node environment
  {
    files: ['api/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.node,
    },
  },

  // bluesky-oauth.ts deliberately uses `@ts-nocheck`: it's the single module
  // that touches the `exports`-only @atproto packages, whose types the
  // @vercel/node function builder can't resolve under its legacy `node` module
  // resolution. Isolating them here (behind plainly-typed wrappers) lets every
  // other function build cleanly; `tsc -b` in `pnpm build` still type-checks
  // the rest. See the file header for the full rationale.
  {
    files: ['api/_lib/bluesky-oauth.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
)
