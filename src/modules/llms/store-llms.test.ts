import { describe, it, expect, beforeEach } from 'vitest';
import { useModelsStore, findLLMOrThrow, findSourceOrThrow, getDiverseTopLlmIds, groupLlmsByVendor, updateSelectedIds } from './store-llms';

describe('store-llms', () => {
  beforeEach(() => {
    useModelsStore.setState({
      llms: [],
      sources: [],
      chatLLMId: null,
      fastLLMId: null,
      funcLLMId: null,
    });
  });

  describe('findLLMOrThrow', () => {
    it('should return the LLM if it exists', () => {
      const llm = { id: 'llm1', _source: {} } as any;
      useModelsStore.setState({ llms: [llm] });
      expect(findLLMOrThrow('llm1')).toBe(llm);
    });

    it('should throw an error if LLM does not exist', () => {
      expect(() => findLLMOrThrow('llm1')).toThrow('LLM llm1 not found');
    });

    it('should throw an error if LLM exists but has no source', () => {
      const llm = { id: 'llm1' } as any;
      useModelsStore.setState({ llms: [llm] });
      expect(() => findLLMOrThrow('llm1')).toThrow('LLM llm1 has no source');
    });
  });

  describe('findSourceOrThrow', () => {
    it('should return the source if it exists', () => {
      const source = { id: 'source1' } as any;
      useModelsStore.setState({ sources: [source] });
      expect(findSourceOrThrow('source1')).toBe(source);
    });

    it('should throw an error if source does not exist', () => {
      expect(() => findSourceOrThrow('source1')).toThrow('ModelSource source1 not found');
    });
  });

  describe('getDiverseTopLlmIds', () => {
    it('should return diverse top LLM IDs', () => {
      const llms = [
        { id: 'llm1', _source: { vId: 'vendor1' }, benchmark: { cbaElo: 200 } },
        { id: 'llm2', _source: { vId: 'vendor2' }, benchmark: { cbaElo: 300 } },
        { id: 'llm3', _source: { vId: 'vendor1' }, benchmark: { cbaElo: 100 } },
      ] as any;
      useModelsStore.setState({ llms });
      const result = getDiverseTopLlmIds(2, false, null);
      expect(result).toEqual(['llm2', 'llm1']);
    });

    it('should pad with fallback if not enough LLMs', () => {
      const llms = [
        { id: 'llm1', _source: { vId: 'vendor1' }, benchmark: { cbaElo: 200 } },
      ] as any;
      useModelsStore.setState({ llms });
      const result = getDiverseTopLlmIds(3, false, 'fallback');
      expect(result).toEqual(['llm1', 'fallback', 'fallback']);
    });
  });

  describe('groupLlmsByVendor', () => {
    it('should group LLMs by vendor and sort by elo', () => {
      const llms = [
        { id: 'llm1', _source: { vId: 'vendor1' }, benchmark: { cbaElo: 200 } },
        { id: 'llm2', _source: { vId: 'vendor2' }, benchmark: { cbaElo: 300 } },
        { id: 'llm3', _source: { vId: 'vendor1' }, benchmark: { cbaElo: 100 } },
      ] as any;
      const result = groupLlmsByVendor(llms);
      expect(result).toEqual([
        { vendorId: 'vendor2', llmsByElo: [{ id: 'llm2', cbaElo: 300 }] },
        { vendorId: 'vendor1', llmsByElo: [{ id: 'llm1', cbaElo: 200 }, { id: 'llm3', cbaElo: 100 }] },
      ]);
    });
  });

  describe('updateSelectedIds', () => {
    it('should update selected LLM IDs based on availability', () => {
      const llms = [
        { id: 'llm1', _source: { vId: 'vendor1' }, benchmark: { cbaElo: 200 } },
        { id: 'llm2', _source: { vId: 'vendor2' }, benchmark: { cbaElo: 300 } },
      ] as any;
      const result = updateSelectedIds(llms, null, null, null);
      expect(result).toEqual({ chatLLMId: 'llm2', fastLLMId: 'llm2', funcLLMId: 'llm2' });
    });
  });
});