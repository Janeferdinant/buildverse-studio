import { create } from 'zustand';
import { Project, ArchitecturalComponent, ComponentOpening } from '../types/project';
import { PriceRecord } from '../types/pricing';
import { QTOResult } from '../types/qto';
import { calculateProjectQTO } from '../engine/qto';
import { calculateBOQ, BOQEstimate, CostSettings } from '../engine/costEstimator';
import { KERALA_PRICE_CATALOG } from '../data/keralaPricingCatalog';
import { MODERN_VILLA_TEMPLATE } from '../data/templates/modernVillaTemplate';
import { WEDDING_HALL_TEMPLATE } from '../data/templates/weddingHallTemplate';
import { RESORT_TEMPLATE } from '../data/templates/resortTemplate';
import { StorageRepository } from '../services/storageRepository';

interface ProjectState {
  project: Project;
  catalog: PriceRecord[];
  costSettings: CostSettings;
  qtoResult: QTOResult;
  boqEstimate: BOQEstimate;
  past: Project[];
  future: Project[];
  lastSavedAt: string | null;
  isDirty: boolean;

  // Actions
  initNewProject: (params: {
    name: string;
    type: 'villa' | 'wedding_hall' | 'resort' | 'commercial' | 'landscape';
    location: string;
    plotLength: number;
    plotWidth: number;
    budget: number;
  }) => void;
  loadTemplate: (type: 'villa' | 'wedding_hall' | 'resort') => void;
  loadProject: (project: Project) => void;
  saveProject: () => boolean;
  addComponent: (component: ArchitecturalComponent) => void;
  updateComponent: (id: string, partial: Partial<ArchitecturalComponent>) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  addOpening: (wallId: string, opening: ComponentOpening) => void;
  removeOpening: (wallId: string, openingId: string) => void;
  updateMaterialPrice: (materialId: string, updates: Partial<PriceRecord>) => void;
  updateCostSettings: (settings: Partial<CostSettings>) => void;
  undo: () => void;
  redo: () => void;
}

const defaultCostSettings: CostSettings = {
  contingencyPercent: 5.0,
  overheadAndProfitPercent: 10.0,
  includeTaxes: true,
};

function computeDerived(project: Project, catalog: PriceRecord[], settings: CostSettings) {
  const qtoResult = calculateProjectQTO(project.components);
  const boqEstimate = calculateBOQ(qtoResult, catalog, settings);
  return { qtoResult, boqEstimate };
}

// Initial default state is Modern Kerala Villa
const initialProject = JSON.parse(JSON.stringify(MODERN_VILLA_TEMPLATE)) as Project;
const initialCatalog = [...KERALA_PRICE_CATALOG];
const { qtoResult: initQTO, boqEstimate: initBOQ } = computeDerived(
  initialProject,
  initialCatalog,
  defaultCostSettings
);

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: initialProject,
  catalog: initialCatalog,
  costSettings: defaultCostSettings,
  qtoResult: initQTO,
  boqEstimate: initBOQ,
  past: [],
  future: [],
  lastSavedAt: null,
  isDirty: false,

  initNewProject: (params) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: params.name || 'Untitled Project',
      type: params.type,
      description: `Custom ${params.type} project at ${params.location}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        location: params.location || 'Kerala, India',
        plotLength: params.plotLength || 20,
        plotWidth: params.plotWidth || 15,
        plotArea: (params.plotLength || 20) * (params.plotWidth || 15),
        floorsCount: 1,
        budget: params.budget || 5000000,
        currency: 'INR',
        style: 'Contemporary Kerala',
        region: 'kerala_in',
        buildingCodeProfile: 'Kerala Municipality Building Rules (KMBR 2019)',
      },
      floors: [
        { id: 'floor-ground', name: 'Ground Floor', elevation: 0.0, height: 3.0 },
      ],
      components: [],
    };

    const { qtoResult, boqEstimate } = computeDerived(newProject, get().catalog, get().costSettings);
    set({
      project: newProject,
      qtoResult,
      boqEstimate,
      past: [],
      future: [],
      isDirty: true,
    });
  },

  loadTemplate: (type) => {
    let template = MODERN_VILLA_TEMPLATE;
    if (type === 'wedding_hall') template = WEDDING_HALL_TEMPLATE;
    if (type === 'resort') template = RESORT_TEMPLATE;

    const cloned = JSON.parse(JSON.stringify(template)) as Project;
    cloned.id = `proj-${Date.now()}`;
    const { qtoResult, boqEstimate } = computeDerived(cloned, get().catalog, get().costSettings);

    set({
      project: cloned,
      qtoResult,
      boqEstimate,
      past: [],
      future: [],
      isDirty: true,
    });
  },

  loadProject: (project) => {
    const { qtoResult, boqEstimate } = computeDerived(project, get().catalog, get().costSettings);
    set({
      project,
      qtoResult,
      boqEstimate,
      past: [],
      future: [],
      isDirty: false,
      lastSavedAt: project.updatedAt,
    });
  },

  saveProject: () => {
    const current = get().project;
    const ok = StorageRepository.saveProject(current);
    if (ok) {
      set({ lastSavedAt: new Date().toISOString(), isDirty: false });
    }
    return ok;
  },

  addComponent: (component) => {
    const { project, past, catalog, costSettings } = get();
    const newPast = [...past.slice(-20), JSON.parse(JSON.stringify(project))];
    const updatedComponents = [...project.components, component];
    const updatedProject: Project = {
      ...project,
      components: updatedComponents,
      updatedAt: new Date().toISOString(),
    };
    const { qtoResult, boqEstimate } = computeDerived(updatedProject, catalog, costSettings);

    set({
      project: updatedProject,
      qtoResult,
      boqEstimate,
      past: newPast,
      future: [],
      isDirty: true,
    });
  },

  updateComponent: (id, partial) => {
    const { project, past, catalog, costSettings } = get();
    const newPast = [...past.slice(-20), JSON.parse(JSON.stringify(project))];
    const updatedComponents = project.components.map((c) =>
      c.id === id ? { ...c, ...partial, dimensions: { ...c.dimensions, ...(partial.dimensions || {}) } } : c
    );
    const updatedProject: Project = {
      ...project,
      components: updatedComponents,
      updatedAt: new Date().toISOString(),
    };
    const { qtoResult, boqEstimate } = computeDerived(updatedProject, catalog, costSettings);

    set({
      project: updatedProject,
      qtoResult,
      boqEstimate,
      past: newPast,
      future: [],
      isDirty: true,
    });
  },

  removeComponent: (id) => {
    const { project, past, catalog, costSettings } = get();
    const newPast = [...past.slice(-20), JSON.parse(JSON.stringify(project))];
    const updatedComponents = project.components.filter((c) => c.id !== id);
    const updatedProject: Project = {
      ...project,
      components: updatedComponents,
      updatedAt: new Date().toISOString(),
    };
    const { qtoResult, boqEstimate } = computeDerived(updatedProject, catalog, costSettings);

    set({
      project: updatedProject,
      qtoResult,
      boqEstimate,
      past: newPast,
      future: [],
      isDirty: true,
    });
  },

  duplicateComponent: (id) => {
    const comp = get().project.components.find((c) => c.id === id);
    if (!comp) return;
    const cloned: ArchitecturalComponent = JSON.parse(JSON.stringify(comp));
    cloned.id = `${comp.type}-${Date.now()}`;
    cloned.name = `${comp.name} (Copy)`;
    // Offset slightly in X and Z
    cloned.transform.position = [
      comp.transform.position[0] + 1.0,
      comp.transform.position[1],
      comp.transform.position[2] + 1.0,
    ];
    get().addComponent(cloned);
  },

  addOpening: (wallId, opening) => {
    const { project, past, catalog, costSettings } = get();
    const newPast = [...past.slice(-20), JSON.parse(JSON.stringify(project))];
    const updatedComponents = project.components.map((c) => {
      if (c.id === wallId && c.type === 'wall') {
        const openings = [...(c.openings || []), opening];
        return { ...c, openings };
      }
      return c;
    });

    const updatedProject: Project = {
      ...project,
      components: updatedComponents,
      updatedAt: new Date().toISOString(),
    };
    const { qtoResult, boqEstimate } = computeDerived(updatedProject, catalog, costSettings);

    set({
      project: updatedProject,
      qtoResult,
      boqEstimate,
      past: newPast,
      future: [],
      isDirty: true,
    });
  },

  removeOpening: (wallId, openingId) => {
    const { project, past, catalog, costSettings } = get();
    const newPast = [...past.slice(-20), JSON.parse(JSON.stringify(project))];
    const updatedComponents = project.components.map((c) => {
      if (c.id === wallId && c.type === 'wall' && c.openings) {
        return { ...c, openings: c.openings.filter((op) => op.id !== openingId) };
      }
      return c;
    });

    const updatedProject: Project = {
      ...project,
      components: updatedComponents,
      updatedAt: new Date().toISOString(),
    };
    const { qtoResult, boqEstimate } = computeDerived(updatedProject, catalog, costSettings);

    set({
      project: updatedProject,
      qtoResult,
      boqEstimate,
      past: newPast,
      future: [],
      isDirty: true,
    });
  },

  updateMaterialPrice: (materialId, updates) => {
    const { catalog, project, costSettings } = get();
    const updatedCatalog = catalog.map((p) =>
      p.materialId === materialId ? { ...p, ...updates } : p
    );
    const { qtoResult, boqEstimate } = computeDerived(project, updatedCatalog, costSettings);
    set({
      catalog: updatedCatalog,
      qtoResult,
      boqEstimate,
      isDirty: true,
    });
  },

  updateCostSettings: (settingsUpdates) => {
    const { project, catalog, costSettings } = get();
    const newSettings = { ...costSettings, ...settingsUpdates };
    const { qtoResult, boqEstimate } = computeDerived(project, catalog, newSettings);
    set({
      costSettings: newSettings,
      qtoResult,
      boqEstimate,
      isDirty: true,
    });
  },

  undo: () => {
    const { past, project, future, catalog, costSettings } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [JSON.parse(JSON.stringify(project)), ...future];
    const { qtoResult, boqEstimate } = computeDerived(previous, catalog, costSettings);

    set({
      project: previous,
      past: newPast,
      future: newFuture,
      qtoResult,
      boqEstimate,
      isDirty: true,
    });
  },

  redo: () => {
    const { past, project, future, catalog, costSettings } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, JSON.parse(JSON.stringify(project))];
    const { qtoResult, boqEstimate } = computeDerived(next, catalog, costSettings);

    set({
      project: next,
      past: newPast,
      future: newFuture,
      qtoResult,
      boqEstimate,
      isDirty: true,
    });
  },
}));
