// @ts-check
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  // ── Ignored paths ────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '**/*.d.ts'],
  },

  // ── TypeScript source files ───────────────────────────────────────────────
  {
    files: ['src/**/*.ts', 'apps/**/*.ts', 'libs/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
    },
    rules: {
      // ── typescript-eslint recommended rules ──────────────────────────────
      ...tseslint.configs['recommended'].rules,

      // ── NestJS-style overrides (mirrors the old .eslintrc.js defaults) ───
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // ── Downgrade unused-vars to warn (NestJS default is lenient here) ──
      // Pre-existing unused variables in the codebase are warnings, not errors
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'off',

      // ── Prettier as a lint rule ──────────────────────────────────────────
      'prettier/prettier': 'warn',

      // ── Prettier config disables conflicting formatting rules ────────────
      ...prettierConfig.rules,
    },
  },
];
