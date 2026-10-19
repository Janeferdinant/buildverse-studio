import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '@/store/projectStore';
import { ArchitecturalComponent } from '@/types/project';

describe('Unified Reactive Project Store', () => {
  beforeEach(() => {
    // Reset store state
    useProjectStore.getState().initNewProject({
      name: 'Test Project',
      type: 'villa',
      location: 'Kochi, Kerala',
      plotLength: 20,
      plotWidth: 15,
      budget: 6500000,
    });
  });

  it('initializes a project and auto-computes empty QTO & BOQ', () => {
    const state = useProjectStore.getState();
    expect(state.project.name).toBe('Test Project');
    expect(state.project.metadata.plotArea).toBe(300);
    expect(state.qtoResult.records.length).toBe(0);
    expect(state.boqEstimate.grandTotal).toBe(0);
  });

  it('automatically recalculates QTO and BOQ when a wall is added', () => {
    const wall: ArchitecturalComponent = {
      id: 'w-test',
      type: 'wall',
      name: 'Living Room North Wall',
      floorId: 'ground',
      materialId: 'mat-brick-9in',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 8.0, height: 3.0, thickness: 0.23 },
    };

    useProjectStore.getState().addComponent(wall);

    const state = useProjectStore.getState();
    expect(state.project.components.length).toBe(1);
    expect(state.qtoResult.summary.totalWallGrossArea).toBe(24.0);
    // Masonry net volume = 24 * 0.23 = 5.52 m3
    expect(state.qtoResult.summary.totalMasonryVolume).toBeCloseTo(5.52, 2);
    // BOQ has masonry line and plaster line
    expect(state.boqEstimate.lineItems.length).toBeGreaterThanOrEqual(2);
    expect(state.boqEstimate.grandTotal).toBeGreaterThan(0);
  });

  it('updates dimensions and re-derives quantities reactively', () => {
    const wall: ArchitecturalComponent = {
      id: 'w-stretch',
      type: 'wall',
      name: 'Stretching Wall',
      floorId: 'ground',
      materialId: 'mat-brick-9in',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 5.0, height: 3.0, thickness: 0.23 },
    };

    useProjectStore.getState().addComponent(wall);
    expect(useProjectStore.getState().qtoResult.summary.totalWallGrossArea).toBe(15.0);

    // Update length to 10m
    useProjectStore.getState().updateComponent('w-stretch', {
      dimensions: { length: 10.0, height: 3.0, thickness: 0.23 },
    });

    expect(useProjectStore.getState().qtoResult.summary.totalWallGrossArea).toBe(30.0);
  });

  it('supports undo and redo for component modifications', () => {
    const wall: ArchitecturalComponent = {
      id: 'w-undo',
      type: 'wall',
      name: 'Undo Wall',
      floorId: 'ground',
      materialId: 'mat-brick-9in',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 4.0, height: 3.0, thickness: 0.23 },
    };

    useProjectStore.getState().addComponent(wall);
    expect(useProjectStore.getState().project.components.length).toBe(1);

    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project.components.length).toBe(0);

    useProjectStore.getState().redo();
    expect(useProjectStore.getState().project.components.length).toBe(1);
  });
});
