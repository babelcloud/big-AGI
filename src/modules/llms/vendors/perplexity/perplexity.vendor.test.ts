import { describe, it, expect, vi } from 'vitest';
import { ModelVendorPerplexity } from './perplexity.vendor';

vi.mock('~/common/components/icons/vendors/PerplexityIcon', () => ({
  PerplexityIcon: vi.fn(),
}));

vi.mock('../openai/openai.vendor', () => ({
  ModelVendorOpenAI: {
    rpcUpdateModelsOrThrow: vi.fn(),
    rpcChatGenerateOrThrow: vi.fn(),
    streamingChatGenerateOrThrow: vi.fn(),
  },
}));

vi.mock('../openai/OpenAILLMOptions', () => ({
  OpenAILLMOptions: vi.fn(),
}));

vi.mock('./PerplexitySourceSetup', () => ({
  PerplexitySourceSetup: vi.fn(),
}));

describe('ModelVendorPerplexity', () => {
  describe('initializeSetup', () => {
    it('should return an object with empty perplexityKey', () => {
      expect(ModelVendorPerplexity.initializeSetup!()).toEqual({ perplexityKey: '' });
    });
  });

  describe('validateSetup', () => {
    it('should return true for valid setup', () => {
      const validSetup = { perplexityKey: 'a'.repeat(50) };
      expect(ModelVendorPerplexity.validateSetup!(validSetup)).toBe(true);
    });

    it('should return false for invalid setup', () => {
      const invalidSetup = { perplexityKey: 'a'.repeat(49) };
      expect(ModelVendorPerplexity.validateSetup!(invalidSetup)).toBe(false);
    });

    it('should return false for empty setup', () => {
      const emptySetup = { perplexityKey: '' };
      expect(ModelVendorPerplexity.validateSetup!(emptySetup)).toBe(false);
    });

    it('should return false for undefined setup', () => {
      const undefinedSetup = { perplexityKey: undefined };
      expect(ModelVendorPerplexity.validateSetup!(undefinedSetup as any)).toBe(false);
    });
  });

  describe('getTransportAccess', () => {
    it('should return correct access object for valid setup', () => {
      const validSetup = { perplexityKey: 'valid-key' };
      const expectedAccess = {
        dialect: 'perplexity',
        oaiKey: 'valid-key',
        oaiOrg: '',
        oaiHost: '',
        heliKey: '',
        moderationCheck: false,
      };
      expect(ModelVendorPerplexity.getTransportAccess(validSetup)).toEqual(expectedAccess);
    });

    it('should return access object with empty key for undefined setup', () => {
      const expectedAccess = {
        dialect: 'perplexity',
        oaiKey: '',
        oaiOrg: '',
        oaiHost: '',
        heliKey: '',
        moderationCheck: false,
      };
      expect(ModelVendorPerplexity.getTransportAccess(undefined)).toEqual(expectedAccess);
    });

    it('should return access object with empty key for null setup', () => {
      const expectedAccess = {
        dialect: 'perplexity',
        oaiKey: '',
        oaiOrg: '',
        oaiHost: '',
        heliKey: '',
        moderationCheck: false,
      };
      expect(ModelVendorPerplexity.getTransportAccess(null as any)).toEqual(expectedAccess);
    });
  });
});