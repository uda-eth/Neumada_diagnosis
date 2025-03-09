
// Global test setup for Jest
import '@jest/globals';
import { getTestApp, closeTestApp } from './utils/test-utils';

// Setup before all tests
beforeAll(async () => {
  // Initialize app for tests
  await getTestApp();
  console.log('Test app initialized');
});

// Cleanup after all tests
afterAll(async () => {
  await closeTestApp();
  console.log('Test app closed');
});
