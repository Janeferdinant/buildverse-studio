import React from 'react';
import { useEditorStore, ActiveDockTab } from '../../store/editorStore';
import { useProjectStore } from '../../store/projectStore';
import { 
  ChevronUp, 
  ChevronDown, 
  BarChart3, 
  FileSpreadsheet, 
  Layers, 
  Coins, 
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const BottomEngineeringDock: React.FC = () => {
  const activeDockTab = useEditorStore((state) => state.activeDockTab);
  const setActiveDockTab = useEditorStore((state) => state.setActiveDockTab);
  const isDockExpanded = useEditorStore((state) => state.isDockExpanded);
  const toggleDockExpanded = useEditorStore((state) => state.toggleDockExpanded);

  const qtoResult = useProjectStore((state) => state.qtoResult);
  const boqEstimate = useProjectStore((state) => state.boqEstimate);

  const tabs: { id: ActiveDockTab; label: string; icon: any }[] = [
    { id: 'qto', label: `QTO Engine (${qtoResult.records.length})`, icon: BarChart3 },
    { id: 'boq', label: `Cost BOQ (₹${(boqEstimate.grandTotal / 100000).toFixed(1)}L)`, icon: FileSpreadsheet },
    { id: 'catalog', label: 'Material Rates', icon: Coins },
  ];

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 bg-cad-dark/95 backdrop-blur-md border-t border-cad-border transition-all duration-200 select-none flex flex-col ${
        isDockExpanded ? 'h-64' : 'h-9'
      }`}
    >
      {/* Dock Bar Tabs */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-cad-border/70 bg-cad-panel/80 text-xs">
        <div className="flex items-center space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isDockExpanded && activeDockTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (!isDockExpanded) toggleDockExpanded();
                  setActiveDockTab(tab.id);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition-colors ${
                  isActive
                    ? 'bg-gold text-black font-semibold'
                    : 'text-cad-light hover:bg-cad-surface'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status ticker & expand/collapse toggle */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 text-[11px] text-cad-muted">
            <span>Wall Net: <strong className="text-white">{qtoResult.summary.totalWallNetArea.toFixed(1)} m²</strong></span>
            <span>•</span>
            <span>Plinth: <strong className="text-white">{qtoResult.summary.totalFloorArea.toFixed(1)} m²</strong></span>
            <span>•</span>
            <span>Grand Total: <strong className="text-gold font-bold">₹{boqEstimate.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></span>
          </div>

          <button
            onClick={toggleDockExpanded}
            className="p-1 rounded text-cad-muted hover:text-cad-light hover:bg-cad-surface"
            title={isDockExpanded ? 'Collapse Dock' : 'Expand Dock'}
          >
            {isDockExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dock Content Body */}
      {isDockExpanded && (
        <div className="flex-1 overflow-auto p-3 text-xs font-mono">
          {activeDockTab === 'qto' && (
            <div className="space-y-1">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="text-cad-muted border-b border-cad-border/60 pb-1 uppercase text-[10px]">
                  <tr>
                    <th className="p-1">Component</th>
                    <th className="p-1">Category</th>
                    <th className="p-1 text-right">Gross</th>
                    <th className="p-1 text-right">Deduction</th>
                    <th className="p-1 text-right">Net Actual</th>
                    <th className="p-1 text-right">Total (+Wastage)</th>
                    <th className="p-1">Unit</th>
                    <th className="p-1">Calculation Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cad-border/40 text-cad-light">
                  {qtoResult.records.slice(0, 15).map((rec) => (
                    <tr key={rec.id} className="hover:bg-cad-surface/30">
                      <td className="p-1 font-sans text-white font-medium">{rec.componentName}</td>
                      <td className="p-1 text-cad-muted">{rec.category}</td>
                      <td className="p-1 text-right">{rec.grossQuantity.toFixed(2)}</td>
                      <td className="p-1 text-right text-terracotta-light">
                        {rec.deductions > 0 ? `-${rec.deductions.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-1 text-right font-bold text-white">{rec.netQuantity.toFixed(2)}</td>
                      <td className="p-1 text-right font-bold text-gold">{rec.totalWithWastage.toFixed(2)}</td>
                      <td className="p-1 text-cad-muted">{rec.unit}</td>
                      <td className="p-1 text-cad-muted text-[10px] truncate max-w-xs">{rec.calculationFormula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeDockTab === 'boq' && (
            <div className="space-y-1">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="text-cad-muted border-b border-cad-border/60 pb-1 uppercase text-[10px]">
                  <tr>
                    <th className="p-1">Item Description</th>
                    <th className="p-1 text-right">Qty</th>
                    <th className="p-1">Unit</th>
                    <th className="p-1 text-right">Unit Rate (₹)</th>
                    <th className="p-1 text-right">Direct Cost (₹)</th>
                    <th className="p-1 text-right">GST (₹)</th>
                    <th className="p-1 text-right">Line Total (₹)</th>
                    <th className="p-1">Rate Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cad-border/40 text-cad-light">
                  {boqEstimate.lineItems.slice(0, 15).map((item) => (
                    <tr key={item.id} className="hover:bg-cad-surface/30">
                      <td className="p-1 font-sans text-white font-medium">{item.componentName}</td>
                      <td className="p-1 text-right">{item.quantity.toFixed(2)}</td>
                      <td className="p-1 text-cad-muted">{item.unit}</td>
                      <td className="p-1 text-right">₹{item.materialRate.toLocaleString('en-IN')}</td>
                      <td className="p-1 text-right font-medium text-white">
                        ₹{item.directCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-right text-blueprint-light">
                        ₹{item.taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-right font-bold text-gold">
                        ₹{item.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-[10px] text-cad-muted truncate max-w-xs">{item.priceSource.replace(/_/g, ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeDockTab === 'catalog' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {useProjectStore.getState().catalog.slice(0, 12).map((mat) => (
                <div key={mat.id} className="p-2 bg-cad-surface/60 rounded border border-cad-border/50 text-[11px]">
                  <div className="font-sans font-semibold text-white truncate">{mat.materialName}</div>
                  <div className="text-gold font-bold mt-1">₹{mat.unitRate} / {mat.unit}</div>
                  <div className="text-[10px] text-cad-muted truncate">{mat.sourceType.replace(/_/g, ' ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
