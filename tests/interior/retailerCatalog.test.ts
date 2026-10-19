import { describe, it, expect } from 'vitest';
import { 
  REAL_WORLD_PRODUCTS, 
  searchProducts, 
  checkKeralaAvailability,
  getCompatibleAlternatives,
  importProductsFromCSV
} from '@/services/retailerAdapters';

describe('Real-World Retailer Product Catalog & Kerala Locality Engine', () => {
  it('contains authentic products across Amazon, IKEA, Flipkart, and Kerala Local artisans', () => {
    expect(REAL_WORLD_PRODUCTS.length).toBeGreaterThanOrEqual(15);

    const retailers = new Set(REAL_WORLD_PRODUCTS.map((p) => p.retailer));
    expect(retailers.has('Amazon India')).toBe(true);
    expect(retailers.has('IKEA India')).toBe(true);
    expect(retailers.has('Flipkart')).toBe(true);
    expect(retailers.has('Kerala Local / Nilambur Crafts')).toBe(true);
  });

  it('filters products by category, retailer, and budget query', () => {
    const sofas = searchProducts({ category: 'sofas' });
    expect(sofas.length).toBeGreaterThan(0);
    expect(sofas.every((s) => s.category === 'sofas')).toBe(true);

    const ikeaProducts = searchProducts({ retailer: 'IKEA India' });
    expect(ikeaProducts.length).toBeGreaterThan(0);
    expect(ikeaProducts.every((p) => p.retailer === 'IKEA India')).toBe(true);

    const budgetSofas = searchProducts({ category: 'sofas', maxPrice: 30000 });
    expect(budgetSofas.every((s) => s.unitPrice <= 30000)).toBe(true);
  });

  it('checks locality availability for Kerala districts (Kochi, Thrissur, Kozhikode)', () => {
    const nilamburTable = REAL_WORLD_PRODUCTS.find((p) => p.name.includes('Nilambur'));
    expect(nilamburTable).toBeDefined();

    // Check delivery to Kochi
    const kochiAvail = checkKeralaAvailability(nilamburTable!, 'Kochi');
    expect(kochiAvail.isAvailable).toBe(true);
    expect(kochiAvail.type).toBe('local_pickup_or_delivery');

    // Unknown/unsupported district
    const remoteAvail = checkKeralaAvailability(nilamburTable!, 'Remote Island');
    expect(remoteAvail.isAvailable).toBe(false);
  });

  it('retrieves compatible alternatives matching dimensions and category', () => {
    const baseSofa = REAL_WORLD_PRODUCTS.find((p) => p.category === 'sofas');
    expect(baseSofa).toBeDefined();

    const alternatives = getCompatibleAlternatives(baseSofa!);
    expect(alternatives.length).toBeGreaterThan(0);
    expect(alternatives.every((a) => a.category === 'sofas')).toBe(true);
    expect(alternatives.some((a) => a.id === baseSofa!.id)).toBe(false);
  });

  it('imports valid CSV product records without corrupting existing catalog', () => {
    const csvContent = `Name,Brand,SKU,Retailer,Price,Length,Height,Thickness,Category,Material,URL
Solid Rosewood Diwan,Kerala Crafts,KC-DW-01,Kerala Local / Nilambur Crafts,32000,1.8,0.75,0.8,beds,Rosewood,https://keralacrafts.example.com/diwan`;

    const imported = importProductsFromCSV(csvContent);
    expect(imported.length).toBe(1);
    expect(imported[0].unitPrice).toBe(32000);
    expect(imported[0].material).toBe('Rosewood');
    expect(imported[0].verificationStatus).toBe('user_provided');
  });
});
