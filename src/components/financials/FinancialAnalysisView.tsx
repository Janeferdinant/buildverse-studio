import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { Coins, TrendingUp, Calculator, AlertCircle, BarChart2 } from 'lucide-react';

export const FinancialAnalysisView: React.FC = () => {
  const project = useProjectStore((state) => state.project);
  const boqEstimate = useProjectStore((state) => state.boqEstimate);

  // Default financial assumptions based on typology
  const isWeddingHall = project.type === 'wedding_hall';
  const isResort = project.type === 'resort';

  const [eventsPerMonth, setEventsPerMonth] = useState(isWeddingHall ? 12 : 6);
  const [tariffPerEventINR, setTariffPerEventINR] = useState(isWeddingHall ? 175000 : 75000);
  const [occupancyRatePct, setOccupancyRatePct] = useState(isResort ? 65 : 50);
  const [monthlyStaffINR, setMonthlyStaffINR] = useState(isWeddingHall ? 180000 : 250000);
  const [monthlyUtilitiesINR, setMonthlyUtilitiesINR] = useState(isWeddingHall ? 95000 : 120000);
  const [maintenanceReservePct, setMaintenanceReservePct] = useState(5);

  const initialCapex = boqEstimate.grandTotal > 0 ? boqEstimate.grandTotal : project.metadata.budget;

  // Annual Financials
  const annualGrossRevenue = isWeddingHall
    ? eventsPerMonth * tariffPerEventINR * 12
    : isResort
    ? (occupancyRatePct / 100) * 12 * 8500 * 365 // 12 cottages @ 8500/night
    : eventsPerMonth * tariffPerEventINR * 12;

  const annualOpEx = (monthlyStaffINR + monthlyUtilitiesINR) * 12 + annualGrossRevenue * (maintenanceReservePct / 100);
  const annualNetProfit = annualGrossRevenue - annualOpEx;
  const paybackPeriodYears = annualNetProfit > 0 ? initialCapex / annualNetProfit : 0;
  const annualROI = initialCapex > 0 ? (annualNetProfit / initialCapex) * 100 : 0;

  return (
    <div className="flex-1 h-full bg-cad-darkest flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-cad-dark border-b border-cad-border flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Commercial Financial & Business ROI Analysis
            </h2>
          </div>
          <p className="text-xs text-cad-muted mt-0.5">
            Simulate operational revenue, event bookings, tariffs, operating expenses, and payback timeline for {project.name}.
          </p>
        </div>

        <div className="text-xs text-cad-muted font-mono bg-cad-surface px-3 py-1.5 rounded border border-cad-border">
          CapEx Basis: <strong className="text-gold">₹{(initialCapex / 100000).toFixed(1)} Lakhs</strong>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Key ROI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
            <div className="bg-cad-dark p-4 rounded-xl border border-cad-border shadow-panel">
              <span className="text-[11px] text-cad-muted uppercase block mb-1">Annual Gross Revenue</span>
              <span className="text-xl font-bold text-emerald-400">
                ₹{(annualGrossRevenue / 100000).toFixed(1)} Lakhs
              </span>
              <span className="text-[10px] text-cad-muted block mt-1">₹{(annualGrossRevenue / 12).toFixed(0)} / month</span>
            </div>

            <div className="bg-cad-dark p-4 rounded-xl border border-cad-border shadow-panel">
              <span className="text-[11px] text-cad-muted uppercase block mb-1">Annual OpEx (Expenses)</span>
              <span className="text-xl font-bold text-terracotta-light">
                ₹{(annualOpEx / 100000).toFixed(1)} Lakhs
              </span>
              <span className="text-[10px] text-cad-muted block mt-1">Staff, power, maintenance</span>
            </div>

            <div className="bg-cad-dark p-4 rounded-xl border border-gold/40 shadow-gold-glow">
              <span className="text-[11px] text-gold uppercase block mb-1 font-semibold">Net Operating Profit</span>
              <span className="text-xl font-bold text-gold-glow">
                ₹{(annualNetProfit / 100000).toFixed(1)} Lakhs
              </span>
              <span className="text-[10px] text-cad-muted block mt-1">Pre-tax annual cash flow</span>
            </div>

            <div className="bg-cad-dark p-4 rounded-xl border border-cad-border shadow-panel">
              <span className="text-[11px] text-cad-muted uppercase block mb-1">Estimated Payback Period</span>
              <span className="text-xl font-bold text-blueprint-light">
                {paybackPeriodYears > 0 ? `${paybackPeriodYears.toFixed(1)} Years` : 'N/A'}
              </span>
              <span className="text-[10px] text-cad-muted block mt-1">Annual ROI: {annualROI.toFixed(1)}%</span>
            </div>
          </div>

          {/* Interactive Assumptions Input Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-cad-dark p-5 rounded-2xl border border-cad-border shadow-panel space-y-4 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center space-x-1.5 pb-2 border-b border-cad-border/60">
                <Calculator className="w-4 h-4 text-gold" />
                <span>Operational Revenue Assumptions</span>
              </h3>

              {isWeddingHall ? (
                <>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-cad-light">Monthly Bookings / Events:</span>
                      <strong className="text-gold font-mono">{eventsPerMonth} Events</strong>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="25"
                      value={eventsPerMonth}
                      onChange={(e) => setEventsPerMonth(parseInt(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-cad-light">Tariff per Booking / Day (INR):</span>
                      <strong className="text-gold font-mono">₹{tariffPerEventINR.toLocaleString('en-IN')}</strong>
                    </div>
                    <input
                      type="range"
                      min="50000"
                      max="500000"
                      step="10000"
                      value={tariffPerEventINR}
                      onChange={(e) => setTariffPerEventINR(parseInt(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-cad-light">Average Room Occupancy:</span>
                      <strong className="text-gold font-mono">{occupancyRatePct}%</strong>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="95"
                      value={occupancyRatePct}
                      onChange={(e) => setOccupancyRatePct(parseInt(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-cad-dark p-5 rounded-2xl border border-cad-border shadow-panel space-y-4 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center space-x-1.5 pb-2 border-b border-cad-border/60">
                <TrendingUp className="w-4 h-4 text-gold" />
                <span>Operating Expenses (OpEx)</span>
              </h3>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-cad-light">Monthly Staff Payroll (INR):</span>
                  <strong className="text-white font-mono">₹{monthlyStaffINR.toLocaleString('en-IN')}</strong>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="500000"
                  step="10000"
                  value={monthlyStaffINR}
                  onChange={(e) => setMonthlyStaffINR(parseInt(e.target.value))}
                  className="w-full accent-gold cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-cad-light">Monthly Power & Water Utilities (INR):</span>
                  <strong className="text-white font-mono">₹{monthlyUtilitiesINR.toLocaleString('en-IN')}</strong>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="300000"
                  step="5000"
                  value={monthlyUtilitiesINR}
                  onChange={(e) => setMonthlyUtilitiesINR(parseInt(e.target.value))}
                  className="w-full accent-gold cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-cad-light">Annual Maintenance Reserve:</span>
                  <strong className="text-white font-mono">{maintenanceReservePct}% of Revenue</strong>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={maintenanceReservePct}
                  onChange={(e) => setMaintenanceReservePct(parseInt(e.target.value))}
                  className="w-full accent-gold cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-cad-panel/60 rounded-xl border border-cad-border text-xs text-cad-muted flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Simulated Projection Disclaimer:</strong> These financial figures represent scenario models based on user-entered assumptions and estimated construction CapEx. They do not constitute certified accounting audits, guaranteed investment yields, or tax advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
