
import 'jest-fetch-mock';
import '@testing-library/jest-dom';

// Configure fetch mock
global.fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

// Mock localStorage for tests that use it - only in jsdom environment
if (typeof window !== 'undefined') {
  class LocalStorageMock {
    private store: Record<string, string>;

    constructor() {
      this.store = {};
    }

    clear() {
      this.store = {};
    }

    getItem(key: string) {
      return this.store[key] || null;
    }

    setItem(key: string, value: string) {
      this.store[key] = String(value);
    }

    removeItem(key: string) {
      delete this.store[key];
    }

    get length() {
      return Object.keys(this.store).length;
    }

    key(index: number) {
      return Object.keys(this.store)[index] || null;
    }
  }

  // Set up localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: new LocalStorageMock(),
  });

  // Set up matchMedia mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Fix "ReferenceError: TextEncoder is not defined" issues
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console methods to suppress noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Only log errors in tests when needed
console.error = (...args) => {
  if (process.env.DEBUG) {
    originalConsoleError(...args);
  }
};

console.warn = (...args) => {
  if (process.env.DEBUG) {
    originalConsoleWarn(...args);
  }
};

console.log = (...args) => {
  if (process.env.DEBUG) {
    originalConsoleLog(...args);
  }
};

// Restore console methods after tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});
