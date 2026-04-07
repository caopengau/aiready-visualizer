import baseConfig from '../../eslint.config.js';

export default [
  ...baseConfig,
  {
    ignores: [
      '.eslintignore',
      'dist/**',
      'node_modules/**',
      'scripts/**', // These scripts use require, might need special handling
      'web/debug-edges.cjs',
      'test/run-tests.js',
    ],
  },
];
