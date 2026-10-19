import React from 'react';
import { 
  X, 
  ExternalLink, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Truck, 
  Star, 
  Columns3,
  Sparkles
} from 'lucide-react';
import { useInteriorStore } from '../../store/interiorStore';
import { REAL_WORLD_PRODUCTS } from '../../data/retailerProductCatalog';
import { RetailerProduct } from '../../types/interior';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInstanceId: string | null;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedInstanceId
}) => {
  const comparisonProductIds = useInteriorStore((state) => state.comparisonProductIds);
  const toggleProductInComparison = useInteriorStore((state) => state.toggleProductInComparison);
  const clearComparison = useInteriorStore((state) => state.clearComparison);
  const replacePlacedProduct = useInteriorStore((state) => state.replacePlacedProduct);
  const preferences = useInteriorStore((state) => state.preferences);

  if (!isOpen) return null;

  // Resolve full product objects
  const comparedProducts: RetailerProduct[] = comparisonProductIds
    .map((id: string) => REAL_WORLD_PRODUCTS.find((p: RetailerProduct) => p.id === id))
    .filter((p): p is RetailerProduct => p !== undefined);

  const handleAssignToDesign = (product: RetailerProduct) => {
    if (selectedInstanceId) {
      replacePlacedProduct(selectedInstanceId, product.id);
    }
    onClose();
  };

  const userDistrict = preferences.keralaDistrict || 'Kochi';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cad-surface border border-cad-border rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden text-cad-light antialiased">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-cad-border flex items-center justify-between bg-cad-dark">
          <div className="flex items-center space-x-2.5">
            <Columns3 className="w-5 h-5 text-gold" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Product Comparison Matrix ({comparedProducts.length} of 4)
              </h3>
              <p className="text-xs text-cad-muted">
                Side-by-side comparison of dimensions, materials, verified Kerala availability, and cost.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {comparedProducts.length > 0 && (
              <button
                onClick={clearComparison}
                className="text-xs text-cad-muted hover:text-red-400 transition"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-cad-muted hover:text-white hover:bg-cad-surface transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-x-auto p-6">
          {comparedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Columns3 className="w-12 h-12 text-cad-muted mx-auto" />
              <div className="text-sm font-medium text-white">No products selected for comparison</div>
              <p className="text-xs text-cad-muted max-w-sm mx-auto">
                Open the product replacement drawer in the 3D room and click "Compare" on up to 4 items.
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${
              comparedProducts.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              comparedProducts.length === 2 ? 'grid-cols-2' :
              comparedProducts.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
            }`}>
              {comparedProducts.map((p: RetailerProduct) => (
                <div
                  key={p.id}
                  className="bg-cad-dark border border-cad-border rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-lg relative group"
                >
                  <button
                    onClick={() => toggleProductInComparison(p.id)}
                    className="absolute top-3 right-3 text-cad-muted hover:text-red-400 p-1"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Thumbnail & Retailer */}
                  <div className="space-y-2">
                    <div className="w-full h-36 bg-cad-surface rounded-lg border border-cad-border overflow-hidden flex items-center justify-center">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cad-surface border border-cad-border text-cyan-400 font-mono font-medium">
                        {p.retailer}
                      </span>
                      {p.rating && (
                        <div className="flex items-center space-x-1 text-gold text-xs font-mono">
                          <Star className="w-3 h-3 fill-gold text-gold" />
                          <span>{p.rating.toFixed(1)}</span>
                          <span className="text-cad-muted text-[10px]">({p.reviewCount})</span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-2" title={p.name}>
                      {p.name}
                    </h4>
                    <div className="text-base font-bold text-gold font-mono">
                      ₹{p.unitPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Matrix Attributes */}
                  <div className="text-xs space-y-2.5 border-t border-b border-cad-border/60 py-3">
                    <div>
                      <span className="text-[10px] text-cad-muted uppercase block">Dimensions</span>
                      <span className="font-mono text-white text-[11px]">
                        {p.dimensions
                          ? `${p.dimensions.length}m L × ${p.dimensions.thickness}m W × ${p.dimensions.height}m H`
                          : 'Unspecified'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-cad-muted uppercase block">Material & Finish</span>
                      <span className="text-white text-[11px]">
                        {p.material} {p.finish ? `(${p.finish})` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-cad-muted uppercase block">Kerala Availability</span>
                      <div className="flex items-center space-x-1 text-emerald-400 text-[11px]">
                        <Truck className="w-3 h-3" />
                        <span>Ships to {userDistrict}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-cad-muted uppercase block">Warranty</span>
                      <div className="flex items-center space-x-1 text-white text-[11px]">
                        <ShieldCheck className="w-3 h-3 text-gold" />
                        <span>{p.warranty || 'Standard Brand Warranty'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    {selectedInstanceId && (
                      <button
                        onClick={() => handleAssignToDesign(p)}
                        className="w-full py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold rounded shadow-gold-glow transition flex items-center justify-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Assign to Room</span>
                      </button>
                    )}
                    <a
                      href={p.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 bg-cad-surface hover:bg-cad-border text-cad-light text-xs font-medium rounded flex items-center justify-center space-x-1 transition"
                    >
                      <span>Open Product URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
