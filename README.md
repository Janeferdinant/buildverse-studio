# BuildVerse Studio — Architecture & Construction Simulation Platform

> A realistic, interactive, browser-based architectural CAD and construction estimation platform connecting 3D design, metric dimensions, pure-geometry quantity take-off, authentic regional pricing, and financial analysis.

Primary Market: **Kerala, India**  
Default Units: **Metres, m², m³, kg, tonnes, nos**  
Default Currency: **Indian Rupees (INR ₹)**  

---

## 🏗️ Highlights & Capabilities

- **Interactive 3D Architectural CAD Viewport:** Built on WebGL via Three.js and React Three Fiber. Supports orbit, pan, zoom, orthographic top plan, front/side elevations, ground grid with 1m and 5m divisions, PBR materials, soft directional shadows, and Day / Sunset / Night lighting simulations.
- **Parametric Architectural Elements:**
  - **Walls:** Real-time geometric regeneration with parametric cutouts for door and window openings.
  - **Floor Slabs:** Reinforced concrete slabs with tile bed finishes.
  - **Pitched Roofs:** Kerala clay tile sloping roofs with configurable pitch angle (e.g. 30°), ridge caps, and true surface area expansion calculations.
  - **Openings:** Handcrafted teak wood doors with brass handles; multi-chambered UPVC casement windows with translucent glazed panes.
  - **Interiors & Landscaping:** Living room sofas, king size teak beds, banquet tables, banquet chairs, Bermuda lawn turf, concrete interlocking driveway pavers, and infinity swimming pools.
- **Pure-Geometry Quantity Take-Off (QTO) Engine:** Derives physical quantities purely from 3D geometry dimensions without pixel estimation. Automatically deducts valid door/window openings, computes masonry cubature, applies configurable wastage allowances (e.g. 5% tiles, 3% brickwork, 7% roofing), and provides an auditable calculation formula for every element.
- **Authentic Kerala Regional Pricing & BOQ:**
  - Real-world unit rates aligned with **Kerala PWD Schedule of Rates (SOR 2024)** and verified dealer quotations from Ernakulam, Nilambur, and Kochi.
  - Transparent rate provenance badges: *Official Schedule Rate*, *Verified Market Rate*, *Supplier Quotation*, and *User Entered*.
  - **Missing Price Integrity:** Missing rates are flagged with warning badges and mark the estimate as *Incomplete* rather than silently omitting them or treating them as ₹0.
  - Itemized direct costs, labour rates, equipment rates, GST tax classifications (12–18%), contractor overhead & profit (10%), and contingency allowances (5%).
- **Synchronized 2D Architectural Drawings:** Top-down vector floor plans with architectural door swing arcs, window double-glass lines, dimension strings, door/window schedules, floor area statements, and SVG export.
- **Multi-Project Management & Guided Creation Wizard:** Create custom projects with Kerala plot dimensions (metres & cents), budget targets, and building standards (KMBR 2019 / NBC India).
- **Starter Templates:**
  1. *Kerala Contemporary Tropical Villa* (2-storey, 120m² ground footprint, clay roof).
  2. *Grand Royal Convention & Wedding Hall* (1000-seat 30m × 20m auditorium, mandap stage, 80-car parking).
  3. *Kerala Backwater Eco-Resort & Spa* (laterite stone cottages, lake sit-outs, infinity pool).
- **Commercial Financials & Construction Scheduling:** 28-week Gantt timeline with phased milestones, plus event hall booking & resort room occupancy ROI calculators.
- **Exports:** RFC 4180 CSV export for the Bill of Quantities, downloadable SVG architectural drawings, JSON project backups, and a formal printable engineering report.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript (Strict Mode), Vite.
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`.
- **Styling:** Tailwind CSS with architectural Dark Slate theme (`#090d16`, `#0f172a`, `#1e293b`), Champagne Gold (`#d97706`), and Blueprint Blue (`#0284c7`).
- **State Management:** Zustand with temporal undo/redo history.
- **Icons:** Lucide React.
- **Testing:** Vitest (17 unit and integration tests passing).

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### Setup Instructions

1. Clone or navigate to the repository directory:
   ```bash
   cd buildverse_studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` (or the terminal URL).

4. Run automated tests:
   ```bash
   npm run test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🧪 Verification Workflows Tested

All acceptance criteria defined in Section 23 of the Master Prompt are automated in `tests/integration/workflowVerification.test.ts`:

- **Workflow A (Create & Save Building):** Created villa, modified wall dimensions, added door and window openings, verified that gross and net areas updated dynamically, saved to storage, and confirmed persistence upon reloading.
- **Workflow B (Cost Estimation):** Assigned material rates, modified rates in the catalog, verified that line items, direct costs, and GST taxes recalculated live, and validated RFC 4180 CSV export.
- **Workflow C (Interiors & Landscaping):** Placed beds, sofas, pools, and paving, verified 3D positioning and BOQ unit-count additions.
- **Workflow D (Wedding Hall):** Loaded the 1000-seat convention hall template, verified stage dimensions and banquet seating layout metrics.
- **Workflow E (Data Integrity):** Tested unpriced materials, verified incomplete status alerts, tested negative bounds handling, and confirmed undo/redo functionality.

---

## 📂 Documentation

- [docs/ARCHITECTURE.md](file:///c:/Users/Asus/Documents/Antigravity-Projects/buildverse_studio/docs/ARCHITECTURE.md) — System architecture, 3D coordinate system, domain models, and persistence abstractions.
- [docs/IMPLEMENTATION_PLAN.md](file:///c:/Users/Asus/Documents/Antigravity-Projects/buildverse_studio/docs/IMPLEMENTATION_PLAN.md) — Phased task breakdown and engineering milestones.
- [docs/FEATURE_STATUS.md](file:///c:/Users/Asus/Documents/Antigravity-Projects/buildverse_studio/docs/FEATURE_STATUS.md) — Feature status tracking matrix across all modules.
