import { describe, it, expect, beforeEach, vi } from 'vitest';
import { workerPuppeteer, cleanHtml } from './browse.router';
import { TRPCError } from '@trpc/server';
import { connect } from '@cloudflare/puppeteer';

// Mocking Puppeteer connect function
vi.mock('@cloudflare/puppeteer', () => ({
  connect: vi.fn(),
}));

// Mocking the environment variable
vi.mock('~/server/env.mjs', () => ({
  env: {
    PUPPETEER_WSS_ENDPOINT: 'wss://example.com',
  },
}));

// Mocking the missing module
vi.mock('~/server/api/trpc.server', () => ({
  createTRPCRouter: vi.fn(),
  publicProcedure: {
    input: vi.fn().mockReturnThis(),
    output: vi.fn().mockReturnThis(),
    mutation: vi.fn(),
  },
}));

describe('workerPuppeteer', () => {
  const mockPage = {
    setDefaultNavigationTimeout: vi.fn(),
    goto: vi.fn().mockResolvedValue({ headers: () => ({ 'content-type': 'text/html' }) }),
    content: vi.fn().mockResolvedValue('<html><body><p>Sample content</p></body></html>'),
    evaluate: vi.fn().mockResolvedValue('page text content'),
    screenshot: vi.fn().mockResolvedValue('base64image'),
    close: vi.fn(),
    setViewport: vi.fn(),
  };

  const mockBrowser = {
    newPage: vi.fn().mockResolvedValue(mockPage),
    createIncognitoBrowserContext: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn(),
    }),
    close: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.mocked(connect).mockResolvedValue(mockBrowser);
    vi.clearAllMocks();
  });

  it('should throw an error if wssEndpoint is invalid', async () => {
    await expect(
      workerPuppeteer(
        { dialect: 'browse-wss', wssEndpoint: 'invalid' },
        'http://example.com',
        ['html'],
      )
    ).rejects.toThrow(TRPCError);
  });

  it('should return content and screenshot for valid input', async () => {
    const result = await workerPuppeteer(
      { dialect: 'browse-wss', wssEndpoint: 'wss://example.com' },
      'http://example.com',
      ['html', 'text', 'markdown'],
      { width: 1024, height: 768, quality: 80 }
    );

    expect(result.url).toBe('http://example.com');
    expect(result.content.html).toBeDefined();
    expect(result.content.text).toBeDefined();
    expect(result.content.markdown).toBeDefined();
    expect(result.screenshot).toBeDefined();
    expect(result.stopReason).toBe('end');
  });

  it('should handle navigation timeout', async () => {
    mockPage.goto.mockRejectedValueOnce(new Error('Navigation timeout exceeded'));

    const result = await workerPuppeteer(
      { dialect: 'browse-wss', wssEndpoint: 'wss://example.com' },
      'http://example.com',
      ['html']
    );

    expect(result.stopReason).toBe('timeout');
    expect(result.error).toBeUndefined();
  });
});

describe('cleanHtml', () => {
  it('should remove unwanted elements and comments', () => {
    const html = `
      <html>
        <head><style>.test { color: red; }</style></head>
        <body>
          <script>alert('test');</script>
          <div>Content</div>
          <!-- Comment -->
        </body>
      </html>
    `;
    const cleanedHtml = cleanHtml(html);
    expect(cleanedHtml).not.toContain('<script>');
    expect(cleanedHtml).not.toContain('<style>');
    expect(cleanedHtml).not.toContain('<!-- Comment -->');
    expect(cleanedHtml).toContain('<div>Content</div>');
  });

  it('should merge consecutive paragraphs', () => {
    const html = `
      <html>
        <body>
          <p>First paragraph.</p>
          <p>Second paragraph.</p>
        </body>
      </html>
    `;
    const cleanedHtml = cleanHtml(html);
    expect(cleanedHtml).toContain('<p>First paragraph. Second paragraph.</p>');
  });
});