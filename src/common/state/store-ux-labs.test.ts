import { describe, it, expect, beforeEach } from 'vitest';
import { useUXLabsStore, getUXLabsHighPerformance } from './store-ux-labs';

describe('getUXLabsHighPerformance', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useUXLabsStore.setState({
      labsAttachScreenCapture: false,
      labsCameraDesktop: false,
      labsChatBarAlt: false,
      labsHighPerformance: false,
      labsShowCost: true,
    });
  });

  it('should return the default value of labsHighPerformance', () => {
    const highPerformance = getUXLabsHighPerformance();
    expect(highPerformance).toBe(false);
  });

  it('should return the updated value of labsHighPerformance', () => {
    useUXLabsStore.setState({ labsHighPerformance: true });
    const highPerformance = getUXLabsHighPerformance();
    expect(highPerformance).toBe(true);
  });
});