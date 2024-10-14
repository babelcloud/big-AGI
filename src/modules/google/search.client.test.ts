import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidGoogleCloudApiKey, isValidGoogleCseId } from './search.client';

// Mock the unresolved module to bypass import errors
vi.mock('~/common/util/trpc.client', () => ({
  apiAsync: {
    googleSearch: {
      search: {
        query: vi.fn(),
      },
    },
  },
}));

describe('isValidGoogleCloudApiKey', () => {
  it('should return true for valid API key', () => {
    const validApiKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890123456789';
    expect(isValidGoogleCloudApiKey(validApiKey)).toBe(true);
  });

  it('should return false for API key that is too short', () => {
    const shortApiKey = 'ABC123';
    expect(isValidGoogleCloudApiKey(shortApiKey)).toBe(false);
  });

  it('should return false for undefined API key', () => {
    expect(isValidGoogleCloudApiKey(undefined)).toBe(false);
  });

  it('should return false for API key with only spaces', () => {
    const spacesApiKey = '   ';
    expect(isValidGoogleCloudApiKey(spacesApiKey)).toBe(false);
  });
});

describe('isValidGoogleCseId', () => {
  it('should return true for valid CSE ID', () => {
    const validCseId = '12345678901234567';
    expect(isValidGoogleCseId(validCseId)).toBe(true);
  });

  it('should return false for CSE ID that is too short', () => {
    const shortCseId = '12345';
    expect(isValidGoogleCseId(shortCseId)).toBe(false);
  });

  it('should return false for undefined CSE ID', () => {
    expect(isValidGoogleCseId(undefined)).toBe(false);
  });

  it('should return false for CSE ID with only spaces', () => {
    const spacesCseId = '   ';
    expect(isValidGoogleCseId(spacesCseId)).toBe(false);
  });
});