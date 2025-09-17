// test/jest-integration.js
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

  // ★ 경로 별칭 매핑
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^libs/(.*)$': '<rootDir>/libs/$1',
    '^test/(.*)$': '<rootDir>/test/$1',           // ← 추가
  },

  // 선택: 모듈 탐색 루트 확장(별칭 매핑이 안 통할 때 보조)
  moduleDirectories: ['node_modules', '<rootDir>/src', '<rootDir>/test'],

  // ts-jest가 tsconfig를 확실히 쓰게
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      // useESM: false, // ESM 사용 시만 true; 현재 require config라면 보통 false
    },
  },
};
