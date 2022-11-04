module.exports = {
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended', // This enables eslint-plugin-prettier
    // This disables formatter specific rules that conflict with Prettier
    // https://github.com/prettier/eslint-config-prettier
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/babel',
    'prettier/react',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'import/prefer-default-export': 'off',
        indent: 'off', // Conflicts
        'no-alert': 'off',
        'class-methods-use-this': 'off',
        '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
        '@typescript-eslint/no-unused-vars': 'off',
        // Duplicative of ts:
        'import/no-duplicates': 'off',
        'no-redeclare': 'off',
        'import/no-unresolved': 'off',
        'import/named': 'off',
        'import/namespace': 'off',
        'import/default': 'off',
        'import/export': 'off',
        'no-undef': 'off',
        'react/require-default-props': 'off',
        'react/no-unused-prop-types': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off'
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'jest/no-disabled-tests': 'off',
      },
    },
    {
      files: ['*.test.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['cypress/integration/*'],
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        before: 'readonly',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'filenames', 'import', 'jest', 'react-hooks', 'prettier'],
  rules: {
    'prettier/prettier': ['error', {
      'printWidth': 120,
      'singleQuote': true,
      'trailingComma': 'all',
      'jsxBracketSameLine': false,
      'arrowParens': 'always'
    }],
    'import/no-unresolved': 'off',
    // Allows: snake_case, kebab-case, with .d, .test, .stories, or .config
    // before the standard suffixes; and sequelize filenames
    'filenames/match-regex': [
      'error',
      '(^([a-z0-9_]+)|([a-z0-9-]+)(.(d|test|stories|config))?$)|([0-9]{14}(-[a-z]+)+)|(^[[a-zA-Z]+])',
    ],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        controlComponents: ['ActionButton', 'Field', 'StyledField'],
      },
    ],
    'jsx-a11y/label-has-for': ['off'], // deprecated
    'jsx-quotes': ['error', 'prefer-double'],
    'max-len': ['error', { code: 120, ignorePattern: '^import\\W.*' }],
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.tsx'] }],
    'react/jsx-closing-tag-location': ['error'],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'ignore' }],
    'react/jsx-one-expression-per-line': 'off',
    'react/prop-types': ['off'],
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'error',
    '@typescript-eslint/camelcase': ['error', { properties: 'never' }],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
    'func-names': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['.storybook/**', '**/*.stories.tsx', '**/*.test.tsx', '**/*.test.ts', '**/tests/**/*.ts'],
      },
    ],
    'import/order': 'off',
    'import/extensions': ['error', 'never', {ignorePackages: true}],
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        directory: __dirname,
      },
    },
  },
};
