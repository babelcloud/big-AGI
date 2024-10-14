import { describe, it, expect, beforeEach } from 'vitest';
import { hasNoChatLinkItems, rememberChatLinkItem, forgetChatLinkItem } from './store-link';

describe('hasNoChatLinkItems', () => {
  beforeEach(() => {
    // Clear any existing chat link items before each test
    const items = [...Array(10).keys()].map(i => `id-${i}`);
    items.forEach(id => forgetChatLinkItem(id));
  });

  it('should return true when chatLinkItems is empty', () => {
    expect(hasNoChatLinkItems()).toBe(true);
  });

  it('should return false when chatLinkItems is not empty', () => {
    rememberChatLinkItem('Test Chat', 'id-1', new Date(), null, 'key-1');
    expect(hasNoChatLinkItems()).toBe(false);
  });
});