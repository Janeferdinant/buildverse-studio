import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { StorageRepository, ProjectIndexItem } from '../../services/storageRepository';
import { ProjectWizardModal } from './ProjectWizardModal';
import { 
  Building2, 
  Plus, 
  Upload, 
  FolderOpen, 
  Trash2, 
  Calendar, 
  MapPin, 
  Ruler, 
  Coins, 
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2
} from 'lucide-react';

export const ProjectDashboard: React.FC = () => {
  const loadTemplate = useProjectStore((state) => state.loadTemplate);
  const loadProject = useProjectStore((state) => state.loadProject);
  const currentProject = useProjectStore((state) => state.project);
  const setActivePage = useEditorStore((state) => state.setActivePage);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ProjectIndexItem[]>([]);

  useEffect(() => {
    setSavedProjects(StorageRepository.listProjects());
  }, []);

  const handleOpenTemplate = (type: 'villa' | 'wedding_hall' | 'resort') => {
    loadTemplate(type);
    setActivePage('designer');
  };

  const handleOpenSaved = (id: string) => {
    const proj = StorageRepository.loadProject(id);
    if (proj) {
      loadProject(proj);
      setActivePage('designer');
    }
  };

  const handleDeleteSaved = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      StorageRepository.deleteProject(id);
      setSavedProjects(StorageRepository.listProjects());
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.id && parsed.components) {
          loadProject(parsed);
          StorageRepository.saveProject(parsed);
          setSavedProjects(StorageRepository.listProjects());
          setActivePage('designer');
        } else {
          alert('Invalid BuildVerse Studio project file structure.');
        }
      } catch (err) {
        alert('Failed to parse project JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 h-full bg-cad-darkest overflow-y-auto p-8 select-none text-cad-light">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-cad-panel via-cad-dark to-cad-panel border border-cad-border/80 p-8 shadow-2xl overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-bright text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Architectural CAD & Kerala Construction Simulator</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
              Precision 3D Architecture, Mathematical QTO & Authentic Indian BOQ
            </h1>
            <p className="text-sm text-cad-muted leading-relaxed mb-6">
              Design buildings parametrically, pierce walls with doors and windows, calculate exact quantities from geometry without pixel approximation, and audit construction costs with Kerala PWD SOR 2024 rates.
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsWizardOpen(true)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gold hover:bg-gold-bright text-black font-bold rounded-xl text-xs transition-all shadow-gold-glow"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Project</span>
              </button>
              <button
                onClick={() => setActivePage('designer')}
                className="flex items-center space-x-2 px-5 py-2.5 bg-cad-surface hover:bg-cad-border text-white font-medium rounded-xl text-xs border border-cad-border transition-colors"
              >
                <Compass className="w-4 h-4 text-gold" />
                <span>Resume 3D Designer</span>
              </button>
              <label className="flex items-center space-x-2 px-4 py-2.5 bg-cad-surface hover:bg-cad-border text-cad-light rounded-xl text-xs border border-cad-border cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-cad-muted" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Professional Starter Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide uppercase">
                Demonstration Starter Templates
              </h2>
              <p className="text-xs text-cad-muted">
                Fully parameterized architectural starter models with complete 3D geometry and Kerala BOQs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Modern Villa */}
            <div className="bg-cad-dark rounded-2xl border border-cad-border/70 hover:border-gold/60 p-5 shadow-panel transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                    Residential Villa
                  </span>
                  <span className="text-xs text-gold font-bold font-mono">₹78 Lakhs Budget</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors mb-1.5">
                  Kerala Contemporary Tropical Villa
                </h3>
                <p className="text-xs text-cad-muted leading-relaxed mb-4">
                  2-storey villa with living hall, master suite, sit-out porch, UPVC casement windows, and a 30° pitched Kerala clay roof.
                </p>
                <div className="space-y-1.5 text-xs text-cad-light font-mono mb-4 bg-cad-surface/60 p-3 rounded-lg border border-cad-border/50">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-cad-muted" />
                    <span>Kakkanad, Kochi (8.7 Cents / 352 m²)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Ruler className="w-3.5 h-3.5 text-cad-muted" />
                    <span>2 Levels • 12m × 10m Ground Footprint</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOpenTemplate('villa')}
                className="w-full py-2 bg-cad-surface group-hover:bg-gold group-hover:text-black text-cad-light border border-cad-border group-hover:border-gold rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
              >
                <span>Launch Villa Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Wedding & Convention Hall */}
            <div className="bg-cad-dark rounded-2xl border border-cad-border/70 hover:border-gold/60 p-5 shadow-panel transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                    Commercial Assembly
                  </span>
                  <span className="text-xs text-gold font-bold font-mono">₹3.50 Crores Budget</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors mb-1.5">
                  Grand Royal Convention & Wedding Hall
                </h3>
                <p className="text-xs text-cad-muted leading-relaxed mb-4">
                  1000-guest convention centre featuring 600m² pillar-free auditorium, elevated wedding mandap stage, and visitor parking.
                </p>
                <div className="space-y-1.5 text-xs text-cad-light font-mono mb-4 bg-cad-surface/60 p-3 rounded-lg border border-cad-border/50">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-cad-muted" />
                    <span>Edappally, Kochi (66 Cents / 2700 m²)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Ruler className="w-3.5 h-3.5 text-cad-muted" />
                    <span>30m × 20m Main Hall • 6.5m Ceiling</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOpenTemplate('wedding_hall')}
                className="w-full py-2 bg-cad-surface group-hover:bg-gold group-hover:text-black text-cad-light border border-cad-border group-hover:border-gold rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
              >
                <span>Launch Convention Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Resort & Spa */}
            <div className="bg-cad-dark rounded-2xl border border-cad-border/70 hover:border-gold/60 p-5 shadow-panel transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                    Hospitality & Resort
                  </span>
                  <span className="text-xs text-gold font-bold font-mono">₹4.80 Crores Budget</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors mb-1.5">
                  Kerala Backwater Eco-Resort & Spa
                </h3>
                <p className="text-xs text-cad-muted leading-relaxed mb-4">
                  Backwater retreat with dressed laterite stone cottages, tropical veranda sit-outs, and an infinity swimming pool.
                </p>
                <div className="space-y-1.5 text-xs text-cad-light font-mono mb-4 bg-cad-surface/60 p-3 rounded-lg border border-cad-border/50">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-cad-muted" />
                    <span>Kumarakom, Kottayam (92 Cents / 3750 m²)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Ruler className="w-3.5 h-3.5 text-cad-muted" />
                    <span>15m Infinity Pool • Laterite Masonry</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOpenTemplate('resort')}
                className="w-full py-2 bg-cad-surface group-hover:bg-gold group-hover:text-black text-cad-light border border-cad-border group-hover:border-gold rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
              >
                <span>Launch Resort Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Locally Saved Projects Repository */}
        <div className="bg-cad-dark rounded-2xl border border-cad-border/70 p-6 shadow-panel">
          <div className="flex items-center justify-between mb-4 border-b border-cad-border/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Saved Projects Repository ({savedProjects.length})
              </h2>
              <p className="text-xs text-cad-muted">
                Persistent local projects saved in your browser storage.
              </p>
            </div>
          </div>

          {savedProjects.length > 0 ? (
            <div className="divide-y divide-cad-border/60">
              {savedProjects.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between hover:bg-cad-surface/30 px-3 rounded-lg transition-colors">
                  <div>
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="text-xs text-cad-muted flex items-center space-x-3 mt-1 font-mono">
                      <span>{p.location}</span>
                      <span>•</span>
                      <span>{p.plotArea} m²</span>
                      <span>•</span>
                      <span>Target: ₹{p.budget?.toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>Saved: {new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenSaved(p.id)}
                      className="px-3 py-1.5 bg-cad-surface hover:bg-cad-border text-cad-light rounded-lg text-xs font-semibold border border-cad-border"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(p.id, p.name)}
                      className="p-1.5 text-cad-muted hover:text-red-400 rounded-lg hover:bg-red-950/30"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-cad-muted italic">
              No saved custom projects yet. Click "Start New Project" or open a template above and click Save.
            </div>
          )}
        </div>
      </div>

      <ProjectWizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
};
