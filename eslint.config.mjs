// @ts-check
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const config = [
  ...compat.env({
    es2021: true,
    node: true,
    browser: true,
  }),

  ...compat.config({
    plugins: ['prettier', '@typescript-eslint', 'eslint-plugin-prettier'],
    extends: [
      'plugin:react/recommended',
      'eslint:recommended',
      'eslint-config-prettier',
      'eslint-config-next',
      'prettier',
      'plugin:@typescript-eslint/recommended',
    ],
    env: {
      es2021: true,
      node: true,
      browser: true,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 1,
      'prettier/prettier': 1,
      'react/jsx-filename-extension': [
        1,
        { extensions: ['.tsx', '.jsx', '.css', '.scss', '.esm', '.hooks', '.lib', '.context'] },
      ],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      '@typescript-eslint/no-explicit-any': 1,
      'no-underscore-dangle': 0,
      'import/no-extraneous-dependencies': 0,
      'no-nested-ternary': 0,
      'react/jsx-props-no-spreading': 1,
      'class-methods-use-this': 1,
      '@typescript-eslint/ban-ts-comment': 1,
      'no-plusplus': 0,
      'react/require-default-props': 0,
      'react/button-has-type': 0,
      'no-await-in-loop': 1,
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        1,
        {
          functions: false,
          classes: true,
          variables: true,
          allowNamedExports: false,
        },
      ],
      camelcase: 1,
      'import/no-mutable-exports': 1,
      'no-loop-func': 1,
      'no-continue': 1,
      'consistent-return': 1,
      'spaced-comment': 0,
    },
  }),
];

export default config;
