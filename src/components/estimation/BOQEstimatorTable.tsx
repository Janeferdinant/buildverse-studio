import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { exportBOQToCSV } from '../../services/csvExporter';
import { 
  FileSpreadsheet, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Search, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';

export const BOQEstimatorTable: React.FC = () => {
  const project = useProjectStore((state) => state.project);
  const boqEstimate = useProjectStore((state) => state.boqEstimate);
  const costSettings = useProjectStore((state) => state.costSettings);
  const updateCostSettings = useProjectStore((state) => state.updateCostSettings);

  const [search, setSearch] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string>('all');

  const packages = ['all', ...Array.from(new Set(boqEstimate.lineItems.map((item) => item.workPackage)))];

  const filteredItems = boqEstimate.lineItems.filter((item) => {
    const matchesPkg = selectedPackage === 'all' || item.workPackage === selectedPackage;
    const matchesSearch = item.componentName.toLowerCase().includes(search.toLowerCase()) ||
                          item.sourceReference.toLowerCase().includes(search.toLowerCase());
    return matchesPkg && matchesSearch;
  });

  const handleExportCSV = () => {
    exportBOQToCSV(project.name, boqEstimate);
  };

  return (
    <div className="flex-1 h-full bg-cad-darkest flex flex-col overflow-hidden select-none">
      {/* BOQ Header & Financial KPI Summary */}
      <div className="p-4 bg-cad-dark border-b border-cad-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Bill of Quantities (BOQ) & Cost Estimation
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-cad-muted">Estimate Status:</span>
              {boqEstimate.isComplete ? (
                <span className="px-2 py-0.5 rounded bg-green-950/60 border border-green-700/60 text-green-300 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>COMPLETE & AUDITED</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-600/60 text-amber-300 font-semibold flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>INCOMPLETE ({boqEstimate.missingPriceCount} UNPRICED)</span>
                </span>
              )}
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-1 bg-gold hover:bg-gold-bright text-black font-semibold rounded text-xs transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Cost Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono">
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Direct Material Cost</span>
            <span className="text-sm font-bold text-white">₹{boqEstimate.totalMaterialCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Labour & Installation</span>
            <span className="text-sm font-bold text-white">₹{boqEstimate.totalLabourCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">GST Taxes (12-18%)</span>
            <span className="text-sm font-bold text-blueprint-light">₹{boqEstimate.totalTaxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Contractor OH & Profit</span>
            <span className="text-sm font-bold text-white">₹{boqEstimate.overheadAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="bg-cad-surface/80 p-2.5 rounded-lg border border-cad-border/70">
            <span className="text-[10px] text-cad-muted block">Contingency (5%)</span>
            <span className="text-sm font-bold text-white">₹{boqEstimate.contingencyAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="bg-cad-surface/90 p-2.5 rounded-lg border border-gold/40 shadow-gold-glow">
            <span className="text-[10px] text-gold block font-semibold">Grand Estimated Total</span>
            <span className="text-sm font-bold text-gold-glow">₹{boqEstimate.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <span className="text-[10px] text-cad-muted block">₹{boqEstimate.costPerSqMetre.toFixed(0)} / m² plinth</span>
          </div>
        </div>
      </div>

      {/* Missing Price Alert Banner if any */}
      {!boqEstimate.isComplete && (
        <div className="p-2.5 bg-amber-950/40 border-b border-amber-600/40 px-4 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Cost Integrity Notice:</strong> {boqEstimate.missingPriceCount} line item(s) have unpriced materials. As per engineering rules, missing items are flagged rather than silently treated as zero cost.
            </span>
          </div>
          <span className="font-mono text-[11px] underline">Add rates in Materials Catalog to finalize</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3 bg-cad-panel border-b border-cad-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-cad-muted" />
            <input
              type="text"
              placeholder="Search BOQ items or sources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-cad-surface border border-cad-border rounded pl-8 pr-3 py-1 text-xs text-cad-light focus:outline-none focus:border-gold w-64"
            />
          </div>

          <div className="flex items-center space-x-1 pl-2 border-l border-cad-border">
            <Filter className="w-3.5 h-3.5 text-cad-muted" />
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="bg-cad-surface border border-cad-border rounded px-2 py-1 text-xs text-cad-light focus:outline-none"
            >
              {packages.map((pkg) => (
                <option key={pkg} value={pkg}>
                  Package: {pkg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-cad-muted text-xs">
          Showing <strong>{filteredItems.length}</strong> line items
        </div>
      </div>

      {/* BOQ Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="border border-cad-border rounded-lg overflow-hidden bg-cad-dark shadow-panel">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-cad-surface text-cad-muted uppercase text-[10px] tracking-wider border-b border-cad-border">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Work Package & Description</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3">Unit</th>
                <th className="p-3 text-right">Material Rate</th>
                <th className="p-3 text-right">Labour Rate</th>
                <th className="p-3 text-right">Composite Rate</th>
                <th className="p-3 text-right">Direct Cost (₹)</th>
                <th className="p-3 text-right">GST (₹)</th>
                <th className="p-3 text-right">Total Line Cost (₹)</th>
                <th className="p-3">Rate Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cad-border text-cad-light text-[11px]">
              {filteredItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    item.isPriceMissing ? 'bg-amber-950/20 hover:bg-amber-950/30' : 'hover:bg-cad-surface/50'
                  }`}
                >
                  <td className="p-3 text-cad-muted">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-semibold text-white font-sans">{item.componentName}</div>
                    <div className="text-[10px] text-cad-muted">{item.workPackage}</div>
                  </td>
                  <td className="p-3 text-right font-bold text-white">{item.quantity.toFixed(2)}</td>
                  <td className="p-3 text-cad-muted">{item.unit}</td>
                  <td className="p-3 text-right">
                    {item.isPriceMissing ? (
                      <span className="text-amber-400 italic">Unpriced</span>
                    ) : (
                      `₹${item.materialRate.toLocaleString('en-IN')}`
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {item.isPriceMissing ? '—' : `₹${item.labourRate.toLocaleString('en-IN')}`}
                  </td>
                  <td className="p-3 text-right font-semibold text-white">
                    {item.isPriceMissing ? '—' : `₹${item.compositeRate.toLocaleString('en-IN')}`}
                  </td>
                  <td className="p-3 text-right font-bold text-white">
                    {item.isPriceMissing ? '—' : `₹${item.directCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  </td>
                  <td className="p-3 text-right text-blueprint-light">
                    {item.isPriceMissing ? '—' : `₹${item.taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  </td>
                  <td className="p-3 text-right font-bold text-gold text-xs">
                    {item.isPriceMissing ? (
                      <span className="text-amber-400">PENDING</span>
                    ) : (
                      `₹${item.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                    )}
                  </td>
                  <td className="p-3 text-[10px]">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-tight ${
                        item.priceSource === 'official_schedule_rate'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : item.priceSource === 'verified_market_rate'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : item.priceSource === 'supplier_quotation'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {item.priceSource.replace(/_/g, ' ')}
                    </span>
                    <div className="text-[10px] text-cad-muted truncate max-w-xs mt-0.5" title={item.sourceReference}>
                      {item.sourceReference}
                    </div>
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
