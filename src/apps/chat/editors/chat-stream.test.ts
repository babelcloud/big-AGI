import { describe, it, expect, beforeEach, vi } from 'vitest';
import { streamAssistantMessage } from './chat-stream';
import { speakText } from '~/modules/elevenlabs/elevenlabs.client';
import { llmStreamingChatGenerate } from '~/modules/llms/llm.client';

vi.mock('~/modules/llms/llm.client', () => ({
  llmStreamingChatGenerate: vi.fn(),
}));

vi.mock('~/modules/elevenlabs/elevenlabs.client', () => ({
  speakText: vi.fn(),
}));

vi.mock('~/modules/aifn/autosuggestions/autoSuggestions', () => ({}));
vi.mock('~/modules/aifn/autotitle/autoTitle', () => ({}));
vi.mock('~/common/chats/ConversationsManager', () => ({
  ConversationsManager: {
    getHandler: vi.fn().mockReturnValue({
      messageAppendAssistant: vi.fn(),
      setAbortController: vi.fn(),
      messageEdit: vi.fn(),
    }),
  },
}));

describe('streamAssistantMessage', () => {
  const mockEditMessage = vi.fn();
  const mockAbortSignal = { aborted: false } as AbortSignal;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully stream messages', async () => {
    vi.mocked(llmStreamingChatGenerate).mockImplementation(async (llmId, messagesHistory, contextName, contextRef, arg5, arg6, abortSignal, callback) => {
      callback({ textSoFar: 'Hello', originLLM: 'mockLLM', typing: true }, false);
    });

    const result = await streamAssistantMessage(
      'test-llm-id',
      [{ role: 'user', content: 'Hi' }],
      'conversation',
      'test-conversation-id',
      1,
      'off',
      mockEditMessage,
      mockAbortSignal
    );

    expect(result.outcome).toBe('success');
    expect(mockEditMessage).toHaveBeenCalledWith({ text: 'Hello', originLLM: 'mockLLM', typing: false });
  });

  it('should handle abort signal', async () => {
    vi.mocked(llmStreamingChatGenerate).mockImplementation(async () => {
      throw { name: 'AbortError' };
    });

    const result = await streamAssistantMessage(
      'test-llm-id',
      [{ role: 'user', content: 'Hi' }],
      'conversation',
      'test-conversation-id',
      1,
      'off',
      mockEditMessage,
      mockAbortSignal
    );

    expect(result.outcome).toBe('aborted');
    expect(mockEditMessage).toHaveBeenCalledWith({ text: '', typing: false });
  });

  it('should handle errors', async () => {
    vi.mocked(llmStreamingChatGenerate).mockImplementation(async () => {
      throw new Error('Test error');
    });

    const result = await streamAssistantMessage(
      'test-llm-id',
      [{ role: 'user', content: 'Hi' }],
      'conversation',
      'test-conversation-id',
      1,
      'off',
      mockEditMessage,
      mockAbortSignal
    );

    expect(result.outcome).toBe('errored');
    expect(result.errorMessage).toBe('Test error');
    expect(mockEditMessage).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('Test error') }));
  });

  it('should speak first line when autoSpeak is "firstLine"', async () => {
    vi.mocked(llmStreamingChatGenerate).mockImplementation(async (llmId, messagesHistory, contextName, contextRef, arg5, arg6, abortSignal, callback) => {
      callback({ textSoFar: 'Hello. This is a test.', originLLM: 'mockLLM', typing: true }, false);
    });

    await streamAssistantMessage(
      'test-llm-id',
      [{ role: 'user', content: 'Hi' }],
      'conversation',
      'test-conversation-id',
      1,
      'firstLine',
      mockEditMessage,
      mockAbortSignal
    );

    expect(speakText).toHaveBeenCalledWith('Hello. This is a test.');
  });

  it('should speak all text when autoSpeak is "all"', async () => {
    vi.mocked(llmStreamingChatGenerate).mockImplementation(async (llmId, messagesHistory, contextName, contextRef, arg5, arg6, abortSignal, callback) => {
      callback({ textSoFar: 'Hello. This is a test.', originLLM: 'mockLLM', typing: true }, false);
    });

    await streamAssistantMessage(
      'test-llm-id',
      [{ role: 'user', content: 'Hi' }],
      'conversation',
      'test-conversation-id',
      1,
      'all',
      mockEditMessage,
      mockAbortSignal
    );

    expect(speakText).toHaveBeenCalledWith('Hello. This is a test.');
  });
});