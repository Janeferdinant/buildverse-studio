import { InteriorDesignAlternative, ShoppingListItem } from '../types/interior';

export function exportShoppingListToCSV(alternative: InteriorDesignAlternative, roomName: string = 'Room'): void {
  const headers = [
    'Category',
    'Product Name',
    'Brand / Maker',
    'Retailer',
    'Unit Price (INR)',
    'Quantity',
    'Total Price (INR)',
    'Dimensions (m: L x W x H)',
    'Delivery Charge (INR)',
    'Installation Charge (INR)',
    'Product URL',
    'Procurement Status',
    'Notes'
  ];

  const rows = alternative.shoppingList.map((item: ShoppingListItem) => {
    const dims = item.dimensions 
      ? `${item.dimensions.length}m x ${item.dimensions.thickness}m x ${item.dimensions.height}m` 
      : 'Unspecified';
    
    return [
      `"${item.category}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.brand}"`,
      `"${item.retailer}"`,
      item.unitPrice,
      item.quantity,
      item.totalPrice,
      `"${dims}"`,
      item.deliveryCharge || 0,
      item.installationCharge || 0,
      `"${item.productUrl}"`,
      `"${item.status}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ];
  });

  // Summary rows
  const budget = alternative.budget;
  const summaryRows = [
    [],
    ['--- BUDGET SUMMARY ---'],
    ['Furniture Subtotal', '', '', '', budget.furnitureSubtotal],
    ['Finishes Subtotal', '', '', '', budget.finishesSubtotal],
    ['Lighting Subtotal', '', '', '', budget.lightingSubtotal],
    ['Decoration Subtotal', '', '', '', budget.decorSubtotal],
    ['Delivery Charges', '', '', '', budget.deliverySubtotal],
    ['Installation Charges', '', '', '', budget.installationSubtotal],
    ['Direct Subtotal', '', '', '', budget.directTotal],
    ['GST (18%)', '', '', '', budget.gstAmount],
    ['Project Contingency (5%)', '', '', '', budget.contingencyAmount],
    ['GRAND TOTAL ESTIMATED BUDGET', '', '', '', budget.grandTotal]
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    ...summaryRows.map((r) => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${roomName.replace(/\s+/g, '_')}_Interior_Shopping_List.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInteriorProjectJSON(alternative: InteriorDesignAlternative, roomName: string): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(alternative, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `${roomName.replace(/\s+/g, '_')}_Interior_Design.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
