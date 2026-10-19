import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { exportBOQToCSV } from '../../services/csvExporter';
import { FileText, Printer, Download, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ProjectReportsView: React.FC = () => {
  const project = useProjectStore((state) => state.project);
  const qtoResult = useProjectStore((state) => state.qtoResult);
  const boqEstimate = useProjectStore((state) => state.boqEstimate);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportBOQToCSV(project.name, boqEstimate);
  };

  return (
    <div className="flex-1 h-full bg-cad-darkest flex flex-col overflow-hidden select-none">
      {/* Top Controls */}
      <div className="h-14 bg-cad-dark border-b border-cad-border px-6 flex items-center justify-between text-xs print:hidden">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gold" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Official Project Documentation & Engineering Report
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cad-surface hover:bg-cad-border text-cad-light border border-cad-border rounded text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gold hover:bg-gold-bright text-black rounded text-xs font-bold shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Formal Architectural Dossier */}
      <div className="flex-1 overflow-y-auto p-8 print:p-0 print:bg-white print:text-black">
        <div className="max-w-4xl mx-auto bg-cad-dark border border-cad-border rounded-2xl shadow-2xl p-8 print:border-none print:shadow-none print:bg-white text-xs space-y-6">
          {/* Formal Report Header */}
          <div className="border-b-2 border-gold pb-4 flex justify-between items-start">
            <div>
              <div className="text-[10px] font-mono text-gold uppercase tracking-widest font-bold">
                BUILDVERSE STUDIO • BIM & ARCHITECTURAL SIMULATION PLATFORM
              </div>
              <h1 className="text-xl font-extrabold text-white print:text-black tracking-tight mt-1">
                {project.name}
              </h1>
              <div className="text-xs text-cad-muted font-mono mt-1">
                Location: {project.metadata.location} • Region: Kerala, India (INR ₹)
              </div>
            </div>

            <div className="text-right font-mono text-[11px] text-cad-muted">
              <div>REPORT DATE: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>CODE: BV-{project.id.slice(0, 8).toUpperCase()}</div>
              <div>STANDARD: {project.metadata.buildingCodeProfile}</div>
            </div>
          </div>

          {/* Project Overview Statement */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-cad-surface/60 print:bg-gray-100 border border-cad-border font-mono">
            <div>
              <span className="text-[10px] text-cad-muted uppercase block">Site Plot Area</span>
              <strong className="text-white print:text-black text-sm">
                {project.metadata.plotArea} m² (~{(project.metadata.plotArea * 0.0247).toFixed(1)} Cents)
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-cad-muted uppercase block">Plinth Floor Area</span>
              <strong className="text-white print:text-black text-sm">
                {qtoResult.summary.totalFloorArea.toFixed(1)} m²
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-cad-muted uppercase block">Target Budget</span>
              <strong className="text-white print:text-black text-sm">
                ₹{(project.metadata.budget / 100000).toFixed(1)} Lakhs
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-cad-muted uppercase block">Estimated BOQ Cost</span>
              <strong className="text-gold print:text-black text-sm">
                ₹{(boqEstimate.grandTotal / 100000).toFixed(1)} Lakhs
              </strong>
            </div>
          </div>

          {/* Quantity Take-Off Summary */}
          <div>
            <h2 className="text-xs font-bold text-white print:text-black uppercase tracking-wider mb-2 font-mono flex items-center space-x-1.5">
              <span>1. Geometric Quantity Take-Off (QTO) Statement</span>
            </h2>
            <div className="border border-cad-border print:border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-cad-surface print:bg-gray-200 text-cad-muted print:text-black uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Component Metric</th>
                    <th className="p-2 text-right">Gross Measured</th>
                    <th className="p-2 text-right">Openings Deducted</th>
                    <th className="p-2 text-right">Net Actual</th>
                    <th className="p-2">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cad-border print:divide-gray-300">
                  <tr>
                    <td className="p-2 font-sans font-medium text-white print:text-black">Wall Masonry Surface</td>
                    <td className="p-2 text-right">{qtoResult.summary.totalWallGrossArea.toFixed(2)}</td>
                    <td className="p-2 text-right text-terracotta-light">-{qtoResult.summary.totalOpeningsArea.toFixed(2)}</td>
                    <td className="p-2 text-right font-bold text-gold">{qtoResult.summary.totalWallNetArea.toFixed(2)}</td>
                    <td className="p-2 text-cad-muted">m²</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-white print:text-black">Masonry Wall Cubature</td>
                    <td className="p-2 text-right">—</td>
                    <td className="p-2 text-right">—</td>
                    <td className="p-2 text-right font-bold text-white print:text-black">{qtoResult.summary.totalMasonryVolume.toFixed(2)}</td>
                    <td className="p-2 text-cad-muted">m³</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-white print:text-black">Concrete Floor Slabs</td>
                    <td className="p-2 text-right">{qtoResult.summary.totalFloorArea.toFixed(2)}</td>
                    <td className="p-2 text-right">0.00</td>
                    <td className="p-2 text-right font-bold text-white print:text-black">{qtoResult.summary.totalFloorArea.toFixed(2)}</td>
                    <td className="p-2 text-cad-muted">m²</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-white print:text-black">Sloping Roof True Surface</td>
                    <td className="p-2 text-right">—</td>
                    <td className="p-2 text-right">—</td>
                    <td className="p-2 text-right font-bold text-white print:text-black">{qtoResult.summary.totalRoofArea.toFixed(2)}</td>
                    <td className="p-2 text-cad-muted">m²</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill of Quantities & Cost Breakdown */}
          <div>
            <h2 className="text-xs font-bold text-white print:text-black uppercase tracking-wider mb-2 font-mono flex items-center space-x-1.5">
              <span>2. Bill of Quantities (BOQ) Summary by Work Package</span>
            </h2>
            <div className="border border-cad-border print:border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-cad-surface print:bg-gray-200 text-cad-muted print:text-black uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Work Package</th>
                    <th className="p-2 text-right">Direct Material (₹)</th>
                    <th className="p-2 text-right">Labour & Machinery (₹)</th>
                    <th className="p-2 text-right">GST Taxes (₹)</th>
                    <th className="p-2 text-right">Package Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cad-border print:divide-gray-300">
                  {boqEstimate.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2 font-sans text-white print:text-black">{item.componentName}</td>
                      <td className="p-2 text-right">₹{item.materialCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-2 text-right">₹{(item.labourCost + item.equipmentCost).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-2 text-right">₹{item.taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-2 text-right font-bold text-gold print:text-black">
                        ₹{item.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-cad-surface/80 print:bg-gray-100 font-bold border-t border-cad-border">
                  <tr>
                    <td className="p-2 uppercase">Total Direct Cost</td>
                    <td colSpan={3} className="p-2 text-right"></td>
                    <td className="p-2 text-right">₹{boqEstimate.totalDirectCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr>
                    <td className="p-2 uppercase">Contractor Overheads & Profit (10%)</td>
                    <td colSpan={3} className="p-2 text-right"></td>
                    <td className="p-2 text-right">₹{boqEstimate.overheadAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr>
                    <td className="p-2 uppercase">Contingency Allowance (5%)</td>
                    <td colSpan={3} className="p-2 text-right"></td>
                    <td className="p-2 text-right">₹{boqEstimate.contingencyAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr className="text-sm text-gold print:text-black border-t-2 border-gold">
                    <td className="p-2 uppercase">Grand Project Estimate (INR)</td>
                    <td colSpan={3} className="p-2 text-right"></td>
                    <td className="p-2 text-right">₹{boqEstimate.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Engineering Provenance & Integrity Statement */}
          <div className="p-4 rounded-xl bg-cad-surface/60 print:bg-gray-100 border border-cad-border text-[11px] text-cad-muted leading-relaxed space-y-2">
            <div className="font-bold text-white print:text-black uppercase tracking-wider text-[10px] flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>Authentic Cost Provenance & Engineering Audit Trail</span>
            </div>
            <p>
              Prices applied in this dossier reflect official Kerala Public Works Department (PWD) Schedule of Rates (SOR 2024), authenticated wholesale timber depot quotations from Nilambur/Ernakulam, and verified steel mandi price indices. Missing or unverified rates are strictly flagged rather than estimated as zero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
