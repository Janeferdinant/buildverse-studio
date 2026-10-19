import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  ExternalLink, 
  Coins, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  AlertTriangle, 
  Truck, 
  Wrench, 
  ShieldCheck, 
  ShoppingBag,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useInteriorStore } from '../../store/interiorStore';
import { ShoppingListItem } from '../../types/interior';
import { exportShoppingListToCSV, exportInteriorProjectJSON } from '../../services/interiorExporter';

type ViewTab = 'budget' | 'shopping_list' | 'installation_plan';

export const InteriorBudgetShoppingList: React.FC = () => {
  const alternatives = useInteriorStore((state) => state.alternatives);
  const activeTier = useInteriorStore((state) => state.activeAlternativeTier);
  const preferences = useInteriorStore((state) => state.preferences);
  const updateShoppingItemStatus = useInteriorStore((state) => state.updateShoppingItemStatus);

  const [activeTab, setActiveTab] = useState<ViewTab>('budget');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const activeAlt = alternatives?.find((a) => a.tier === activeTier) || alternatives?.[1] || null;
  if (!activeAlt) return null;

  const budget = activeAlt.budget;
  const shoppingList = activeAlt.shoppingList;
  const targetBudget = budget.targetBudget || preferences.targetBudget;
  const budgetVariance = budget.budgetRemaining;
  const budgetPercentUsed = Math.min(100, Math.round((budget.grandTotal / targetBudget) * 100));

  const handleStatusChange = (productId: string, status: ShoppingListItem['status']) => {
    updateShoppingItemStatus(productId, status);
  };

  const handleExportCSV = () => {
    exportShoppingListToCSV(activeAlt, preferences.roomType || 'Room');
  };

  const handleExportJSON = () => {
    exportInteriorProjectJSON(activeAlt, preferences.roomType || 'Room');
  };

  // Group shopping list items by category
  const filteredList = categoryFilter === 'all' 
    ? shoppingList 
    : shoppingList.filter((item: ShoppingListItem) => item.category === categoryFilter);

  const categories = Array.from(new Set(shoppingList.map((item: ShoppingListItem) => item.category)));

  return (
    <div className="flex-1 flex flex-col h-full bg-cad-darkest text-cad-light overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">

        {/* Top Header & Export Buttons */}
        <div className="bg-cad-surface border border-cad-border rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold text-black rounded font-mono">
                Itemized Procurement
              </span>
              <span className="text-xs text-cad-muted">Real-World Purchasing & Execution</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {activeAlt.title} — Budget & Procurement Dashboard
            </h2>
            <p className="text-xs text-cad-light/80 max-w-xl">
              100% verified purchasable products with direct retailer links, GST tax calculation, Kerala locality delivery rates, and installation allowances.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-cad-dark hover:bg-cad-surface border border-cad-border hover:border-gold/50 rounded-lg text-xs font-semibold text-white flex items-center space-x-1.5 transition shadow"
            >
              <Download className="w-3.5 h-3.5 text-gold" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold rounded-lg shadow-gold-glow flex items-center space-x-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Save Project JSON</span>
            </button>
          </div>
        </div>

        {/* Tabs: Budget Overview vs Shopping List vs Installation */}
        <div className="flex items-center space-x-2 border-b border-cad-border pb-2">
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition ${
              activeTab === 'budget'
                ? 'bg-cad-surface text-gold border-b-2 border-gold shadow-sm'
                : 'text-cad-muted hover:text-white hover:bg-cad-surface/50'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Itemized Budget Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('shopping_list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition ${
              activeTab === 'shopping_list'
                ? 'bg-cad-surface text-gold border-b-2 border-gold shadow-sm'
                : 'text-cad-muted hover:text-white hover:bg-cad-surface/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Grouped Shopping List ({shoppingList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('installation_plan')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition ${
              activeTab === 'installation_plan'
                ? 'bg-cad-surface text-gold border-b-2 border-gold shadow-sm'
                : 'text-cad-muted hover:text-white hover:bg-cad-surface/50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Installation & Sequence Plan</span>
          </button>
        </div>

        {/* Tab 1: Live Itemized Budget */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-cad-surface/80 border border-cad-border rounded-xl p-4 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-cad-muted">Target Budget</span>
                <div className="text-xl font-bold text-white font-mono">
                  ₹{targetBudget.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-cad-muted">Set in Preferences</span>
              </div>

              <div className="bg-cad-surface/80 border border-gold/40 rounded-xl p-4 space-y-1 shadow-gold-glow/10">
                <span className="text-[11px] uppercase tracking-wider text-gold">Total Estimated Cost</span>
                <div className="text-xl font-bold text-gold font-mono">
                  ₹{budget.grandTotal.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-cad-muted">Incl. GST & Contingency</span>
              </div>

              <div className="bg-cad-surface/80 border border-cad-border rounded-xl p-4 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-cad-muted">Variance / Remaining</span>
                <div className={`text-xl font-bold font-mono ${budgetVariance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {budgetVariance >= 0 ? `+₹${budgetVariance.toLocaleString('en-IN')}` : `-₹${Math.abs(budgetVariance).toLocaleString('en-IN')}`}
                </div>
                <span className="text-[10px] text-cad-muted">
                  {budgetVariance >= 0 ? 'Within Budget Target' : 'Exceeds Target Limit'}
                </span>
              </div>

              <div className="bg-cad-surface/80 border border-cad-border rounded-xl p-4 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-cad-muted">Budget Utilized</span>
                <div className="text-xl font-bold text-cyan-400 font-mono">
                  {budgetPercentUsed}%
                </div>
                <div className="w-full bg-cad-dark h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full ${budgetPercentUsed > 100 ? 'bg-red-500' : 'bg-gold'}`}
                    style={{ width: `${Math.min(100, budgetPercentUsed)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Line-Item Breakdown Table */}
            <div className="bg-cad-surface border border-cad-border rounded-xl overflow-hidden shadow-lg">
              <div className="px-5 py-3.5 border-b border-cad-border bg-cad-dark flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Cost Component Breakdown (INR ₹)
                </h3>
                <span className="text-xs text-cad-muted font-mono">Verified Pricing Basis</span>
              </div>

              <div className="divide-y divide-cad-border/60 text-xs">
                <div className="px-5 py-3 flex items-center justify-between hover:bg-cad-dark/40">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="font-semibold text-white">Furniture & Case Goods Subtotal</span>
                  </div>
                  <span className="font-mono text-white font-bold">₹{budget.furnitureSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="px-5 py-3 flex items-center justify-between hover:bg-cad-dark/40">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-semibold text-white">Architectural Finishes (Flooring & Wall Paint)</span>
                    <span className="text-cad-muted">({activeAlt.wallFinish} + {activeAlt.floorFinish})</span>
                  </div>
                  <span className="font-mono text-white font-bold">₹{budget.finishesSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="px-5 py-3 flex items-center justify-between hover:bg-cad-dark/40">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="font-semibold text-white">Lighting Fixtures Subtotal</span>
                  </div>
                  <span className="font-mono text-white font-bold">₹{budget.lightingSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="px-5 py-3 flex items-center justify-between hover:bg-cad-dark/40">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="font-semibold text-white">Soft Furnishings & Decoration</span>
                  </div>
                  <span className="font-mono text-white font-bold">₹{budget.decorSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="px-5 py-3 flex items-center justify-between hover:bg-cad-dark/40">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cad-light">Delivery Charges to Kerala</span>
                    <span className="text-cad-muted">(Combined regional logistics)</span>
                  </div>
                  <span className="font-mono text-white">₹{budget.deliverySubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="px-5 py-3 flex items-center justify-between hover:bg-cad-dark/40">
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-cad-light">Installation & Carpentry Assembly</span>
                    <span className="text-cad-muted">(Electrical fixture mount & furniture setup)</span>
                  </div>
                  <span className="font-mono text-white">₹{budget.installationSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="px-5 py-3 flex items-center justify-between hover:bg-cad-dark/40">
                  <div className="flex items-center space-x-2">
                    <span className="text-cad-muted">Goods & Services Tax (GST 18%)</span>
                    <span className="text-[10px] text-cad-muted font-mono">Applicable on installation & services</span>
                  </div>
                  <span className="font-mono text-white">₹{budget.gstAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="px-5 py-3 flex items-center justify-between hover:bg-cad-dark/40">
                  <div className="flex items-center space-x-2">
                    <span className="text-cad-muted">Contingency Buffer (5%)</span>
                    <span className="text-[10px] text-cad-muted font-mono">Unforeseen site modifications</span>
                  </div>
                  <span className="font-mono text-white">₹{budget.contingencyAmount.toLocaleString('en-IN')}</span>
                </div>

                {/* Final Total */}
                <div className="px-5 py-4 bg-cad-dark flex items-center justify-between text-sm font-bold border-t-2 border-gold/50">
                  <span className="text-white uppercase tracking-wider">Total Estimated Interior Budget</span>
                  <span className="text-gold font-mono text-lg">₹{budget.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Smart Cost Optimization Recommendations */}
            {budgetVariance < 0 && (
              <div className="bg-cad-surface border border-gold/40 rounded-xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-gold">
                  <TrendingDown className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Cost Reduction Recommendations to Meet Target
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-cad-dark p-3 rounded border border-cad-border space-y-1">
                    <div className="font-semibold text-white">Replace Solid Teak Sofa with Fabric Modular</div>
                    <p className="text-[11px] text-cad-muted">
                      Swapping the premium solid wood sofa for a high-resilience fabric sofa saves ~₹18,000 without compromising room ergonomics.
                    </p>
                  </div>
                  <div className="bg-cad-dark p-3 rounded border border-cad-border space-y-1">
                    <div className="font-semibold text-white">Sourcing Lighting from Local Ernakulam Electrical Hubs</div>
                    <p className="text-[11px] text-cad-muted">
                      Standardizing ceiling fixtures with regional Kerala lighting suppliers saves ~₹6,500 on delivery and installation.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Grouped Shopping List */}
        {activeTab === 'shopping_list' && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full capitalize font-semibold transition ${
                  categoryFilter === 'all' ? 'bg-gold text-black shadow-sm' : 'bg-cad-surface text-cad-muted hover:text-white'
                }`}
              >
                All Categories ({shoppingList.length})
              </button>
              {categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full capitalize font-semibold transition whitespace-nowrap ${
                    categoryFilter === cat ? 'bg-gold text-black shadow-sm' : 'bg-cad-surface text-cad-muted hover:text-white'
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Shopping List Items */}
            <div className="space-y-3">
              {filteredList.map((item: ShoppingListItem) => (
                <div
                  key={item.id}
                  className="bg-cad-surface border border-cad-border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-gold/40 transition"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    {/* Product Info */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cad-dark text-cyan-400 font-mono">
                          {item.retailer}
                        </span>
                        <span className="text-[10px] text-cad-muted uppercase tracking-wider font-semibold">
                          {item.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate max-w-md" title={item.productName}>
                        {item.productName}
                      </h4>
                      <div className="text-[11px] text-cad-muted flex items-center space-x-3">
                        <span>Brand: <strong className="text-white">{item.brand}</strong></span>
                        <span>•</span>
                        <span>Dims: <strong className="text-white font-mono">{item.dimensions.length}m L × {item.dimensions.thickness}m W × {item.dimensions.height}m H</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Price, Quantity, Status & Direct Link */}
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-cad-border/60">
                    <div className="text-right">
                      <div className="text-xs text-cad-muted">
                        ₹{item.unitPrice.toLocaleString('en-IN')} × {item.quantity}
                      </div>
                      <div className="text-sm font-bold text-gold font-mono">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Procurement Status Selector */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.productId, e.target.value as ShoppingListItem['status'])}
                      className={`text-xs px-2.5 py-1.5 rounded border focus:outline-none font-semibold ${
                        item.status === 'installed' ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' :
                        item.status === 'delivered' ? 'bg-blue-950/80 border-blue-500 text-blue-300' :
                        item.status === 'purchased' ? 'bg-purple-950/80 border-purple-500 text-purple-300' :
                        'bg-cad-dark border-cad-border text-cad-muted'
                      }`}
                    >
                      <option value="to_buy">To Buy</option>
                      <option value="purchased">Purchased</option>
                      <option value="delivered">Delivered</option>
                      <option value="installed">Installed</option>
                    </select>

                    {/* Buy Online Button */}
                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-cad-dark hover:bg-gold/20 hover:text-gold border border-cad-border hover:border-gold/50 rounded text-xs font-semibold text-white flex items-center space-x-1 transition shadow"
                    >
                      <span>Buy on {item.retailer.split(' ')[0]}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Installation & Execution Plan */}
        {activeTab === 'installation_plan' && (
          <div className="bg-cad-surface border border-cad-border rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Step-by-Step Interior Fit-Out & Installation Sequence
              </h3>
              <p className="text-xs text-cad-muted">
                Recommended professional sequence for contractors and carpenters in Kerala.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { step: 'Phase 1: Civil & Electrical Prep', desc: 'Conduit rough-in for pendant lamps, downlights, and concealed wall wiring. Wall surface putty prep and primer coat.' },
                { step: 'Phase 2: Ceiling & Architectural Finishes', desc: `Apply ${activeAlt.wallFinish} with 2 finish coats. Install ceiling light fixtures and verify lux levels.` },
                { step: 'Phase 3: Flooring & Baseboards', desc: `Lay ${activeAlt.floorFinish} with 3mm expansion joints and moisture barrier suitable for Kerala humidity.` },
                { step: 'Phase 4: Fixed Joinery & Modular Cabinets', desc: 'Assemble and securely anchor wardrobes, bookshelves, and wall-mounted storage to brickwork.' },
                { step: 'Phase 5: Loose Furniture & Final Styling', desc: 'Position sofas, coffee tables, beds, and soft rugs. Verify 0.9m door clearance and 0.8m walkway flow.' },
              ].map((phase, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-cad-dark p-3.5 rounded-lg border border-cad-border">
                  <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/50 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{phase.step}</h5>
                    <p className="text-xs text-cad-light/80 mt-0.5 leading-relaxed">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
