import { create } from 'zustand';

export type EditorTool = 
  | 'select'
  | 'wall'
  | 'door'
  | 'window'
  | 'floor'
  | 'roof'
  | 'furniture'
  | 'landscape'
  | 'measure'
  | 'walkthrough';

export type CameraViewMode = 
  | 'orbit'
  | 'top'
  | 'front'
  | 'side'
  | 'isometric'
  | 'first_person';

export type ActiveDockTab = 
  | 'floorplan'
  | 'qto'
  | 'boq'
  | 'catalog'
  | 'schedule'
  | 'financials'
  | 'reports'
  | 'none';

export type MainNavPage =
  | 'dashboard'
  | 'designer'
  | 'floorplans'
  | 'qto'
  | 'estimator'
  | 'materials'
  | 'interiors'
  | 'landscape'
  | 'schedule'
  | 'financials'
  | 'reports'
  | 'settings';

interface EditorState {
  activePage: MainNavPage;
  activeTool: EditorTool;
  selectedComponentId: string | null;
  activeFloorId: string;
  cameraMode: CameraViewMode;
  snapGridSize: number | null; // e.g. 0.1, 0.5, 1.0 or null
  showGrid: boolean;
  showMeasurements: boolean;
  dayNightMode: 'day' | 'night' | 'sunset';
  activeDockTab: ActiveDockTab;
  isDockExpanded: boolean;
  isAssetDrawerOpen: boolean;
  isPropertiesPanelOpen: boolean;

  // Actions
  setActivePage: (page: MainNavPage) => void;
  setActiveTool: (tool: EditorTool) => void;
  setSelectedComponentId: (id: string | null) => void;
  setActiveFloorId: (floorId: string) => void;
  setCameraMode: (mode: CameraViewMode) => void;
  setSnapGridSize: (size: number | null) => void;
  setShowGrid: (show: boolean) => void;
  setShowMeasurements: (show: boolean) => void;
  setDayNightMode: (mode: 'day' | 'night' | 'sunset') => void;
  setActiveDockTab: (tab: ActiveDockTab) => void;
  toggleDockExpanded: () => void;
  setAssetDrawerOpen: (open: boolean) => void;
  setPropertiesPanelOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activePage: 'designer',
  activeTool: 'select',
  selectedComponentId: null,
  activeFloorId: 'floor-ground',
  cameraMode: 'orbit',
  snapGridSize: 0.5, // 0.5m default grid snap
  showGrid: true,
  showMeasurements: true,
  dayNightMode: 'day',
  activeDockTab: 'qto',
  isDockExpanded: true,
  isAssetDrawerOpen: true,
  isPropertiesPanelOpen: true,

  setActivePage: (page) => set({ activePage: page }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  setActiveFloorId: (floorId) => set({ activeFloorId: floorId }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setSnapGridSize: (size) => set({ snapGridSize: size }),
  setShowGrid: (show) => set({ showGrid: show }),
  setShowMeasurements: (show) => set({ showMeasurements: show }),
  setDayNightMode: (mode) => set({ dayNightMode: mode }),
  setActiveDockTab: (tab) => set({ activeDockTab: tab, isDockExpanded: tab !== 'none' }),
  toggleDockExpanded: () => set((state) => ({ isDockExpanded: !state.isDockExpanded })),
  setAssetDrawerOpen: (open) => set({ isAssetDrawerOpen: open }),
  setPropertiesPanelOpen: (open) => set({ isPropertiesPanelOpen: open }),
}));
