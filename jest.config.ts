
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testMatch: ["<rootDir>/tests/**/*.test.ts?(x)"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true
    }]
  },
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  clearMocks: true,
  testTimeout: 10000,
  coverageReporters: ["text", "lcov", "clover"],
  testPathIgnorePatterns: ["/node_modules/"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"]
  },
  // Configure different test environments based on test path
  projects: [
    {
      displayName: 'client',
      testMatch: ['<rootDir>/tests/client/**/*.test.ts?(x)'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"]
    },
    {
      displayName: 'server',
      testMatch: ['<rootDir>/tests/server/**/*.test.ts?(x)', '<rootDir>/tests/auth/**/*.test.ts?(x)', '<rootDir>/tests/sample.test.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"]
    }
  ]
};

export default config;
