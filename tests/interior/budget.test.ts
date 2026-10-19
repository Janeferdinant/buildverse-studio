import { describe, it, expect } from 'vitest';
import { calculateInteriorBudget } from '@/engine/interiorDesignGenerator';
import { PlacedProductInstance, InteriorDesignPreferences } from '@/types/interior';
import { RetailerProduct } from '@/types/interior';

describe('Interior Budget & Cost Engine', () => {
  const sampleProducts: RetailerProduct[] = [
    {
      id: 'prod-ikea-sofa',
      name: 'IKEA KIVIK 3-Seat Sofa with Chaise Lounge',
      brand: 'IKEA',
      sku: 'IK-591.937.56',
      retailer: 'IKEA India',
      productUrl: 'https://www.ikea.com/in/en/p/kivik-three-seat-sofa-tresund-anthracite-s59193756/',
      unitPrice: 42990,
      currency: 'INR',
      dimensions: { length: 2.28, height: 0.83, thickness: 0.95 },
      material: 'Fabric (Anthracite)',
      category: 'sofas',
      deliveryCharge: 1499,
      installationCharge: 800,
      warranty: '10 Years IKEA Warranty',
      availability: 'in_stock',
      localityAvailability: { 'Kochi': true, 'Ernakulam': true, 'Thrissur': true },
      verificationStatus: 'verified_official',
      lastVerifiedDate: '2024-10-15',
    },
    {
      id: 'prod-amazon-table',
      name: 'Wakefit Teak Finish Coffee Table',
      brand: 'Wakefit',
      sku: 'AMZ-WF-CT-01',
      retailer: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B08XYZ123',
      unitPrice: 5499,
      currency: 'INR',
      dimensions: { length: 0.9, height: 0.45, thickness: 0.5 },
      material: 'Engineered Wood',
      category: 'coffee_tables',
      deliveryCharge: 0, // Free Prime delivery
      installationCharge: 0,
      warranty: '1 Year Manufacturer Warranty',
      availability: 'in_stock',
      localityAvailability: { 'Kochi': true, 'Ernakulam': true },
      verificationStatus: 'verified_official',
      lastVerifiedDate: '2024-10-15',
    },
  ];

  const placedInstances: PlacedProductInstance[] = [
    {
      instanceId: 'inst-1',
      productId: 'prod-ikea-sofa',
      position: [0, 0, 1.5],
      rotation: [0, 0, 0],
      dimensions: { length: 2.28, height: 0.83, thickness: 0.95 },
      fitStatus: 'ok',
    },
    {
      instanceId: 'inst-2',
      productId: 'prod-amazon-table',
      position: [0, 0, 0.2],
      rotation: [0, 0, 0],
      dimensions: { length: 0.9, height: 0.45, thickness: 0.5 },
      fitStatus: 'ok',
    },
  ];

  const preferences: InteriorDesignPreferences = {
    roomType: 'living_room',
    roomDimensions: { length: 5.0, width: 4.0, height: 3.0 },
    style: 'modern_minimalist',
    targetBudget: 100000,
    currency: 'INR',
    preferredRetailers: ['IKEA India', 'Amazon India'],
    keralaDistrict: 'Ernakulam',
  };

  it('calculates itemized budget, delivery, installation, and remaining budget correctly', () => {
    const budget = calculateInteriorBudget(placedInstances, sampleProducts, preferences);

    // Furniture subtotal = 42990 + 5499 = 48489
    expect(budget.furnitureSubtotal).toBe(48489);

    // Delivery subtotal = 1499 + 0 = 1499
    expect(budget.deliverySubtotal).toBe(1499);

    // Installation subtotal = 800 + 0 = 800
    expect(budget.installationSubtotal).toBe(800);

    // Direct items = 48489 + 1499 + 800 = 50788
    expect(budget.directTotal).toBe(50788);

    // Grand total should include direct + taxes/contingency
    expect(budget.grandTotal).toBeGreaterThan(50788);

    // Target budget is 100000, so remaining budget should be positive
    expect(budget.budgetRemaining).toBe(100000 - budget.grandTotal);
    expect(budget.isWithinBudget).toBe(true);
    expect(budget.isComplete).toBe(true);
  });

  it('flags unpriced or missing products and marks budget as incomplete', () => {
    const placedWithMissing: PlacedProductInstance[] = [
      {
        instanceId: 'inst-unknown',
        productId: 'prod-nonexistent',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        dimensions: { length: 1.0, height: 1.0, thickness: 1.0 },
        fitStatus: 'ok',
      },
    ];

    const budget = calculateInteriorBudget(placedWithMissing, sampleProducts, preferences);
    expect(budget.isComplete).toBe(false);
    expect(budget.missingPriceCount).toBe(1);
  });
});
