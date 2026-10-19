import { describe, it, expect } from 'vitest';
import { calculateBOQ, CostSettings } from '@/engine/costEstimator';
import { QTOResult } from '@/types/qto';
import { PriceRecord } from '@/types/pricing';

describe('BOQ & Construction Cost Estimator Engine', () => {
  const mockCatalog: PriceRecord[] = [
    {
      id: 'price-brick-9in',
      materialId: 'mat-brick-9in',
      materialName: 'Country Brick Masonry (9-inch)',
      category: 'masonry',
      specification: 'Class I country bricks in 1:6 cement mortar as per Kerala PWD SOR 2024',
      unit: 'm3',
      unitRate: 6850, // INR per m3
      currency: 'INR',
      region: 'Kerala - Kochi',
      sourceType: 'official_schedule_rate',
      sourceReference: 'Kerala PWD Schedule of Rates 2024 Item 6.1.1',
      effectiveDate: '2024-04-01',
      lastVerifiedDate: '2024-09-15',
      taxIncluded: false,
      taxRatePercent: 18,
      labourRatePerUnit: 1450, // Mason and helper labour
      equipmentRatePerUnit: 120, // Concrete mixer / hoist
      confidence: 'high',
    },
    {
      id: 'price-tile-600',
      materialId: 'mat-vitrified-tile-600',
      materialName: 'Vitrified Floor Tiles (600x600mm)',
      category: 'flooring_and_tiles',
      specification: 'Double-charged premium vitrified floor tiles',
      unit: 'm2',
      unitRate: 850,
      currency: 'INR',
      region: 'Kerala - Kochi',
      sourceType: 'verified_market_rate',
      sourceReference: 'Kochi Wholesale Tile Depot quotation #KD-8812',
      effectiveDate: '2024-08-01',
      lastVerifiedDate: '2024-10-01',
      taxIncluded: false,
      taxRatePercent: 18,
      labourRatePerUnit: 280, // Tiling labour & mortar bed
      equipmentRatePerUnit: 0,
      confidence: 'high',
    },
  ];

  const defaultSettings: CostSettings = {
    contingencyPercent: 5.0,
    overheadAndProfitPercent: 10.0,
    includeTaxes: true,
  };

  it('calculates direct costs (material + labour + equipment) and taxes accurately', () => {
    const qto: QTOResult = {
      records: [
        {
          id: 'qto-1',
          componentId: 'w1',
          componentName: 'Main Wall',
          category: 'Masonry',
          grossQuantity: 10,
          deductions: 0,
          netQuantity: 10,
          wastagePercent: 3.0,
          totalWithWastage: 10.3, // 10.3 m3
          unit: 'm3',
          calculationFormula: '10m3 + 3% wastage',
          materialId: 'mat-brick-9in',
          validationStatus: 'valid',
        },
      ],
      summary: {
        totalWallGrossArea: 40,
        totalWallNetArea: 40,
        totalMasonryVolume: 10,
        totalFloorArea: 0,
        totalRoofArea: 0,
        totalOpeningsArea: 0,
        doorCount: 0,
        windowCount: 0,
        componentCount: 1,
      },
      calculatedAt: new Date().toISOString(),
    };

    const estimate = calculateBOQ(qto, mockCatalog, defaultSettings);

    // Quantity = 10.3 m3
    // Material cost = 10.3 * 6850 = 70555
    // Labour cost = 10.3 * 1450 = 14935
    // Equipment cost = 10.3 * 120 = 1236
    // Direct cost = 70555 + 14935 + 1236 = 86726
    const line = estimate.lineItems[0];
    expect(line.materialCost).toBeCloseTo(70555, 0);
    expect(line.labourCost).toBeCloseTo(14935, 0);
    expect(line.equipmentCost).toBeCloseTo(1236, 0);
    expect(line.directCost).toBeCloseTo(86726, 0);

    // Tax = 18% of 86726 = 15610.68
    expect(line.taxAmount).toBeCloseTo(15610.68, 1);
    expect(estimate.totalDirectCost).toBeCloseTo(86726, 0);
    expect(estimate.isComplete).toBe(true);
    expect(estimate.missingPriceCount).toBe(0);
  });

  it('flags unpriced materials and marks estimate as incomplete instead of treating as zero', () => {
    const qtoWithMissingPrice: QTOResult = {
      records: [
        {
          id: 'qto-custom',
          componentId: 'c1',
          componentName: 'Custom Exotic Facade Cladding',
          category: 'Finishes',
          grossQuantity: 25,
          deductions: 0,
          netQuantity: 25,
          wastagePercent: 5.0,
          totalWithWastage: 26.25,
          unit: 'm2',
          calculationFormula: '25m2 + 5% wastage',
          materialId: 'mat-exotic-unknown-stone', // Not in catalog!
          validationStatus: 'valid',
        },
      ],
      summary: {
        totalWallGrossArea: 25,
        totalWallNetArea: 25,
        totalMasonryVolume: 0,
        totalFloorArea: 0,
        totalRoofArea: 0,
        totalOpeningsArea: 0,
        doorCount: 0,
        windowCount: 0,
        componentCount: 1,
      },
      calculatedAt: new Date().toISOString(),
    };

    const estimate = calculateBOQ(qtoWithMissingPrice, mockCatalog, defaultSettings);

    expect(estimate.isComplete).toBe(false);
    expect(estimate.missingPriceCount).toBe(1);
    expect(estimate.lineItems[0].isPriceMissing).toBe(true);
    expect(estimate.lineItems[0].notes).toContain('Price unavailable in catalog');
  });
});
