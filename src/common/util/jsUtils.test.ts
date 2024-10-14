import { describe, it, expect } from 'vitest';
import { isDeepEqual } from './jsUtils';

describe('isDeepEqual', () => {
  it('should return true for identical primitive values', () => {
    expect(isDeepEqual(5, 5)).toBe(true);
    expect(isDeepEqual('test', 'test')).toBe(true);
    expect(isDeepEqual(true, true)).toBe(true);
  });

  it('should return false for different primitive values', () => {
    expect(isDeepEqual(5, 10)).toBe(false);
    expect(isDeepEqual('test', 'Test')).toBe(false);
    expect(isDeepEqual(true, false)).toBe(false);
  });

  it('should return true for identical arrays', () => {
    expect(isDeepEqual([1, 2, 3] as any, [1, 2, 3] as any)).toBe(true);
    expect(isDeepEqual(['a', 'b'] as any, ['a', 'b'] as any)).toBe(true);
  });

  it('should return false for different arrays', () => {
    expect(isDeepEqual([1, 2, 3] as any, [1, 2, 4] as any)).toBe(false);
    expect(isDeepEqual(['a', 'b'] as any, ['a', 'c'] as any)).toBe(false);
    expect(isDeepEqual([1, 2] as any, [1, 2, 3] as any)).toBe(false);
  });

  it('should return true for identical objects', () => {
    expect(isDeepEqual({ a: 1, b: 2 } as any, { a: 1, b: 2 } as any)).toBe(true);
    expect(isDeepEqual({ a: { b: 2 } } as any, { a: { b: 2 } } as any)).toBe(true);
  });

  it('should return false for different objects', () => {
    expect(isDeepEqual({ a: 1, b: 2 } as any, { a: 1, b: 3 } as any)).toBe(false);
    expect(isDeepEqual({ a: { b: 2 } } as any, { a: { b: 3 } } as any)).toBe(false);
    expect(isDeepEqual({ a: 1 } as any, { a: 1, b: 2 } as any)).toBe(false);
  });

  it('should handle null and undefined correctly', () => {
    expect(isDeepEqual(null as any, null as any)).toBe(true);
    expect(isDeepEqual(undefined as any, undefined as any)).toBe(true);
    expect(isDeepEqual(null as any, undefined as any)).toBe(false);
    expect(isDeepEqual(null as any, {} as any)).toBe(false);
    expect(isDeepEqual(undefined as any, {} as any)).toBe(false);
  });

  it('should return false for different types', () => {
    expect(isDeepEqual(5 as any, '5' as any)).toBe(false);
    expect(isDeepEqual(true as any, 1 as any)).toBe(false);
    expect(isDeepEqual([] as any, {} as any)).toBe(false);
  });

  it('should handle complex nested structures', () => {
    const obj1 = { a: [1, { b: 2 }], c: { d: 3 } };
    const obj2 = { a: [1, { b: 2 }], c: { d: 3 } };
    const obj3 = { a: [1, { b: 3 }], c: { d: 3 } };

    expect(isDeepEqual(obj1 as any, obj2 as any)).toBe(true);
    expect(isDeepEqual(obj1 as any, obj3 as any)).toBe(false);
  });
});