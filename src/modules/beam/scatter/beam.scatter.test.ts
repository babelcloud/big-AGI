import { vi, describe, it, expect, beforeEach } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { createDMessage } from '~/common/state/store-chats';
import { streamAssistantMessage } from '../../../apps/chat/editors/chat-stream';
import { getUXLabsHighPerformance } from '~/common/state/store-ux-labs';
import { SCATTER_PLACEHOLDER } from '../beam.config';
import {
  createBRay,
  rayScatterStart,
  rayScatterStop,
  rayIsError,
  rayIsScattering,
  rayIsSelectable,
  rayIsUserSelected,
  rayIsImported,
  reInitScatterStateSlice,
  createScatterSlice,
  BRay,
} from './beam.scatter';

vi.mock('uuid', () => ({
  v4: () => 'mocked-uuid',
}));

vi.mock('~/common/state/store-chats', () => ({
  createDMessage: () => ({
    id: 'mocked-id',
    role: 'assistant',
    text: '',
    sender: 'AI',
    avatar: null,
    typing: false,
    created: Date.now(),
    updated: null
  }),
}));

vi.mock('../../../apps/chat/editors/chat-stream', () => ({
  streamAssistantMessage: vi.fn(),
}));

vi.mock('~/common/state/store-ux-labs', () => ({
  getUXLabsHighPerformance: vi.fn(),
}));

describe('beam.scatter', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createBRay', () => {
    it('should create a BRay with the given llmId', () => {
      const llmId = 'test-llm';
      const ray = createBRay(llmId);
      expect(ray).toEqual({
        rayId: 'mocked-uuid',
        status: 'empty',
        message: expect.any(Object),
        rayLlmId: llmId,
        userSelected: false,
        imported: false,
      });
      expect(ray.message).toEqual(expect.objectContaining({
        id: 'mocked-id',
        role: 'assistant',
        text: '',
        sender: 'AI',
        avatar: null,
        typing: false,
        created: expect.any(Number),
        updated: null
      }));
    });
  });

  describe('rayScatterStart', () => {
    it('should start scattering a ray', () => {
      const ray: BRay = createBRay('test-llm');
      const inputHistory = [{ id: 'user-id', role: 'user', text: 'Hello', sender: 'User', avatar: null, typing: false, created: Date.now(), updated: null }];
      const scatterStore = {
        rays: [],
        _rayUpdate: vi.fn(),
        _syncRaysStateToScatter: vi.fn(),
      };

      vi.mocked(getUXLabsHighPerformance).mockReturnValue(false);
      vi.mocked(streamAssistantMessage).mockResolvedValue({ outcome: 'success' });

      const result = rayScatterStart(ray, 'test-llm', inputHistory as any, false, scatterStore as any);

      expect(result.status).toBe('scattering');
      expect(result.message.text).toBe(SCATTER_PLACEHOLDER);
      expect(streamAssistantMessage).toHaveBeenCalled();
    });
  });

  describe('rayScatterStop', () => {
    it('should stop scattering a ray', () => {
      const ray: BRay = {
        ...createBRay('test-llm'),
        status: 'scattering',
        genAbortController: { abort: vi.fn() } as any,
      };

      const result = rayScatterStop(ray);

      expect(result.status).toBe('stopped');
      expect(result.genAbortController).toBeUndefined();
      expect(ray.genAbortController?.abort).toHaveBeenCalled();
    });
  });

  describe('rayIsError', () => {
    it('should return true for error status', () => {
      const ray: BRay = { ...createBRay('test-llm'), status: 'error' };
      expect(rayIsError(ray)).toBe(true);
    });

    it('should return false for non-error status', () => {
      const ray: BRay = { ...createBRay('test-llm'), status: 'success' };
      expect(rayIsError(ray)).toBe(false);
    });
  });

  describe('rayIsScattering', () => {
    it('should return true for scattering status', () => {
      const ray: BRay = { ...createBRay('test-llm'), status: 'scattering' };
      expect(rayIsScattering(ray)).toBe(true);
    });

    it('should return false for non-scattering status', () => {
      const ray: BRay = { ...createBRay('test-llm'), status: 'success' };
      expect(rayIsScattering(ray)).toBe(false);
    });
  });

  describe('rayIsSelectable', () => {
    it('should return true for selectable ray', () => {
      const ray: BRay = {
        ...createBRay('test-llm'),
        message: { text: 'Hello', updated: Date.now() } as any,
      };
      expect(rayIsSelectable(ray)).toBe(true);
    });

    it('should return false for non-selectable ray', () => {
      const ray: BRay = {
        ...createBRay('test-llm'),
        message: { text: SCATTER_PLACEHOLDER } as any,
      };
      expect(rayIsSelectable(ray)).toBe(false);
    });
  });

  describe('rayIsUserSelected', () => {
    it('should return true for user-selected ray', () => {
      const ray: BRay = { ...createBRay('test-llm'), userSelected: true };
      expect(rayIsUserSelected(ray)).toBe(true);
    });

    it('should return false for non-user-selected ray', () => {
      const ray: BRay = { ...createBRay('test-llm'), userSelected: false };
      expect(rayIsUserSelected(ray)).toBe(false);
    });
  });

  describe('rayIsImported', () => {
    it('should return true for imported ray', () => {
      const ray: BRay = { ...createBRay('test-llm'), imported: true };
      expect(rayIsImported(ray)).toBe(true);
    });

    it('should return false for non-imported ray', () => {
      const ray: BRay = { ...createBRay('test-llm'), imported: false };
      expect(rayIsImported(ray)).toBe(false);
    });
  });

  describe('reInitScatterStateSlice', () => {
    it('should reinitialize scatter state slice', () => {
      const prevRays: BRay[] = [
        { ...createBRay('llm1'), status: 'scattering', genAbortController: { abort: vi.fn() } as any },
        { ...createBRay('llm2'), status: 'success' },
      ];

      const result = reInitScatterStateSlice(prevRays);

      expect(result.rays.length).toBe(2);
      expect(result.rays[0].rayLlmId).toBe('llm1');
      expect(result.rays[1].rayLlmId).toBe('llm2');
      expect(result.rays.every(ray => ray.status === 'empty')).toBe(true);
      expect(prevRays[0].genAbortController?.abort).toHaveBeenCalled();
    });
  });

  describe('createScatterSlice', () => {
    it('should create a scatter slice with all required methods', () => {
      const set = vi.fn();
      const get = vi.fn();
      const store = {} as any;

      const slice = createScatterSlice(set, get, store);

      expect(slice).toHaveProperty('setRayCount');
      expect(slice).toHaveProperty('removeRay');
      expect(slice).toHaveProperty('importRays');
      expect(slice).toHaveProperty('setRayLlmIds');
      expect(slice).toHaveProperty('startScatteringAll');
      expect(slice).toHaveProperty('stopScatteringAll');
      expect(slice).toHaveProperty('rayToggleScattering');
      expect(slice).toHaveProperty('raySetLlmId');
      expect(slice).toHaveProperty('_rayUpdate');
      expect(slice).toHaveProperty('_storeLastScatterConfig');
      expect(slice).toHaveProperty('_syncRaysStateToScatter');
    });

    it('should handle setRayCount correctly', () => {
      const set = vi.fn();
      const get = vi.fn().mockReturnValue({
        rays: [createBRay('llm1'), createBRay('llm2')],
        _storeLastScatterConfig: vi.fn(),
        _syncRaysStateToScatter: vi.fn(),
      });
      const store = {} as any;

      const slice = createScatterSlice(set, get, store);
      slice.setRayCount(3);

      expect(set).toHaveBeenCalled();
      const setArg = set.mock.calls[0][0];
      expect(typeof setArg).toBe('object');
      expect(setArg).toHaveProperty('rays');
      expect(setArg.rays.length).toBe(3);
    });
  });
});