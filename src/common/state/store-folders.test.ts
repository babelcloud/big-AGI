import { describe, it, expect } from 'vitest';
import { getRotatingFolderColor, FOLDERS_COLOR_PALETTE } from './store-folders';

describe('getRotatingFolderColor', () => {
  it('should return a color from the FOLDERS_COLOR_PALETTE', () => {
    const color = getRotatingFolderColor();
    expect(FOLDERS_COLOR_PALETTE).toContain(color);
  });
});