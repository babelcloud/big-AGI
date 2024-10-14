import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationsManager } from './ConversationsManager';
import { ConversationHandler } from './ConversationHandler';

// Mock ConversationHandler to track instances
vi.mock('./ConversationHandler', () => ({
  ConversationHandler: vi.fn(),
}));

describe('ConversationsManager', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    (ConversationsManager as any)._instance = undefined;
    vi.clearAllMocks();
  });

  it('should create a new ConversationHandler if none exists for the given ID', () => {
    const conversationId = 'test-id';
    const handler = ConversationsManager.getHandler(conversationId);

    expect(handler).toBeInstanceOf(ConversationHandler);
    expect(ConversationHandler).toHaveBeenCalledWith(conversationId);
  });

  it('should return the existing ConversationHandler for a given ID', () => {
    const conversationId = 'test-id';
    const firstHandler = ConversationsManager.getHandler(conversationId);
    const secondHandler = ConversationsManager.getHandler(conversationId);

    expect(secondHandler).toBe(firstHandler);
    expect(ConversationHandler).toHaveBeenCalledTimes(1);
  });
});