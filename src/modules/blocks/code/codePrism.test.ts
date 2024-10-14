import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inferCodeLanguage, highlightCode } from './codePrism';

vi.mock('prismjs', () => ({
  default: {
    languages: {
      typescript: {},
      javascript: {},
      python: {},
      java: {},
      html: {},
      xml: {},
      csharp: {},
      'plant-uml': {},
      bash: {},
      css: {},
      json: {},
      markdown: {},
      mermaid: {},
    },
    tokenize: vi.fn(),
    highlight: vi.fn(),
  },
}));

// Mock the imports for Prism components
vi.mock('prismjs/components/prism-bash', () => ({}));
vi.mock('prismjs/components/prism-css', () => ({}));
vi.mock('prismjs/components/prism-java', () => ({}));
vi.mock('prismjs/components/prism-javascript', () => ({}));
vi.mock('prismjs/components/prism-json', () => ({}));
vi.mock('prismjs/components/prism-markdown', () => ({}));
vi.mock('prismjs/components/prism-mermaid', () => ({}));
vi.mock('prismjs/components/prism-plant-uml', () => ({}));
vi.mock('prismjs/components/prism-python', () => ({}));
vi.mock('prismjs/components/prism-typescript', () => ({}));

import Prism from 'prismjs';

describe('inferCodeLanguage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should infer language from block title', () => {
    expect(inferCodeLanguage('js', '')).toBe('javascript');
    expect(inferCodeLanguage('py', '')).toBe('python');
    expect(inferCodeLanguage('ts', '')).toBe('typescript');
  });

  it('should infer language from file extension in block title', () => {
    expect(inferCodeLanguage('example.js', '')).toBe('javascript');
    expect(inferCodeLanguage('script.py', '')).toBe('python');
    expect(inferCodeLanguage('code.ts', '')).toBe('typescript');
  });

  it('should infer language from code content', () => {
    expect(inferCodeLanguage('', '<!DOCTYPE html>')).toBe('html');
    expect(inferCodeLanguage('', '<html>')).toBe('html');
    expect(inferCodeLanguage('', '<root>')).toBe('xml');
    expect(inferCodeLanguage('', 'from module import function')).toBe('python');
    expect(inferCodeLanguage('', 'import { useState } from "react"')).toBe('typescript');
    expect(inferCodeLanguage('', 'package com.example')).toBe('java');
    expect(inferCodeLanguage('', 'using System;')).toBe('csharp');
    expect(inferCodeLanguage('', '@startuml')).toBe('plant-uml');
  });

  it('should return null if language cannot be inferred', () => {
    vi.mocked(Prism.tokenize).mockReturnValue([]);
    expect(inferCodeLanguage('', 'console.log("Hello, World!")')).toBeNull();
  });

  it('should use Prism tokenization as a fallback', () => {
    vi.mocked(Prism.tokenize).mockImplementation((code, grammar) => {
      if (grammar === Prism.languages.javascript) {
        return [{ type: 'keyword', content: 'const' }, ' x = 5;'] as any;
      }
      return [];
    });

    expect(inferCodeLanguage('', 'const x = 5;')).toBe('javascript');
  });
});

describe('highlightCode', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call Prism.highlight with correct parameters', () => {
    const mockHighlight = vi.fn().mockReturnValue('<span class="highlighted">code</span>');
    vi.mocked(Prism.highlight).mockImplementation(mockHighlight);

    const result = highlightCode('javascript', 'const x = 5;');

    expect(mockHighlight).toHaveBeenCalledWith(
      'const x = 5;',
      Prism.languages.javascript,
      'javascript'
    );
    expect(result).toBe('<span class="highlighted">code</span>');
  });

  it('should use typescript as fallback if language is null', () => {
    const mockHighlight = vi.fn().mockReturnValue('<span class="highlighted">code</span>');
    vi.mocked(Prism.highlight).mockImplementation(mockHighlight);

    highlightCode(null, 'const x: number = 5;');

    expect(mockHighlight).toHaveBeenCalledWith(
      'const x: number = 5;',
      Prism.languages.typescript,
      'typescript'
    );
  });
});