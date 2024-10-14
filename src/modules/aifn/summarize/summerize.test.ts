import { describe, it, expect, beforeEach, vi } from 'vitest';
import { breakDownChunk, summerizeToFitContextBudget, cleanUpContent, recursiveSummerize } from './summerize';
import { llmChatGenerateOrThrow } from '~/modules/llms/llm.client';
import { findLLMOrThrow } from '~/modules/llms/store-llms';

// Mocking external dependencies
vi.mock('~/modules/llms/llm.client', () => ({
  llmChatGenerateOrThrow: vi.fn(),
}));

vi.mock('~/modules/llms/store-llms', () => ({
  findLLMOrThrow: vi.fn(() => ({ contextTokens: 1000 })),
}));

describe('breakDownChunk', () => {
  it('should break down a chunk into smaller chunks based on target word count', () => {
    const chunk = 'This is a test chunk that needs to be split into smaller parts.';
    const result = breakDownChunk(chunk, 3);
    expect(result).toEqual(['This is a', 'test chunk that', 'needs to be', 'split into smaller', 'parts.']);
  });

  it('should return the original chunk if it is shorter than the target word count', () => {
    const chunk = 'Short chunk';
    const result = breakDownChunk(chunk, 5);
    expect(result).toEqual(['Short chunk']);
  });

  it('should handle an empty string', () => {
    const chunk = '';
    const result = breakDownChunk(chunk, 3);
    expect(result).toEqual(['']);
  });
});

describe('cleanUpContent', () => {
  beforeEach(() => {
    vi.mocked(llmChatGenerateOrThrow).mockReset();
  });

  it('should clean up content using the external API', async () => {
    const mockResponse = { content: 'Cleaned content' };
    vi.mocked(llmChatGenerateOrThrow).mockResolvedValue(mockResponse as any);

    const result = await cleanUpContent('Some content', 'mock-llm-id', 100);
    expect(result).toBe('Cleaned content');
  });

  it('should return an empty string if the API call fails', async () => {
    vi.mocked(llmChatGenerateOrThrow).mockRejectedValue(new Error('API Error'));

    const result = await cleanUpContent('Some content', 'mock-llm-id', 100);
    expect(result).toBe('');
  });
});

describe('recursiveSummerize', () => {
  beforeEach(() => {
    vi.mocked(llmChatGenerateOrThrow).mockReset();
  });

  it('should return the original text if it is within the target word count', async () => {
    const text = 'Short text';
    const result = await recursiveSummerize(text, 'mock-llm-id', 10);
    expect(result).toBe(text);
  });

  it('should recursively summarize the text', async () => {
    const mockResponse = { content: 'Short text' };
    vi.mocked(llmChatGenerateOrThrow).mockResolvedValue(mockResponse as any);

    const text = 'This is a long text that needs to be summarized.';
    const result = await recursiveSummerize(text, 'mock-llm-id', 2);
    expect(result).toBe('Short text');
  });
});

describe('summerizeToFitContextBudget', () => {
  beforeEach(() => {
    vi.mocked(llmChatGenerateOrThrow).mockReset();
  });

  it('should throw an error if target word count is negative', async () => {
    await expect(summerizeToFitContextBudget('Some text', -1, 'mock-llm-id')).rejects.toThrow('Target word count must be a non-negative number.');
  });

  it('should summarize text to fit the context budget', async () => {
    const mockCleanedResponse = { content: 'Cleaned text' };
    const mockSummarizedResponse = { content: 'Summarized text' };
    vi.mocked(llmChatGenerateOrThrow)
      .mockResolvedValueOnce(mockCleanedResponse as any)
      .mockResolvedValueOnce(mockSummarizedResponse as any);

    const text = 'This is a long text that needs to be summarized to fit the budget.';
    const result = await summerizeToFitContextBudget(text, 5, 'mock-llm-id');
    expect(result).toBe('Cleaned text\nSummarized text\n');
  });
});