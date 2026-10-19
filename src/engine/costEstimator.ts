import { QTOResult, QuantityRecord } from '../types/qto';
import { PriceRecord, PriceSourceType } from '../types/pricing';

export interface CostSettings {
  contingencyPercent: number; // e.g. 5.0%
  overheadAndProfitPercent: number; // e.g. 10.0%
  includeTaxes: boolean;
}

export interface BOQLineItem {
  id: string;
  quantityRecordId: string;
  componentName: string;
  workPackage: string;
  quantity: number;
  unit: string;
  materialRate: number;
  materialCost: number;
  labourRate: number;
  labourCost: number;
  equipmentRate: number;
  equipmentCost: number;
  compositeRate: number; // materialRate + labourRate + equipmentRate
  directCost: number;
  taxRatePercent: number;
  taxAmount: number;
  totalCost: number; // directCost + taxAmount
  priceSource: PriceSourceType;
  sourceReference: string;
  isPriceMissing: boolean;
  notes?: string;
}

export interface BOQEstimate {
  lineItems: BOQLineItem[];
  totalMaterialCost: number;
  totalLabourCost: number;
  totalEquipmentCost: number;
  totalDirectCost: number;
  totalTaxAmount: number;
  contingencyAmount: number;
  overheadAmount: number;
  grandTotal: number;
  costPerSqMetre: number;
  currency: string;
  isComplete: boolean;
  missingPriceCount: number;
  calculatedAt: string;
}

/**
 * Calculates itemized BOQ, direct/labour/machinery costs, GST taxes, and indirect markups.
 * Flags missing prices and marks estimate as incomplete instead of assuming 0.
 */
export function calculateBOQ(
  qto: QTOResult,
  catalog: PriceRecord[],
  settings: CostSettings = { contingencyPercent: 5, overheadAndProfitPercent: 10, includeTaxes: true }
): BOQEstimate {
  const lineItems: BOQLineItem[] = [];
  let totalMaterialCost = 0;
  let totalLabourCost = 0;
  let totalEquipmentCost = 0;
  let totalDirectCost = 0;
  let totalTaxAmount = 0;
  let missingPriceCount = 0;

  // Build price lookup map by materialId
  const priceMap = new Map<string, PriceRecord>();
  for (const price of catalog) {
    priceMap.set(price.materialId, price);
  }

  for (const record of qto.records) {
    const priceRecord = priceMap.get(record.materialId);

    if (!priceRecord) {
      // Missing price! Flag line and total as incomplete
      missingPriceCount++;
      lineItems.push({
        id: `boq-${record.id}`,
        quantityRecordId: record.id,
        componentName: record.componentName,
        workPackage: record.category,
        quantity: record.totalWithWastage,
        unit: record.unit,
        materialRate: 0,
        materialCost: 0,
        labourRate: 0,
        labourCost: 0,
        equipmentRate: 0,
        equipmentCost: 0,
        compositeRate: 0,
        directCost: 0,
        taxRatePercent: 0,
        taxAmount: 0,
        totalCost: 0,
        priceSource: 'illustrative_placeholder',
        sourceReference: 'No price record available',
        isPriceMissing: true,
        notes: `Price unavailable in catalog for material ID: "${record.materialId}"`,
      });
      continue;
    }

    const qty = record.totalWithWastage;
    const materialCost = qty * priceRecord.unitRate;
    const labourCost = qty * priceRecord.labourRatePerUnit;
    const equipmentCost = qty * priceRecord.equipmentRatePerUnit;
    const directCost = materialCost + labourCost + equipmentCost;

    let taxAmount = 0;
    if (settings.includeTaxes && !priceRecord.taxIncluded && priceRecord.taxRatePercent > 0) {
      taxAmount = directCost * (priceRecord.taxRatePercent / 100);
    }

    const totalCost = directCost + taxAmount;

    totalMaterialCost += materialCost;
    totalLabourCost += labourCost;
    totalEquipmentCost += equipmentCost;
    totalDirectCost += directCost;
    totalTaxAmount += taxAmount;

    lineItems.push({
      id: `boq-${record.id}`,
      quantityRecordId: record.id,
      componentName: record.componentName,
      workPackage: record.category,
      quantity: qty,
      unit: record.unit,
      materialRate: priceRecord.unitRate,
      materialCost,
      labourRate: priceRecord.labourRatePerUnit,
      labourCost,
      equipmentRate: priceRecord.equipmentRatePerUnit,
      equipmentCost,
      compositeRate: priceRecord.unitRate + priceRecord.labourRatePerUnit + priceRecord.equipmentRatePerUnit,
      directCost,
      taxRatePercent: priceRecord.taxRatePercent,
      taxAmount,
      totalCost,
      priceSource: priceRecord.sourceType,
      sourceReference: priceRecord.sourceReference,
      isPriceMissing: false,
      notes: priceRecord.notes,
    });
  }

  // Overhead & Profit (computed on direct cost)
  const overheadAmount = totalDirectCost * (settings.overheadAndProfitPercent / 100);

  // Contingency (computed on direct cost + overhead)
  const contingencyBasis = totalDirectCost + overheadAmount;
  const contingencyAmount = contingencyBasis * (settings.contingencyPercent / 100);

  // Grand total
  const grandTotal = totalDirectCost + totalTaxAmount + overheadAmount + contingencyAmount;

  // Cost per square metre of total floor area
  const totalFloorArea = qto.summary.totalFloorArea > 0 ? qto.summary.totalFloorArea : 1;
  const costPerSqMetre = grandTotal / totalFloorArea;

  return {
    lineItems,
    totalMaterialCost,
    totalLabourCost,
    totalEquipmentCost,
    totalDirectCost,
    totalTaxAmount,
    contingencyAmount,
    overheadAmount,
    grandTotal,
    costPerSqMetre,
    currency: 'INR',
    isComplete: missingPriceCount === 0,
    missingPriceCount,
    calculatedAt: new Date().toISOString(),
  };
}
