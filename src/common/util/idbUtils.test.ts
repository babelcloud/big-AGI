import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WriteScheduler, idbStateStorage } from './idbUtils';
import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';

vi.mock('idb-keyval', () => ({
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
}));

describe('WriteScheduler', () => {
  let scheduler: WriteScheduler;

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new WriteScheduler(1000, 400);
    vi.clearAllMocks();
  });

  it('should schedule a write operation', () => {
    scheduler.scheduleWrite('testKey', 'testValue');
    const operation = scheduler['writeOperations']['testKey'];
    expect(operation).toBeDefined();
    expect(operation.pendingValue).toBe('testValue');
  });

  it('should perform a write immediately if deadline is exceeded', async () => {
    scheduler = new WriteScheduler(100, 50);
    const now = Date.now();
    vi.setSystemTime(now - 100);
    scheduler.scheduleWrite('testKey', 'testValue');

    await vi.runAllTimersAsync();

    expect(idbSet).toHaveBeenCalledWith('testKey', 'testValue');
  });

  it('should retrieve a pending write', async () => {
    scheduler.scheduleWrite('testKey', 'testValue');
    const pendingValue = await scheduler.retrievePendingWrite('testKey');
    expect(pendingValue).toBe('testValue');
  });

  it('should return null if no pending write exists', async () => {
    const pendingValue = await scheduler.retrievePendingWrite('nonExistentKey');
    expect(pendingValue).toBeNull();
  });
});

describe('idbStateStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get an item from IndexedDB', async () => {
    vi.mocked(idbGet).mockResolvedValue('storedValue');

    const value = await idbStateStorage.getItem('testKey');
    expect(idbGet).toHaveBeenCalledWith('testKey');
    expect(value).toBe('storedValue');
  });

  it('should set an item in IndexedDB', () => {
    idbStateStorage.setItem('testKey', 'testValue');

    const scheduler = new WriteScheduler();
    scheduler.scheduleWrite('testKey', 'testValue');
    const operation = scheduler['writeOperations']['testKey'];
    expect(operation).toBeDefined();
    expect(operation.pendingValue).toBe('testValue');
  });

  it('should remove an item from IndexedDB', async () => {
    await idbStateStorage.removeItem('testKey');
    expect(idbDel).toHaveBeenCalledWith('testKey');
  });
});