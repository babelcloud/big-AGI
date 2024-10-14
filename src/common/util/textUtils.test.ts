import { describe, it, expect, vi, beforeEach } from 'vitest';
import { capitalizeFirstLetter, createBase36Uid, ellipsizeFront, ellipsizeMiddle } from './textUtils';

describe('capitalizeFirstLetter', () => {
  it('should capitalize the first letter of a string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('should return an empty string if input is empty', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('should handle single character strings', () => {
    expect(capitalizeFirstLetter('a')).toBe('A');
  });

  it('should handle already capitalized strings', () => {
    expect(capitalizeFirstLetter('Hello')).toBe('Hello');
  });
});

describe('createBase36Uid', () => {
  const mockRandom = vi.spyOn(Math, 'random');

  beforeEach(() => {
    mockRandom.mockReset();
  });

  it('should generate a unique base36 ID', () => {
    mockRandom.mockReturnValueOnce(0.1).mockReturnValueOnce(0.2);
    const uid = createBase36Uid([]);
    expect(uid).toHaveLength(8);
  });

  it('should avoid duplicates', () => {
    mockRandom.mockReturnValueOnce(0.1).mockReturnValueOnce(0.1).mockReturnValueOnce(0.2);
    const uid = createBase36Uid(['b']);
    expect(uid).not.toBe('b');
  });
});

describe('ellipsizeFront', () => {
  it('should return the original text if it is shorter than maxLength', () => {
    expect(ellipsizeFront('hello', 10)).toBe('hello');
  });

  it('should ellipsize the front of the text if it is longer than maxLength', () => {
    expect(ellipsizeFront('hello world', 5)).toBe('…orld');
  });

  it('should handle edge case where maxLength is 1', () => {
    expect(ellipsizeFront('hello', 1)).toBe('…hello');
  });
});

describe('ellipsizeMiddle', () => {
  it('should return the original text if it is shorter than maxLength', () => {
    expect(ellipsizeMiddle('hello', 10)).toBe('hello');
  });

  it('should ellipsize the middle of the text if it is longer than maxLength', () => {
    expect(ellipsizeMiddle('hello world', 5)).toBe('he…ld');
  });

  it('should handle edge case where maxLength is 1', () => {
    expect(ellipsizeMiddle('hello', 1)).toBe('…hello');
  });
});