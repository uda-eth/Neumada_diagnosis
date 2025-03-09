
import { describe, it, expect } from '@jest/globals';

describe('Simple test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
  
  it('should do math correctly', () => {
    expect(2 + 2).toBe(4);
  });
});
