
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts?(x)"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/client/src/$1",
    "^@db/(.*)$": "<rootDir>/db/$1",
    "^@db": "<rootDir>/db/index.ts"
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.json"
    }]
  },
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  testEnvironmentOptions: {
    url: "http://localhost/"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  clearMocks: true,
  testTimeout: 10000,
  coverageReporters: ["text", "lcov", "clover"],
  globals: {
    "ts-jest": {
      isolatedModules: true
    }
  },
  testPathIgnorePatterns: ["/node_modules/"],
  moduleDirectories: ["node_modules", "<rootDir>"]
};
