import { vi, describe, it, expect } from 'vitest';
import { sdbmHash, generateLlmEnvConfigHash } from './backend.router';
import { z } from 'zod';

// Mock the trpc.server module
vi.mock('~/server/api/trpc.server', () => ({
  createTRPCRouter: vi.fn(),
  publicProcedure: {
    input: vi.fn().mockReturnThis(),
    query: vi.fn(),
  },
}));

// Mock the env module
vi.mock('~/server/env.mjs', () => ({
  env: {},
}));

// Mock the trpc.router.fetchers module
vi.mock('~/server/api/trpc.router.fetchers', () => ({
  fetchJsonOrTRPCError: vi.fn(),
}));

// Mock the backend.analytics module
vi.mock('./backend.analytics', () => ({
  analyticsListCapabilities: vi.fn(),
}));

describe('sdbmHash', () => {
  it('should return a consistent hash for a given string', () => {
    expect(sdbmHash('test')).toBe('4745d132');
  });

  it('should return different hashes for different strings', () => {
    const hash1 = sdbmHash('test1');
    const hash2 = sdbmHash('test2');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty string', () => {
    expect(sdbmHash('')).toBe('0');
  });

  it('should handle long strings', () => {
    const longString = 'a'.repeat(1000);
    expect(sdbmHash(longString)).toMatch(/^[0-9a-f]+$/);
  });
});

describe('generateLlmEnvConfigHash', () => {
  it('should generate a hash based on API-related environment variables', () => {
    const mockEnv = {
      OPENAI_API_KEY: 'test-key',
      AZURE_OPENAI_API_KEY: 'azure-key',
      ANTHROPIC_API_KEY: 'anthropic-key',
      SOME_OTHER_VAR: 'ignored',
    };
    expect(generateLlmEnvConfigHash(mockEnv)).toMatch(/^[0-9a-f]+$/);
  });

  it('should ignore non-API environment variables', () => {
    const mockEnv = {
      OPENAI_API_KEY: 'test-key',
      SOME_OTHER_VAR: 'ignored',
    };
    const hashWithIgnored = generateLlmEnvConfigHash(mockEnv);
    
    const mockEnvWithoutIgnored = {
      OPENAI_API_KEY: 'test-key',
    };
    const hashWithoutIgnored = generateLlmEnvConfigHash(mockEnvWithoutIgnored);
    
    expect(hashWithIgnored).toBe(hashWithoutIgnored);
  });

  it('should return consistent hash regardless of variable order', () => {
    const mockEnv1 = {
      OPENAI_API_KEY: 'key1',
      AZURE_OPENAI_API_KEY: 'key2',
    };
    const mockEnv2 = {
      AZURE_OPENAI_API_KEY: 'key2',
      OPENAI_API_KEY: 'key1',
    };
    expect(generateLlmEnvConfigHash(mockEnv1)).toBe(generateLlmEnvConfigHash(mockEnv2));
  });

  it('should handle empty environment', () => {
    expect(generateLlmEnvConfigHash({})).toBe('0');
  });

  it('should ignore empty API variables', () => {
    const mockEnv = {
      OPENAI_API_KEY: 'test-key',
      AZURE_OPENAI_API_KEY: '',
    };
    const hash = generateLlmEnvConfigHash(mockEnv);
    expect(hash).toBe(generateLlmEnvConfigHash({ OPENAI_API_KEY: 'test-key' }));
  });
});