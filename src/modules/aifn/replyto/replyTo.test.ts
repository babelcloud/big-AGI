import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateHistoryForReplyTo } from './replyTo';
import { createDMessage, DMessage } from '~/common/state/store-chats';

vi.mock('~/common/state/store-chats', () => ({
  createDMessage: vi.fn(),
}));

describe('updateHistoryForReplyTo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do nothing if history is empty', () => {
    const history: DMessage[] = [];
    updateHistoryForReplyTo(history);
    expect(history).toHaveLength(0);
  });

  it('should do nothing if last message is not from user', () => {
    const history: DMessage[] = [
      { id: '1', text: '', sender: '', avatar: '', role: 'system', metadata: { inReplyToText: 'Hello' }, typing: false, tokenCount: 0, created: Date.now(), updated: Date.now() },
    ];
    updateHistoryForReplyTo(history);
    expect(history).toHaveLength(1);
  });

  it('should do nothing if last user message has no metadata', () => {
    const history: DMessage[] = [
      { id: '2', text: '', sender: '', avatar: '', role: 'user', metadata: {}, typing: false, tokenCount: 0, created: Date.now(), updated: Date.now() },
    ];
    updateHistoryForReplyTo(history);
    expect(history).toHaveLength(1);
  });

  it('should add a system message if last user message has inReplyToText metadata', () => {
    const history: DMessage[] = [
      { id: '3', text: '', sender: '', avatar: '', role: 'user', metadata: { inReplyToText: 'Hello' }, typing: false, tokenCount: 0, created: Date.now(), updated: Date.now() },
    ];
    const expectedMessage: DMessage = { id: '4', text: 'The user is referring to this in particular:\nHello', sender: '', avatar: '', role: 'system', metadata: {}, typing: false, tokenCount: 0, created: Date.now(), updated: Date.now() };

    vi.mocked(createDMessage).mockReturnValue(expectedMessage);

    updateHistoryForReplyTo(history);

    expect(createDMessage).toHaveBeenCalledWith('system', 'The user is referring to this in particular:\nHello');
    expect(history).toHaveLength(2);
    expect(history[1]).toEqual(expectedMessage);
  });
});