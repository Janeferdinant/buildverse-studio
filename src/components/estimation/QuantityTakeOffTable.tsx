import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BarChart3, Search, Filter, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const QuantityTakeOffTable: React.FC = () => {
  const qtoResult = useProjectStore((state) => state.qtoResult);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(qtoResult.records.map((r) => r.category)))];

  const filteredRecords = qtoResult.records.filter((r) => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =
      r.componentName.toLowerCase().includes(search.toLowerCase()) ||
      r.calculationFormula.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 h-full bg-cad-darkest flex flex-col overflow-hidden select-none">
      {/* Top Header & Summary Cards */}
      <div className="p-4 bg-cad-dark border-b border-cad-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Quantity Take-Off (QTO) Audit Workbench
            </h2>
          </div>
          <div className="text-xs text-cad-muted font-mono">
            Pure Geometric Derivation • Calculated: {new Date(qtoResult.calculatedAt).toLocaleTimeString()}
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono">
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Gross Wall Area</span>
            <span className="text-sm font-bold text-white">{qtoResult.summary.totalWallGrossArea.toFixed(1)} m²</span>
          </div>
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Opening Deductions</span>
            <span className="text-sm font-bold text-terracotta-light">-{qtoResult.summary.totalOpeningsArea.toFixed(1)} m²</span>
          </div>
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Net Wall Area</span>
            <span className="text-sm font-bold text-gold">{qtoResult.summary.totalWallNetArea.toFixed(1)} m²</span>
          </div>
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Masonry Cubature</span>
            <span className="text-sm font-bold text-white">{qtoResult.summary.totalMasonryVolume.toFixed(2)} m³</span>
          </div>
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Total Floor Area</span>
            <span className="text-sm font-bold text-blueprint-light">{qtoResult.summary.totalFloorArea.toFixed(1)} m²</span>
          </div>
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Doors & Windows</span>
            <span className="text-sm font-bold text-white">
              {qtoResult.summary.doorCount} D / {qtoResult.summary.windowCount} W
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-cad-panel border-b border-cad-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-cad-muted" />
            <input
              type="text"
              placeholder="Search take-off records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-cad-surface border border-cad-border rounded pl-8 pr-3 py-1 text-xs text-cad-light focus:outline-none focus:border-gold w-64"
            />
          </div>

          <div className="flex items-center space-x-1 pl-2 border-l border-cad-border">
            <Filter className="w-3.5 h-3.5 text-cad-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-cad-surface border border-cad-border rounded px-2 py-1 text-xs text-cad-light focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-cad-muted text-xs">
          Showing <strong>{filteredRecords.length}</strong> of {qtoResult.records.length} items
        </div>
      </div>

      {/* QTO Audit Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="border border-cad-border rounded-lg overflow-hidden bg-cad-dark shadow-panel">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-cad-surface text-cad-muted uppercase text-[10px] tracking-wider border-b border-cad-border">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Component Description</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Gross Qty</th>
                <th className="p-3 text-right">Deductions</th>
                <th className="p-3 text-right">Net Qty</th>
                <th className="p-3 text-right">Wastage</th>
                <th className="p-3 text-right">Purchase Qty</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Calculation Formula / Audit Trail</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cad-border text-cad-light text-[11px]">
              {filteredRecords.map((item, idx) => (
                <tr key={item.id} className="hover:bg-cad-surface/50 transition-colors">
                  <td className="p-3 text-cad-muted">{idx + 1}</td>
                  <td className="p-3 font-semibold text-white font-sans">{item.componentName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-cad-surface border border-cad-border text-[10px] uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 text-right">{item.grossQuantity.toFixed(2)}</td>
                  <td className="p-3 text-right text-terracotta-light">
                    {item.deductions > 0 ? `-${item.deductions.toFixed(2)}` : '—'}
                  </td>
                  <td className="p-3 text-right font-bold text-white">{item.netQuantity.toFixed(2)}</td>
                  <td className="p-3 text-right text-cad-muted">{item.wastagePercent}%</td>
                  <td className="p-3 text-right font-bold text-gold">{item.totalWithWastage.toFixed(2)}</td>
                  <td className="p-3 text-cad-muted">{item.unit}</td>
                  <td className="p-3 text-[10px] text-cad-muted font-mono max-w-xs truncate" title={item.calculationFormula}>
                    {item.calculationFormula}
                  </td>
                  <td className="p-3 text-center">
                    {item.validationStatus === 'valid' ? (
                      <span className="inline-flex items-center text-green-400 text-[10px]">
                        <CheckCircle className="w-3 h-3 mr-1" /> Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-400 text-[10px]">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Check
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
