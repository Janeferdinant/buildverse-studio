export type PriceSourceType = 
  | 'verified_market_rate'
  | 'official_schedule_rate'
  | 'supplier_quotation'
  | 'user_entered'
  | 'historical_rate'
  | 'illustrative_placeholder';

export type MaterialCategory = 
  | 'masonry'
  | 'concrete_and_rcc'
  | 'steel'
  | 'flooring_and_tiles'
  | 'roofing'
  | 'doors_and_windows'
  | 'finishes_and_paint'
  | 'plumbing_and_sanitary'
  | 'electrical'
  | 'furniture_and_interior'
  | 'landscaping';

export interface PriceRecord {
  id: string;
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  specification: string;
  unit: 'm2' | 'm3' | 'kg' | 'tonne' | 'nos' | 'litre' | 'bag';
  unitRate: number;              // in INR
  currency: string;              // 'INR'
  region: string;                // e.g. 'Kerala - Ernakulam / PWD Schedule'
  sourceType: PriceSourceType;
  sourceReference: string;       // e.g. 'Kerala PWD Schedule of Rates (SOR) 2024'
  effectiveDate: string;         // YYYY-MM-DD
  lastVerifiedDate: string;      // YYYY-MM-DD
  taxIncluded: boolean;          // true if GST included in unit rate
  taxRatePercent: number;        // e.g. 18 for 18% GST
  labourRatePerUnit: number;     // INR per unit for installation
  equipmentRatePerUnit: number;  // INR per unit for machinery
  confidence: 'high' | 'medium' | 'provisional' | 'placeholder';
  notes?: string;
}
