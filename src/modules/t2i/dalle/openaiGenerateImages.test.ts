import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openAIImageModelsPricing } from './openaiGenerateImages';

// Mock the missing module to prevent errors during test execution
vi.mock('~/common/util/trpc.client', () => ({
  apiAsync: {
    llmOpenAI: {
      createImages: {
        mutate: vi.fn(),
      },
    },
  },
}));

// Mock other dependencies
vi.mock('../../llms/vendors/vendors.registry', () => ({
  findAccessForSourceOrThrow: vi.fn().mockReturnValue({
    transportAccess: {},
  }),
}));

vi.mock('./store-module-dalle', () => ({
  useDalleStore: {
    getState: vi.fn().mockReturnValue({
      dalleModelId: 'dall-e-3',
      dalleQuality: 'standard',
      dalleSize: '1024x1024',
      dalleStyle: 'vivid',
      dalleNoRewrite: false,
    }),
  },
}));

describe('openAIImageModelsPricing', () => {
  it('should return correct pricing for dall-e-3, hd, 1024x1024', () => {
    const price = openAIImageModelsPricing('dall-e-3', 'hd', '1024x1024');
    expect(price).toBe('0.08');
  });

  it('should return correct pricing for dall-e-3, hd, 1792x1024', () => {
    const price = openAIImageModelsPricing('dall-e-3', 'hd', '1792x1024');
    expect(price).toBe('0.12');
  });

  it('should return correct pricing for dall-e-3, hd, 1024x1792', () => {
    const price = openAIImageModelsPricing('dall-e-3', 'hd', '1024x1792');
    expect(price).toBe('0.12');
  });

  it('should return correct pricing for dall-e-3, standard, 1024x1024', () => {
    const price = openAIImageModelsPricing('dall-e-3', 'standard', '1024x1024');
    expect(price).toBe('0.04');
  });

  it('should return correct pricing for dall-e-3, standard, 1792x1024', () => {
    const price = openAIImageModelsPricing('dall-e-3', 'standard', '1792x1024');
    expect(price).toBe('0.08');
  });

  it('should return correct pricing for dall-e-3, standard, 1024x1792', () => {
    const price = openAIImageModelsPricing('dall-e-3', 'standard', '1024x1792');
    expect(price).toBe('0.08');
  });

  it('should return correct pricing for dall-e-2, any quality, 256x256', () => {
    const price = openAIImageModelsPricing('dall-e-2', 'standard', '256x256');
    expect(price).toBe('0.016');
  });

  it('should return correct pricing for dall-e-2, any quality, 512x512', () => {
    const price = openAIImageModelsPricing('dall-e-2', 'standard', '512x512');
    expect(price).toBe('0.018');
  });

  it('should return correct pricing for dall-e-2, any quality, 1024x1024', () => {
    const price = openAIImageModelsPricing('dall-e-2', 'standard', '1024x1024');
    expect(price).toBe('0.02');
  });

  it('should return "?" for unknown combinations', () => {
    const price = openAIImageModelsPricing('dall-e-2', 'standard', 'unknown-size' as any);
    expect(price).toBe('?');
  });
});