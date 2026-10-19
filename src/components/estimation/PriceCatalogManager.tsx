import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { PriceRecord, PriceSourceType } from '../../types/pricing';
import { 
  Coins, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  ShieldCheck, 
  Check, 
  X,
  ExternalLink,
  Info
} from 'lucide-react';

export const PriceCatalogManager: React.FC = () => {
  const catalog = useProjectStore((state) => state.catalog);
  const updateMaterialPrice = useProjectStore((state) => state.updateMaterialPrice);

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<number>(0);
  const [editLabour, setEditLabour] = useState<number>(0);

  const filteredCatalog = catalog.filter((item) => {
    const matchesSource = sourceFilter === 'all' || item.sourceType === sourceFilter;
    const matchesSearch =
      item.materialName.toLowerCase().includes(search.toLowerCase()) ||
      item.specification.toLowerCase().includes(search.toLowerCase()) ||
      item.region.toLowerCase().includes(search.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const handleStartEdit = (item: PriceRecord) => {
    setEditingMaterialId(item.materialId);
    setEditRate(item.unitRate);
    setEditLabour(item.labourRatePerUnit);
  };

  const handleSaveEdit = (materialId: string) => {
    updateMaterialPrice(materialId, {
      unitRate: editRate,
      labourRatePerUnit: editLabour,
      sourceType: 'user_entered',
      sourceReference: `User-adjusted rate (Modified ${new Date().toLocaleDateString()})`,
      lastVerifiedDate: new Date().toISOString().slice(0, 10),
    });
    setEditingMaterialId(null);
  };

  return (
    <div className="flex-1 h-full bg-cad-darkest flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-cad-dark border-b border-cad-border flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Kerala Regional Material & Price Database
            </h2>
          </div>
          <p className="text-xs text-cad-muted mt-0.5">
            CPWD & Kerala PWD Schedule of Rates (SOR 2024), wholesale timber, steel mandi, and certified supplier quotations.
          </p>
        </div>

        <div className="text-xs text-cad-muted font-mono bg-cad-surface px-3 py-1.5 rounded border border-cad-border">
          Active Market: <strong className="text-gold">Kerala, India (INR ₹)</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-cad-panel border-b border-cad-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-cad-muted" />
            <input
              type="text"
              placeholder="Search materials, specifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-cad-surface border border-cad-border rounded pl-8 pr-3 py-1 text-xs text-cad-light focus:outline-none focus:border-gold w-64"
            />
          </div>

          <div className="flex items-center space-x-1 pl-2 border-l border-cad-border">
            <Filter className="w-3.5 h-3.5 text-cad-muted" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-cad-surface border border-cad-border rounded px-2 py-1 text-xs text-cad-light focus:outline-none"
            >
              <option value="all">All Provenance Types</option>
              <option value="official_schedule_rate">Official PWD Schedule Rates</option>
              <option value="verified_market_rate">Verified Dealer Quotes</option>
              <option value="supplier_quotation">Supplier Direct Quotes</option>
              <option value="user_entered">User Entered</option>
            </select>
          </div>
        </div>

        <div className="text-cad-muted text-xs">
          <strong>{filteredCatalog.length}</strong> catalog records found
        </div>
      </div>

      {/* Catalog Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="border border-cad-border rounded-lg overflow-hidden bg-cad-dark shadow-panel">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-cad-surface text-cad-muted uppercase text-[10px] tracking-wider border-b border-cad-border">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Material & Specification</th>
                <th className="p-3">Category</th>
                <th className="p-3">Unit</th>
                <th className="p-3 text-right">Material Rate (₹)</th>
                <th className="p-3 text-right">Labour Rate (₹)</th>
                <th className="p-3 text-right">Composite (₹)</th>
                <th className="p-3">Provenance & Source</th>
                <th className="p-3">Region</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cad-border text-cad-light text-[11px]">
              {filteredCatalog.map((item, idx) => {
                const isEditing = editingMaterialId === item.materialId;

                return (
                  <tr key={item.id} className="hover:bg-cad-surface/40 transition-colors">
                    <td className="p-3 text-cad-muted">{idx + 1}</td>
                    <td className="p-3 max-w-sm">
                      <div className="font-semibold text-white font-sans">{item.materialName}</div>
                      <div className="text-[10px] text-cad-muted font-sans leading-tight mt-0.5">
                        {item.specification}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-cad-surface border border-cad-border text-[9px] uppercase">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-cad-muted">{item.unit}</td>
                    <td className="p-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRate}
                          onChange={(e) => setEditRate(parseFloat(e.target.value))}
                          className="w-24 bg-cad-darkest border border-gold rounded px-1.5 py-0.5 text-right font-mono text-white text-xs"
                        />
                      ) : (
                        <span className="font-bold text-white">₹{item.unitRate.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editLabour}
                          onChange={(e) => setEditLabour(parseFloat(e.target.value))}
                          className="w-20 bg-cad-darkest border border-gold rounded px-1.5 py-0.5 text-right font-mono text-white text-xs"
                        />
                      ) : (
                        `₹${item.labourRatePerUnit.toLocaleString('en-IN')}`
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-gold">
                      ₹{(item.unitRate + item.labourRatePerUnit + item.equipmentRatePerUnit).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-mono tracking-tight ${
                          item.sourceType === 'official_schedule_rate'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : item.sourceType === 'verified_market_rate'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {item.sourceType.replace(/_/g, ' ')}
                      </span>
                      <div className="text-[10px] text-cad-muted truncate max-w-xs mt-0.5" title={item.sourceReference}>
                        {item.sourceReference}
                      </div>
                    </td>
                    <td className="p-3 text-cad-muted text-[10px]">{item.region}</td>
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleSaveEdit(item.materialId)}
                            className="p-1 bg-green-700 hover:bg-green-600 text-white rounded"
                            title="Save Rate Changes"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingMaterialId(null)}
                            className="p-1 bg-cad-surface hover:bg-cad-border text-cad-muted rounded"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 text-cad-muted hover:text-gold hover:bg-cad-surface rounded transition-colors"
                          title="Edit Rate"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
