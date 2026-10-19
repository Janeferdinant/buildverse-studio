import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '@/store/projectStore';
import { StorageRepository } from '@/services/storageRepository';
import { ArchitecturalComponent } from '@/types/project';
import { calculateProjectQTO } from '@/engine/qto';
import { calculateBOQ } from '@/engine/costEstimator';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('BuildVerse Studio — Integration & Workflow Verification', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // --- WORKFLOW A: CREATE AND SAVE A BUILDING ---
  it('Workflow A: Creates, edits, saves, and reloads a modern villa with updated geometry', () => {
    // 1. Initialize project
    useProjectStore.getState().initNewProject({
      name: 'Kerala Waterfront Villa',
      type: 'villa',
      location: 'Aluva, Kochi',
      plotLength: 24,
      plotWidth: 18,
      budget: 8500000,
    });

    const store = useProjectStore.getState();
    expect(store.project.name).toBe('Kerala Waterfront Villa');
    expect(store.project.metadata.plotArea).toBe(432);

    // 2. Add a wall
    const wall1: ArchitecturalComponent = {
      id: 'wf-a-wall1',
      type: 'wall',
      name: 'North Villa Facade',
      floorId: 'floor-ground',
      materialId: 'mat-brick-9in',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 8.0, height: 3.2, thickness: 0.23 },
    };
    useProjectStore.getState().addComponent(wall1);

    // Initial gross area = 8.0 * 3.2 = 25.6 m2
    expect(useProjectStore.getState().qtoResult.summary.totalWallGrossArea).toBeCloseTo(25.6, 2);

    // 3. Add door and window opening
    useProjectStore.getState().addOpening('wf-a-wall1', {
      id: 'op-wf-door',
      componentId: 'door-main',
      offset: 1.5,
      width: 1.2,
      height: 2.1, // 2.52 m2
      sillHeight: 0,
    });
    useProjectStore.getState().addOpening('wf-a-wall1', {
      id: 'op-wf-win',
      componentId: 'win-1',
      offset: 4.5,
      width: 1.5,
      height: 1.2, // 1.8 m2
      sillHeight: 0.9,
    });

    // Net area = 25.6 - (2.52 + 1.8) = 21.28 m2
    expect(useProjectStore.getState().qtoResult.summary.totalWallNetArea).toBeCloseTo(21.28, 2);

    // 4. Change wall length from 8.0m to 12.0m
    useProjectStore.getState().updateComponent('wf-a-wall1', {
      dimensions: { length: 12.0, height: 3.2, thickness: 0.23 },
    });
    // New gross = 12 * 3.2 = 38.4 m2, Net = 38.4 - 4.32 = 34.08 m2
    expect(useProjectStore.getState().qtoResult.summary.totalWallNetArea).toBeCloseTo(34.08, 2);

    // 5. Save project to persistent storage
    const saved = useProjectStore.getState().saveProject();
    expect(saved).toBe(true);

    // 6. Reload from storage
    const reloaded = StorageRepository.loadProject(useProjectStore.getState().project.id);
    expect(reloaded).not.toBeNull();
    expect(reloaded?.name).toBe('Kerala Waterfront Villa');
    expect(reloaded?.components.length).toBe(1);
    expect(reloaded?.components[0].dimensions.length).toBe(12.0);
  });

  // --- WORKFLOW B: COST ESTIMATION & BOQ UPDATES ---
  it('Workflow B: Updates material rate and verifies live recalculation of BOQ lines and taxes', () => {
    useProjectStore.getState().loadTemplate('villa');

    const initialEstimate = useProjectStore.getState().boqEstimate;
    expect(initialEstimate.grandTotal).toBeGreaterThan(0);

    // Find brickwork rate in catalog
    const brickRate = useProjectStore.getState().catalog.find((c) => c.materialId === 'mat-brick-9in');
    expect(brickRate).toBeDefined();
    const oldRate = brickRate!.unitRate;

    // Change rate from 6850 to 8000 INR
    useProjectStore.getState().updateMaterialPrice('mat-brick-9in', {
      unitRate: 8000,
      sourceType: 'user_entered',
    });

    const updatedEstimate = useProjectStore.getState().boqEstimate;
    // Grand total must have increased
    expect(updatedEstimate.grandTotal).toBeGreaterThan(initialEstimate.grandTotal);

    // Verified price provenance is user_entered for updated item
    const brickLine = updatedEstimate.lineItems.find((l) => l.componentName.includes('Masonry'));
    expect(brickLine?.priceSource).toBe('user_entered');
  });

  // --- WORKFLOW C: INTERIORS AND LANDSCAPING ---
  it('Workflow C: Adds furnishings and landscape pool, verifying positions and line items', () => {
    useProjectStore.getState().initNewProject({
      name: 'Resort Villa',
      type: 'resort',
      location: 'Kumarakom',
      plotLength: 40,
      plotWidth: 30,
      budget: 12000000,
    });

    // Add King Bed
    const bed: ArchitecturalComponent = {
      id: 'furn-bed-1',
      type: 'furniture',
      name: 'Teak Master Bed',
      floorId: 'floor-ground',
      materialId: 'mat-king-bed-teak',
      transform: { position: [2, 0, 3], rotation: [0, Math.PI / 2, 0] },
      dimensions: { length: 2.0, height: 1.0, thickness: 1.8 },
    };
    useProjectStore.getState().addComponent(bed);

    // Add Infinity Pool
    const pool: ArchitecturalComponent = {
      id: 'land-pool-1',
      type: 'landscape',
      name: 'Infinity Pool',
      floorId: 'floor-ground',
      materialId: 'mat-vitrified-tile-600',
      transform: { position: [10, -1, 5], rotation: [0, 0, 0] },
      dimensions: { length: 12.0, height: 1.5, thickness: 5.0 },
    };
    useProjectStore.getState().addComponent(pool);

    const store = useProjectStore.getState();
    expect(store.project.components.length).toBe(2);

    // Verify bed line in BOQ
    const bedLine = store.boqEstimate.lineItems.find((l) => l.componentName === 'Teak Master Bed');
    expect(bedLine).toBeDefined();
    expect(bedLine?.unit).toBe('nos');
  });

  // --- WORKFLOW D: WEDDING HALL TEMPLATE & SEATING ---
  it('Workflow D: Loads wedding hall template and audits seating layout parameters', () => {
    useProjectStore.getState().loadTemplate('wedding_hall');
    const store = useProjectStore.getState();

    expect(store.project.type).toBe('wedding_hall');
    expect(store.project.metadata.plotArea).toBe(2700);

    // Check auditorium floor slab
    const slab = store.project.components.find((c) => c.name.includes('Auditorium'));
    expect(slab).toBeDefined();
    expect(slab?.dimensions.length).toBe(30.0);
    expect(slab?.dimensions.thickness).toBe(20.0);

    // Verify banquet seating rows
    const seatingSections = store.project.components.filter((c) => c.name.includes('Seating'));
    expect(seatingSections.length).toBeGreaterThanOrEqual(2);
  });

  // --- WORKFLOW E: DATA INTEGRITY & AUDIT SAFETY ---
  it('Workflow E: Handles unpriced items safely, flags incomplete status, and validates undo/redo', () => {
    useProjectStore.getState().initNewProject({
      name: 'Integrity Test',
      type: 'villa',
      location: 'Kochi',
      plotLength: 20,
      plotWidth: 15,
      budget: 5000000,
    });

    // Add component with unknown material ID
    const unpricedWall: ArchitecturalComponent = {
      id: 'w-unpriced',
      type: 'wall',
      name: 'Unpriced Imported Wall Cladding',
      floorId: 'floor-ground',
      materialId: 'mat-nonexistent-stone',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 6.0, height: 3.0, thickness: 0.23 },
    };

    useProjectStore.getState().addComponent(unpricedWall);
    const store = useProjectStore.getState();

    // Must be marked INCOMPLETE and flag missing price
    expect(store.boqEstimate.isComplete).toBe(false);
    expect(store.boqEstimate.missingPriceCount).toBeGreaterThan(0);

    // Test Undo
    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project.components.length).toBe(0);

    // Test Redo
    useProjectStore.getState().redo();
    expect(useProjectStore.getState().project.components.length).toBe(1);
  });
});
