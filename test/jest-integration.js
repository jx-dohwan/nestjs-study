const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  displayName: 'Integration Tests',
  rootDir: path.resolve(__dirname, '..'),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/integration/**/*.spec.ts'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage-integration',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^libs/(.*)$': '<rootDir>/libs/$1',
  },
  // 필요 시 셋업 파일 추가
  // setupFilesAfterEnv: ['<rootDir>/test/setup/integration-setup.ts'],
};
