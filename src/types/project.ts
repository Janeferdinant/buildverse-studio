export type ComponentType = 
  | 'wall' 
  | 'floor' 
  | 'roof' 
  | 'door' 
  | 'window' 
  | 'column' 
  | 'beam' 
  | 'stair'
  | 'furniture'
  | 'landscape';

export interface ComponentOpening {
  id: string;
  componentId: string; // door or window ID
  offset: number;      // offset from start of wall in metres
  width: number;       // metres
  height: number;      // metres
  sillHeight: number;  // metres from floor (0 for doors)
}

export interface ArchitecturalComponent {
  id: string;
  type: ComponentType;
  name: string;
  floorId: string;
  materialId: string;
  transform: {
    position: [number, number, number]; // [x, y, z] in metres
    rotation: [number, number, number]; // [rx, ry, rz] in radians
    scale?: [number, number, number];
  };
  dimensions: {
    length: number;    // metres (or width for furniture)
    height: number;    // metres
    thickness: number; // metres (or depth for slabs/furniture)
    pitch?: number;    // degrees (e.g. 20-45 deg for pitched roofs)
    sillHeight?: number; // metres for windows
    rises?: number;    // for stairs
    treads?: number;   // for stairs
  };
  openings?: ComponentOpening[];
  properties?: Record<string, any>;
}

export interface FloorLevel {
  id: string;
  name: string;
  elevation: number; // metres from ground (0.0 for ground floor)
  height: number;    // ceiling height (default 3.0m)
}

export interface ProjectMetadata {
  location: string;
  plotLength: number; // metres
  plotWidth: number;  // metres
  plotArea: number;   // sq metres
  floorsCount: number;
  budget: number;     // INR
  currency: string;   // 'INR'
  style: string;
  region: string;     // 'kerala_in'
  buildingCodeProfile: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'villa' | 'wedding_hall' | 'resort' | 'commercial' | 'landscape';
  description?: string;
  createdAt: string;
  updatedAt: string;
  metadata: ProjectMetadata;
  floors: FloorLevel[];
  components: ArchitecturalComponent[];
  scheduleTasks?: any[];
  financialAssumptions?: any;
}
