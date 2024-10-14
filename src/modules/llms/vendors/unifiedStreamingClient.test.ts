import { describe, it, expect, vi, beforeEach } from 'vitest';
import { _openAIModerationCheck } from './unifiedStreamingClient';
import { apiAsync } from '~/common/util/trpc.client';
import type { OpenAIAccessSchema } from '../server/openai/openai.router';
import type { VChatMessageIn } from '../llm.client';

vi.mock('~/common/util/trpc.client', () => ({
  apiAsync: {
    llmOpenAI: {
      moderation: {
        mutate: vi.fn(),
      },
    },
  },
}));

vi.mock('~/common/util/clientFetchers', () => ({}));

describe('_openAIModerationCheck', () => {
  let access: OpenAIAccessSchema;
  let lastMessage: VChatMessageIn | null;

  beforeEach(() => {
    vi.clearAllMocks();
    access = {
      dialect: 'openai',
      oaiKey: 'test-key',
      oaiOrg: 'test-org',
      oaiHost: 'test-host',
      heliKey: 'test-heli-key',
      moderationCheck: true,
    };
    lastMessage = {
      role: 'user',
      content: 'test content',
    };
  });

  it('should return null if lastMessage is null', async () => {
    lastMessage = null;
    const result = await _openAIModerationCheck(access, lastMessage);
    expect(result).toBeNull();
  });

  it('should return null if lastMessage role is not user', async () => {
    lastMessage = { role: 'assistant', content: 'test content' };
    const result = await _openAIModerationCheck(access, lastMessage);
    expect(result).toBeNull();
  });

  it('should return a moderation message if flagged', async () => {
    vi.mocked(apiAsync.llmOpenAI.moderation.mutate).mockResolvedValueOnce({
      id: 'test-id',
      model: 'test-model',
      results: [
        {
          categories: {
            hate: true,
            'hate/threatening': false,
            'self-harm': false,
            sexual: false,
            'sexual/minors': false,
            violence: false,
            'violence/graphic': false,
          },
          category_scores: {
            hate: 0.9,
            'hate/threatening': 0.0,
            'self-harm': 0.0,
            sexual: 0.0,
            'sexual/minors': 0.0,
            violence: 0.0,
            'violence/graphic': 0.0,
          },
          flagged: true,
        },
      ],
    });

    const result = await _openAIModerationCheck(access, lastMessage);
    expect(result).toContain('I an unable to provide a response');
  });

  it('should return null if not flagged', async () => {
    vi.mocked(apiAsync.llmOpenAI.moderation.mutate).mockResolvedValueOnce({
      id: 'test-id',
      model: 'test-model',
      results: [
        {
          categories: {
            hate: false,
            'hate/threatening': false,
            'self-harm': false,
            sexual: false,
            'sexual/minors': false,
            violence: false,
            'violence/graphic': false,
          },
          category_scores: {
            hate: 0.1,
            'hate/threatening': 0.0,
            'self-harm': 0.0,
            sexual: 0.0,
            'sexual/minors': 0.0,
            violence: 0.0,
            'violence/graphic': 0.0,
          },
          flagged: false,
        },
      ],
    });

    const result = await _openAIModerationCheck(access, lastMessage);
    expect(result).toBeNull();
  });

  it('should return an error message if moderation check fails', async () => {
    vi.mocked(apiAsync.llmOpenAI.moderation.mutate).mockRejectedValueOnce(new Error('Network error'));

    const result = await _openAIModerationCheck(access, lastMessage);
    expect(result).toContain('There was an error while checking for harmful content');
  });
});