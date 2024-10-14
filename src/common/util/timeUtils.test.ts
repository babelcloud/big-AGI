import { describe, it, expect, vi } from 'vitest';
import { prettyTimestampForFilenames } from './timeUtils';

describe('prettyTimestampForFilenames', () => {
  it('should return a timestamp with seconds by default', () => {
    const mockDate = new Date(2024, 9, 1, 12, 34, 56);
    vi.setSystemTime(mockDate);

    const result = prettyTimestampForFilenames();
    expect(result).toBe('2024-10-01-123456');

    vi.useRealTimers();
  });

  it('should return a timestamp without seconds when useSeconds is false', () => {
    const mockDate = new Date(2024, 9, 1, 12, 34, 56);
    vi.setSystemTime(mockDate);

    const result = prettyTimestampForFilenames(false);
    expect(result).toBe('2024-10-01-1234');

    vi.useRealTimers();
  });
});