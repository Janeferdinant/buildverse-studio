import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  RotateCw, 
  Trash2, 
  Sparkles, 
  Check, 
  Columns3, 
  Filter, 
  TrendingDown, 
  Truck, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useInteriorStore } from '../../store/interiorStore';
import { RetailerProduct, PlacedProductInstance } from '../../types/interior';
import { getCompatibleAlternatives } from '../../services/retailerAdapters';
import { REAL_WORLD_PRODUCTS } from '../../data/retailerProductCatalog';

interface ProductReplacementDrawerProps {
  instance: PlacedProductInstance | null;
  onClose: () => void;
  onOpenComparison: () => void;
}

export const ProductReplacementDrawer: React.FC<ProductReplacementDrawerProps> = ({
  instance,
  onClose,
  onOpenComparison
}) => {
  const replacePlacedProduct = useInteriorStore((state) => state.replacePlacedProduct);
  const removePlacedProduct = useInteriorStore((state) => state.removePlacedProduct);
  const updatePlacedProductTransform = useInteriorStore((state) => state.updatePlacedProductTransform);
  const preferences = useInteriorStore((state) => state.preferences);
  const toggleProductInComparison = useInteriorStore((state) => state.toggleProductInComparison);
  const comparisonProductIds = useInteriorStore((state) => state.comparisonProductIds);

  const [selectedRetailerFilter, setSelectedRetailerFilter] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | 'default'>('default');

  if (!instance) return null;

  const currentProduct: RetailerProduct = REAL_WORLD_PRODUCTS.find((p) => p.id === instance.productId) || {
    id: instance.productId,
    name: 'Selected Product',
    brand: 'BuildVerse Studio',
    sku: 'BV-SEL-01',
    retailer: 'Custom User Supplier',
    productUrl: '#',
    unitPrice: 15000,
    currency: 'INR',
    dimensions: instance.dimensions,
    material: 'Wood',
    category: 'sofas',
    deliveryCharge: 0,
    installationCharge: 0,
    availability: 'in_stock',
    localityAvailability: {},
    verificationStatus: 'verified_official',
    lastVerifiedDate: '2024-10-15'
  };

  const userDistrict = preferences.keralaDistrict || 'Kochi';

  // Find compatible replacement products
  let compatibleProducts = getCompatibleAlternatives(currentProduct);

  // Apply retailer filter
  if (selectedRetailerFilter !== 'all') {
    compatibleProducts = compatibleProducts.filter((p) => p.retailer === selectedRetailerFilter);
  }

  // Apply price sorting
  if (priceSort === 'asc') {
    compatibleProducts.sort((a, b) => a.unitPrice - b.unitPrice);
  } else if (priceSort === 'desc') {
    compatibleProducts.sort((a, b) => b.unitPrice - a.unitPrice);
  }

  const handleSelectAlternative = (newProduct: RetailerProduct) => {
    replacePlacedProduct(instance.instanceId, newProduct.id);
  };

  const handleRotate = () => {
    updatePlacedProductTransform(
      instance.instanceId,
      instance.position,
      [
        instance.rotation[0],
        instance.rotation[1] + Math.PI / 2,
        instance.rotation[2]
      ]
    );
  };

  const isCurrentInComparison = comparisonProductIds.includes(currentProduct.id);

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-cad-surface border-l border-cad-border shadow-2xl z-40 flex flex-col text-cad-light antialiased">
      {/* Header */}
      <div className="h-14 border-b border-cad-border px-4 flex items-center justify-between bg-cad-dark">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Product Replacement & Fit
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-cad-muted hover:text-white p-1 rounded hover:bg-cad-surface transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Currently Placed Product Card */}
        <div className="bg-cad-dark rounded-xl border border-gold/40 p-3.5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gold tracking-wider">
              Currently Selected
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cad-surface border border-cad-border text-cyan-400 font-mono">
              {currentProduct.retailer}
            </span>
          </div>

          <div className="flex space-x-3">
            <div className="w-16 h-16 rounded bg-cad-surface border border-cad-border flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={currentProduct.imageUrl}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white truncate" title={currentProduct.name}>
                {currentProduct.name}
              </h4>
              <div className="text-[11px] text-cad-muted">Brand: {currentProduct.brand}</div>
              <div className="text-sm font-bold text-gold font-mono mt-0.5">
                ₹{currentProduct.unitPrice.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-cad-surface/60 p-2.5 rounded border border-cad-border">
            <div>
              <span className="text-cad-muted block text-[10px]">Dimensions (m):</span>
              <span className="font-mono text-white">
                {currentProduct.dimensions
                  ? `${currentProduct.dimensions.length}m L × ${currentProduct.dimensions.thickness}m W × ${currentProduct.dimensions.height}m H`
                  : 'Unspecified'}
              </span>
            </div>
            <div>
              <span className="text-cad-muted block text-[10px]">Material:</span>
              <span className="text-white truncate block">{currentProduct.material}</span>
            </div>
          </div>

          {/* Delivery & Link */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <Truck className="w-3.5 h-3.5" />
              <span>Delivers to {userDistrict}</span>
            </div>
            <a
              href={currentProduct.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline flex items-center space-x-1 font-medium"
            >
              <span>View Listing</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Controls: Rotate & Remove */}
          <div className="flex items-center space-x-2 pt-2 border-t border-cad-border/60">
            <button
              onClick={handleRotate}
              className="flex-1 py-1.5 bg-cad-surface hover:bg-cad-border rounded text-xs text-white font-medium flex items-center justify-center space-x-1 transition"
            >
              <RotateCw className="w-3 h-3 text-gold" />
              <span>Rotate 90°</span>
            </button>
            <button
              onClick={() => {
                if (!isCurrentInComparison) {
                  toggleProductInComparison(currentProduct.id);
                }
                onOpenComparison();
              }}
              className="px-2.5 py-1.5 bg-cad-surface hover:bg-cad-border rounded text-xs text-gold font-medium flex items-center space-x-1 transition"
              title="Compare with other products"
            >
              <Columns3 className="w-3 h-3" />
              <span>Compare</span>
            </button>
            <button
              onClick={() => {
                removePlacedProduct(instance.instanceId);
                onClose();
              }}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition"
              title="Remove from room"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compatible Alternatives Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Compatible Alternatives ({compatibleProducts.length})
            </h4>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center space-x-2 text-[11px]">
            <select
              value={selectedRetailerFilter}
              onChange={(e) => setSelectedRetailerFilter(e.target.value)}
              className="flex-1 bg-cad-dark border border-cad-border rounded px-2 py-1 text-white focus:outline-none focus:border-gold"
            >
              <option value="all">All Retailers</option>
              <option value="Amazon India">Amazon India</option>
              <option value="IKEA India">IKEA India</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Kerala Local / Nilambur Crafts">Kerala Artisans</option>
            </select>

            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as any)}
              className="bg-cad-dark border border-cad-border rounded px-2 py-1 text-white focus:outline-none focus:border-gold"
            >
              <option value="default">Sort: Recommended</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>

          {/* Alternatives List */}
          <div className="space-y-2.5">
            {compatibleProducts.map((altProduct) => {
              const priceDiff = altProduct.unitPrice - currentProduct.unitPrice;
              const isComparing = comparisonProductIds.includes(altProduct.id);

              return (
                <div
                  key={altProduct.id}
                  className="bg-cad-dark/80 hover:bg-cad-dark border border-cad-border hover:border-gold/50 rounded-lg p-3 space-y-2 transition group"
                >
                  <div className="flex space-x-2.5">
                    <div className="w-14 h-14 rounded bg-cad-surface border border-cad-border flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={altProduct.imageUrl}
                        alt={altProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-cyan-400 font-mono">{altProduct.retailer}</span>
                        {priceDiff < 0 ? (
                          <span className="text-[10px] font-bold text-emerald-400 font-mono">
                            Save ₹{Math.abs(priceDiff).toLocaleString('en-IN')}
                          </span>
                        ) : priceDiff > 0 ? (
                          <span className="text-[10px] text-cad-muted font-mono">
                            +₹{priceDiff.toLocaleString('en-IN')}
                          </span>
                        ) : null}
                      </div>
                      <h5 className="text-xs font-semibold text-white truncate" title={altProduct.name}>
                        {altProduct.name}
                      </h5>
                      <div className="text-xs font-bold text-gold font-mono">
                        ₹{altProduct.unitPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-cad-border/50">
                    <span className="text-cad-muted font-mono">
                      {altProduct.dimensions.length}m × {altProduct.dimensions.thickness}m × {altProduct.dimensions.height}m
                    </span>
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => {
                          if (!isComparing) toggleProductInComparison(altProduct.id);
                          onOpenComparison();
                        }}
                        className="px-2 py-1 bg-cad-surface hover:bg-cad-border text-cad-light text-[10px] font-medium rounded transition"
                      >
                        Compare
                      </button>
                      <button
                        onClick={() => handleSelectAlternative(altProduct)}
                        className="px-2.5 py-1 bg-gold hover:bg-gold-light text-black text-[10px] font-bold rounded shadow-sm transition"
                      >
                        Swap In
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
