import { describe, it, expect } from 'vitest';
import { getModelFromFile, prettyBaseModel } from './modelUtils';

describe('getModelFromFile', () => {
  it('should return the file name from a given path', () => {
    expect(getModelFromFile('C:\\models\\test-model.bin')).toBe('test-model.bin');
    expect(getModelFromFile('/usr/local/models/test-model.bin')).toBe('test-model.bin');
    expect(getModelFromFile('test-model.bin')).toBe('test-model.bin');
  });

  it('should handle paths with mixed slashes', () => {
    expect(getModelFromFile('C:/models\\test-model.bin')).toBe('test-model.bin');
  });

  it('should return an empty string for an empty path', () => {
    expect(getModelFromFile('')).toBe('');
  });
});

describe('prettyBaseModel', () => {
  it('should return a pretty name for known models', () => {
    expect(prettyBaseModel('gpt-4-vision-preview')).toBe('GPT-4 Vision');
    expect(prettyBaseModel('gpt-4-1106-preview')).toBe('GPT-4 Turbo');
    expect(prettyBaseModel('gpt-4-32k')).toBe('GPT-4-32k');
    expect(prettyBaseModel('gpt-4o-mini')).toBe('GPT-4o Mini');
    expect(prettyBaseModel('gpt-4o')).toBe('GPT-4o');
    expect(prettyBaseModel('gpt-4-turbo')).toBe('GPT-4 Turbo');
    expect(prettyBaseModel('gpt-4')).toBe('GPT-4');
    expect(prettyBaseModel('gpt-3.5-turbo-instruct')).toBe('3.5 Turbo Instruct');
    expect(prettyBaseModel('gpt-3.5-turbo-1106')).toBe('3.5 Turbo 16k');
    expect(prettyBaseModel('gpt-3.5-turbo-16k')).toBe('3.5 Turbo 16k');
    expect(prettyBaseModel('gpt-3.5-turbo')).toBe('3.5 Turbo');
    expect(prettyBaseModel('claude-3-opus')).toBe('Claude 3 Opus');
    expect(prettyBaseModel('claude-3-sonnet')).toBe('Claude 3 Sonnet');
  });

  it('should handle model paths and remove extensions', () => {
    expect(prettyBaseModel('C:\\models\\test-model.gguf')).toBe('test-model');
    expect(prettyBaseModel('D:\\models\\another-model.gguf')).toBe('another-model');
  });

  it('should replace colons and remove ":latest" suffix', () => {
    expect(prettyBaseModel('model:version:latest')).toBe('model version');
  });

  it('should return the original model name if no conditions match', () => {
    expect(prettyBaseModel('unknown-model')).toBe('unknown-model');
  });

  it('should return an empty string for undefined or empty model', () => {
    expect(prettyBaseModel(undefined)).toBe('');
    expect(prettyBaseModel('')).toBe('');
  });
});