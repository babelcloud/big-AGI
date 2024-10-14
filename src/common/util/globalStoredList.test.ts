import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStoredTaggetList } from './globalStoredList';

type TestItem = {
  id: string;
  listTags: string[];
  data?: string;
};

describe('createStoredTaggetList', () => {
  let useTestList: ReturnType<typeof createStoredTaggetList<TestItem>>;

  beforeEach(() => {
    // Mock localStorage without using window
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();

    global.localStorage = localStorageMock as any;

    useTestList = createStoredTaggetList<TestItem>('test-storage');
  });

  it('should add an item', () => {
    const { addItem, items } = useTestList.getState();
    const newItem = { id: '1', listTags: ['tag1'], data: 'test' };

    addItem(newItem);
    expect(useTestList.getState().items).toContainEqual(newItem);
  });

  it('should remove an item', () => {
    const { addItem, removeItem, items } = useTestList.getState();
    const newItem = { id: '1', listTags: ['tag1'], data: 'test' };

    addItem(newItem);
    removeItem('1');
    expect(useTestList.getState().items).not.toContainEqual(newItem);
  });

  it('should modify an item', () => {
    const { addItem, modifyItem, items } = useTestList.getState();
    const newItem = { id: '1', listTags: ['tag1'], data: 'test' };

    addItem(newItem);
    modifyItem('1', { data: 'updated' });
    expect(useTestList.getState().items).toContainEqual({ ...newItem, data: 'updated' });
  });

  it('should modify an item deeply', () => {
    const { addItem, modifyItemDeep, items } = useTestList.getState();
    const newItem = { id: '1', listTags: ['tag1'], data: 'test' };

    addItem(newItem);
    modifyItemDeep('1', (item) => ({ ...item, data: 'deep updated' }));
    expect(useTestList.getState().items).toContainEqual({ ...newItem, data: 'deep updated' });
  });

  it('should select an item for a tag', () => {
    const { addItem, selectItemForTag, selections } = useTestList.getState();
    const newItem = { id: '1', listTags: ['tag1'], data: 'test' };

    addItem(newItem);
    selectItemForTag('tag1', '1');
    expect(useTestList.getState().selections).toEqual({ tag1: '1' });
  });

  it('should not select an item for an unsupported tag', () => {
    const { addItem, selectItemForTag, selections } = useTestList.getState();
    const newItem = { id: '1', listTags: ['tag1'], data: 'test' };

    addItem(newItem);
    selectItemForTag('tag2', '1');
    expect(useTestList.getState().selections).toEqual({});
  });
});