import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getBaseUrl, getOriginUrl, asValidURL, fixupHost } from './urlUtils';
import * as pwaUtils from './pwaUtils';

vi.mock('./pwaUtils', () => ({
  isBrowser: false,
  isVercelFromBackendOrSSR: false,
}));

describe('getBaseUrl', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(pwaUtils).isBrowser = false;
    vi.mocked(pwaUtils).isVercelFromBackendOrSSR = false;
  });

  it('should return empty string in browser environment', () => {
    vi.mocked(pwaUtils).isBrowser = true;
    expect(getBaseUrl()).toBe('');
  });

  it('should return Vercel URL in SSR environment', () => {
    vi.mocked(pwaUtils).isVercelFromBackendOrSSR = true;
    process.env.VERCEL_URL = 'example.vercel.app';
    expect(getBaseUrl()).toBe('https://example.vercel.app');
  });

  it('should return localhost URL in dev SSR environment', () => {
    process.env.PORT = '4000';
    expect(getBaseUrl()).toBe('http://localhost:4000');
  });

  it('should default to port 3000 if PORT is not set', () => {
    delete process.env.PORT;
    expect(getBaseUrl()).toBe('http://localhost:3000');
  });
});

describe('getOriginUrl', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(pwaUtils).isBrowser = false;
    vi.mocked(pwaUtils).isVercelFromBackendOrSSR = false;
  });

  it('should return window origin in browser environment', () => {
    vi.mocked(pwaUtils).isBrowser = true;
    global.window = { location: { origin: 'http://example.com' } } as any;
    expect(getOriginUrl()).toBe('http://example.com');
  });

  it('should return Vercel URL in SSR environment', () => {
    vi.mocked(pwaUtils).isVercelFromBackendOrSSR = true;
    process.env.VERCEL_URL = 'example.vercel.app';
    expect(getOriginUrl()).toBe('https://example.vercel.app');
  });

  it('should return localhost URL in dev SSR environment', () => {
    process.env.PORT = '4000';
    expect(getOriginUrl()).toBe('http://localhost:4000');
  });

  it('should default to port 3000 if PORT is not set', () => {
    delete process.env.PORT;
    expect(getOriginUrl()).toBe('http://localhost:3000');
  });
});

describe('asValidURL', () => {
  it('should return null for null input', () => {
    expect(asValidURL(null)).toBeNull();
  });

  it('should return null for invalid URL', () => {
    expect(asValidURL('not a url')).toBeNull();
  });

  it('should return the URL if valid', () => {
    expect(asValidURL('https://example.com')).toBe('https://example.com');
  });

  it('should trim the input before validation', () => {
    expect(asValidURL('  https://example.com  ')).toBe('https://example.com');
  });
});

describe('fixupHost', () => {
  it('should add https if missing', () => {
    expect(fixupHost('example.com', '/api')).toBe('https://example.com');
  });

  it('should remove trailing slash if apiPath starts with slash', () => {
    expect(fixupHost('https://example.com/', '/api')).toBe('https://example.com');
  });

  it('should not remove trailing slash if apiPath does not start with slash', () => {
    expect(fixupHost('https://example.com/', 'api')).toBe('https://example.com/');
  });
});