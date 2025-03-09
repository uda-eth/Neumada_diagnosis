
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/tests/**/*.test.ts",
    "<rootDir>/tests/**/*.spec.ts"
  ],
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
  testTimeout: 10000 // Increased timeout for tests
};
