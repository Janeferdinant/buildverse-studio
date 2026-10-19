# BuildVerse Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a realistic, interactive, browser-based architectural CAD and construction estimation platform with parametric 3D building, 2D floor plans, mathematical quantity take-off, regional Kerala pricing provenance, BOQ generation, and project management.

**Architecture:** A client-side React 19 + TypeScript application powered by Three.js/React Three Fiber for WebGL architectural rendering, Zustand for unified reactive project state, a dedicated pure-mathematics Quantity Take-Off (QTO) engine, and an authentic regional price catalog with explicit provenance flags and missing-cost alerts.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Three.js, @react-three/fiber, @react-three/drei, Zustand, Lucide React, Vitest.

**Spec:** `docs/ARCHITECTURE.md` and User Master Development Prompt.

## Global Constraints
- Primary market: Kerala, India. Default currency: INR (₹). Default units: metres, m², m³, kg, tonnes, nos.
- Never estimate physical quantities by counting pixels or reading rendered screenshots; derive purely from 3D geometry dimensions and specifications.
- Never fabricate live market prices or supplier quotes; clearly categorize rates as verified, official schedule (PWD/CPWD), supplier quote, user-entered, or illustrative placeholder.
- Never silently treat missing prices as zero; flag affected lines and project total as incomplete.
- Clean architectural CAD aesthetics: Dark slate UI (`#0f172a`), Champagne Gold accents (`#d97706`), crisp vector icons, and realistic PBR materials.

## Review Focus
1. **Wall Openings Calculation:** Subtract valid door and window openings from gross wall area to ensure net area and masonry volumes are strictly non-negative.
2. **Missing Rate Auditing:** A line item with an unpriced material must flag the BOQ with a warning badge and mark estimate as provisional/incomplete rather than silently omitting it.
3. **Parametric Snapping & Dimensional Validation:** Dimensions must enforce positive bounds (e.g. wall thickness > 0.05m, length > 0.2m) and coordinate snapping must align to grid increments.
4. **State Persistence & Reloading:** All placed 3D components, materials, dimensions, and project metadata must survive browser reloads via IndexedDB/LocalStorage.
5. **Wastage Calculations:** Configurable wastage allowances (e.g., 5-10% for tiles/masonry) must apply to purchase quantities without distorting installed geometry dimensions.

---

### Task 1: Project Scaffolding & Core Architecture Foundation
**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces: Runnable React 19 + Vite + Tailwind + Three.js application shell with Vitest testing setup.

- [ ] **Step 1: Write setup test verifying test runner and basic environment**
- [ ] **Step 2: Initialize Vite template with React + TypeScript and install core dependencies (`three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`, `zod`, `vitest`)**
- [ ] **Step 3: Configure Tailwind CSS with architectural Dark Slate and Champagne Gold design tokens**
- [ ] **Step 4: Run test to verify environment passes**
- [ ] **Step 5: Verify build with `npm run build`**

---

### Task 2: Core Domain Types & Pure Quantity Take-Off (QTO) Engine
**Files:**
- Create: `src/types/project.ts`, `src/types/pricing.ts`, `src/types/qto.ts`
- Create: `src/engine/qto.ts`
- Test: `tests/engine/qto.test.ts`

**Interfaces:**
- Produces: `calculateWallQuantity(wall: WallComponent, openings: Opening[]): QuantityRecord`
- Produces: `calculateFloorQuantity(floor: FloorComponent): QuantityRecord`
- Produces: `calculateProjectQTO(components: ArchitecturalComponent[]): QTOResult`

- [ ] **Step 1: Write failing unit tests for QTO engine (gross area, net opening subtractions, volumetric masonry cubature, tile wastage multiplier)**
- [ ] **Step 2: Run test to verify it fails (`npx vitest run tests/engine/qto.test.ts`)**
- [ ] **Step 3: Implement domain types in `src/types/` and deterministic calculation functions in `src/engine/qto.ts`**
- [ ] **Step 4: Run test to verify all calculation tests pass**

---

### Task 3: Regional Kerala Price Catalog & BOQ Cost Engine
**Files:**
- Create: `src/data/keralaPricingCatalog.ts`
- Create: `src/engine/costEstimator.ts`
- Test: `tests/engine/costEstimator.test.ts`

**Interfaces:**
- Consumes: `QTOResult` from Task 2.
- Produces: `calculateBOQ(qto: QTOResult, catalog: PriceRecord[], settings: CostSettings): BOQEstimate`

- [ ] **Step 1: Write failing unit tests for BOQ Cost Engine (direct cost calculation, labour addition, GST computation, missing price detection, incomplete estimate flags)**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement authentic Kerala PWD/market catalog with clear provenance metadata in `src/data/keralaPricingCatalog.ts`**
- [ ] **Step 4: Implement `calculateBOQ` in `src/engine/costEstimator.ts` handling direct costs, labour, equipment, GST, contingency, and missing price auditing**
- [ ] **Step 5: Run tests to verify all cost and BOQ calculation tests pass**

---

### Task 4: Unified Reactive Project Store & Persistence Repository
**Files:**
- Create: `src/store/projectStore.ts`
- Create: `src/store/editorStore.ts`
- Create: `src/services/storageRepository.ts`
- Create: `src/data/templates/modernVillaTemplate.ts`
- Create: `src/data/templates/weddingHallTemplate.ts`
- Create: `src/data/templates/resortTemplate.ts`
- Test: `tests/store/projectStore.test.ts`

**Interfaces:**
- Produces: `useProjectStore` (active project, component add/update/delete, template loading, save/load, autosave status, undo/redo).
- Produces: `useEditorStore` (active tool, selected component ID, view mode, grid snapping, camera preset).

- [ ] **Step 1: Write failing tests for store actions (adding wall, modifying dimensions, calculating derived QTO/BOQ on change, persistence to localStorage)**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `storageRepository.ts` with local persistence and export/import capability**
- [ ] **Step 4: Implement `projectStore.ts` with automatic recalculation of QTO/BOQ whenever 3D components or prices change**
- [ ] **Step 5: Create complete starter templates (`Modern Kerala Villa`, `Wedding & Convention Hall`, `Resort Cottage`)**
- [ ] **Step 6: Run test to verify store and template tests pass**

---

### Task 5: 3D CAD Viewport & Parametric Geometry Visualizer
**Files:**
- Create: `src/components/viewport/CADViewport.tsx`
- Create: `src/components/viewport/SceneLighting.tsx`
- Create: `src/components/viewport/GridAndAxes.tsx`
- Create: `src/components/viewport/ParametricWallMesh.tsx`
- Create: `src/components/viewport/ParametricFloorMesh.tsx`
- Create: `src/components/viewport/ParametricOpeningMesh.tsx`
- Create: `src/components/viewport/ParametricRoofMesh.tsx`
- Create: `src/components/viewport/FurnitureMesh.tsx`
- Create: `src/components/viewport/FirstPersonWalkthrough.tsx`
- Create: `src/components/viewport/MeasurementOverlay.tsx`

**Interfaces:**
- Consumes: `useProjectStore`, `useEditorStore`.
- Produces: High-fidelity interactive WebGL 3D CAD canvas with camera controls, orbit/pan/zoom, component raycasting selection, real-time parametric mesh regeneration on dimension edits.

- [ ] **Step 1: Implement `CADViewport.tsx` with Canvas, OrbitControls, and architectural camera presets (Top, Front, Side, Isometric, Perspective)**
- [ ] **Step 2: Implement `SceneLighting.tsx` (PBR sun directional light, soft ambient fill, contact ground shadow, day/night mode toggle)**
- [ ] **Step 3: Implement parametric 3D wall mesh with cutout geometry for doors and windows**
- [ ] **Step 4: Implement floor slabs, roofs (pitched & flat RCC), and interior/landscape object renderers**
- [ ] **Step 5: Implement interactive selection raycasting, transform gizmo / dimensional draggers, and measurement dimension tags**

---

### Task 6: Studio Interface: Toolbar, Asset Catalog & Parametric Inspector
**Files:**
- Create: `src/components/layout/StudioHeader.tsx`
- Create: `src/components/layout/StudioSidebar.tsx`
- Create: `src/components/layout/AssetCatalogDrawer.tsx`
- Create: `src/components/inspector/ComponentInspector.tsx`
- Create: `src/components/inspector/MaterialSelector.tsx`
- Create: `src/components/inspector/DimensionEditor.tsx`

**Interfaces:**
- Produces: Professional dark-slate CAD workbench with live parametric property inputs (length, height, thickness, elevation, material assignment, opening offsets).

- [ ] **Step 1: Build `StudioHeader.tsx` with project title, floor switcher, camera preset buttons, snap toggles, undo/redo, save indicator, and export triggers**
- [ ] **Step 2: Build `AssetCatalogDrawer.tsx` allowing one-click placement of walls, doors, windows, slabs, roofs, and categorized furnishings**
- [ ] **Step 3: Build `ComponentInspector.tsx` with strict numeric input validation for dimensions and material assignments**

---

### Task 7: Architectural 2D Drawing & Floor Plan Engine
**Files:**
- Create: `src/components/drawings/FloorPlan2D.tsx`
- Create: `src/components/drawings/RoomSchedule.tsx`
- Create: `src/services/svgExporter.ts`

**Interfaces:**
- Consumes: 3D component coordinates and dimensions from `useProjectStore`.
- Produces: Scaled architectural 2D vector floor plan with walls, door swing arcs, window openings, room labels, dimensional strings, and SVG export.

- [ ] **Step 1: Implement 2D projection renderer projecting 3D walls, openings, and slabs into top-down architectural drawing conventions**
- [ ] **Step 2: Add dynamic dimensional lines and room area labels**
- [ ] **Step 3: Implement SVG export utility for downloading vector floor plans**

---

### Task 8: Quantity Take-Off & Construction Cost Estimator (BOQ) Workbench
**Files:**
- Create: `src/components/estimation/QuantityTakeOffTable.tsx`
- Create: `src/components/estimation/BOQEstimatorTable.tsx`
- Create: `src/components/estimation/PriceCatalogManager.tsx`
- Create: `src/services/csvExporter.ts`

**Interfaces:**
- Produces: Interactive bottom dock with searchable QTO audit records, editable unit rates, price provenance badges, missing-rate alerts, cost summary breakdown, and CSV export.

- [ ] **Step 1: Implement `QuantityTakeOffTable.tsx` detailing every architectural element, formula, deductions, and wastage**
- [ ] **Step 2: Implement `BOQEstimatorTable.tsx` with work packages, composite rates, GST calculation, and missing-price banners**
- [ ] **Step 3: Implement `PriceCatalogManager.tsx` allowing users to inspect Kerala PWD rates and input local market quotes**
- [ ] **Step 4: Implement CSV export for the full Bill of Quantities**

---

### Task 9: Project Management Dashboard & Creation Wizard
**Files:**
- Create: `src/components/dashboard/ProjectDashboard.tsx`
- Create: `src/components/dashboard/ProjectWizardModal.tsx`
- Create: `src/components/dashboard/ProjectCard.tsx`

**Interfaces:**
- Produces: Multi-project management screen with project cards, search/filter, template selection, and guided wizard.

- [ ] **Step 1: Build `ProjectWizardModal.tsx` collecting site dimensions (length/width in metres), building type, budget, and Kerala region**
- [ ] **Step 2: Build `ProjectDashboard.tsx` displaying existing projects, recent activity, budget variance, and template pickers**

---

### Task 10: Construction Scheduling, Financial Analysis & Formal Reports
**Files:**
- Create: `src/components/schedule/ConstructionGantt.tsx`
- Create: `src/components/financials/FinancialAnalysisView.tsx`
- Create: `src/components/reports/ProjectReportModal.tsx`

**Interfaces:**
- Produces: Construction milestone schedule with progress bars, commercial ROI/break-even calculator for event halls/resorts, and printable PDF/report summary.

- [ ] **Step 1: Implement `ConstructionGantt.tsx` with task timelines (Earthwork, Substructure, Masonry, Slab Casting, Plastering, MEP, Finishes)**
- [ ] **Step 2: Implement `FinancialAnalysisView.tsx` calculating event hall bookings, seat turnover, resort room rates, and payback period**
- [ ] **Step 3: Implement printable architectural project summary report modal**

---

### Task 11: End-to-End Verification & Validation of Workflows A to E
**Files:**
- Create: `tests/integration/workflowVerification.test.ts`
- Run: Full suite of unit & integration tests, browser build check, and linting.

- [ ] **Step 1: Test Workflow A: Create, edit, and save 3D villa; verify geometry persists**
- [ ] **Step 2: Test Workflow B: Assign materials, modify price, recalculate BOQ, export CSV**
- [ ] **Step 3: Test Workflow C: Furnishings and landscape placement persistence**
- [ ] **Step 4: Test Workflow D: Wedding hall template with seating capacity calculation**
- [ ] **Step 5: Test Workflow E: Data integrity tests for missing prices, negative dimensions, and undo/redo**
- [ ] **Step 6: Run `npm run test` and `npm run build` to confirm 100% clean build**
