import { describe, it, expect, beforeEach, vi } from 'vitest';
import { elevenlabsAccess, elevenlabsVoiceId } from './elevenlabs.router';
import { env } from '~/server/env.mjs';

vi.mock('~/server/api/trpc.server', () => ({
  createTRPCRouter: vi.fn(() => ({
    listVoices: {
      input: vi.fn(),
      output: vi.fn(),
      query: vi.fn(),
    },
  })),
  publicProcedure: {
    input: vi.fn().mockReturnThis(),
    output: vi.fn().mockReturnThis(),
    query: vi.fn().mockReturnThis(),
  },
}));

vi.mock('~/server/env.mjs', () => ({
  env: {
    ELEVENLABS_API_KEY: 'mocked-api-key',
    ELEVENLABS_API_HOST: 'https://api.elevenlabs.io',
    ELEVENLABS_VOICE_ID: 'mocked-voice-id',
  },
}));

vi.mock('~/server/api/trpc.router.fetchers', () => ({
  fetchJsonOrTRPCError: vi.fn(),
}));

describe('elevenlabsAccess', () => {
  const originalEnv = { ...env };

  beforeEach(() => {
    (env as any).ELEVENLABS_API_KEY = originalEnv.ELEVENLABS_API_KEY;
    (env as any).ELEVENLABS_API_HOST = originalEnv.ELEVENLABS_API_HOST;
  });

  it('should throw an error if API key is missing', () => {
    (env as any).ELEVENLABS_API_KEY = '';
    expect(() => elevenlabsAccess(undefined, '/v1/voices')).toThrow('Missing ElevenLabs API key.');
  });

  it('should construct the correct URL with provided API key and path', () => {
    const apiKey = 'test-key';
    const apiPath = '/v1/voices';
    const { headers, url } = elevenlabsAccess(apiKey, apiPath);

    expect((headers as any)['xi-api-key']).toBe(apiKey);
    expect(url).toBe('https://api.elevenlabs.io/v1/voices');
  });

  it('should use the default host if none is provided', () => {
    (env as any).ELEVENLABS_API_HOST = '';
    const { url } = elevenlabsAccess('test-key', '/v1/voices');
    expect(url).toBe('https://api.elevenlabs.io/v1/voices');
  });

  it('should correctly handle trailing slashes in host and path', () => {
    (env as any).ELEVENLABS_API_HOST = 'https://api.elevenlabs.io/';
    const { url } = elevenlabsAccess('test-key', '/v1/voices');
    expect(url).toBe('https://api.elevenlabs.io/v1/voices');
  });
});

describe('elevenlabsVoiceId', () => {
  const originalEnv = { ...env };

  beforeEach(() => {
    (env as any).ELEVENLABS_VOICE_ID = originalEnv.ELEVENLABS_VOICE_ID;
  });

  it('should return the provided voice ID if given', () => {
    const voiceId = 'custom-voice-id';
    expect(elevenlabsVoiceId(voiceId)).toBe(voiceId);
  });

  it('should return the default voice ID from the environment if none is provided', () => {
    (env as any).ELEVENLABS_VOICE_ID = 'env-default-voice-id';
    expect(elevenlabsVoiceId()).toBe('env-default-voice-id');
  });

  it('should return the hardcoded default voice ID if none is provided and env is not set', () => {
    (env as any).ELEVENLABS_VOICE_ID = '';
    expect(elevenlabsVoiceId()).toBe('21m00Tcm4TlvDq8ikWAM');
  });
});