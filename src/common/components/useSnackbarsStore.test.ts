import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSnackbarsStore, SNACKBAR_ANIMATION_DURATION } from './useSnackbarsStore';
import { v4 as uuidv4 } from 'uuid';

vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

describe('useSnackbarsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSnackbarsStore.setState({
      activeSnackbar: null,
      activeSnackbarOpen: true,
      snackbarQueue: [],
    });
  });

  it('should add a snackbar when none is active', () => {
    const snackbar = {
      key: 'test',
      message: 'Test Message',
      type: 'success' as const,
    };

    vi.mocked(uuidv4).mockReturnValue('unique-id');

    const key = useSnackbarsStore.getState().addSnackbar(snackbar);

    expect(key).toBe('test-unique-id');
    expect(useSnackbarsStore.getState().activeSnackbar).toEqual({
      key: 'test-unique-id',
      message: 'Test Message',
      type: 'success',
    });
    expect(useSnackbarsStore.getState().activeSnackbarOpen).toBe(true);
    expect(useSnackbarsStore.getState().snackbarQueue).toEqual([]);
  });

  it('should queue a snackbar when one is already active', () => {
    const firstSnackbar = {
      key: 'first',
      message: 'First Message',
      type: 'success' as const,
    };

    const secondSnackbar = {
      key: 'second',
      message: 'Second Message',
      type: 'issue' as const,
    };

    vi.mocked(uuidv4).mockReturnValueOnce('first-id').mockReturnValueOnce('second-id');

    useSnackbarsStore.getState().addSnackbar(firstSnackbar);
    useSnackbarsStore.getState().addSnackbar(secondSnackbar);

    expect(useSnackbarsStore.getState().activeSnackbar?.key).toBe('first-first-id');
    expect(useSnackbarsStore.getState().snackbarQueue).toHaveLength(1);
    expect(useSnackbarsStore.getState().snackbarQueue[0].key).toBe('second-second-id');
  });

  it('should close the active snackbar and show the next one in the queue', () => {
    const firstSnackbar = {
      key: 'first',
      message: 'First Message',
      type: 'success' as const,
    };

    const secondSnackbar = {
      key: 'second',
      message: 'Second Message',
      type: 'issue' as const,
    };

    vi.mocked(uuidv4).mockReturnValueOnce('first-id').mockReturnValueOnce('second-id');

    useSnackbarsStore.getState().addSnackbar(firstSnackbar);
    useSnackbarsStore.getState().addSnackbar(secondSnackbar);

    useSnackbarsStore.getState().closeSnackbar();

    expect(useSnackbarsStore.getState().activeSnackbar?.key).toBe('second-second-id');
    expect(useSnackbarsStore.getState().snackbarQueue).toHaveLength(0);
  });

  it('should handle animate close snackbar', async () => {
    const snackbar = {
      key: 'test',
      message: 'Test Message',
      type: 'success' as const,
    };

    vi.mocked(uuidv4).mockReturnValue('unique-id');

    useSnackbarsStore.getState().addSnackbar(snackbar);

    useSnackbarsStore.getState().animateCloseSnackbar();

    expect(useSnackbarsStore.getState().activeSnackbarOpen).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, SNACKBAR_ANIMATION_DURATION));

    expect(useSnackbarsStore.getState().activeSnackbar).toBeNull();
  });

  it('should remove a snackbar by key', () => {
    const firstSnackbar = {
      key: 'first',
      message: 'First Message',
      type: 'success' as const,
    };

    const secondSnackbar = {
      key: 'second',
      message: 'Second Message',
      type: 'issue' as const,
    };

    vi.mocked(uuidv4).mockReturnValueOnce('first-id').mockReturnValueOnce('second-id');

    useSnackbarsStore.getState().addSnackbar(firstSnackbar);
    useSnackbarsStore.getState().addSnackbar(secondSnackbar);

    useSnackbarsStore.getState().removeSnackbar('first-first-id');

    expect(useSnackbarsStore.getState().activeSnackbar?.key).toBe('second-second-id');
    expect(useSnackbarsStore.getState().snackbarQueue).toHaveLength(0);
  });

  it('should handle removing a non-existent snackbar gracefully', () => {
    const snackbar = {
      key: 'test',
      message: 'Test Message',
      type: 'success' as const,
    };

    vi.mocked(uuidv4).mockReturnValue('unique-id');

    useSnackbarsStore.getState().addSnackbar(snackbar);

    useSnackbarsStore.getState().removeSnackbar('non-existent-key');

    expect(useSnackbarsStore.getState().activeSnackbar?.key).toBe('test-unique-id');
    expect(useSnackbarsStore.getState().snackbarQueue).toHaveLength(0);
  });
});