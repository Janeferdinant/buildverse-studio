import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Coins, 
  Sliders, 
  Store, 
  Layers, 
  Check, 
  Palette, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useInteriorStore } from '../../store/interiorStore';
import { InteriorDesignStyle, InteriorDesignPreferences } from '../../types/interior';

const STYLE_CARDS: { id: InteriorDesignStyle; label: string; desc: string; icon: string }[] = [
  { id: 'kerala_contemporary', label: 'Kerala-Inspired Contemporary', desc: 'Teakwood tones, cane accents, brass highlights, indoor greenery & monsoon ventilation', icon: '🌴' },
  { id: 'modern_minimalist', label: 'Modern Minimalist', desc: 'Clean lines, hidden storage, muted neutrals, functional simplicity', icon: '📐' },
  { id: 'contemporary_luxury', label: 'Contemporary Luxury', desc: 'Italian marble finishes, plush upholstery, warm ambient coving, metallic accents', icon: '✨' },
  { id: 'scandinavian', label: 'Scandinavian', desc: 'Light oak, airy whites, textured fabrics, functional warmth', icon: '❄️' },
  { id: 'japandi', label: 'Japandi', desc: 'Japanese wabi-sabi meets Scandinavian ergonomics, organic textures', icon: '🎋' },
  { id: 'tropical_resort', label: 'Tropical Resort', desc: 'Open spatial flow, terracotta, teak, louvered elements, resort vibes', icon: '🏖️' },
  { id: 'traditional_indian', label: 'Traditional Indian', desc: 'Carved rosewood/teak, handloom cushions, brass uruli, heritage warmth', icon: '🪔' },
  { id: 'budget_modern', label: 'Budget-Friendly Modern', desc: 'High visual impact with cost-optimized Amazon & IKEA flat-pack furniture', icon: '🏷️' },
  { id: 'industrial', label: 'Industrial', desc: 'Exposed metal frames, reclaimed wood, matte black fixtures', icon: '🏭' },
  { id: 'hotel_suite', label: 'Hotel-Inspired Suite', desc: 'Boutique hotel luxury, symetrical bedside lamps, upholstered accent wall', icon: '🏨' },
];

const KERALA_DISTRICTS = [
  'Kochi',
  'Ernakulam',
  'Thrissur',
  'Kozhikode',
  'Thiruvananthapuram',
  'Kottayam',
  'Palakkad',
  'Malappuram',
  'Kannur',
  'Kollam',
  'Alappuzha',
  'Pathanamthitta',
  'Idukki',
  'Wayanad',
  'Kasaragod'
];

export const DesignPreferencesModal: React.FC<{ onGenerated: () => void; onBack: () => void }> = ({ onGenerated, onBack }) => {
  const preferences = useInteriorStore((state) => state.preferences);
  const setPreferences = useInteriorStore((state) => state.setPreferences);
  const generateAlternatives = useInteriorStore((state) => state.generateAlternatives);

  const [selectedStyle, setSelectedStyle] = useState<InteriorDesignStyle>(preferences.style);
  const [customStyle, setCustomStyle] = useState<string>('');
  const [budgetTarget, setBudgetTarget] = useState<number>(preferences.targetBudget || 250000);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(preferences.keralaDistrict || 'Kochi');

  const [retailers, setRetailers] = useState<{
    amazon: boolean;
    ikea: boolean;
    flipkart: boolean;
    keralaLocal: boolean;
  }>({
    amazon: preferences.preferredRetailers.includes('Amazon India'),
    ikea: preferences.preferredRetailers.includes('IKEA India'),
    flipkart: preferences.preferredRetailers.includes('Flipkart'),
    keralaLocal: preferences.preferredRetailers.includes('Kerala Local / Nilambur Crafts') || true
  });

  const [accessibility, setAccessibility] = useState<boolean>(false);

  const handleGenerate = () => {
    const preferredList: string[] = [];
    if (retailers.amazon) preferredList.push('Amazon India');
    if (retailers.ikea) preferredList.push('IKEA India');
    if (retailers.flipkart) preferredList.push('Flipkart');
    if (retailers.keralaLocal) preferredList.push('Kerala Local / Nilambur Crafts');

    setPreferences({
      style: selectedStyle,
      targetBudget: budgetTarget,
      keralaDistrict: selectedDistrict,
      preferredRetailers: preferredList,
      specialRequirements: accessibility ? 'Wheelchair 0.9m circulation buffer' : undefined
    });

    generateAlternatives();
    onGenerated();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-cad-darkest text-cad-light overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">

        {/* Wizard Header */}
        <div className="bg-cad-surface border border-cad-border rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold text-black rounded font-mono">
                AI Interior Wizard
              </span>
              <span className="text-xs text-cad-muted">Style, Budget & Regional Sourcing</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Configure Your Interior Design Preferences
            </h2>
            <p className="text-xs text-cad-light/80 max-w-xl">
              We generate 3 complete, editable designs (Budget, Balanced, and Premium) populated exclusively with verified real-world products delivered to your Kerala address.
            </p>
          </div>
        </div>

        {/* Style Selection Cards Grid */}
        <div className="bg-cad-surface border border-cad-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gold" />
              <span>Select Interior Design Style</span>
            </h3>
            <span className="text-[11px] text-gold font-mono">
              Selected: {STYLE_CARDS.find((s) => s.id === selectedStyle)?.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {STYLE_CARDS.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gold/15 border-gold text-white shadow-gold-glow/20'
                      : 'bg-cad-dark/70 border-cad-border hover:border-gold/50 text-cad-light'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{style.icon}</span>
                    {isSelected && <Check className="w-4 h-4 text-gold" />}
                  </div>
                  <div className="text-xs font-semibold text-white mb-1">{style.label}</div>
                  <div className="text-[10px] text-cad-muted leading-relaxed line-clamp-2">{style.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Custom style notes */}
          <div className="pt-2">
            <input
              type="text"
              placeholder="Or enter custom styling nuances (e.g., Nilambur teak dining with brass pendant lighting & warm beige walls)..."
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              className="w-full bg-cad-dark border border-cad-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold placeholder-cad-muted"
            />
          </div>
        </div>

        {/* Budget & Kerala Delivery Sourcing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Target Budget Card */}
          <div className="bg-cad-surface border border-cad-border rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-gold">
              <Coins className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Target Room Budget (INR ₹)</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-cad-muted">Room Furnishing Limit:</span>
                <span className="text-base font-bold text-gold font-mono">
                  ₹{budgetTarget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="75000"
                max="1000000"
                step="25000"
                value={budgetTarget}
                onChange={(e) => setBudgetTarget(Number(e.target.value))}
                className="w-full accent-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-cad-muted font-mono">
                <span>₹75k (Economy)</span>
                <span>₹2.5L (Balanced)</span>
                <span>₹10L (Luxury)</span>
              </div>
            </div>

            <div className="text-[11px] text-cad-muted bg-cad-dark p-3 rounded border border-cad-border space-y-1">
              <div className="flex justify-between">
                <span>• Budget-Conscious tier:</span>
                <span className="text-white font-mono">~₹{(budgetTarget * 0.55).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>• Balanced tier:</span>
                <span className="text-white font-mono">~₹{(budgetTarget * 0.95).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>• Premium tier:</span>
                <span className="text-white font-mono">~₹{(budgetTarget * 1.5).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Regional Kerala Sourcing */}
          <div className="bg-cad-surface border border-cad-border rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <MapPin className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Kerala Delivery Locality</h3>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-cad-muted">District / Major Hub:</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-cad-dark border border-cad-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
              >
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Preferred Retailers Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] text-cad-muted uppercase tracking-wider block">Authorized Sourcing Partners:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2 bg-cad-dark p-2 rounded border border-cad-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retailers.amazon}
                    onChange={(e) => setRetailers({ ...retailers, amazon: e.target.checked })}
                    className="accent-gold"
                  />
                  <span>Amazon India</span>
                </label>
                <label className="flex items-center space-x-2 bg-cad-dark p-2 rounded border border-cad-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retailers.ikea}
                    onChange={(e) => setRetailers({ ...retailers, ikea: e.target.checked })}
                    className="accent-gold"
                  />
                  <span>IKEA India</span>
                </label>
                <label className="flex items-center space-x-2 bg-cad-dark p-2 rounded border border-cad-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retailers.flipkart}
                    onChange={(e) => setRetailers({ ...retailers, flipkart: e.target.checked })}
                    className="accent-gold"
                  />
                  <span>Flipkart</span>
                </label>
                <label className="flex items-center space-x-2 bg-cad-dark p-2 rounded border border-cad-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retailers.keralaLocal}
                    onChange={(e) => setRetailers({ ...retailers, keralaLocal: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-gold font-semibold">Kerala Artisans</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Constraints */}
        <div className="bg-cad-surface border border-cad-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center space-x-2 text-xs text-cad-light cursor-pointer">
            <input
              type="checkbox"
              checked={accessibility}
              onChange={(e) => setAccessibility(e.target.checked)}
              className="accent-gold"
            />
            <span>Ensure 0.9m Wheelchair Circulation Buffer</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-cad-border hover:bg-cad-surface rounded-lg text-xs font-medium text-cad-light transition"
          >
            ← Back to Geometry Review
          </button>

          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-gradient-to-r from-gold via-gold-light to-gold text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-gold-glow hover:brightness-110 active:scale-98 transition flex items-center space-x-2"
          >
            <span>Generate 3 Interior Alternatives</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
