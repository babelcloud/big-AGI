import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pdfToText, pdfToImageDataURLs } from './pdfUtils';

vi.mock('pdfjs-dist', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdfjs-dist')>();
  return {
    ...actual,
    getDocument: vi.fn(),
    GlobalWorkerOptions: { workerSrc: '' }
  };
});

describe('pdfUtils', () => {
  let mockGetDocument: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const pdfjs = await import('pdfjs-dist');
    mockGetDocument = vi.mocked(pdfjs).getDocument;
  });

  describe('pdfToText', () => {
    it('should extract text from a PDF', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'Hello' }, { str: 'World' }]
        })
      };
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };

      mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) } as any);

      const result = await pdfToText(new ArrayBuffer(0));
      expect(result).toBe('Hello World');
    });

    it('should handle PDFs with multiple pages', async () => {
      const mockPage1 = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'Page' }, { str: '1' }]
        })
      };
      const mockPage2 = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'Page' }, { str: '2' }]
        })
      };
      const mockPdf = {
        numPages: 2,
        getPage: vi.fn()
          .mockResolvedValueOnce(mockPage1)
          .mockResolvedValueOnce(mockPage2)
      };

      mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) } as any);

      const result = await pdfToText(new ArrayBuffer(0));
      expect(result).toBe('Page 1\n\nPage 2');
    });
  });

  describe('pdfToImageDataURLs', () => {
    beforeEach(() => {
      global.document = {
        createElement: vi.fn(() => ({
          getContext: vi.fn(() => ({
            drawImage: vi.fn(),
          })),
          toDataURL: vi.fn(() => 'data:image/jpeg;base64,'),
          height: 0,
          width: 0,
        }))
      } as any;
    });

    it('should render PDF pages to images', async () => {
      const mockPage = {
        getViewport: vi.fn().mockReturnValue({ width: 100, height: 200 }),
        render: vi.fn().mockResolvedValue({ promise: Promise.resolve() })
      };
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };

      mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) } as any);

      const images = await pdfToImageDataURLs(new ArrayBuffer(0));
      expect(images).toHaveLength(1);
      expect(images[0]).toMatchObject({
        scale: 1.5,
        width: 100,
        height: 200,
        base64Url: expect.stringContaining('data:image/jpeg;base64,')
      });
    });

    it('should handle PDFs with multiple pages', async () => {
      const mockPage = {
        getViewport: vi.fn().mockReturnValue({ width: 100, height: 200 }),
        render: vi.fn().mockResolvedValue({ promise: Promise.resolve() })
      };
      const mockPdf = {
        numPages: 2,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };

      mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) } as any);

      const images = await pdfToImageDataURLs(new ArrayBuffer(0));
      expect(images).toHaveLength(2);
      images.forEach(image => {
        expect(image).toMatchObject({
          scale: 1.5,
          width: 100,
          height: 200,
          base64Url: expect.stringContaining('data:image/jpeg;base64,')
        });
      });
    });
  });
});