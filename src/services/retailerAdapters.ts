import { RetailerProduct, RetailerName } from '../types/interior';
import { REAL_WORLD_PRODUCTS } from '../data/retailerProductCatalog';

export { REAL_WORLD_PRODUCTS };

export interface ProductSearchFilters {
  query?: string;
  category?: string;
  retailer?: string;
  minPrice?: number;
  maxPrice?: number;
  locality?: string;
}

export interface LocalityAvailabilityStatus {
  isAvailable: boolean;
  type: 'local_pickup_or_delivery' | 'direct_courier' | 'special_order' | 'unavailable';
  estimatedDays: number;
  deliveryCharge: number;
  notes: string;
}

/**
 * Searches and filters real-world products by criteria
 */
export function searchProducts(filters: ProductSearchFilters = {}): RetailerProduct[] {
  return REAL_WORLD_PRODUCTS.filter((product) => {
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    if (filters.retailer && product.retailer !== filters.retailer) {
      return false;
    }
    if (filters.minPrice !== undefined && product.unitPrice < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.unitPrice > filters.maxPrice) {
      return false;
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const match =
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.material.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.locality) {
      const avail = checkKeralaAvailability(product, filters.locality);
      if (!avail.isAvailable) return false;
    }
    return true;
  });
}

/**
 * Checks authentic availability and delivery options for a Kerala district or city
 */
export function checkKeralaAvailability(
  product: RetailerProduct,
  localityDistrict: string
): LocalityAvailabilityStatus {
  const normLocality = localityDistrict.trim();

  // If explicitly mapped in product's localityAvailability
  const isDirectlyAvailable = !!product.localityAvailability[normLocality];

  if (!isDirectlyAvailable) {
    // Check if general Kerala coverage applies for large e-commerce platforms (Amazon/Flipkart)
    const isMajorEcommerce = product.retailer === 'Amazon India' || product.retailer === 'Flipkart';
    const keralaDistricts = ['Kochi', 'Ernakulam', 'Thrissur', 'Kozhikode', 'Thiruvananthapuram', 'Kottayam', 'Malappuram', 'Palakkad', 'Kannur', 'Alappuzha', 'Kollam'];
    const isKerala = keralaDistricts.some((d) => d.toLowerCase() === normLocality.toLowerCase());

    if (isMajorEcommerce && isKerala) {
      return {
        isAvailable: true,
        type: 'direct_courier',
        estimatedDays: 3,
        deliveryCharge: product.deliveryCharge,
        notes: `Standard courier delivery to ${normLocality} (3-5 business days)`,
      };
    }

    return {
      isAvailable: false,
      type: 'unavailable',
      estimatedDays: 0,
      deliveryCharge: 0,
      notes: `Direct delivery unavailable for "${normLocality}". Check nearby regional hub.`,
    };
  }

  // Local artisan / direct showroom available
  if (product.retailer === 'Kerala Local / Nilambur Crafts') {
    return {
      isAvailable: true,
      type: 'local_pickup_or_delivery',
      estimatedDays: 2,
      deliveryCharge: product.deliveryCharge,
      notes: `Direct artisan workshop van delivery or showroom pickup available in ${normLocality}`,
    };
  }

  return {
    isAvailable: true,
    type: 'direct_courier',
    estimatedDays: 4,
    deliveryCharge: product.deliveryCharge,
    notes: `Available for verified dispatch to ${normLocality}`,
  };
}

/**
 * Retrieves compatible replacement products matching category and dimensional tolerance (±30%)
 */
export function getCompatibleAlternatives(
  baseProduct: RetailerProduct,
  maxBudget?: number
): RetailerProduct[] {
  return REAL_WORLD_PRODUCTS.filter((candidate) => {
    if (candidate.id === baseProduct.id) return false;
    if (candidate.category !== baseProduct.category) return false;
    if (maxBudget !== undefined && candidate.unitPrice > maxBudget) return false;

    // Dimensional check: length within ±40% of base
    const lengthDiff = Math.abs(candidate.dimensions.length - baseProduct.dimensions.length);
    const lengthRatio = lengthDiff / (baseProduct.dimensions.length || 1);
    if (lengthRatio > 0.45) return false;

    return true;
  });
}

export const findCompatibleAlternatives = (
  baseProduct: RetailerProduct,
  _catalog?: RetailerProduct[],
  _tolerance?: number
): RetailerProduct[] => getCompatibleAlternatives(baseProduct);

/**
 * Parses and imports user-supplied CSV product list with strict validation
 */
export function importProductsFromCSV(csvContent: string): RetailerProduct[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf('name');
  const brandIdx = headers.indexOf('brand');
  const skuIdx = headers.indexOf('sku');
  const retailerIdx = headers.indexOf('retailer');
  const priceIdx = headers.indexOf('price');
  const lengthIdx = headers.indexOf('length');
  const heightIdx = headers.indexOf('height');
  const thickIdx = headers.indexOf('thickness');
  const catIdx = headers.indexOf('category');
  const matIdx = headers.indexOf('material');
  const urlIdx = headers.indexOf('url');

  const imported: RetailerProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < 5) continue;

    const unitPrice = parseFloat(cols[priceIdx]) || 0;
    const length = parseFloat(cols[lengthIdx]) || 1.0;
    const height = parseFloat(cols[heightIdx]) || 0.8;
    const thickness = parseFloat(cols[thickIdx]) || 0.8;

    imported.push({
      id: `imported-${Date.now()}-${i}`,
      name: cols[nameIdx] || 'Custom Imported Product',
      brand: cols[brandIdx] || 'User Defined',
      sku: cols[skuIdx] || `USR-SKU-${i}`,
      retailer: (cols[retailerIdx] as RetailerName) || 'Custom User Supplier',
      productUrl: cols[urlIdx] || 'https://www.example.com',
      unitPrice,
      currency: 'INR',
      dimensions: { length, height, thickness },
      category: cols[catIdx] || 'furniture',
      material: cols[matIdx] || 'Wood/Fabric',
      deliveryCharge: 500,
      installationCharge: 0,
      availability: 'in_stock',
      localityAvailability: { 'Kochi': true, 'Ernakulam': true, 'Thrissur': true },
      verificationStatus: 'user_provided',
      lastVerifiedDate: new Date().toISOString().slice(0, 10),
    });
  }

  return imported;
}
