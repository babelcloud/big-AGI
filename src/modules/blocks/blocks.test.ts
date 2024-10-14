import { describe, it, expect, beforeEach, vi } from 'vitest';
import { areBlocksEqual, parseMessageBlocks, type Block } from './blocks';
import { heuristicIsHtml } from './RenderHtml';
import { heuristicLegacyImageBlocks, heuristicMarkdownImageReferenceBlocks } from './RenderImage';
import type { Diff as TextDiff } from '@sanity/diff-match-patch';

vi.mock('./RenderHtml', () => ({
  heuristicIsHtml: vi.fn()
}));

vi.mock('./RenderImage', () => ({
  heuristicLegacyImageBlocks: vi.fn(),
  heuristicMarkdownImageReferenceBlocks: vi.fn(),
}));

describe('areBlocksEqual', () => {
  it('should return true for equal code blocks', () => {
    const blockA: Block = { type: 'code', blockTitle: 'Title', blockCode: 'Code', complete: true };
    const blockB: Block = { type: 'code', blockTitle: 'Title', blockCode: 'Code', complete: true };
    expect(areBlocksEqual(blockA, blockB)).toBe(true);
  });

  it('should return false for different code blocks', () => {
    const blockA: Block = { type: 'code', blockTitle: 'Title', blockCode: 'Code', complete: true };
    const blockB: Block = { type: 'code', blockTitle: 'Title', blockCode: 'Different Code', complete: true };
    expect(areBlocksEqual(blockA, blockB)).toBe(false);
  });

  it('should return false for diff blocks', () => {
    const blockA: Block = { type: 'diff', textDiffs: [] };
    const blockB: Block = { type: 'diff', textDiffs: [] };
    expect(areBlocksEqual(blockA, blockB)).toBe(false);
  });

  it('should return true for equal html blocks', () => {
    const blockA: Block = { type: 'html', html: '<p>Hello</p>' };
    const blockB: Block = { type: 'html', html: '<p>Hello</p>' };
    expect(areBlocksEqual(blockA, blockB)).toBe(true);
  });

  it('should return false for different html blocks', () => {
    const blockA: Block = { type: 'html', html: '<p>Hello</p>' };
    const blockB: Block = { type: 'html', html: '<p>World</p>' };
    expect(areBlocksEqual(blockA, blockB)).toBe(false);
  });

  it('should return true for equal image blocks', () => {
    const blockA: Block = { type: 'image', url: 'http://example.com/image.png', alt: 'Image' };
    const blockB: Block = { type: 'image', url: 'http://example.com/image.png', alt: 'Image' };
    expect(areBlocksEqual(blockA, blockB)).toBe(true);
  });

  it('should return false for different image blocks', () => {
    const blockA: Block = { type: 'image', url: 'http://example.com/image.png', alt: 'Image' };
    const blockB: Block = { type: 'image', url: 'http://example.com/image2.png', alt: 'Image' };
    expect(areBlocksEqual(blockA, blockB)).toBe(false);
  });

  it('should return true for equal text blocks', () => {
    const blockA: Block = { type: 'text', content: 'Hello' };
    const blockB: Block = { type: 'text', content: 'Hello' };
    expect(areBlocksEqual(blockA, blockB)).toBe(true);
  });

  it('should return false for different text blocks', () => {
    const blockA: Block = { type: 'text', content: 'Hello' };
    const blockB: Block = { type: 'text', content: 'World' };
    expect(areBlocksEqual(blockA, blockB)).toBe(false);
  });
});

describe('parseMessageBlocks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return a text block if parsing is disabled', () => {
    const text = 'Some text';
    const blocks = parseMessageBlocks(text, true);
    expect(blocks).toEqual([{ type: 'text', content: text }]);
  });

  it('should return a diff block if forceTextDiffs is provided', () => {
    const textDiffs: TextDiff[] = [{ start1: 0, start2: 0, length1: 1, length2: 1, diffs: [] } as any];
    const blocks = parseMessageBlocks('', false, textDiffs);
    expect(blocks).toEqual([{ type: 'diff', textDiffs }]);
  });

  it('should return an html block if text is HTML', () => {
    const text = '<html></html>';
    vi.mocked(heuristicIsHtml).mockReturnValue(true);
    const blocks = parseMessageBlocks(text, false);
    expect(blocks).toEqual([{ type: 'html', html: text }]);
  });

  it('should return image blocks for markdown image references', () => {
    const text = '![alt](http://example.com/image.png)';
    const imageBlocks: Block[] = [{ type: 'image', url: 'http://example.com/image.png', alt: 'alt' }];
    vi.mocked(heuristicMarkdownImageReferenceBlocks).mockReturnValue(imageBlocks as any);
    const blocks = parseMessageBlocks(text, false);
    expect(blocks).toEqual(imageBlocks);
  });

  it('should return legacy image blocks if detected', () => {
    const text = 'legacy image';
    const legacyImageBlocks: Block[] = [{ type: 'image', url: 'http://example.com/image.png' }];
    vi.mocked(heuristicLegacyImageBlocks).mockReturnValue(legacyImageBlocks as any);
    const blocks = parseMessageBlocks(text, false);
    expect(blocks).toEqual(legacyImageBlocks);
  });

  it('should parse code blocks correctly', () => {
    const text = '```\nconsole.log("Hello");\n```';
    const blocks = parseMessageBlocks(text, false);
    expect(blocks).toEqual([{ type: 'code', blockTitle: '', blockCode: 'console.log("Hello");', complete: true }]);
  });

  it('should parse mixed content correctly', () => {
    const text = 'Hello\n```\ncode\n```\nWorld';
    const blocks = parseMessageBlocks(text, false);
    expect(blocks).toEqual([
      { type: 'text', content: 'Hello\n' },
      { type: 'code', blockTitle: '', blockCode: 'code', complete: true },
      { type: 'text', content: 'World' }
    ]);
  });
});