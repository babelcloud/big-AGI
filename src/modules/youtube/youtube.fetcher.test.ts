import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractFromTo, fetchYouTubeTranscript } from './youtube.fetcher';

describe('extractFromTo', () => {
  it('should extract text between given delimiters', () => {
    const html = '<div>some text <span>target text</span> more text</div>';
    const result = extractFromTo(html, '<span>', '</span>', 'Test Label');
    expect(result).toBe('<span>target text');
  });

  it('should throw an error if start delimiter is not found', () => {
    const html = '<div>some text <span>target text</span> more text</div>';
    expect(() => extractFromTo(html, '<p>', '</span>', 'Test Label')).toThrow(
      "[YouTube API Issue] Could not find 'Test Label'"
    );
  });

  it('should throw an error if end delimiter is not found', () => {
    const html = '<div>some text <span>target text</span> more text</div>';
    expect(() => extractFromTo(html, '<span>', '</p>', 'Test Label')).toThrow(
      "[YouTube API Issue] Could not find 'Test Label'"
    );
  });

  it('should throw an error if end delimiter is before start delimiter', () => {
    const html = '<div>some text <span>target text</span> more text</div>';
    expect(() => extractFromTo(html, '</span>', '<span>', 'Test Label')).toThrow(
      "[YouTube API Issue] Could not find 'Test Label'"
    );
  });
});

describe('fetchYouTubeTranscript', () => {
  let fetchTextFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchTextFn = vi.fn();
  });

  it('should fetch and process YouTube transcript data successfully', async () => {
    const videoId = 'testVideoId';
    const htmlMock = `
      <html>
        <head><title>Test Video - YouTube</title></head>
        <body>
          <a href="https://www.youtube.com/api/timedtext?lang=en">Captions</a>
          <img src="https://i.ytimg.com/vi/testVideoId/maxresdefault.jpg">
        </body>
      </html>
    `;
    const captionsMock = JSON.stringify({
      wireMagic: 'pb3',
      events: [
        { tStartMs: 0, segs: [{ utf8: 'Hello ' }, { utf8: 'world!' }] }
      ]
    });

    fetchTextFn.mockResolvedValueOnce(htmlMock).mockResolvedValueOnce(captionsMock);

    const result = await fetchYouTubeTranscript(videoId, fetchTextFn);

    expect(fetchTextFn).toHaveBeenCalledWith(`https://www.youtube.com/watch?v=${videoId}`);
    expect(result).toEqual({
      videoId,
      videoTitle: 'Test Video',
      thumbnailUrl: 'https://i.ytimg.com/vi/testVideoId/hqdefault.jpg',
      transcript: 'Hello world!',
    });
  });

  it('should throw an error if captions URL cannot be extracted', async () => {
    const videoId = 'testVideoId';
    const htmlMock = '<html><head><title>Test Video - YouTube</title></head></html>';

    fetchTextFn.mockResolvedValueOnce(htmlMock);

    await expect(fetchYouTubeTranscript(videoId, fetchTextFn)).rejects.toThrow(
      "[YouTube API Issue] Could not find 'Captions URL'"
    );
  });

  it('should throw an error if captions cannot be parsed', async () => {
    const videoId = 'testVideoId';
    const htmlMock = `
      <html>
        <head><title>Test Video - YouTube</title></head>
        <body>
          <a href="https://www.youtube.com/api/timedtext?lang=en">Captions</a>
          <img src="https://i.ytimg.com/vi/testVideoId/maxresdefault.jpg">
        </body>
      </html>
    `;
    const invalidCaptionsMock = 'invalid json';

    fetchTextFn.mockResolvedValueOnce(htmlMock).mockResolvedValueOnce(invalidCaptionsMock);

    await expect(fetchYouTubeTranscript(videoId, fetchTextFn)).rejects.toThrow(
      '[YouTube API Issue] Could not parse the captions'
    );
  });

  it('should throw an error if captions cannot be verified', async () => {
    const videoId = 'testVideoId';
    const htmlMock = `
      <html>
        <head><title>Test Video - YouTube</title></head>
        <body>
          <a href="https://www.youtube.com/api/timedtext?lang=en">Captions</a>
          <img src="https://i.ytimg.com/vi/testVideoId/maxresdefault.jpg">
        </body>
      </html>
    `;
    const invalidCaptionsMock = JSON.stringify({ wireMagic: 'invalid' });

    fetchTextFn.mockResolvedValueOnce(htmlMock).mockResolvedValueOnce(invalidCaptionsMock);

    await expect(fetchYouTubeTranscript(videoId, fetchTextFn)).rejects.toThrow(
      '[YouTube API Issue] Could not verify the captions'
    );
  });
});