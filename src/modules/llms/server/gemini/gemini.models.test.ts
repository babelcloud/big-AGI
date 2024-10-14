import { describe, it, expect, beforeEach } from 'vitest';
import {
  geminiFilterModels,
  geminiModelToModelDescription,
} from './gemini.models';
import type { GeminiModelSchema } from './gemini.wiretypes';
import { LLM_IF_OAI_Chat, LLM_IF_OAI_Json, LLM_IF_OAI_Vision } from '../../store-llms';

const mockGeminiModel: GeminiModelSchema = {
  name: 'mock-model',
  version: '1.0',
  displayName: 'Mock Model',
  description: 'A mock model for testing',
  inputTokenLimit: 1000,
  outputTokenLimit: 500,
  supportedGenerationMethods: ['generateContent'],
};

describe('geminiFilterModels', () => {
  it('should allow models with allowed names and interfaces', () => {
    const model: GeminiModelSchema = {
      ...mockGeminiModel,
      displayName: 'Allowed Model',
      supportedGenerationMethods: ['generateContent'],
    };

    expect(geminiFilterModels(model)).toBe(true);
  });

  it('should filter out models with unallowed names', () => {
    const model: GeminiModelSchema = {
      ...mockGeminiModel,
      displayName: 'Legacy Model',
    };

    expect(geminiFilterModels(model)).toBe(false);
  });

  it('should filter out models with unsupported interfaces', () => {
    const model: GeminiModelSchema = {
      ...mockGeminiModel,
      supportedGenerationMethods: ['generateAnswer'],
    };

    expect(geminiFilterModels(model)).toBe(false);
  });
});

describe('geminiModelToModelDescription', () => {
  it('should convert a gemini model to a model description', () => {
    const model: GeminiModelSchema = {
      ...mockGeminiModel,
      supportedGenerationMethods: ['generateContent', 'embedText'],
    };

    const description = geminiModelToModelDescription(model);

    expect(description.id).toBe('mock-model');
    expect(description.label).toBe('Mock Model');
    expect(description.description).toContain('A mock model for testing');
    expect(description.contextWindow).toBe(1500);
    expect(description.interfaces).toContain(LLM_IF_OAI_Chat);
  });

  it('should handle hidden models correctly', () => {
    const model: GeminiModelSchema = {
      ...mockGeminiModel,
      supportedGenerationMethods: [],
    };

    const description = geminiModelToModelDescription(model);

    expect(description.hidden).toBe(true);
  });

  it('should handle models with symlinks correctly', () => {
    const model: GeminiModelSchema = {
      ...mockGeminiModel,
      name: 'models/gemini-pro',
      displayName: 'Gemini Pro',
    };

    const description = geminiModelToModelDescription(model);

    expect(description.label).toContain('🔗');
  });
});