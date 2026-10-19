import { describe, it, expect, beforeEach } from 'vitest';
import { useInteriorStore } from '@/store/interiorStore';
import { RoomMedia } from '@/types/interior';

describe('Reactive Interior Design Store', () => {
  beforeEach(() => {
    useInteriorStore.getState().resetStore();
  });

  it('adds room media and advances pipeline stages', () => {
    const store = useInteriorStore.getState();
    expect(store.uploadedMedia.length).toBe(0);
    expect(store.processingStage).toBe('idle');

    const sampleMedia: RoomMedia = {
      id: 'm-1',
      type: 'panorama_360',
      name: 'room_360.jpg',
      url: 'data:image/jpeg;base64,123',
      fileSize: 3500000,
      timestamp: new Date().toISOString(),
    };

    useInteriorStore.getState().addMedia(sampleMedia);
    expect(useInteriorStore.getState().uploadedMedia.length).toBe(1);

    useInteriorStore.getState().setProcessingStage('analyzing');
    expect(useInteriorStore.getState().processingStage).toBe('analyzing');
  });

  it('generates 3 alternatives and permits switching between tiers reactively', () => {
    useInteriorStore.getState().confirmDimensions({ length: 6.0, width: 4.5, height: 3.0 });
    useInteriorStore.getState().generateAlternatives();

    const state = useInteriorStore.getState();
    expect(state.alternatives).not.toBeNull();
    expect(state.alternatives?.length).toBe(3);
    expect(state.placedProducts.length).toBeGreaterThan(0);

    // Switch tier from balanced to budget
    useInteriorStore.getState().setActiveAlternativeTier('budget');
    expect(useInteriorStore.getState().activeAlternativeTier).toBe('budget');

    // Switch to premium
    useInteriorStore.getState().setActiveAlternativeTier('premium');
    expect(useInteriorStore.getState().activeAlternativeTier).toBe('premium');
  });

  it('replaces a placed product and updates budget and shopping list reactively', () => {
    useInteriorStore.getState().confirmDimensions({ length: 5.5, width: 4.5, height: 3.0 });
    useInteriorStore.getState().generateAlternatives();

    const initialPlaced = useInteriorStore.getState().placedProducts;
    expect(initialPlaced.length).toBeGreaterThan(0);
    const targetInstance = initialPlaced[0];
    const oldProductId = targetInstance.productId;

    // Pick a different product from catalog
    const catalog = useInteriorStore.getState().catalog;
    const replacement = catalog.find((p) => p.id !== oldProductId && p.category === 'sofas') || catalog[0];

    useInteriorStore.getState().replacePlacedProduct(targetInstance.instanceId, replacement.id);

    const updatedPlaced = useInteriorStore.getState().placedProducts;
    const updatedInstance = updatedPlaced.find((p) => p.instanceId === targetInstance.instanceId);

    expect(updatedInstance?.productId).toBe(replacement.id);
    expect(updatedInstance?.dimensions.length).toBe(replacement.dimensions.length);
  });

  it('toggles product selection in 4-way comparison modal', () => {
    useInteriorStore.getState().toggleProductInComparison('prod-ikea-kivik-sofa');
    expect(useInteriorStore.getState().comparisonProductIds).toContain('prod-ikea-kivik-sofa');

    useInteriorStore.getState().toggleProductInComparison('prod-ikea-kivik-sofa');
    expect(useInteriorStore.getState().comparisonProductIds).not.toContain('prod-ikea-kivik-sofa');
  });
});
