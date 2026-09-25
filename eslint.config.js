// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const testingLibrary = require('eslint-plugin-testing-library');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'coverage/*', '.expo/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      // Features expose a public API via index.ts; no deep imports across features.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: 'Import from the feature public API (e.g. @/features/transactions).',
            },
          ],
        },
      ],
    },
  },
  {
    // Tests and test utilities may reach feature internals.
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // Testing Library rules only where components are rendered.
    ...testingLibrary.configs['flat/react'],
    files: ['src/**/*.test.tsx', 'src/test/**'],
  },
]);
