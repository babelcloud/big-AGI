import { describe, it, expect, vi } from 'vitest';
import { objectToQueryString } from './search.router';

// Mock the modules that cause import errors
vi.mock('~/server/api/trpc.server', () => ({
  createTRPCRouter: vi.fn(),
  publicProcedure: {
    input: vi.fn().mockReturnThis(),
    query: vi.fn().mockReturnThis(),
  },
}));

vi.mock('~/server/env.mjs', () => ({
  env: {
    GOOGLE_CSE_ID: 'mocked_cse_id',
    GOOGLE_CLOUD_API_KEY: 'mocked_api_key',
  },
}));

vi.mock('~/server/api/trpc.router.fetchers', () => ({
  fetchJsonOrTRPCError: vi.fn(),
}));

describe('objectToQueryString', () => {
  it('should convert an empty object to an empty string', () => {
    const result = objectToQueryString({});
    expect(result).toBe('');
  });

  it('should convert a simple object to a query string', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const result = objectToQueryString(obj);
    expect(result).toBe('key1=value1&key2=value2');
  });

  it('should handle special characters in keys and values', () => {
    const obj = { 'key 1': 'value&1', 'key@2': 'value=2' };
    const result = objectToQueryString(obj);
    expect(result).toBe('key%201=value%261&key%402=value%3D2');
  });

  it('should handle numeric values', () => {
    const obj = { key1: 123, key2: 456 };
    const result = objectToQueryString(obj);
    expect(result).toBe('key1=123&key2=456');
  });

  it('should handle boolean values', () => {
    const obj = { key1: true, key2: false };
    const result = objectToQueryString(obj);
    expect(result).toBe('key1=true&key2=false');
  });

  it('should handle undefined and null values by converting them to strings', () => {
    const obj = { key1: undefined, key2: null, key3: 'value3' };
    const result = objectToQueryString(obj);
    expect(result).toBe('key1=undefined&key2=null&key3=value3');
  });
});