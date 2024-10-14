import { vi, describe, it, expect } from 'vitest';
import { ModelVendorGroq } from './groq.vendor';

vi.mock('~/common/components/icons/vendors/GroqIcon', () => ({
  GroqIcon: vi.fn(),
}));

vi.mock('../openai/openai.vendor', () => ({
  ModelVendorOpenAI: {
    rpcUpdateModelsOrThrow: vi.fn(),
    rpcChatGenerateOrThrow: vi.fn(),
    streamingChatGenerateOrThrow: vi.fn(),
  },
}));

vi.mock('./GroqSourceSetup', () => ({
  GroqSourceSetup: vi.fn(),
}));

vi.mock('../openai/OpenAILLMOptions', () => ({
  OpenAILLMOptions: vi.fn(),
}));

describe('ModelVendorGroq', () => {
  describe('initializeSetup', () => {
    it('should return an object with an empty groqKey', () => {
      const result = ModelVendorGroq.initializeSetup!();
      expect(result).toEqual({ groqKey: '' });
    });
  });

  describe('validateSetup', () => {
    it('should return true for a valid groqKey', () => {
      const setup = { groqKey: 'a'.repeat(50) };
      const result = ModelVendorGroq.validateSetup!(setup);
      expect(result).toBe(true);
    });

    it('should return false for an invalid groqKey (too short)', () => {
      const setup = { groqKey: 'a'.repeat(49) };
      const result = ModelVendorGroq.validateSetup!(setup);
      expect(result).toBe(false);
    });

    it('should return false for an empty groqKey', () => {
      const setup = { groqKey: '' };
      const result = ModelVendorGroq.validateSetup!(setup);
      expect(result).toBe(false);
    });

    it('should return false for undefined groqKey', () => {
      const setup = {} as any;
      const result = ModelVendorGroq.validateSetup!(setup);
      expect(result).toBe(false);
    });
  });

  describe('getTransportAccess', () => {
    it('should return correct access object with provided groqKey', () => {
      const partialSetup = { groqKey: 'test-key' };
      const result = ModelVendorGroq.getTransportAccess!(partialSetup);
      expect(result).toEqual({
        dialect: 'groq',
        oaiKey: 'test-key',
        oaiOrg: '',
        oaiHost: '',
        heliKey: '',
        moderationCheck: false,
      });
    });

    it('should return correct access object with empty groqKey if not provided', () => {
      const result = ModelVendorGroq.getTransportAccess!();
      expect(result).toEqual({
        dialect: 'groq',
        oaiKey: '',
        oaiOrg: '',
        oaiHost: '',
        heliKey: '',
        moderationCheck: false,
      });
    });
  });

  describe('ModelVendorGroq properties', () => {
    it('should have correct static properties', () => {
      expect(ModelVendorGroq.id).toBe('groq');
      expect(ModelVendorGroq.name).toBe('Groq');
      expect(ModelVendorGroq.rank).toBe(18);
      expect(ModelVendorGroq.location).toBe('cloud');
      expect(ModelVendorGroq.instanceLimit).toBe(1);
      expect(ModelVendorGroq.hasBackendCapKey).toBe('hasLlmGroq');
    });
  });
});