import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { enableLoggerLink } from './trpc.client';

describe('enableLoggerLink', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should enable logger in development environment', () => {
    process.env.NODE_ENV = 'development';
    const result = enableLoggerLink({ direction: 'up', result: null });
    expect(result).toBe(true);
  });

  it('should enable logger for error results in non-development environment', () => {
    process.env.NODE_ENV = 'production';
    const result = enableLoggerLink({ direction: 'down', result: new Error('Test error') });
    expect(result).toBe(true);
  });

  it('should not enable logger for non-error results in non-development environment', () => {
    process.env.NODE_ENV = 'production';
    const result = enableLoggerLink({ direction: 'up', result: null });
    expect(result).toBe(false);
  });
});