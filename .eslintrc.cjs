/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
};
