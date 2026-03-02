module.exports = {
  root: true,
  env: { 
    node: true, 
    es2022: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: { 
    ecmaVersion: 2022, 
    sourceType: "module",
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  ignorePatterns: [
    "node_modules", 
    "dist", 
    "build", 
    ".next",
    "coverage",
    "*.js"
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
