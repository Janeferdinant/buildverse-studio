import { describe, it, expect, beforeEach } from 'vitest';
import { useInteriorStore } from '../../src/store/interiorStore';
import { REAL_WORLD_PRODUCTS } from '../../src/data/retailerProductCatalog';
import { RoomMedia } from '../../src/types/interior';

describe('AI Room Designer End-to-End Workflow', () => {
  beforeEach(() => {
    useInteriorStore.getState().resetStore();
  });

  it('executes the full end-to-end flow from upload to alternatives, replacement, and budget calculation', () => {
    const store = useInteriorStore.getState();

    // 1. Ingestion: Upload a 360 panorama
    const sampleMedia: RoomMedia = {
      id: 'pano_test_1',
      type: 'panorama_360',
      name: 'kerala_living_360.jpg',
      fileSize: 4500000,
      url: 'data:image/jpeg;base64,sample_pano_data',
      aspectRatio: 2.0,
      isEquirectangular: true,
      timestamp: new Date().toISOString()
    };
    store.addMedia(sampleMedia);
    expect(useInteriorStore.getState().uploadedMedia).toHaveLength(1);

    // 2. Room analysis was auto-triggered on media upload
    const analysis = useInteriorStore.getState().roomAnalysis;
    expect(analysis).toBeDefined();
    expect(analysis?.confidence).toBeDefined();

    // 3. User confirms measured dimensions
    store.confirmDimensions({ length: 5.5, width: 4.5, height: 3.0 });
    const updatedAnalysis = useInteriorStore.getState().roomAnalysis;
    expect(updatedAnalysis?.isDimensionUserConfirmed).toBe(true);
    expect(updatedAnalysis?.verifiedDimensions.length).toBe(5.5);

    // 4. Set interior design preferences (Kerala contemporary, target budget ₹3.5L)
    store.setPreferences({
      style: 'kerala_contemporary',
      targetBudget: 350000,
      keralaDistrict: 'Kochi',
      preferredRetailers: ['IKEA India', 'Kerala Local / Nilambur Crafts', 'Amazon India']
    });

    // 5. Generate 3 design alternatives
    store.generateAlternatives();
    const alternatives = useInteriorStore.getState().alternatives;
    expect(alternatives).not.toBeNull();
    expect(alternatives).toHaveLength(3);

    const [budgetAlt, balancedAlt, premiumAlt] = alternatives!;
    expect(budgetAlt.tier).toBe('budget');
    expect(balancedAlt.tier).toBe('balanced');
    expect(premiumAlt.tier).toBe('premium');

    // Hierarchy check: budget < balanced < premium
    expect(budgetAlt.budget.grandTotal).toBeLessThan(balancedAlt.budget.grandTotal);
    expect(balancedAlt.budget.grandTotal).toBeLessThan(premiumAlt.budget.grandTotal);

    // 6. Placed products verification in active tier (balanced by default)
    const placed = useInteriorStore.getState().placedProducts;
    expect(placed.length).toBeGreaterThan(0);

    placed.forEach((item) => {
      expect(item.instanceId).toBeDefined();
      expect(item.productId).toBeDefined();
      expect(item.dimensions.length).toBeGreaterThan(0);
      expect(item.fitStatus).toBeDefined();
    });

    // 7. Test switching between tiers
    store.setActiveAlternativeTier('premium');
    expect(useInteriorStore.getState().activeAlternativeTier).toBe('premium');
    expect(useInteriorStore.getState().placedProducts.length).toBeGreaterThan(0);

    store.setActiveAlternativeTier('balanced');
    expect(useInteriorStore.getState().activeAlternativeTier).toBe('balanced');

    // 8. Test Product Replacement
    const initialInstance = useInteriorStore.getState().placedProducts[0];
    const oldProductId = initialInstance.productId;

    // Pick a compatible product from catalog
    const replacement = REAL_WORLD_PRODUCTS.find((p) => p.id !== oldProductId && p.category === 'sofas') || REAL_WORLD_PRODUCTS[1];
    store.replacePlacedProduct(initialInstance.instanceId, replacement.id);

    const updatedPlaced = useInteriorStore.getState().placedProducts;
    const replacedItem = updatedPlaced.find((p) => p.instanceId === initialInstance.instanceId);
    expect(replacedItem?.productId).toBe(replacement.id);
    expect(replacedItem?.dimensions.length).toBe(replacement.dimensions.length);

    // Position was preserved
    expect(replacedItem?.position[0]).toBe(initialInstance.position[0]);
    expect(replacedItem?.position[2]).toBe(initialInstance.position[2]);

    // 9. Update shopping item status
    const altBalanced = useInteriorStore.getState().alternatives![1];
    const firstShopItem = altBalanced.shoppingList[0];
    store.updateShoppingItemStatus(firstShopItem.productId, 'purchased');
    const updatedAlt = useInteriorStore.getState().alternatives![1];
    const shopItemAfter = updatedAlt.shoppingList.find((s) => s.productId === firstShopItem.productId);
    expect(shopItemAfter?.status).toBe('purchased');
  });

  it('manages 4-way product comparison state and toggling', () => {
    const store = useInteriorStore.getState();
    const p1 = REAL_WORLD_PRODUCTS[0].id;
    const p2 = REAL_WORLD_PRODUCTS[1].id;
    const p3 = REAL_WORLD_PRODUCTS[2].id;
    const p4 = REAL_WORLD_PRODUCTS[3].id;
    const p5 = REAL_WORLD_PRODUCTS[4].id;

    store.toggleProductInComparison(p1);
    store.toggleProductInComparison(p2);
    store.toggleProductInComparison(p3);
    store.toggleProductInComparison(p4);
    expect(useInteriorStore.getState().comparisonProductIds).toHaveLength(4);

    // Toggling existing item removes it
    store.toggleProductInComparison(p1);
    expect(useInteriorStore.getState().comparisonProductIds).toHaveLength(3);
    expect(useInteriorStore.getState().comparisonProductIds).not.toContain(p1);

    // Clear all
    store.clearComparison();
    expect(useInteriorStore.getState().comparisonProductIds).toHaveLength(0);
  });
});
