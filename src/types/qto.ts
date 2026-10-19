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
  unit: 'm2' | 'm3' | 'kg' | 'tonne' | 'nos' | 'litre' | 'bag';
  calculationFormula: string;
  materialId: string;
  validationStatus: 'valid' | 'warning' | 'geometry_incomplete';
  validationMessage?: string;
}

export interface WallQuantityResult {
  grossArea: number;           // m2
  openingDeductions: number;   // m2
  netArea: number;             // m2
  netVolume: number;          // m3
  validationStatus: 'valid' | 'warning' | 'geometry_incomplete';
}

export interface FloorQuantityResult {
  area: number;                // m2
  concreteVolume: number;      // m3
  tilePurchaseQuantity: number; // m2 (with wastage)
}

export interface RoofQuantityResult {
  planFootprintArea: number;   // m2
  trueSurfaceArea: number;     // m2 adjusted by slope angle
}

export interface QTOSummary {
  totalWallGrossArea: number;
  totalWallNetArea: number;
  totalMasonryVolume: number;
  totalFloorArea: number;
  totalRoofArea: number;
  totalOpeningsArea: number;
  doorCount: number;
  windowCount: number;
  componentCount: number;
}

export interface QTOResult {
  records: QuantityRecord[];
  summary: QTOSummary;
  calculatedAt: string;
}
