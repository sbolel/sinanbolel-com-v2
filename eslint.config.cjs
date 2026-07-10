const { defineConfig, globalIgnores } = require('eslint/config')

const globals = require('globals')

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat')

const tsParser = require('@typescript-eslint/parser')
const node = require('eslint-plugin-node')
const typescriptEslint = require('@typescript-eslint/eslint-plugin')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const reactRefresh = require('eslint-plugin-react-refresh').default
const jest = require('eslint-plugin-jest')
const prettier = require('eslint-plugin-prettier')
const js = require('@eslint/js')

const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

module.exports = defineConfig([
  {
    files: ['**/*.{js,cjs,mjs,jsx,ts,tsx}'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...jest.environments.globals.globals,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        jsx: true,
        useJSXTextNode: true,
      },
    },

    extends: fixupConfigRules(
      compat.extends(
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:jest/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react/jsx-runtime',
        'prettier',
        'plugin:storybook/recommended'
      )
    ),

    plugins: {
      node,
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      'react-refresh': reactRefresh,
      jest: fixupPluginRules(jest),
      prettier,
    },

    rules: {
      semi: 'off',
      'no-debugger': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-useless-assignment': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      'prettier/prettier': ['error'],
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-refresh/only-export-components': 'warn',
      'react/jsx-closing-bracket-location': [2, 'tag-aligned'],
      'react/jsx-first-prop-new-line': [2, 'multiline'],
      'react/jsx-indent-props': [2, 2],

      'react/jsx-indent': [
        2,
        2,
        {
          indentLogicalExpressions: true,
        },
      ],

      'react/jsx-max-props-per-line': [
        2,
        {
          maximum: 1,
          when: 'multiline',
        },
      ],

      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },

    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.cjs'],
        },
      },

      react: {
        pragma: 'React',
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.cjs'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],

    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'jest/no-conditional-expect': 'off',
      'react/display-name': 'off',
    },
  },
  {
    files: [
      '**/*.stories.js',
      '**/*.stories.jsx',
      '**/*.stories.ts',
      '**/*.stories.tsx',
    ],

    rules: {
      'react/display-name': 'off',
      'storybook/no-renderer-packages': 'off',
    },
  },
  {
    files: ['config/jest/**/*.ts', 'eslint.config.cjs'],

    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],

    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  globalIgnores([
    '**/node_modules/',
    '**/coverage/',
    '**/build/',
    '**/dist/',
    '**/public/',
  ]),
])
