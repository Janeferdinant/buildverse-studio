import { BOQEstimate } from '../engine/costEstimator';

/**
 * Exports Bill of Quantities to an RFC 4180 compliant CSV file
 */
export function exportBOQToCSV(projectName: string, estimate: BOQEstimate): void {
  const headers = [
    'Item #',
    'Component Name',
    'Work Package',
    'Quantity',
    'Unit',
    'Material Rate (INR)',
    'Labour Rate (INR)',
    'Equipment Rate (INR)',
    'Composite Unit Rate (INR)',
    'Direct Cost (INR)',
    'GST Tax %',
    'Tax Amount (INR)',
    'Total Cost (INR)',
    'Price Source Type',
    'Source Reference',
    'Price Status',
    'Notes',
  ];

  const rows = estimate.lineItems.map((item, idx) => [
    idx + 1,
    `"${item.componentName.replace(/"/g, '""')}"`,
    `"${item.workPackage.replace(/"/g, '""')}"`,
    item.quantity.toFixed(2),
    item.unit,
    item.materialRate.toFixed(2),
    item.labourRate.toFixed(2),
    item.equipmentRate.toFixed(2),
    item.compositeRate.toFixed(2),
    item.directCost.toFixed(2),
    `${item.taxRatePercent}%`,
    item.taxAmount.toFixed(2),
    item.totalCost.toFixed(2),
    `"${item.priceSource}"`,
    `"${(item.sourceReference || '').replace(/"/g, '""')}"`,
    item.isPriceMissing ? 'MISSING_PRICE' : 'VERIFIED',
    `"${(item.notes || '').replace(/"/g, '""')}"`,
  ]);

  // Append summary rows
  rows.push([]);
  rows.push(['', 'TOTAL DIRECT COST', '', '', '', '', '', '', '', estimate.totalDirectCost.toFixed(2)]);
  rows.push(['', 'TOTAL GST TAXES', '', '', '', '', '', '', '', estimate.totalTaxAmount.toFixed(2)]);
  rows.push(['', 'CONTRACTOR OVERHEAD & PROFIT (10%)', '', '', '', '', '', '', '', estimate.overheadAmount.toFixed(2)]);
  rows.push(['', 'CONTINGENCY ALLOWANCE (5%)', '', '', '', '', '', '', '', estimate.contingencyAmount.toFixed(2)]);
  rows.push(['', 'ESTIMATED GRAND TOTAL (INR)', '', '', '', '', '', '', '', estimate.grandTotal.toFixed(2)]);
  rows.push(['', 'COST PER SQ. METRE', '', '', '', '', '', '', '', `${estimate.costPerSqMetre.toFixed(2)} INR/m²`]);
  rows.push(['', 'ESTIMATE STATUS', '', '', '', '', '', '', '', estimate.isComplete ? 'COMPLETE' : 'INCOMPLETE (MISSING RATES)']);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_BOQ_estimate.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
