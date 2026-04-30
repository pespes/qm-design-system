import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import baseConfig from '../../eslint.config.mjs';

const config = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
        'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true
        }
      ],
      'react/display-name': 'warn',
      'react/jsx-curly-brace-presence': 'error',
      'react/jsx-fragments': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-uses-react': 'error',
      'react/no-array-index-key': 'off',
      'react/no-children-prop': 'error',
      'react/prop-types': 'off',
      'react/sort-comp': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
    {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs'
    ]
  },
];

export default config;