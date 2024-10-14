import { describe, it, expect, beforeEach, vi } from 'vitest';
import { downloadVideoFrameAsPNG, renderVideoFrameAsPNGFile, _prettyFileName, _renderVideoFrameToCanvas, _canvasToBlob } from './videoUtils';
import { prettyTimestampForFilenames } from './timeUtils';

// Mocking timeUtils
vi.mock('./timeUtils', () => ({
  prettyTimestampForFilenames: vi.fn(() => 'mocked-timestamp'),
}));

// Ensure the test environment supports DOM
vi.stubGlobal('document', {
  createElement: vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toDataURL: vi.fn(() => 'data:image/png;base64,'),
        toBlob: vi.fn((callback: any) => callback(new Blob())),
      };
    }
    if (tagName === 'a') {
      return {
        download: '',
        href: '',
        click: vi.fn(),
      };
    }
    return {};
  }),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
});

// Mocking HTMLCanvasElement and HTMLVideoElement
globalThis.HTMLCanvasElement = vi.fn().mockImplementation(() => ({
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
  })),
  toDataURL: vi.fn(() => 'data:image/png;base64,'),
  toBlob: vi.fn((callback: any) => callback(new Blob())),
})) as any;

globalThis.HTMLVideoElement = vi.fn();

describe('videoUtils', () => {
  let videoElement: HTMLVideoElement;

  beforeEach(() => {
    videoElement = document.createElement('video') as HTMLVideoElement;
    videoElement.width = 640;
    videoElement.height = 480;
    vi.clearAllMocks();
  });

  describe('downloadVideoFrameAsPNG', () => {
    it('should download the current video frame as a PNG', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      downloadVideoFrameAsPNG(videoElement, 'testPrefix');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });

  describe('renderVideoFrameAsPNGFile', () => {
    it('should render the current video frame as a PNG file', async () => {
      const file = await renderVideoFrameAsPNGFile(videoElement, 'testPrefix');
      expect(file).toBeInstanceOf(File);
      expect(file.name).toContain('testPrefix_mocked-timestamp_640x480.png');
    });
  });

  describe('_prettyFileName', () => {
    it('should generate a pretty filename', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const fileName = _prettyFileName('testPrefix', canvas);
      expect(fileName).toBe('testPrefix_mocked-timestamp_640x480.png');
    });
  });

  describe('_renderVideoFrameToCanvas', () => {
    it('should render a video frame to a canvas', () => {
      const canvas = _renderVideoFrameToCanvas(videoElement);
      expect(canvas.width).toBe(640);
      expect(canvas.height).toBe(480);
    });
  });

  describe('_canvasToBlob', () => {
    it('should convert a canvas to a Blob', async () => {
      const canvas = document.createElement('canvas');
      const blob = await _canvasToBlob(canvas, 'image/png');
      expect(blob).toBeInstanceOf(Blob);
    });
  });
});