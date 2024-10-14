import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidOpenRouterKey } from './openrouter.vendor';

// Mock the missing imports to bypass the error
vi.mock('~/common/components/icons/vendors/OpenRouterIcon', () => ({
  OpenRouterIcon: () => null,
}));
vi.mock('../openai/openai.vendor', () => ({
  LLMOptionsOpenAI: {},
  ModelVendorOpenAI: {},
}));
vi.mock('../openai/OpenAILLMOptions', () => ({
  OpenAILLMOptions: () => null,
}));
vi.mock('./OpenRouterSourceSetup', () => ({
  OpenRouterSourceSetup: () => null,
}));

describe('isValidOpenRouterKey', () => {
  it('should return true for valid keys', () => {
    expect(isValidOpenRouterKey('sk-or-validKey123456789012345678901234567890')).toBe(true);
  });

  it('should return false for keys with invalid prefix', () => {
    expect(isValidOpenRouterKey('sk-invalidKey123456789012345678901234567890')).toBe(false);
  });

  it('should return false for keys with insufficient length', () => {
    expect(isValidOpenRouterKey('sk-or-short')).toBe(false);
  });

  it('should return false for undefined keys', () => {
    expect(isValidOpenRouterKey(undefined)).toBe(false);
  });

  it('should return false for empty string keys', () => {
    expect(isValidOpenRouterKey('')).toBe(false);
  });
});