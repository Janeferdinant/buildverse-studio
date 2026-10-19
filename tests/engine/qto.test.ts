import { describe, it, expect } from 'vitest';
import {
  calculateWallQuantity,
  calculateFloorQuantity,
  calculateRoofQuantity,
  calculateProjectQTO,
} from '@/engine/qto';
import { ArchitecturalComponent } from '@/types/project';

describe('Quantity Take-Off (QTO) Engine', () => {
  it('calculates wall gross area, opening deductions, and net volume correctly', () => {
    // 6m wall, 3m high, 0.23m thick (Kerala standard 9-inch brickwork)
    // 1 door (1m x 2.1m = 2.1 m2)
    // 1 window (1.2m x 1.2m = 1.44 m2)
    const wall: ArchitecturalComponent = {
      id: 'wall-1',
      type: 'wall',
      name: 'North External Wall',
      floorId: 'ground',
      materialId: 'mat-brick-9in',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 6.0, height: 3.0, thickness: 0.23 },
      openings: [
        {
          id: 'op-door-1',
          componentId: 'door-1',
          offset: 1.0,
          width: 1.0,
          height: 2.1,
          sillHeight: 0,
        },
        {
          id: 'op-win-1',
          componentId: 'win-1',
          offset: 3.5,
          width: 1.2,
          height: 1.2,
          sillHeight: 0.9,
        },
      ],
    };

    const result = calculateWallQuantity(wall);

    // Gross area = 6.0 * 3.0 = 18.0 m2
    expect(result.grossArea).toBeCloseTo(18.0, 2);
    // Deductions = 2.1 + 1.44 = 3.54 m2
    expect(result.openingDeductions).toBeCloseTo(3.54, 2);
    // Net area = 18.0 - 3.54 = 14.46 m2
    expect(result.netArea).toBeCloseTo(14.46, 2);
    // Net volume = 14.46 * 0.23 = 3.3258 m3
    expect(result.netVolume).toBeCloseTo(3.326, 2);
    // Calculation status is valid
    expect(result.validationStatus).toBe('valid');
  });

  it('clamps deductions so net area is never negative when opening exceeds wall', () => {
    const wall: ArchitecturalComponent = {
      id: 'wall-small',
      type: 'wall',
      name: 'Small Partition',
      floorId: 'ground',
      materialId: 'mat-brick-4in',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 2.0, height: 2.0, thickness: 0.12 },
      openings: [
        {
          id: 'op-huge',
          componentId: 'door-huge',
          offset: 0,
          width: 3.0,
          height: 2.5,
          sillHeight: 0,
        },
      ],
    };

    const result = calculateWallQuantity(wall);
    expect(result.grossArea).toBe(4.0);
    expect(result.netArea).toBe(0);
    expect(result.netVolume).toBe(0);
    expect(result.validationStatus).toBe('warning');
  });

  it('calculates floor slab area, concrete volume, and tile wastage allowance', () => {
    // 8m x 6m floor slab, 0.15m thick RCC
    const floor: ArchitecturalComponent = {
      id: 'floor-1',
      type: 'floor',
      name: 'Living Room Slab & Vitrified Tile',
      floorId: 'ground',
      materialId: 'mat-vitrified-tile-600',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 8.0, height: 0.15, thickness: 6.0 }, // length x width (stored in thickness)
    };

    const result = calculateFloorQuantity(floor, { tileWastagePercent: 7.5 });

    // Net area = 8.0 * 6.0 = 48.0 m2
    expect(result.area).toBe(48.0);
    // Slab concrete volume = 48.0 * 0.15 = 7.2 m3
    expect(result.concreteVolume).toBeCloseTo(7.2, 2);
    // Tile order quantity with 7.5% wastage = 48 * 1.075 = 51.6 m2
    expect(result.tilePurchaseQuantity).toBeCloseTo(51.6, 2);
  });

  it('calculates pitched roof area using pitch slope angle', () => {
    // 10m x 6m footprint, 30 degree slope (Kerala traditional monsoon pitched roof)
    const roof: ArchitecturalComponent = {
      id: 'roof-1',
      type: 'roof',
      name: 'Kerala Terracotta Pitched Roof',
      floorId: 'first',
      materialId: 'mat-kerala-clay-tile',
      transform: { position: [0, 3, 0], rotation: [0, 0, 0] },
      dimensions: { length: 10.0, height: 1.5, thickness: 6.0, pitch: 30 },
    };

    const result = calculateRoofQuantity(roof);
    // Slope factor = 1 / cos(30 deg) = 1.1547
    // True slope area = 60 * 1.1547 = 69.28 m2
    expect(result.trueSurfaceArea).toBeGreaterThan(60.0);
    expect(result.trueSurfaceArea).toBeCloseTo(69.28, 1);
  });

  it('aggregates complete project QTO into clear categorised records', () => {
    const components: ArchitecturalComponent[] = [
      {
        id: 'w1',
        type: 'wall',
        name: 'Wall 1',
        floorId: 'ground',
        materialId: 'mat-brick-9in',
        transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
        dimensions: { length: 5.0, height: 3.0, thickness: 0.23 },
      },
      {
        id: 'f1',
        type: 'floor',
        name: 'Floor 1',
        floorId: 'ground',
        materialId: 'mat-vitrified-tile-600',
        transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
        dimensions: { length: 5.0, height: 0.15, thickness: 4.0 },
      },
    ];

    const projectQTO = calculateProjectQTO(components);
    expect(projectQTO.records.length).toBeGreaterThanOrEqual(2);
    expect(projectQTO.summary.totalWallGrossArea).toBe(15.0);
    expect(projectQTO.summary.totalFloorArea).toBe(20.0);
  });
});
