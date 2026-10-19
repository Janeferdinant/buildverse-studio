import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { X, Sparkles, Building2, MapPin, Ruler, DollarSign, ArrowRight } from 'lucide-react';

interface ProjectWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({ isOpen, onClose }) => {
  const initNewProject = useProjectStore((state) => state.initNewProject);
  const setActivePage = useEditorStore((state) => state.setActivePage);

  const [name, setName] = useState('');
  const [type, setType] = useState<'villa' | 'wedding_hall' | 'resort' | 'commercial' | 'landscape'>('villa');
  const [location, setLocation] = useState('Kochi, Kerala');
  const [plotLength, setPlotLength] = useState(20);
  const [plotWidth, setPlotWidth] = useState(15);
  const [budget, setBudget] = useState(6500000);
  const [style, setStyle] = useState('Contemporary Kerala Tropical');

  if (!isOpen) return null;

  const plotArea = plotLength * plotWidth;
  const cents = (plotArea * 0.0247).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initNewProject({
      name: name || `New ${type.toUpperCase()} Project`,
      type,
      location,
      plotLength,
      plotWidth,
      budget,
    });
    setActivePage('designer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-cad-dark border border-cad-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-cad-panel border-b border-cad-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Project Creation Wizard
            </h3>
          </div>
          <button onClick={onClose} className="text-cad-muted hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-cad-muted uppercase tracking-wider text-[11px] block mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Skyline Waterfront Villa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-cad-muted uppercase tracking-wider text-[11px] block mb-1">
                Project Typology
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
              >
                <option value="villa">Residential Villa</option>
                <option value="wedding_hall">Convention / Wedding Hall</option>
                <option value="resort">Eco-Resort & Cottages</option>
                <option value="commercial">Commercial Office</option>
                <option value="landscape">Landscape Garden</option>
              </select>
            </div>

            <div>
              <label className="text-cad-muted uppercase tracking-wider text-[11px] block mb-1">
                Site Location (Kerala, India)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Plot Dimensions */}
          <div className="bg-cad-surface/60 p-4 rounded-xl border border-cad-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cad-light uppercase tracking-wide text-[11px] flex items-center space-x-1.5">
                <Ruler className="w-4 h-4 text-gold" />
                <span>Plot Boundary & Dimensions (Metres)</span>
              </span>
              <span className="text-gold font-mono text-xs font-bold">
                {plotArea} m² (~{cents} Cents)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-cad-muted block mb-1">Plot Length (m)</span>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={plotLength}
                  onChange={(e) => setPlotLength(parseFloat(e.target.value) || 0)}
                  className="w-full bg-cad-dark border border-cad-border rounded px-3 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <span className="text-cad-muted block mb-1">Plot Width (m)</span>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={plotWidth}
                  onChange={(e) => setPlotWidth(parseFloat(e.target.value) || 0)}
                  className="w-full bg-cad-dark border border-cad-border rounded px-3 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-cad-muted uppercase tracking-wider text-[11px] block mb-1">
                Estimated Target Budget (INR ₹)
              </label>
              <input
                type="number"
                step="100000"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="text-cad-muted uppercase tracking-wider text-[11px] block mb-1">
                Architectural Style
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="text-[11px] text-cad-muted bg-cad-panel/60 p-3 rounded-lg border border-cad-border/50">
            <strong>Applicable Standards:</strong> Kerala Municipality Building Rules (KMBR 2019) & National Building Code (NBC India) • Metric Units (metres, m², m³) • Currency: INR (₹).
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-cad-surface hover:bg-cad-border text-cad-light rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 bg-gold hover:bg-gold-bright text-black rounded-lg text-xs font-bold shadow-md transition-colors"
            >
              <span>Initialize 3D Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
