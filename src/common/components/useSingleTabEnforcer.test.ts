import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AloneDetector } from './useSingleTabEnforcer';

vi.stubGlobal('window', {
  setTimeout: vi.fn((fn, delay) => setTimeout(fn, delay)),
  clearTimeout: vi.fn(clearTimeout),
});

class MockBroadcastChannel {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();
}

vi.mock('broadcast-channel', () => ({
  BroadcastChannel: MockBroadcastChannel,
}));

describe('AloneDetector', () => {
  let mockChannel: any;
  let aloneDetector: AloneDetector;
  let onAloneCallback: (isAlone: boolean) => void;

  beforeEach(() => {
    mockChannel = new MockBroadcastChannel();
    onAloneCallback = vi.fn();
    aloneDetector = new AloneDetector('test-channel', onAloneCallback);

    // Inject mockChannel using Object.defineProperty to bypass read-only
    Object.defineProperty(aloneDetector, 'bChannel', {
      value: mockChannel,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should send CHECK message on checkIfAlone', () => {
    aloneDetector.checkIfAlone();
    expect(mockChannel.postMessage).toHaveBeenCalledWith({
      type: 'CHECK',
      sender: expect.any(String),
    });
  });

  it('should call onAlone true if no response', () => {
    vi.useFakeTimers();

    aloneDetector.checkIfAlone();
    vi.advanceTimersByTime(500);

    expect(onAloneCallback).toHaveBeenCalledWith(true);

    vi.useRealTimers();
  });

  it('should respond with ALIVE on receiving CHECK message', () => {
    const checkEvent = new MessageEvent('message', {
      data: { type: 'CHECK', sender: 'other-client' },
    });

    aloneDetector['handleIncomingMessage'](checkEvent);

    expect(mockChannel.postMessage).toHaveBeenCalledWith({
      type: 'ALIVE',
      sender: expect.any(String),
    });
  });

  it('should call onAlone false on receiving ALIVE message', () => {
    vi.useFakeTimers();

    aloneDetector.checkIfAlone();

    const aliveEvent = new MessageEvent('message', {
      data: { type: 'ALIVE', sender: 'other-client' },
    });

    aloneDetector['handleIncomingMessage'](aliveEvent);

    expect(onAloneCallback).toHaveBeenCalledWith(false);

    vi.useRealTimers();
  });

  it('should clear timeout and close channel on unmount', () => {
    aloneDetector.checkIfAlone();

    aloneDetector.onUnmount();

    expect(mockChannel.close).toHaveBeenCalled();
    expect(aloneDetector['aloneCallback']).toBeNull();
  });
});