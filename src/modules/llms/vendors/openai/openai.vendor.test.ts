import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelVendorOpenAI } from './openai.vendor';
import type { OpenAIAccessSchema } from '../../server/openai/openai.router';
import type { SourceSetupOpenAI } from './openai.vendor';

// Mock the OpenAIIcon component to bypass loading issues
vi.mock('~/common/components/icons/vendors/OpenAIIcon', () => ({
  OpenAIIcon: () => null,
}));

// Mock the apiAsync to bypass loading issues
vi.mock('~/common/util/trpc.client', () => ({
  apiAsync: {
    llmOpenAI: {
      listModels: {
        query: vi.fn(),
      },
      chatGenerateWithFunctions: {
        mutate: vi.fn(),
      },
    },
  },
}));

// Mock the unifiedStreamingClient to bypass loading issues
vi.mock('../unifiedStreamingClient', () => ({
  unifiedStreamingClient: vi.fn(),
}));

// Mock the OpenAILLMOptions component to bypass loading issues
vi.mock('./OpenAILLMOptions', () => ({
  OpenAILLMOptions: () => null,
}));

// Mock the OpenAISourceSetup component to bypass loading issues
vi.mock('./OpenAISourceSetup', () => ({
  OpenAISourceSetup: () => null,
}));

describe('ModelVendorOpenAI', () => {
  describe('getTransportAccess', () => {
    it('should return default access schema when partialSetup is empty', () => {
      const partialSetup: Partial<SourceSetupOpenAI> = {};
      const expectedAccess: OpenAIAccessSchema = {
        dialect: 'openai',
        oaiKey: '',
        oaiOrg: '',
        oaiHost: '',
        heliKey: '',
        moderationCheck: false,
      };

      const result = ModelVendorOpenAI.getTransportAccess(partialSetup);

      expect(result).toEqual(expectedAccess);
    });

    it('should merge partialSetup with default access schema', () => {
      const partialSetup: Partial<SourceSetupOpenAI> = {
        oaiKey: 'sk-test',
        moderationCheck: true,
      };
      const expectedAccess: OpenAIAccessSchema = {
        dialect: 'openai',
        oaiKey: 'sk-test',
        oaiOrg: '',
        oaiHost: '',
        heliKey: '',
        moderationCheck: true,
      };

      const result = ModelVendorOpenAI.getTransportAccess(partialSetup);

      expect(result).toEqual(expectedAccess);
    });

    it('should override default values with partialSetup values', () => {
      const partialSetup: Partial<SourceSetupOpenAI> = {
        oaiKey: 'sk-newKey',
        oaiOrg: 'newOrg',
        oaiHost: 'newHost',
        heliKey: 'newHeliKey',
        moderationCheck: true,
      };
      const expectedAccess: OpenAIAccessSchema = {
        dialect: 'openai',
        oaiKey: 'sk-newKey',
        oaiOrg: 'newOrg',
        oaiHost: 'newHost',
        heliKey: 'newHeliKey',
        moderationCheck: true,
      };

      const result = ModelVendorOpenAI.getTransportAccess(partialSetup);

      expect(result).toEqual(expectedAccess);
    });
  });
});