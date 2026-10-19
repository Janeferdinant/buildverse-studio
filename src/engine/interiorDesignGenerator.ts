import { 
  PlacedProductInstance, 
  RetailerProduct, 
  InteriorDesignPreferences, 
  InteriorBudgetBreakdown,
  InteriorDesignAlternative,
  ShoppingListItem,
  InteriorDesignStyle
} from '../types/interior';

/**
 * Calculates itemized interior budget including furniture, finishes, lighting,
 * delivery, installation, GST taxes, contingency, and remaining budget gauge.
 */
export function calculateInteriorBudget(
  placedInstances: PlacedProductInstance[],
  catalog: RetailerProduct[],
  preferences: InteriorDesignPreferences,
  options?: { finishRatePerM2?: number; contingencyPct?: number; gstRatePct?: number }
): InteriorBudgetBreakdown {
  const gstRate = options?.gstRatePct ?? 18.0;
  const contingencyRate = options?.contingencyPct ?? 5.0;

  const productMap = new Map<string, RetailerProduct>();
  for (const prod of catalog) {
    productMap.set(prod.id, prod);
  }

  let furnitureSubtotal = 0;
  let lightingSubtotal = 0;
  let decorSubtotal = 0;
  let deliverySubtotal = 0;
  let installationSubtotal = 0;
  let missingPriceCount = 0;

  for (const instance of placedInstances) {
    const product = productMap.get(instance.productId);
    if (!product || product.unitPrice === undefined || product.unitPrice === null) {
      missingPriceCount++;
      continue;
    }

    const price = product.unitPrice;
    const cat = product.category.toLowerCase();

    if (cat.includes('light') || cat.includes('lamp') || cat.includes('chandelier')) {
      lightingSubtotal += price;
    } else if (cat.includes('rug') || cat.includes('art') || cat.includes('decor') || cat.includes('plant')) {
      decorSubtotal += price;
    } else {
      furnitureSubtotal += price;
    }

    deliverySubtotal += product.deliveryCharge || 0;
    installationSubtotal += product.installationCharge || 0;
  }

  // Room finishes allowance based on room dimensions
  const roomArea = Math.max(1, preferences.roomDimensions.length * preferences.roomDimensions.width);
  const finishRate = options?.finishRatePerM2 ?? 0;
  const finishesSubtotal = roomArea * finishRate;

  const directTotal = furnitureSubtotal + lightingSubtotal + decorSubtotal + finishesSubtotal + deliverySubtotal + installationSubtotal;

  // Taxes: 18% GST on products and services
  const gstAmount = directTotal * (gstRate / 100);

  // Contingency allowance
  const contingencyAmount = (directTotal + gstAmount) * (contingencyRate / 100);

  const grandTotal = Math.round(directTotal + gstAmount + contingencyAmount);
  const target = preferences.targetBudget || 100000;
  const budgetRemaining = target - grandTotal;
  const isWithinBudget = grandTotal <= target;

  return {
    furnitureSubtotal,
    finishesSubtotal,
    lightingSubtotal,
    decorSubtotal,
    deliverySubtotal,
    installationSubtotal,
    directTotal,
    gstAmount,
    contingencyAmount,
    grandTotal,
    targetBudget: target,
    budgetRemaining,
    isWithinBudget,
    isComplete: missingPriceCount === 0,
    missingPriceCount,
  };
}

/**
 * Builds a grouped shopping list from placed product instances
 */
export function buildShoppingList(
  placedInstances: PlacedProductInstance[],
  catalog: RetailerProduct[]
): ShoppingListItem[] {
  const productMap = new Map<string, RetailerProduct>();
  for (const prod of catalog) {
    productMap.set(prod.id, prod);
  }

  const counts = new Map<string, number>();
  for (const inst of placedInstances) {
    counts.set(inst.productId, (counts.get(inst.productId) || 0) + 1);
  }

  const items: ShoppingListItem[] = [];
  for (const [productId, qty] of counts.entries()) {
    const product = productMap.get(productId);
    if (!product) continue;

    items.push({
      id: `shop-${productId}`,
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      retailer: product.retailer,
      productUrl: product.productUrl,
      unitPrice: product.unitPrice,
      quantity: qty,
      totalPrice: product.unitPrice * qty,
      deliveryCharge: (product.deliveryCharge || 0) * qty,
      installationCharge: (product.installationCharge || 0) * qty,
      status: 'to_buy',
      dimensions: product.dimensions,
      category: product.category,
      notes: `${product.material} • Warranty: ${product.warranty || 'Standard'}`,
    });
  }

  return items;
}

/**
 * Generates three distinct, realistic interior design alternatives:
 * 1. Budget-Conscious
 * 2. Balanced Modern
 * 3. Premium Luxury Artisan
 * All mapped to real purchasable products on identical room geometry.
 */
export function generateDesignAlternatives(
  preferences: InteriorDesignPreferences,
  catalog: RetailerProduct[]
): [InteriorDesignAlternative, InteriorDesignAlternative, InteriorDesignAlternative] {
  const roomL = preferences.roomDimensions.length;
  const roomW = preferences.roomDimensions.width;
  const isBedroom = preferences.roomType === 'bedroom';
  const isDining = preferences.roomType === 'dining_room';

  // Helper to pick product by ID or category fallback
  const getProduct = (preferredId: string, fallbackCategory: string): RetailerProduct => {
    const found = catalog.find((p) => p.id === preferredId);
    if (found) return found;
    const catFound = catalog.find((p) => p.category === fallbackCategory);
    if (catFound) return catFound;
    return catalog[0];
  };

  // -------------------------------------------------------------
  // ALTERNATIVE 1: BUDGET-CONSCIOUS
  // -------------------------------------------------------------
  const budgetInstances: PlacedProductInstance[] = [];
  if (isBedroom) {
    const bed = getProduct('prod-wakefit-sheesham-bed', 'beds');
    budgetInstances.push({
      instanceId: 'inst-b-bed',
      productId: bed.id,
      position: [0, 0, -roomW / 2 + bed.dimensions.thickness / 2 + 0.3],
      rotation: [0, 0, 0],
      dimensions: bed.dimensions,
      fitStatus: 'ok',
    });
    const lamp = getProduct('prod-philips-hue-ceiling', 'lighting');
    budgetInstances.push({
      instanceId: 'inst-b-light',
      productId: lamp.id,
      position: [0, preferences.roomDimensions.height - 0.1, 0],
      rotation: [0, 0, 0],
      dimensions: lamp.dimensions,
      fitStatus: 'ok',
    });
  } else {
    // Living Room default
    const sofa = getProduct('prod-amazon-solimo-sofa', 'sofas');
    budgetInstances.push({
      instanceId: 'inst-b-sofa',
      productId: sofa.id,
      position: [0, 0, -roomW / 2 + sofa.dimensions.thickness / 2 + 0.25],
      rotation: [0, 0, 0],
      dimensions: sofa.dimensions,
      fitStatus: 'ok',
    });
    const table = getProduct('prod-ikea-lack-coffee-table', 'coffee_tables');
    budgetInstances.push({
      instanceId: 'inst-b-table',
      productId: table.id,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      dimensions: table.dimensions,
      fitStatus: 'ok',
    });
    const rug = getProduct('prod-kerala-coir-jute-rug', 'decor');
    budgetInstances.push({
      instanceId: 'inst-b-rug',
      productId: rug.id,
      position: [0, 0.005, 0],
      rotation: [0, 0, 0],
      dimensions: rug.dimensions,
      fitStatus: 'ok',
    });
    const light = getProduct('prod-philips-hue-ceiling', 'lighting');
    budgetInstances.push({
      instanceId: 'inst-b-light',
      productId: light.id,
      position: [0, preferences.roomDimensions.height - 0.1, 0],
      rotation: [0, 0, 0],
      dimensions: light.dimensions,
      fitStatus: 'ok',
    });
  }

  const budgetBreakdown = calculateInteriorBudget(budgetInstances, catalog, preferences, { finishRatePerM2: 120 });
  const budgetAlternative: InteriorDesignAlternative = {
    id: `alt-budget-${Date.now()}`,
    tier: 'budget',
    title: 'Smart Budget-Conscious Modern',
    description: 'High-value modern furniture pairing Solimo, Wakefit, and IKEA essentials with natural Alleppey jute decor for cost efficiency.',
    style: 'budget_modern',
    colorPalette: ['#f8fafc', '#94a3b8', '#0284c7', '#334155'],
    wallFinish: 'Asian Paints Royale Emulsion (Off-White Cloud)',
    floorFinish: 'Vitrified Matte Ceramic Tiles (600x600mm)',
    ceilingFinish: 'Standard Gypsum White Paint',
    placedProducts: budgetInstances,
    budget: budgetBreakdown,
    shoppingList: buildShoppingList(budgetInstances, catalog),
    spaceUtilizationNotes: 'Open central circulation preserved; minimal wall clutter ensures broad 1.2m walkways throughout.',
    lightingNotes: 'Tunable smart white ambient ceiling fixture with daylight 4000K mode.',
  };

  // -------------------------------------------------------------
  // ALTERNATIVE 2: BALANCED MODERN DESIGN
  // -------------------------------------------------------------
  const balancedInstances: PlacedProductInstance[] = [];
  if (isBedroom) {
    const bed = getProduct('prod-ikea-malm-bed', 'beds');
    balancedInstances.push({
      instanceId: 'inst-m-bed',
      productId: bed.id,
      position: [0, 0, -roomW / 2 + bed.dimensions.thickness / 2 + 0.3],
      rotation: [0, 0, 0],
      dimensions: bed.dimensions,
      fitStatus: 'ok',
    });
    const wardrobe = getProduct('prod-flipkart-wardrobe-3door', 'storage');
    balancedInstances.push({
      instanceId: 'inst-m-wardrobe',
      productId: wardrobe.id,
      position: [-roomL / 2 + wardrobe.dimensions.length / 2 + 0.2, 0, 0],
      rotation: [0, Math.PI / 2, 0],
      dimensions: wardrobe.dimensions,
      fitStatus: 'ok',
    });
    const chair = getProduct('prod-kerala-rattan-chair', 'armchairs');
    balancedInstances.push({
      instanceId: 'inst-m-chair',
      productId: chair.id,
      position: [roomL / 2 - chair.dimensions.length / 2 - 0.4, 0, 0.5],
      rotation: [0, -Math.PI / 4, 0],
      dimensions: chair.dimensions,
      fitStatus: 'ok',
    });
    const rug = getProduct('prod-ikea-vindum-rug', 'decor');
    balancedInstances.push({
      instanceId: 'inst-m-rug',
      productId: rug.id,
      position: [0, 0.005, 0.5],
      rotation: [0, 0, 0],
      dimensions: rug.dimensions,
      fitStatus: 'ok',
    });
  } else {
    // Living Room default
    const sofa = getProduct('prod-ikea-kivik-sofa', 'sofas');
    balancedInstances.push({
      instanceId: 'inst-m-sofa',
      productId: sofa.id,
      position: [0, 0, -roomW / 2 + sofa.dimensions.thickness / 2 + 0.3],
      rotation: [0, 0, 0],
      dimensions: sofa.dimensions,
      fitStatus: 'ok',
    });
    const table = getProduct('prod-amazon-wakefit-coffee-table', 'coffee_tables');
    balancedInstances.push({
      instanceId: 'inst-m-table',
      productId: table.id,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      dimensions: table.dimensions,
      fitStatus: 'ok',
    });
    const armchair = getProduct('prod-ikea-strandmon-armchair', 'armchairs');
    balancedInstances.push({
      instanceId: 'inst-m-armchair',
      productId: armchair.id,
      position: [roomL / 2 - armchair.dimensions.length / 2 - 0.5, 0, 0],
      rotation: [0, -Math.PI / 3, 0],
      dimensions: armchair.dimensions,
      fitStatus: 'ok',
    });
    const bookcase = getProduct('prod-ikea-billy-bookcase', 'storage');
    balancedInstances.push({
      instanceId: 'inst-m-bookcase',
      productId: bookcase.id,
      position: [-roomL / 2 + bookcase.dimensions.thickness / 2 + 0.1, 0, 0],
      rotation: [0, Math.PI / 2, 0],
      dimensions: bookcase.dimensions,
      fitStatus: 'ok',
    });
    const rug = getProduct('prod-ikea-vindum-rug', 'decor');
    balancedInstances.push({
      instanceId: 'inst-m-rug',
      productId: rug.id,
      position: [0, 0.005, 0],
      rotation: [0, 0, 0],
      dimensions: rug.dimensions,
      fitStatus: 'ok',
    });
    const light = getProduct('prod-philips-hue-ceiling', 'lighting');
    balancedInstances.push({
      instanceId: 'inst-m-light',
      productId: light.id,
      position: [0, preferences.roomDimensions.height - 0.1, 0],
      rotation: [0, 0, 0],
      dimensions: light.dimensions,
      fitStatus: 'ok',
    });
  }

  const balancedBreakdown = calculateInteriorBudget(balancedInstances, catalog, preferences, { finishRatePerM2: 240 });
  const balancedAlternative: InteriorDesignAlternative = {
    id: `alt-balanced-${Date.now()}`,
    tier: 'balanced',
    title: 'Balanced Contemporary Scandinavian-Kerala',
    description: 'Harmonious blend of IKEA Scandinavian ergonomics with warm Indian wood finishes and textured high-pile comfort.',
    style: preferences.style || 'scandinavian',
    colorPalette: ['#fef3c7', '#d97706', '#334155', '#1e293b'],
    wallFinish: 'Warm Ivory Putty with Textured Terracotta Accent Wall',
    floorFinish: 'Polished Glazed Double-Charged Vitrified Tile (800x800mm)',
    ceilingFinish: 'False Gypsum Ceiling with Perimeter Cove Lighting',
    placedProducts: balancedInstances,
    budget: balancedBreakdown,
    shoppingList: buildShoppingList(balancedInstances, catalog),
    spaceUtilizationNotes: 'Balanced conversation zone with dedicated reading corner; clear 0.9m doorway clearance maintained.',
    lightingNotes: 'Layered warm ambient lighting complemented by focused reading luminescence.',
  };

  // -------------------------------------------------------------
  // ALTERNATIVE 3: PREMIUM LUXURY ARTISAN
  // -------------------------------------------------------------
  const premiumInstances: PlacedProductInstance[] = [];
  if (isBedroom) {
    const diwan = getProduct('prod-kerala-heritage-diwan', 'beds');
    premiumInstances.push({
      instanceId: 'inst-p-diwan',
      productId: diwan.id,
      position: [0, 0, -roomW / 2 + diwan.dimensions.thickness / 2 + 0.3],
      rotation: [0, 0, 0],
      dimensions: diwan.dimensions,
      fitStatus: 'ok',
    });
    const chair = getProduct('prod-kerala-rattan-chair', 'armchairs');
    premiumInstances.push({
      instanceId: 'inst-p-chair1',
      productId: chair.id,
      position: [-roomL / 2 + chair.dimensions.length / 2 + 0.5, 0, 0],
      rotation: [0, Math.PI / 3, 0],
      dimensions: chair.dimensions,
      fitStatus: 'ok',
    });
    const brassLamp = getProduct('prod-kerala-brass-pendant', 'lighting');
    premiumInstances.push({
      instanceId: 'inst-p-brass',
      productId: brassLamp.id,
      position: [0, preferences.roomDimensions.height - 0.75, 0],
      rotation: [0, 0, 0],
      dimensions: brassLamp.dimensions,
      fitStatus: 'ok',
    });
  } else {
    // Living Room default
    const teakSofa = getProduct('prod-kerala-nilambur-sofa', 'sofas');
    premiumInstances.push({
      instanceId: 'inst-p-teaksofa',
      productId: teakSofa.id,
      position: [0, 0, -roomW / 2 + teakSofa.dimensions.thickness / 2 + 0.3],
      rotation: [0, 0, 0],
      dimensions: teakSofa.dimensions,
      fitStatus: 'ok',
    });
    const diningOrTable = getProduct('prod-nilambur-dining-set', 'dining_tables');
    premiumInstances.push({
      instanceId: 'inst-p-teaktable',
      productId: diningOrTable.id,
      position: [0, 0, 0.4],
      rotation: [0, 0, 0],
      dimensions: diningOrTable.dimensions,
      fitStatus: 'ok',
    });
    const caneChair = getProduct('prod-kerala-rattan-chair', 'armchairs');
    premiumInstances.push({
      instanceId: 'inst-p-canechair',
      productId: caneChair.id,
      position: [roomL / 2 - caneChair.dimensions.length / 2 - 0.4, 0, -0.2],
      rotation: [0, -Math.PI / 4, 0],
      dimensions: caneChair.dimensions,
      fitStatus: 'ok',
    });
    const brassPendant = getProduct('prod-kerala-brass-pendant', 'lighting');
    premiumInstances.push({
      instanceId: 'inst-p-brasspendant',
      productId: brassPendant.id,
      position: [0, preferences.roomDimensions.height - 0.75, 0],
      rotation: [0, 0, 0],
      dimensions: brassPendant.dimensions,
      fitStatus: 'ok',
    });
  }

  const premiumBreakdown = calculateInteriorBudget(premiumInstances, catalog, preferences, { finishRatePerM2: 450 });
  const premiumAlternative: InteriorDesignAlternative = {
    id: `alt-premium-${Date.now()}`,
    tier: 'premium',
    title: 'Kerala Heritage Vernacular Luxury',
    description: 'Handcrafted Nilambur first-quality seasoned teakwood furniture, bell-metal brass hanging lamp, and natural rattan elements.',
    style: 'kerala_contemporary',
    colorPalette: ['#451a03', '#92400e', '#d97706', '#0f172a'],
    wallFinish: 'Lime Plaster Finish with Teakwood Cornice Trims',
    floorFinish: 'Polished Black Granite / Heritage Athangudi Tiles',
    ceilingFinish: 'Exposed Hardwood Timber Rafter Ceiling',
    placedProducts: premiumInstances,
    budget: premiumBreakdown,
    shoppingList: buildShoppingList(premiumInstances, catalog),
    spaceUtilizationNotes: 'Generous traditional sit-out zoning with timeless solid teak heritage centerpiece.',
    lightingNotes: 'Suspended traditional Kerala bell-metal thookku vilakku creating golden reflective illumination.',
  };

  return [budgetAlternative, balancedAlternative, premiumAlternative];
}
