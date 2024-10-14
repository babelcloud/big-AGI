import { describe, it, expect, beforeEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { createDEphemeral, EphemeralsStore, EphemeralHandler } from './EphemeralsStore';
import { customEventHelpers } from '~/common/util/eventUtils';

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mocked-uuid'),
}));

vi.mock('~/common/util/eventUtils', () => {
  const dispatch = vi.fn();
  const installListener = vi.fn(() => () => {});
  return {
    customEventHelpers: vi.fn(() => [dispatch, installListener]),
  };
});

describe('createDEphemeral', () => {
  it('should create a DEphemeral object with a unique ID', () => {
    const title = 'Test Title';
    const initialText = 'Initial Text';
    const ephemeral = createDEphemeral(title, initialText);

    expect(ephemeral).toEqual({
      id: 'mocked-uuid',
      title,
      text: initialText,
      state: {},
    });
  });
});

describe('EphemeralsStore', () => {
  let store: EphemeralsStore;
  let dispatchEphemeralsChanged: ReturnType<typeof customEventHelpers>[0];

  beforeEach(() => {
    store = new EphemeralsStore();
    dispatchEphemeralsChanged = vi.mocked(customEventHelpers).mock.results[0].value[0];
    (dispatchEphemeralsChanged as any).mockClear();
  });

  it('should append a new ephemeral', () => {
    const ephemeral = createDEphemeral('Title', 'Text');
    store.append(ephemeral);

    expect(store.find()).toContain(ephemeral);
    expect(dispatchEphemeralsChanged).toHaveBeenCalledWith(store, [ephemeral]);
  });

  it('should delete an ephemeral by ID', () => {
    const ephemeral = createDEphemeral('Title', 'Text');
    store.append(ephemeral);
    store.delete(ephemeral.id);

    expect(store.find()).not.toContain(ephemeral);
    expect(dispatchEphemeralsChanged).toHaveBeenCalledWith(store, []);
  });

  it('should update an ephemeral by ID', () => {
    const ephemeral = createDEphemeral('Title', 'Text');
    store.append(ephemeral);
    const updatedText = 'Updated Text';
    store.update(ephemeral.id, { text: updatedText });

    expect(store.find()[0].text).toBe(updatedText);
    expect(dispatchEphemeralsChanged).toHaveBeenCalledWith(store, [expect.objectContaining({ text: updatedText })]);
  });
});

describe('EphemeralHandler', () => {
  let store: EphemeralsStore;
  let handler: EphemeralHandler;

  beforeEach(() => {
    store = new EphemeralsStore();
    handler = new EphemeralHandler('Handler Title', 'Handler Text', store);
  });

  it('should update text of the ephemeral', () => {
    const newText = 'New Text';
    handler.updateText(newText);

    expect(store.find()[0].text).toBe(newText);
  });

  it('should update state of the ephemeral', () => {
    const newState = { key: 'value' };
    handler.updateState(newState);

    expect(store.find()[0].state).toEqual(newState);
  });

  it('should delete the ephemeral', () => {
    handler.delete();

    expect(store.find()).toHaveLength(0);
  });
});