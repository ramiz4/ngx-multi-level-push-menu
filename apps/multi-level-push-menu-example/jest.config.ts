/* eslint-disable */
export default {
  displayName: 'multi-level-push-menu-example',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  coverageDirectory: '../../coverage/apps/multi-level-push-menu-example',
  moduleNameMapper: {
    '@ramiz4/ngx-multi-level-push-menu':
      '<rootDir>/../../libs/ngx-multi-level-push-menu/src/index.ts',
  },
  // CI specific settings to prevent memory issues
  ...(process.env['CI'] === 'true'
    ? {
        // Run tests in sequence when in CI environment
        runInBand: true,
        // Limit the number of workers to avoid memory issues
        maxWorkers: 2,
        // Increase timeout for CI environment
        testTimeout: 30000,
      }
    : {}),
};
