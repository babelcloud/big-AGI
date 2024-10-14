import { describe, it, expect, beforeEach } from 'vitest';
import {
  openAIModelFilter,
  openAIModelToModelDescription,
  azureModelToModelDescription,
  deepseekModelToModelDescription,
  lmStudioModelToModelDescription,
  localAIModelToModelDescription,
  mistralModelToModelDescription,
  mistralModelsSort,
  oobaboogaModelToModelDescription,
  openRouterModelFamilySortFn,
  openRouterModelToModelDescription,
  togetherAIModelsToModelDescriptions,
  perplexityAIModelDescriptions,
  perplexityAIModelSort,
  groqModelToModelDescription,
  groqModelSortFn,
  fromManualMapping
} from './models.data';
import type { ModelDescriptionSchema } from '../llm.server.types';
import type { OpenAIWire } from './openai.wiretypes';

describe('Model Functions', () => {

  describe('openAIModelFilter', () => {
    it('should filter models based on deny list', () => {
      const model: OpenAIWire.Models.ModelDescription = {
        id: 'gpt-3.5-turbo-0613',
        object: 'model',
        created: 123456,
        owned_by: 'openai'
      };
      expect(openAIModelFilter(model)).toBe(false);
      
      model.id = 'gpt-4o';
      expect(openAIModelFilter(model)).toBe(true);
    });
  });

  describe('openAIModelToModelDescription', () => {
    it('should map OpenAI model to ModelDescriptionSchema', () => {
      const modelDescription = openAIModelToModelDescription('gpt-4o', 123456);
      expect(modelDescription).toMatchObject({
        id: 'gpt-4o',
        label: expect.any(String),
        created: 123456
      });
    });
  });

  describe('azureModelToModelDescription', () => {
    it('should map Azure model to ModelDescriptionSchema', () => {
      const modelDescription = azureModelToModelDescription('gpt-35-turbo', 'gpt-4o', 123456);
      expect(modelDescription).toMatchObject({
        id: 'gpt-35-turbo',
        label: expect.any(String),
        created: 123456
      });
    });
  });

  describe('deepseekModelToModelDescription', () => {
    it('should map Deepseek model to ModelDescriptionSchema', () => {
      const modelDescription = deepseekModelToModelDescription('deepseek-chat');
      expect(modelDescription).toMatchObject({
        id: 'deepseek-chat',
        label: expect.any(String),
        description: expect.any(String)
      });
    });
  });

  describe('lmStudioModelToModelDescription', () => {
    it('should map LM Studio model to ModelDescriptionSchema', () => {
      const modelDescription = lmStudioModelToModelDescription('lm-studio-model');
      expect(modelDescription).toMatchObject({
        id: 'lm-studio-model',
        label: expect.any(String),
        description: expect.any(String)
      });
    });
  });

  describe('localAIModelToModelDescription', () => {
    it('should map LocalAI model to ModelDescriptionSchema', () => {
      const modelDescription = localAIModelToModelDescription('ggml-gpt4all-j');
      expect(modelDescription).toMatchObject({
        id: 'ggml-gpt4all-j',
        label: expect.any(String),
        description: expect.any(String)
      });
    });
  });

  describe('mistralModelToModelDescription', () => {
    it('should map Mistral model to ModelDescriptionSchema', () => {
      const modelDescription = mistralModelToModelDescription({ id: 'mistral-large-2402', created: 123456, object: 'model', owned_by: 'mistral' });
      expect(modelDescription).toMatchObject({
        id: 'mistral-large-2402',
        label: expect.any(String),
        description: expect.any(String)
      });
    });
  });

  describe('mistralModelsSort', () => {
    it('should sort Mistral models correctly', () => {
      const modelA: ModelDescriptionSchema = { id: 'mistral-large-2402', label: 'A', interfaces: [], contextWindow: 0, description: 'desc' };
      const modelB: ModelDescriptionSchema = { id: 'mistral-small-2402', label: 'B', interfaces: [], contextWindow: 0, description: 'desc' };
      expect(mistralModelsSort(modelA, modelB)).toBeLessThan(0);
    });
  });

  describe('oobaboogaModelToModelDescription', () => {
    it('should map Oobabooga model to ModelDescriptionSchema', () => {
      const modelDescription = oobaboogaModelToModelDescription('gpt-3.5-turbo', 123456);
      expect(modelDescription).toMatchObject({
        id: 'gpt-3.5-turbo',
        label: expect.any(String),
        description: expect.any(String)
      });
    });
  });

  describe('openRouterModelFamilySortFn', () => {
    it('should sort OpenRouter models based on family', () => {
      const modelA = { id: 'openai/gpt-3.5-turbo' };
      const modelB = { id: 'anthropic/claude-2.0' };
      expect(openRouterModelFamilySortFn(modelA, modelB)).toBeGreaterThan(0);
    });
  });

  describe('openRouterModelToModelDescription', () => {
    it('should map OpenRouter model to ModelDescriptionSchema', () => {
      const wireModel = {
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'A great model',
        pricing: { prompt: '0.01', completion: '0.02', image: '0', request: '0' },
        context_length: 4096,
        architecture: { modality: 'text', tokenizer: 'default', instruct_type: null },
        top_provider: { max_completion_tokens: 4096, is_moderated: false },
        per_request_limits: null
      };
      const modelDescription = openRouterModelToModelDescription(wireModel);
      expect(modelDescription).toMatchObject({
        id: 'openai/gpt-3.5-turbo',
        label: expect.any(String),
        description: 'A great model'
      });
    });
  });

  describe('togetherAIModelsToModelDescriptions', () => {
    it('should map Together AI models to ModelDescriptionSchema', () => {
      const wireModels = [{ id: 'NousResearch/Nous-Hermes-2', created: 123456, object: 'model' }];
      const modelDescriptions = togetherAIModelsToModelDescriptions(wireModels);
      expect(modelDescriptions).toHaveLength(1);
      expect(modelDescriptions[0]).toMatchObject({
        id: 'NousResearch/Nous-Hermes-2',
        label: expect.any(String),
        description: expect.any(String)
      });
    });
  });

  describe('perplexityAIModelDescriptions', () => {
    it('should return static descriptions for Perplexity AI models', () => {
      const descriptions = perplexityAIModelDescriptions();
      expect(descriptions).toBeInstanceOf(Array);
    });
  });

  describe('perplexityAIModelSort', () => {
    it('should sort Perplexity AI models correctly', () => {
      const modelA: ModelDescriptionSchema = { id: 'llama-3-sonar-large-32k-chat', label: 'A', interfaces: [], contextWindow: 0, description: 'desc' };
      const modelB: ModelDescriptionSchema = { id: 'llama-3-sonar-small-32k-chat', label: 'B', interfaces: [], contextWindow: 0, description: 'desc' };
      expect(perplexityAIModelSort(modelA, modelB)).toBeLessThan(0);
    });
  });

  describe('groqModelToModelDescription', () => {
    it('should map Groq model to ModelDescriptionSchema', () => {
      const wireModel = { id: 'llama-3.1-405b-reasoning', created: 123456, object: 'model', owned_by: 'groq', active: true };
      const modelDescription = groqModelToModelDescription(wireModel);
      expect(modelDescription).toMatchObject({
        id: 'llama-3.1-405b-reasoning',
        label: expect.any(String),
        description: expect.any(String)
      });
    });
  });

  describe('groqModelSortFn', () => {
    it('should sort Groq models correctly', () => {
      const modelA: ModelDescriptionSchema = { id: 'llama-3.1-405b-reasoning', label: 'A', interfaces: [], contextWindow: 0, description: 'desc' };
      const modelB: ModelDescriptionSchema = { id: 'llama-3.1-70b-versatile', label: 'B', interfaces: [], contextWindow: 0, description: 'desc' };
      expect(groqModelSortFn(modelA, modelB)).toBeLessThan(0);
    });
  });

  describe('fromManualMapping', () => {
    it('should map model using manual mapping', () => {
      const mappings = [
        { idPrefix: 'test-', label: 'Test Model', description: 'A test model', contextWindow: 1024, interfaces: [] }
      ];
      const modelDescription = fromManualMapping(mappings, 'test-1234', 123456);
      expect(modelDescription).toMatchObject({
        id: 'test-1234',
        label: 'Test Model [1234]',
        description: 'A test model'
      });
    });
  });

});