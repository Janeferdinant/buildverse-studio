import { ArchitecturalComponent } from '../types/project';
import {
  QuantityRecord,
  WallQuantityResult,
  FloorQuantityResult,
  RoofQuantityResult,
  QTOResult,
  QTOSummary,
} from '../types/qto';

/**
 * Calculates wall gross area, opening deductions, net area, and net masonry volume.
 * Never estimates from pixels — uses exact 3D geometric dimensions.
 */
export function calculateWallQuantity(wall: ArchitecturalComponent): WallQuantityResult {
  const length = Math.max(0, wall.dimensions.length || 0);
  const height = Math.max(0, wall.dimensions.height || 0);
  const thickness = Math.max(0, wall.dimensions.thickness || 0.23);

  const grossArea = length * height;

  let totalOpeningArea = 0;
  if (wall.openings && wall.openings.length > 0) {
    for (const op of wall.openings) {
      const opW = Math.max(0, op.width || 0);
      const opH = Math.max(0, op.height || 0);
      totalOpeningArea += opW * opH;
    }
  }

  const netArea = Math.max(0, grossArea - totalOpeningArea);
  const netVolume = netArea * thickness;

  let validationStatus: 'valid' | 'warning' | 'geometry_incomplete' = 'valid';
  if (totalOpeningArea > grossArea) {
    validationStatus = 'warning';
  } else if (grossArea <= 0) {
    validationStatus = 'geometry_incomplete';
  }

  return {
    grossArea,
    openingDeductions: totalOpeningArea,
    netArea,
    netVolume,
    validationStatus,
  };
}

/**
 * Calculates floor slab area, concrete volume, and tile order quantity with wastage.
 */
export function calculateFloorQuantity(
  floor: ArchitecturalComponent,
  options?: { tileWastagePercent?: number }
): FloorQuantityResult {
  const length = Math.max(0, floor.dimensions.length || 0);
  const width = Math.max(0, floor.dimensions.thickness || 0);
  const slabDepth = Math.max(0, floor.dimensions.height || 0.15); // e.g. 0.15m RCC slab
  const wastage = options?.tileWastagePercent ?? 5.0; // 5% default tile wastage

  const area = length * width;
  const concreteVolume = area * slabDepth;
  const tilePurchaseQuantity = area * (1 + wastage / 100);

  return {
    area,
    concreteVolume,
    tilePurchaseQuantity,
  };
}

/**
 * Calculates roof plan footprint and true 3D surface area for pitched roofs.
 */
export function calculateRoofQuantity(roof: ArchitecturalComponent): RoofQuantityResult {
  const length = Math.max(0, roof.dimensions.length || 0);
  const width = Math.max(0, roof.dimensions.thickness || 0);
  const pitchDegrees = roof.dimensions.pitch ?? 0;

  const planFootprintArea = length * width;
  let slopeFactor = 1.0;

  if (pitchDegrees > 0 && pitchDegrees < 85) {
    const pitchRad = (pitchDegrees * Math.PI) / 180;
    slopeFactor = 1 / Math.cos(pitchRad);
  }

  const trueSurfaceArea = planFootprintArea * slopeFactor;

  return {
    planFootprintArea,
    trueSurfaceArea,
  };
}

/**
 * Aggregates complete project components into a structured Quantity Take-Off (QTO)
 */
export function calculateProjectQTO(components: ArchitecturalComponent[]): QTOResult {
  const records: QuantityRecord[] = [];
  const summary: QTOSummary = {
    totalWallGrossArea: 0,
    totalWallNetArea: 0,
    totalMasonryVolume: 0,
    totalFloorArea: 0,
    totalRoofArea: 0,
    totalOpeningsArea: 0,
    doorCount: 0,
    windowCount: 0,
    componentCount: components.length,
  };

  for (const comp of components) {
    if (comp.type === 'wall') {
      const q = calculateWallQuantity(comp);
      summary.totalWallGrossArea += q.grossArea;
      summary.totalWallNetArea += q.netArea;
      summary.totalMasonryVolume += q.netVolume;
      summary.totalOpeningsArea += q.openingDeductions;

      // Masonry Volume Record
      records.push({
        id: `qto-${comp.id}-masonry`,
        componentId: comp.id,
        componentName: `${comp.name} (Masonry)`,
        category: 'Masonry',
        grossQuantity: q.grossArea * comp.dimensions.thickness,
        deductions: q.openingDeductions * comp.dimensions.thickness,
        netQuantity: q.netVolume,
        wastagePercent: 3.0,
        totalWithWastage: q.netVolume * 1.03,
        unit: 'm3',
        calculationFormula: `(${comp.dimensions.length}m × ${comp.dimensions.height}m - ${q.openingDeductions.toFixed(2)}m² openings) × ${comp.dimensions.thickness}m`,
        materialId: comp.materialId,
        validationStatus: q.validationStatus,
      });

      // Plastering / Wall Paint Area Record (both faces = 2x net area)
      records.push({
        id: `qto-${comp.id}-plaster`,
        componentId: comp.id,
        componentName: `${comp.name} (Plastering & Paint)`,
        category: 'Finishes',
        grossQuantity: q.grossArea * 2,
        deductions: q.openingDeductions * 2,
        netQuantity: q.netArea * 2,
        wastagePercent: 5.0,
        totalWithWastage: q.netArea * 2 * 1.05,
        unit: 'm2',
        calculationFormula: `2 faces × (${q.grossArea.toFixed(2)}m² - ${q.openingDeductions.toFixed(2)}m²)`,
        materialId: 'mat-emulsion-paint',
        validationStatus: q.validationStatus,
      });
    } else if (comp.type === 'floor') {
      const q = calculateFloorQuantity(comp);
      summary.totalFloorArea += q.area;

      // Floor Concrete Slab
      records.push({
        id: `qto-${comp.id}-slab`,
        componentId: comp.id,
        componentName: `${comp.name} (RCC Slab)`,
        category: 'Slabs & Concrete',
        grossQuantity: q.area,
        deductions: 0,
        netQuantity: q.concreteVolume,
        wastagePercent: 2.5,
        totalWithWastage: q.concreteVolume * 1.025,
        unit: 'm3',
        calculationFormula: `${comp.dimensions.length}m × ${comp.dimensions.thickness}m × ${comp.dimensions.height}m depth`,
        materialId: 'mat-rcc-m25',
        validationStatus: 'valid',
      });

      // Floor Tiling
      records.push({
        id: `qto-${comp.id}-tile`,
        componentId: comp.id,
        componentName: `${comp.name} (Tiling)`,
        category: 'Flooring',
        grossQuantity: q.area,
        deductions: 0,
        netQuantity: q.area,
        wastagePercent: 5.0,
        totalWithWastage: q.tilePurchaseQuantity,
        unit: 'm2',
        calculationFormula: `${comp.dimensions.length}m × ${comp.dimensions.thickness}m + 5% wastage`,
        materialId: comp.materialId || 'mat-vitrified-tile-600',
        validationStatus: 'valid',
      });
    } else if (comp.type === 'roof') {
      const q = calculateRoofQuantity(comp);
      summary.totalRoofArea += q.trueSurfaceArea;

      records.push({
        id: `qto-${comp.id}-roof`,
        componentId: comp.id,
        componentName: comp.name,
        category: 'Roofing',
        grossQuantity: q.planFootprintArea,
        deductions: 0,
        netQuantity: q.trueSurfaceArea,
        wastagePercent: 7.0,
        totalWithWastage: q.trueSurfaceArea * 1.07,
        unit: 'm2',
        calculationFormula: `${comp.dimensions.length}m × ${comp.dimensions.thickness}m / cos(${comp.dimensions.pitch || 0}°)`,
        materialId: comp.materialId || 'mat-kerala-clay-tile',
        validationStatus: 'valid',
      });
    } else if (comp.type === 'door') {
      summary.doorCount += 1;
      records.push({
        id: `qto-${comp.id}`,
        componentId: comp.id,
        componentName: comp.name,
        category: 'Doors & Windows',
        grossQuantity: 1,
        deductions: 0,
        netQuantity: 1,
        wastagePercent: 0,
        totalWithWastage: 1,
        unit: 'nos',
        calculationFormula: `Piece count: 1 unit (${comp.dimensions.length}m × ${comp.dimensions.height}m)`,
        materialId: comp.materialId || 'mat-teak-door',
        validationStatus: 'valid',
      });
    } else if (comp.type === 'window') {
      summary.windowCount += 1;
      records.push({
        id: `qto-${comp.id}`,
        componentId: comp.id,
        componentName: comp.name,
        category: 'Doors & Windows',
        grossQuantity: 1,
        deductions: 0,
        netQuantity: 1,
        wastagePercent: 0,
        totalWithWastage: 1,
        unit: 'nos',
        calculationFormula: `Piece count: 1 unit (${comp.dimensions.length}m × ${comp.dimensions.height}m)`,
        materialId: comp.materialId || 'mat-upvc-window',
        validationStatus: 'valid',
      });
    } else if (comp.type === 'furniture' || comp.type === 'landscape') {
      records.push({
        id: `qto-${comp.id}`,
        componentId: comp.id,
        componentName: comp.name,
        category: comp.type === 'furniture' ? 'Interiors' : 'Landscaping',
        grossQuantity: 1,
        deductions: 0,
        netQuantity: 1,
        wastagePercent: 0,
        totalWithWastage: 1,
        unit: 'nos',
        calculationFormula: `Piece count: 1 unit`,
        materialId: comp.materialId,
        validationStatus: 'valid',
      });
    }
  }

  return {
    records,
    summary,
    calculatedAt: new Date().toISOString(),
  };
}
