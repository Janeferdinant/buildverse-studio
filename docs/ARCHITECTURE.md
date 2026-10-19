# BUILDVERSE STUDIO — ARCHITECTURE SPECIFICATION

## 1. System Overview & Mission

**BuildVerse Studio** is a professional, interactive, browser-based architectural CAD and construction simulation platform. It unites:
1. **Interactive 3D Architectural CAD Modeling**: Parametric walls, floor slabs, doors, windows, roofs, stairs, columns, and interior/landscape components with real-world dimensions and coordinate snapping.
2. **Synchronized 2D Architectural Drawings**: Top-down floor plans, dimension overlays, elevations, and door/window schedules synchronized with the 3D model.
3. **Deterministic Quantity Take-Off (QTO) Engine**: Pure geometric and mathematical calculations derived from the 3D scene (gross/net wall areas, wall volumes, floor areas, opening deductions, unit counts, and configured wastage).
4. **Authentic Construction Cost Estimation (BOQ)**: Kerala (India) CPWD/PWD-aligned and local market pricing records with provenance tracking (verified rates, official schedule rates, supplier quotations, user rates, or illustrative placeholders). Missing rates trigger explicit warnings.
5. **Project Management, Scheduling & Financials**: Multi-project dashboard, Gantt construction scheduling, and business scenario modeling (wedding hall seating/capacity analysis, resort revenue, ROI/payback).

---

## 2. Core Architecture & Technology Stack

```
+-------------------------------------------------------------------------------------------------+
|                                        BUILDVERSE STUDIO                                        |
+-------------------------------------------------------------------------------------------------+
|                                         PRESENTATION                                            |
|  +---------------------------+  +-------------------------------+  +-------------------------+  |
|  |     Asset / Component     |  |       Interactive 3D          |  |   Parametric Inspector  |  |
|  |     Catalog Sidebar       |  |      Viewport (Three.js)      |  |   & Material Studio     |  |
|  +---------------------------+  +-------------------------------+  +-------------------------+  |
|  |           Top Toolbar: Navigation, Camera Presets, Undo/Redo, Snap Toggle, Save, Export   |  |
|  |      Bottom Dock: 2D Floor Plans, QTO Audit Trail, BOQ Cost Estimator, Schedule, Reports  |  |
+-------------------------------------------------------------------------------------------------+
|                                      APPLICATION STATE (Zustand)                                |
|  - projectStore: active project, metadata, save/autosave status, undo/redo history              |
|  - editorStore: tool selection, active floor, camera mode, snap settings, selection hierarchy   |
|  - catalogStore: material specs, product models, regional price records with provenance         |
|  - estimateStore: derived QTO records, BOQ line items, tax/wastage/contingency configuration    |
+-------------------------------------------------------------------------------------------------+
|                                      CORE DOMAIN ENGINES                                        |
|  +-----------------------+  +------------------------+  +------------------------------------+  |
|  | 3D Geometry & Cad     |  | Pure Quantity Take-Off |  | Construction Estimation & BOQ      |  |
|  | - Parametric meshing  |  | - Geometric net areas  |  | - Direct & indirect costs          |  |
|  | - Wall openings       |  | - Volumetric cubature  |  | - Wastage & tax tiers (GST)        |  |
|  | - Snapping & grid     |  | - Opening subtractions |  | - Provenance validation flags      |  |
|  | - First-person walker |  | - Unit conversions     |  | - Missing-rate auditing            |  |
|  +-----------------------+  +------------------------+  +------------------------------------+  |
+-------------------------------------------------------------------------------------------------+
|                                      PERSISTENCE & REPOSITORIES                                 |
|  - IProjectRepository (Local IndexedDB/LocalStorage -> Future PostgreSQL/Prisma REST API)       |
|  - IPriceCatalogRepository (Local Kerala Catalog -> Remote Regional Schedule Rates)             |
|  - Export Engines (JSON project files, CSV BOQ exports, SVG 2D Floor Plans, Print Reports)     |
+-------------------------------------------------------------------------------------------------+
```

### Stack Choices
- **UI Framework**: React 19 + TypeScript (Strict Mode).
- **Styling**: Tailwind CSS with architectural Dark Slate theme (`#0f172a`, `#1e293b`), Champagne Gold (`#d97706`), Warm Terracotta (`#ea580c`), and Slate-muted accents.
- **3D Graphics Engine**: Three.js & `@react-three/fiber` + `@react-three/drei` for declarative WebGL scene graph, realistic PBR materials, directional shadows, and orbit/fly controls.
- **State Management**: `zustand` with persistence and temporal undo/redo middleware.
- **Form Validation**: `zod` for dimensional and budgetary constraints.
- **Icons**: `lucide-react` for crisp vector CAD iconography.
- **Exports**: Native SVG generation for floor plans, RFC 4180 CSV export for BOQ, and print CSS for formal reports.

---

## 3. Coordinate System & Measurement Conventions

- **World Units**: Metric (1.0 Three.js unit = 1.0 metre).
- **Coordinate Axes**:
  - $X$: East / Width axis (horizontal).
  - $Y$: Elevation / Height axis (vertical, $Y = 0$ is ground level).
  - $Z$: North / Depth axis.
- **Default Dimensions**:
  - Exterior Walls: 0.23m (9-inch brick/block standard in Kerala).
  - Interior Partitions: 0.12m (4.5-inch brick/block).
  - Standard Ceiling Height: 3.0m.
  - Standard Doors: 0.9m or 1.0m width $\times$ 2.1m height $\times$ 0.12m frame.
  - Standard Windows: 1.2m or 1.5m width $\times$ 1.2m height, sill level at 0.9m.
  - Floor Slab: 0.15m reinforced concrete.
- **Default Currency**: Indian Rupees (INR, ₹).
- **Primary Regional Focus**: Kerala, India (supporting CPWD rates, local labour norms, monsoon-ready slope roof considerations, and GST classifications).

---

## 4. Domain Data Model & Schemas

### 4.1 Project & Building Hierarchy
```typescript
export interface Project {
  id: string;
  name: string;
  type: 'villa' | 'wedding_hall' | 'resort' | 'commercial' | 'landscape';
  description?: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    location: string;
    plotLength: number; // metres
    plotWidth: number;  // metres
    plotArea: number;   // sq metres
    floorsCount: number;
    budget: number;     // INR
    currency: string;
    style: string;
    region: string;     // 'kerala_in'
    buildingCodeProfile: string;
  };
  site: SiteBoundary;
  floors: FloorLevel[];
  components: ArchitecturalComponent[];
  furnishings: InteriorObject[];
  landscapeItems: LandscapeObject[];
  scheduleTasks: ScheduleTask[];
  financialAssumptions?: FinancialScenario;
}
```

### 4.2 Parametric Architectural Components
```typescript
export interface ArchitecturalComponent {
  id: string;
  type: 'wall' | 'floor' | 'roof' | 'door' | 'window' | 'column' | 'beam' | 'stair';
  name: string;
  floorId: string;
  materialId: string;
  // Geometric parameters
  transform: {
    position: [number, number, number]; // [x, y, z] in metres
    rotation: [number, number, number]; // euler [rx, ry, rz] in radians
    scale?: [number, number, number];
  };
  dimensions: {
    length: number;    // metres
    height: number;    // metres
    thickness: number; // metres
    pitch?: number;    // degrees for roofs
    sillHeight?: number; // metres from floor for windows
  };
  openings?: {
    id: string;
    componentId: string; // door/window ID
    offset: number;      // offset along wall length (metres)
    width: number;
    height: number;
    sillHeight: number;
  }[];
  properties?: Record<string, any>;
}
```

### 4.3 Material & Regional Price Provenance Model
```typescript
export type PriceSourceType = 
  | 'verified_market_rate'
  | 'official_schedule_rate'
  | 'supplier_quotation'
  | 'user_entered'
  | 'historical_rate'
  | 'illustrative_placeholder';

export interface PriceRecord {
  id: string;
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  specification: string;
  unit: 'm2' | 'm3' | 'kg' | 'tonne' | 'nos' | 'litre' | 'bag';
  unitRate: number;      // in specified currency (INR)
  currency: string;
  region: string;        // 'Kerala - Kochi / TVM'
  sourceType: PriceSourceType;
  sourceReference: string;
  effectiveDate: string;
  lastVerifiedDate: string;
  taxIncluded: boolean;
  taxRatePercent: number; // e.g. 18% GST
  labourRatePerUnit: number;
  equipmentRatePerUnit: number;
  confidence: 'high' | 'medium' | 'provisional' | 'placeholder';
  notes?: string;
}
```

### 4.4 Quantity Take-Off & Cost Engine
```typescript
export interface QuantityRecord {
  id: string;
  componentId: string;
  componentName: string;
  category: string;
  grossQuantity: number;
  deductions: number;
  netQuantity: number;
  wastagePercent: number;
  totalWithWastage: number;
  unit: string;
  calculationFormula: string;
  validationStatus: 'valid' | 'geometry_incomplete' | 'warning';
}

export interface BOQLineItem {
  id: string;
  quantityRecordId: string;
  componentName: string;
  workPackage: 'Substructure' | 'Masonry' | 'Slabs & Concrete' | 'Finishes' | 'Doors & Windows' | 'Interiors' | 'Landscaping';
  quantity: number;
  unit: string;
  materialRate: number;
  labourRate: number;
  equipmentRate: number;
  compositeUnitRate: number;
  directCost: number;
  taxAmount: number;
  totalCost: number;
  priceSource: PriceSourceType;
  isPriceMissing: boolean;
}
```

---

## 5. Architectural Quality & Aesthetic Directives
- **Palette**: Dark Slate (`#0B0F19`, `#1E293B`) with brushed metal borders (`#334155`), Champagne Gold accents (`#F59E0B`), warm wood/terracotta highlights (`#C2410C`), and crisp engineering typography (JetBrains Mono for dimensions/coordinates, Inter for UI).
- **No Voxel/Childish Look**: PBR shaders with subtle roughness, normal bumps, soft directional shadows, physical ground grid with subtle 1m and 5m accent lines, and realistic architectural proportions.
- **High-Density Studio UI**: Clean CAD ribbon top bar, asset drawer on left, multi-tab property/material inspector on right, retractable engineering dock at bottom (Tabs: 2D Floor Plan, QTO Audit Trail, BOQ Cost Estimator, Construction Gantt, Financial Analysis).
