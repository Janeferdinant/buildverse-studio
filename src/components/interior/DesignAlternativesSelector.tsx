import React from 'react';
import { 
  Sparkles, 
  Coins, 
  Layers, 
  Check, 
  TrendingDown, 
  ShieldCheck, 
  Crown,
  Info
} from 'lucide-react';
import { useInteriorStore } from '../../store/interiorStore';
import { InteriorDesignAlternative } from '../../types/interior';

export const DesignAlternativesSelector: React.FC = () => {
  const alternatives = useInteriorStore((state) => state.alternatives);
  const activeTier = useInteriorStore((state) => state.activeAlternativeTier);
  const setActiveTier = useInteriorStore((state) => state.setActiveAlternativeTier);

  if (!alternatives) return null;

  const activeAlt = alternatives.find((a) => a.tier === activeTier) || alternatives[1];

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'budget':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      case 'balanced':
        return <ShieldCheck className="w-4 h-4 text-gold" />;
      case 'premium':
        return <Crown className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-gold" />;
    }
  };

  return (
    <div className="bg-cad-surface/90 backdrop-blur border-b border-cad-border px-6 py-3 space-y-3">
      {/* 3 Tier Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cad-muted">
            Design Tier:
          </span>
          <div className="flex bg-cad-dark p-1 rounded-lg border border-cad-border space-x-1">
            {alternatives.map((alt: InteriorDesignAlternative) => {
              const isSelected = activeTier === alt.tier;
              return (
                <button
                  key={alt.id}
                  onClick={() => setActiveTier(alt.tier)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gold text-black shadow-gold-glow'
                      : 'text-cad-light hover:text-white hover:bg-cad-surface'
                  }`}
                >
                  {getTierIcon(alt.tier)}
                  <span>{alt.title}</span>
                  <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-black' : 'text-gold'}`}>
                    ₹{alt.budget.grandTotal.toLocaleString('en-IN')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Spec Metrics */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-cad-muted">Wall Finish:</span>
            <span className="font-semibold text-white">{activeAlt.wallFinish}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-cad-muted">Flooring:</span>
            <span className="font-semibold text-white">{activeAlt.floorFinish}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-cad-muted">Catalog Items:</span>
            <span className="font-semibold text-gold font-mono">{activeAlt.placedProducts.length} Items</span>
          </div>
        </div>
      </div>

      {/* Rationale and Color Palette Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-xs bg-cad-dark/70 px-3 py-2 rounded border border-cad-border gap-2">
        <div className="flex items-center space-x-2 flex-1">
          <Info className="w-3.5 h-3.5 text-gold flex-shrink-0" />
          <span className="text-cad-light text-[11px] leading-relaxed">
            <strong className="text-white">Design Concept:</strong> {activeAlt.description} • {activeAlt.spaceUtilizationNotes}
          </span>
        </div>

        {/* Palette Swatches */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <span className="text-[10px] text-cad-muted uppercase tracking-wider">Palette:</span>
          {activeAlt.colorPalette.map((color: string, i: number) => (
            <span
              key={i}
              className="w-4 h-4 rounded-full border border-cad-border shadow-sm inline-block"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
