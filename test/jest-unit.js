const path = require('path');
module.exports = {
  displayName: 'Unit Tests',
  rootDir: path.resolve(__dirname, '..'),
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/jest.setup.ts'],
  testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage-unit',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^libs/(.*)$': '<rootDir>/libs/$1',
  },
  // ★ 추가
  setupFilesAfterEnv: ['<rootDir>/test/setup/unit-setup.ts'],
};
