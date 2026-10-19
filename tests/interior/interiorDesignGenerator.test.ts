import { describe, it, expect } from 'vitest';
import { generateDesignAlternatives } from '@/engine/interiorDesignGenerator';
import { REAL_WORLD_PRODUCTS } from '@/services/retailerAdapters';
import { InteriorDesignPreferences } from '@/types/interior';

describe('AI Interior Design Generator Engine', () => {
  const preferences: InteriorDesignPreferences = {
    roomType: 'living_room',
    roomDimensions: { length: 5.5, width: 4.5, height: 3.0 },
    style: 'kerala_contemporary',
    targetBudget: 150000, // ₹1.5 Lakhs
    currency: 'INR',
    preferredRetailers: ['IKEA India', 'Kerala Local / Nilambur Crafts', 'Amazon India'],
    keralaDistrict: 'Kochi',
  };

  it('generates 3 distinct alternatives (Budget, Balanced, Premium) on the same room geometry', () => {
    const alternatives = generateDesignAlternatives(preferences, REAL_WORLD_PRODUCTS);
    expect(alternatives.length).toBe(3);

    const [budgetAlt, balancedAlt, premiumAlt] = alternatives;

    // Check tiers
    expect(budgetAlt.tier).toBe('budget');
    expect(balancedAlt.tier).toBe('balanced');
    expect(premiumAlt.tier).toBe('premium');

    // Cost hierarchy: Budget <= Balanced <= Premium
    expect(budgetAlt.budget.grandTotal).toBeLessThanOrEqual(balancedAlt.budget.grandTotal);
    expect(balancedAlt.budget.grandTotal).toBeLessThanOrEqual(premiumAlt.budget.grandTotal);

    // Each must have placed products
    expect(budgetAlt.placedProducts.length).toBeGreaterThanOrEqual(2);
    expect(balancedAlt.placedProducts.length).toBeGreaterThanOrEqual(3);
    expect(premiumAlt.placedProducts.length).toBeGreaterThanOrEqual(3);

    // Each must include a shopping list with valid direct URLs and retailers
    expect(balancedAlt.shoppingList.length).toBeGreaterThanOrEqual(3);
    expect(balancedAlt.shoppingList.every((item) => item.productUrl.startsWith('http'))).toBe(true);

    // Color palettes, finishes, and space utilization rationale
    expect(balancedAlt.colorPalette.length).toBeGreaterThanOrEqual(3);
    expect(balancedAlt.spaceUtilizationNotes.length).toBeGreaterThan(10);
    expect(balancedAlt.wallFinish.length).toBeGreaterThan(0);
    expect(balancedAlt.floorFinish.length).toBeGreaterThan(0);
  });

  it('adapts product selection for bedrooms (placing bed, bedside, storage)', () => {
    const bedroomPrefs: InteriorDesignPreferences = {
      roomType: 'bedroom',
      roomDimensions: { length: 4.5, width: 4.0, height: 3.0 },
      style: 'scandinavian',
      targetBudget: 120000,
      currency: 'INR',
      preferredRetailers: ['IKEA India', 'Amazon India'],
      keralaDistrict: 'Ernakulam',
    };

    const alternatives = generateDesignAlternatives(bedroomPrefs, REAL_WORLD_PRODUCTS);
    const balanced = alternatives[1];

    // Bedroom must contain a bed
    const productMap = new Map(REAL_WORLD_PRODUCTS.map((p) => [p.id, p]));
    const hasBed = balanced.placedProducts.some((p) => {
      const prod = productMap.get(p.productId);
      return prod?.category === 'beds';
    });
    expect(hasBed).toBe(true);
  });
});
