import { describe, it, expect } from 'vitest';
import { roundTime } from './anthropic.models';

describe('roundTime', () => {
  it('should convert a date string to a rounded timestamp', () => {
    const date = '2024-06-20 06:00';
    const expectedTimestamp = Math.round(new Date(date).getTime() / 1000);
    expect(roundTime(date)).toBe(expectedTimestamp);
  });

  it('should handle different date formats', () => {
    const date1 = '2024-06-20T06:00:00Z';
    const date2 = 'June 20, 2024 06:00:00';
    const date3 = '2024/06/20 06:00:00';

    const expectedTimestamp = Math.round(new Date(date1).getTime() / 1000);

    expect(roundTime(date1)).toBe(expectedTimestamp);
    expect(roundTime(date2)).toBe(expectedTimestamp);
    expect(roundTime(date3)).toBe(expectedTimestamp);
  });

  it('should return NaN for invalid date strings', () => {
    const invalidDate = 'invalid-date-string';
    expect(roundTime(invalidDate)).toBeNaN();
  });
});