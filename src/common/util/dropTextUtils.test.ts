import { describe, expect, it } from 'vitest';
import { extractFilePathsWithCommonRadix, findCommonPrefix } from './dropTextUtils';

describe('extractFilePathsWithCommonRadix', () => {
  it('should return an empty array for input with less than 2 file paths', () => {
    const input = 'file:/path/to/file1.txt';
    expect(extractFilePathsWithCommonRadix(input)).toEqual([]);
  });

  it('should return an empty array when there is no common radix ending with /', () => {
    const input = 'file:/path/to/file1.txt\nfile:/path/to/file2.txt';
    expect(extractFilePathsWithCommonRadix(input)).toEqual([]);
  });

  it('should return file paths when there is no common radix ending with / (different paths)', () => {
    const input = 'file:/path/to/file1.txt\nfile:/different/path/file2.txt';
    expect(extractFilePathsWithCommonRadix(input)).toEqual(['path/to/file1.txt', 'different/path/file2.txt']);
  });

  it('should correctly extract file paths with common radix', () => {
    const input = 'file:/common/path/\nfile:/common/path/file1.txt\nfile:/common/path/file2.txt\nfile:/common/path/subdir/file3.txt';
    const expected = ['', 'file1.txt', 'file2.txt', 'subdir/file3.txt'];
    expect(extractFilePathsWithCommonRadix(input)).toEqual(expected);
  });

  it('should handle mixed input with non-file paths', () => {
    const input = 'file:/common/path/\nfile:/common/path/file1.txt\nsome text\nfile:/common/path/file2.txt';
    const expected = ['', 'file1.txt', 'file2.txt'];
    expect(extractFilePathsWithCommonRadix(input)).toEqual(expected);
  });

  it('should handle input with different line endings', () => {
    const input = 'file:/common/path/\r\nfile:/common/path/file1.txt\r\nfile:/common/path/file2.txt';
    const expected = ['', 'file1.txt', 'file2.txt'];
    expect(extractFilePathsWithCommonRadix(input)).toEqual(expected);
  });
});

describe('findCommonPrefix', () => {
  it('should return an empty string for an empty array', () => {
    expect(findCommonPrefix([])).toBe('');
  });

  it('should return the common prefix for an array of strings', () => {
    const input = ['/common/path/file1.txt', '/common/path/file2.txt', '/common/path/subdir/file3.txt'];
    expect(findCommonPrefix(input)).toBe('/common/path/');
  });

  it('should return the common prefix when there is no common path after root', () => {
    const input = ['/path1/file1.txt', '/path2/file2.txt', '/path3/file3.txt'];
    expect(findCommonPrefix(input)).toBe('/path');
  });

  it('should handle case when one string is a prefix of another', () => {
    const input = ['/common/path', '/common/path/file.txt'];
    expect(findCommonPrefix(input)).toBe('/common/path');
  });

  it('should return the entire string when there is only one input', () => {
    const input = ['/path/to/file.txt'];
    expect(findCommonPrefix(input)).toBe('/path/to/file.txt');
  });
});