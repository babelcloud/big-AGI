import { describe, it, expect, vi } from 'vitest';
import { isValidAzureApiKey, ModelVendorAzure } from './azure.vendor';

// Mock the AzureIcon component
vi.mock('~/common/components/icons/vendors/AzureIcon', () => ({
  AzureIcon: vi.fn(),
}));

// Mock the OpenAILLMOptions component
vi.mock('../openai/OpenAILLMOptions', () => ({
  OpenAILLMOptions: vi.fn(),
}));

// Mock the AzureSourceSetup component
vi.mock('./AzureSourceSetup', () => ({
  AzureSourceSetup: vi.fn(),
}));

// Mock the ModelVendorOpenAI
vi.mock('../openai/openai.vendor', () => ({
  ModelVendorOpenAI: {
    rpcUpdateModelsOrThrow: vi.fn(),
    rpcChatGenerateOrThrow: vi.fn(),
    streamingChatGenerateOrThrow: vi.fn(),
  },
}));

describe('Azure Vendor', () => {
  describe('isValidAzureApiKey', () => {
    it('should return true for valid API keys', () => {
      expect(isValidAzureApiKey('1234567890123456789012345678901234')).toBe(true);
      expect(isValidAzureApiKey('abcdefghijklmnopqrstuvwxyz123456789')).toBe(true);
    });

    it('should return false for invalid API keys', () => {
      expect(isValidAzureApiKey('')).toBe(false);
      expect(isValidAzureApiKey('short')).toBe(false);
      expect(isValidAzureApiKey(undefined)).toBe(false);
    });
  });

  describe('getTransportAccess', () => {
    it('should return correct access schema for valid setup', () => {
      const partialSetup = {
        azureKey: 'validKey123456789012345678901234567890',
        azureEndpoint: 'https://example.azure.com',
      };

      const result = ModelVendorAzure.getTransportAccess(partialSetup);

      expect(result).toEqual({
        dialect: 'azure',
        oaiKey: 'validKey123456789012345678901234567890',
        oaiOrg: '',
        oaiHost: 'https://example.azure.com',
        heliKey: '',
        moderationCheck: false,
      });
    });

    it('should handle missing or partial setup', () => {
      const result = ModelVendorAzure.getTransportAccess();

      expect(result).toEqual({
        dialect: 'azure',
        oaiKey: '',
        oaiOrg: '',
        oaiHost: '',
        heliKey: '',
        moderationCheck: false,
      });
    });
  });
});