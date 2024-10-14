/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFetcherFromTRPC } from './trpc.router.fetchers';
import { TRPCError } from '@trpc/server';

vi.mock('~/server/wire', () => ({
  debugGenerateCurlCommand: vi.fn(),
  safeErrorString: vi.fn((error) => error.toString()),
  SERVER_DEBUG_WIRE: false,
}));

describe('createFetcherFromTRPC', () => {
  const url = 'https://example.com/api';
  const headers = { 'Content-Type': 'application/json' };
  const moduleName = 'testModule';

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  const mockResponse = (overrides: Partial<Response>): Response => ({
    ok: true,
    json: vi.fn(),
    text: vi.fn(),
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    ...overrides,
  });

  it('should return parsed JSON for a successful response', async () => {
    const responseData = { data: 'test' };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({
        json: vi.fn().mockResolvedValueOnce(responseData),
      })
    );

    const fetcher = createFetcherFromTRPC(async (res) => await res.json(), 'json');
    const result = await fetcher(url, 'GET', headers, undefined, moduleName);

    expect(result).toEqual(responseData);
    expect(global.fetch).toHaveBeenCalledWith(url, { method: 'GET', headers });
  });

  it('should throw TRPCError on network error', async () => {
    const networkError = new Error('Network Error');
    vi.mocked(global.fetch).mockRejectedValueOnce(networkError);

    const fetcher = createFetcherFromTRPC(async (res) => await res.json(), 'json');

    await expect(fetcher(url, 'GET', headers, undefined, moduleName))
      .rejects.toThrow(TRPCError);
  });

  it('should throw TRPCError on non-200 response', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockRejectedValueOnce(new Error('JSON parse error')),
        text: vi.fn().mockResolvedValueOnce('Not Found'),
      })
    );

    const fetcher = createFetcherFromTRPC(async (res) => await res.json(), 'json');

    await expect(fetcher(url, 'GET', headers, undefined, moduleName))
      .rejects.toThrow(TRPCError);
  });

  it('should throw TRPCError on parsing error', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({
        json: vi.fn().mockRejectedValueOnce(new Error('JSON parse error')),
      })
    );

    const fetcher = createFetcherFromTRPC(async (res) => await res.json(), 'json');

    await expect(fetcher(url, 'GET', headers, undefined, moduleName))
      .rejects.toThrow(TRPCError);
  });
});