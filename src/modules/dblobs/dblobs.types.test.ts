import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createDBlobBase, createDBlobImageItem, DBlobMetaDataType } from './dblobs.types';
import { v4 as uuidv4 } from 'uuid';

vi.mock('uuid', async (importOriginal) => {
  const actual = await importOriginal<typeof import('uuid')>();
  return {
    ...actual,
    v4: vi.fn(() => 'mocked-uuid'),
  };
});

enum DBlobMimeType {
  IMG_PNG = 'image/png',
  IMG_JPEG = 'image/jpeg',
  AUDIO_MPEG = 'audio/mpeg',
  AUDIO_WAV = 'audio/wav',
}

describe('createDBlobBase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a DBlobBase object with correct properties', () => {
    const type = DBlobMetaDataType.IMAGE;
    const label = 'Test Image';
    const data = { mimeType: DBlobMimeType.IMG_PNG, base64: 'base64string' };
    const origin = { origin: 'upload', dir: 'out', source: 'attachment', fileName: 'test.png' } as const;
    const metadata = { width: 100, height: 100 };

    const result = createDBlobBase(type, label, data, origin, metadata);

    expect(result.id).toBe('mocked-uuid');
    expect(result.type).toBe(type);
    expect(result.label).toBe(label);
    expect(result.data).toBe(data);
    expect(result.origin).toBe(origin);
    expect(result.metadata).toBe(metadata);
    expect(result.cache).toEqual({});
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });
});

describe('createDBlobImageItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a DBlobImageItem with correct properties', () => {
    const label = 'Image Item';
    const data = { mimeType: DBlobMimeType.IMG_PNG, base64: 'base64string' } as const;
    const origin = { origin: 'upload', dir: 'out', source: 'attachment', fileName: 'test.png' } as const;
    const metadata = { width: 200, height: 200 };

    const result = createDBlobImageItem(label, data, origin, metadata);

    expect(result.id).toBe('mocked-uuid');
    expect(result.type).toBe(DBlobMetaDataType.IMAGE);
    expect(result.label).toBe(label);
    expect(result.data).toBe(data);
    expect(result.origin).toBe(origin);
    expect(result.metadata).toBe(metadata);
    expect(result.cache).toEqual({});
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });
});