import { describe, it, expect, beforeEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import {
  createDConversation,
  createDMessage,
  messageHasUserFlag,
  messageToggleUserFlag,
  messageUserFlagToEmoji,
  getNextBranchTitle,
  updateDMessageTokenCount,
  updateTokenCounts
} from './store-chats';
import { countModelTokens } from '../util/token-counter';
import { defaultSystemPurposeId } from '../../data';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

// Mock countModelTokens
vi.mock('../util/token-counter', () => ({
  countModelTokens: vi.fn(() => 42),
}));

// Mock the missing module
vi.mock('~/modules/llms/store-llms', () => ({
  DLLMId: vi.fn(),
  getChatLLMId: vi.fn(() => 'mock-llm-id'),
}));

describe('store-chats', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDConversation', () => {
    it('should create a new conversation with default values', () => {
      const conversation = createDConversation();
      expect(conversation).toEqual({
        id: 'mock-uuid',
        messages: [],
        systemPurposeId: defaultSystemPurposeId,
        tokenCount: 0,
        created: expect.any(Number),
        updated: expect.any(Number),
        abortController: null,
      });
    });
  });

  describe('createDMessage', () => {
    it('should create a new message with default values for user role', () => {
      const message = createDMessage('user', 'Hello');
      expect(message).toEqual({
        id: 'mock-uuid',
        text: 'Hello',
        sender: 'You',
        avatar: null,
        typing: false,
        role: 'user',
        tokenCount: 0,
        created: expect.any(Number),
        updated: null,
      });
    });

    it('should create a new message with default values for bot role', () => {
      const message = createDMessage('assistant', 'Hi');
      expect(message).toEqual({
        id: 'mock-uuid',
        text: 'Hi',
        sender: 'Bot',
        avatar: null,
        typing: false,
        role: 'assistant',
        tokenCount: 0,
        created: expect.any(Number),
        updated: null,
      });
    });
  });

  describe('messageHasUserFlag', () => {
    it('should return true if the message has the specified user flag', () => {
      const message = { userFlags: ['starred'] };
      expect(messageHasUserFlag(message as any, 'starred')).toBe(true);
    });

    it('should return false if the message does not have the specified user flag', () => {
      const message = { userFlags: [] };
      expect(messageHasUserFlag(message as any, 'starred')).toBe(false);
    });
  });

  describe('messageToggleUserFlag', () => {
    it('should add the flag if it is not present', () => {
      const message = { userFlags: [] };
      const updatedFlags = messageToggleUserFlag(message as any, 'starred');
      expect(updatedFlags).toEqual(['starred']);
    });

    it('should remove the flag if it is present', () => {
      const message = { userFlags: ['starred'] };
      const updatedFlags = messageToggleUserFlag(message as any, 'starred');
      expect(updatedFlags).toEqual([]);
    });
  });

  describe('messageUserFlagToEmoji', () => {
    it('should return the correct emoji for a known flag', () => {
      expect(messageUserFlagToEmoji('starred')).toBe('⭐️');
    });

    it('should return a question mark for an unknown flag', () => {
      expect(messageUserFlagToEmoji('unknown' as any)).toBe('❓');
    });
  });

  describe('getNextBranchTitle', () => {
    it('should increment the number prefix if present', () => {
      expect(getNextBranchTitle('(1) Title')).toBe('(2) Title');
    });

    it('should add a number prefix if not present', () => {
      expect(getNextBranchTitle('Title')).toBe('(1) Title');
    });
  });

  describe('updateDMessageTokenCount', () => {
    it('should update the token count for a message', () => {
      const message = { text: 'Hello', tokenCount: 0 };
      const result = updateDMessageTokenCount(message as any, 'llm-id', true, 'test');
      expect(result).toBe(42);
      expect(countModelTokens).toHaveBeenCalledWith('Hello', 'llm-id', 'test');
    });

    it('should not update the token count if not forced and already present', () => {
      const message = { text: 'Hello', tokenCount: 10 };
      const result = updateDMessageTokenCount(message as any, 'llm-id', false, 'test');
      expect(result).toBe(10);
      expect(countModelTokens).not.toHaveBeenCalled();
    });
  });

  describe('updateTokenCounts', () => {
    it('should update token counts for a list of messages', () => {
      const messages = [
        { text: 'Hello', tokenCount: 0 },
        { text: 'World', tokenCount: 0 },
      ];
      const result = updateTokenCounts(messages as any, true, 'test');
      expect(result).toBe(3 + (4 + 42) * 2);
      expect(countModelTokens).toHaveBeenCalledTimes(2);
    });
  });

});