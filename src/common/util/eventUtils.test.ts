import { describe, it, expect, beforeEach, vi } from 'vitest';
import { customEventHelpers } from './eventUtils';

describe('customEventHelpers', () => {
  let target: EventTarget;
  let dispatchEvent: (target: EventTarget, detail: any) => void;
  let installListener: (state: any, target: EventTarget, listener: (detail: any) => void) => () => void;

  beforeEach(() => {
    target = new EventTarget();
    [dispatchEvent, installListener] = customEventHelpers<any>('test');
  });

  it('should dispatch a custom event with the correct detail', () => {
    const detail = { key: 'value' };
    const listener = vi.fn();

    target.addEventListener('testEvent', (event: Event) => {
      listener((event as CustomEvent).detail);
    });

    dispatchEvent(target, detail);

    expect(listener).toHaveBeenCalledWith(detail);
  });

  it('should install a listener and call it with the initial state', () => {
    const initialState = { key: 'initial' };
    const listener = vi.fn();

    const removeListener = installListener(initialState, target, listener);

    expect(listener).toHaveBeenCalledWith(initialState);

    removeListener();
  });

  it('should remove the listener when the returned function is called', () => {
    const detail = { key: 'value' };
    const listener = vi.fn();

    const removeListener = installListener({}, target, listener);

    // Listener should be called initially with the current state
    expect(listener).toHaveBeenCalledTimes(1);

    dispatchEvent(target, detail);
    expect(listener).toHaveBeenCalledTimes(2);

    removeListener();

    dispatchEvent(target, detail);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should call the listener with the correct detail when event is dispatched', () => {
    const detail1 = { key: 'value1' };
    const detail2 = { key: 'value2' };
    const listener = vi.fn();

    installListener({}, target, listener);

    dispatchEvent(target, detail1);
    dispatchEvent(target, detail2);

    expect(listener).toHaveBeenCalledWith(detail1);
    expect(listener).toHaveBeenCalledWith(detail2);
  });
});