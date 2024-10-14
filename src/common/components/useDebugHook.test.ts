import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getRandom1000, increment } from './useDebugHook';

describe('useDebugHook utilities', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('getRandom1000', () => {
    it('should generate a random number between 0 and 1000', () => {
      const number = getRandom1000();
      expect(number).toBeGreaterThanOrEqual(0);
      expect(number).toBeLessThanOrEqual(1000);
      expect(consoleSpy).toHaveBeenCalledWith('~random', number);
    });
  });

  describe('increment', () => {
    it('should increment the instance counter', () => {
      const initialCount = increment();
      expect(consoleSpy).toHaveBeenCalledWith('+increment', initialCount);

      const nextCount = increment();
      expect(nextCount).toBe(initialCount + 1);
      expect(consoleSpy).toHaveBeenCalledWith('+increment', nextCount);
    });
  });
});