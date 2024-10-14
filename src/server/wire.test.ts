import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  nonTrpcServerFetchOrThrow,
  safeErrorString,
  serverCapitalizeFirstLetter,
  debugGenerateCurlCommand,
  createEmptyReadableStream,
  ServerFetchError
} from './wire';

global.fetch = vi.fn();

describe('nonTrpcServerFetchOrThrow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return response if fetch is successful', async () => {
    const mockResponse = new Response(null, { status: 200, statusText: 'OK' });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const response = await nonTrpcServerFetchOrThrow('https://example.com', 'GET', {}, undefined);
    expect(response).toEqual(mockResponse);
  });

  it('should throw ServerFetchError if fetch response is not ok', async () => {
    const mockResponse = new Response('Error', { status: 404, statusText: 'Not Found' });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await expect(nonTrpcServerFetchOrThrow('https://example.com', 'GET', {}, undefined))
      .rejects
      .toThrow(ServerFetchError);
  });
});

describe('safeErrorString', () => {
  it('should return null for null input', () => {
    expect(safeErrorString(null)).toBeNull();
  });

  it('should return the message if error has a message property', () => {
    expect(safeErrorString({ message: 'Error occurred' })).toBe('Error occurred');
  });

  it('should return the string itself if input is a string', () => {
    expect(safeErrorString('Just a string')).toBe('Just a string');
  });

  it('should return stringified object if input is an object', () => {
    expect(safeErrorString({ key: 'value' })).toBe('\n  "key": "value"\n');
  });
});

describe('serverCapitalizeFirstLetter', () => {
  it('should capitalize the first letter of a string', () => {
    expect(serverCapitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('should return an empty string if input is empty', () => {
    expect(serverCapitalizeFirstLetter('')).toBe('');
  });
});

describe('debugGenerateCurlCommand', () => {
  it('should generate a curl command for GET request', () => {
    const command = debugGenerateCurlCommand('GET', 'https://example.com', { 'Content-Type': 'application/json' }, undefined);
    expect(command).toBe("curl -X GET 'https://example.com' -H 'Content-Type: application/json' ");
  });

  it('should generate a curl command for POST request with body', () => {
    const command = debugGenerateCurlCommand('POST', 'https://example.com', {}, { key: 'value' });
    expect(command).toBe("curl -X POST 'https://example.com' -d '{\"key\":\"value\"}'");
  });
});

describe('createEmptyReadableStream', () => {
  it('should create an empty readable stream', async () => {
    const stream = createEmptyReadableStream();
    const reader = stream.getReader();
    const result = await reader.read();
    expect(result.done).toBe(true);
  });
});