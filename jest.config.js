module.exports = {
    displayName: 'Integration Tests',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/integration/**/*.spec.ts'],
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
      'src/**/*.(t|j)s',
    ],
    coverageDirectory: '../coverage-integration',
    testEnvironment: 'node',
    moduleNameMapping: {
      '^src/(.*)$': '<rootDir>/src/$1',
      '^libs/(.*)$': '<rootDir>/libs/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/test/setup/integration-setup.ts'],
  };