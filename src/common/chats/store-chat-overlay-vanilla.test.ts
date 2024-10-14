import { describe, it, expect, beforeEach } from 'vitest';
import { createComposerOverlayStoreSlice } from './store-chat-overlay-vanilla';
import { createStore, StoreApi } from 'zustand/vanilla';

describe('createComposerOverlayStoreSlice', () => {
  let store: StoreApi<any>;

  beforeEach(() => {
    store = createStore(createComposerOverlayStoreSlice);
  });

  it('should initialize with null replyToText', () => {
    const state = store.getState();
    expect(state.replyToText).toBeNull();
  });

  it('should update replyToText using setReplyToText', () => {
    const state = store.getState();
    state.setReplyToText('Hello, World!');
    expect(store.getState().replyToText).toBe('Hello, World!');
  });

  it('should set replyToText to null', () => {
    const state = store.getState();
    state.setReplyToText('Initial Text');
    state.setReplyToText(null);
    expect(store.getState().replyToText).toBeNull();
  });
});