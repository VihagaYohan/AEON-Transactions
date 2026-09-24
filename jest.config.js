/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/app/**', // thin route files, covered by E2E
    '!src/test/**',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: { lines: 80, statements: 80, functions: 75, branches: 70 },
  },
};
