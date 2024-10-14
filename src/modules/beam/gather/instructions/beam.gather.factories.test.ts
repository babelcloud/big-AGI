import { describe, it, expect } from 'vitest';
import { findFusionFactory, FUSION_FACTORIES, CUSTOM_FACTORY_ID } from './beam.gather.factories';

describe('findFusionFactory', () => {
  it('should return the correct FusionFactorySpec for a valid factoryId', () => {
    const factoryId = 'fuse';
    const result = findFusionFactory(factoryId);
    expect(result).toBe(FUSION_FACTORIES.find(f => f.factoryId === factoryId));
  });

  it('should return null for an invalid factoryId', () => {
    const factoryId = 'invalid-id';
    const result = findFusionFactory(factoryId);
    expect(result).toBeNull();
  });

  it('should return null when factoryId is null', () => {
    const result = findFusionFactory(null);
    expect(result).toBeNull();
  });

  it('should return null when factoryId is undefined', () => {
    const result = findFusionFactory(undefined);
    expect(result).toBeNull();
  });

  it('should return the correct FusionFactorySpec for CUSTOM_FACTORY_ID', () => {
    const result = findFusionFactory(CUSTOM_FACTORY_ID);
    expect(result).toBe(FUSION_FACTORIES.find(f => f.factoryId === CUSTOM_FACTORY_ID));
  });
});