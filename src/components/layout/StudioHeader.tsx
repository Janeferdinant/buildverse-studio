import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore, MainNavPage } from '../../store/editorStore';
import { StorageRepository } from '../../services/storageRepository';
import { exportBOQToCSV } from '../../services/csvExporter';
import { 
  Building2, 
  Undo2, 
  Redo2, 
  Save, 
  Download, 
  Layers, 
  FileSpreadsheet, 
  BarChart3, 
  Calendar, 
  Coins, 
  Compass,
  FileText,
  Home,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const StudioHeader: React.FC = () => {
  const project = useProjectStore((state) => state.project);
  const isDirty = useProjectStore((state) => state.isDirty);
  const lastSavedAt = useProjectStore((state) => state.lastSavedAt);
  const saveProject = useProjectStore((state) => state.saveProject);
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);
  const past = useProjectStore((state) => state.past);
  const future = useProjectStore((state) => state.future);
  const boqEstimate = useProjectStore((state) => state.boqEstimate);

  const activePage = useEditorStore((state) => state.activePage);
  const setActivePage = useEditorStore((state) => state.setActivePage);
  const activeFloorId = useEditorStore((state) => state.activeFloorId);
  const setActiveFloorId = useEditorStore((state) => state.setActiveFloorId);

  const handleSave = () => {
    saveProject();
  };

  const handleExportJSON = () => {
    StorageRepository.exportProjectJSON(project);
  };

  const handleExportCSV = () => {
    exportBOQToCSV(project.name, boqEstimate);
  };

  return (
    <header className="h-14 bg-cad-dark border-b border-cad-border flex items-center justify-between px-4 z-30 select-none">
      {/* Brand & Project Info */}
      <div className="flex items-center space-x-4">
        <div 
          onClick={() => setActivePage('dashboard')}
          className="flex items-center space-x-2 cursor-pointer group"
          title="Return to Projects Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-terracotta flex items-center justify-center text-black font-bold shadow-md">
            <Building2 className="w-5 h-5 text-cad-darkest" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wider flex items-center space-x-1.5">
              <span>BUILDVERSE</span>
              <span className="text-[10px] uppercase px-1.5 py-0.2 bg-gold-dark/40 text-gold-glow rounded border border-gold/30">STUDIO</span>
            </div>
            <div className="text-[10px] text-cad-muted tracking-tight">KERALA BIM & ARCHITECTURE CAD</div>
          </div>
        </div>

        <div className="h-6 w-px bg-cad-border" />

        {/* Project Title & Plot Spec */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white truncate max-w-[200px]" title={project.name}>
            {project.name}
          </span>
          <span className="text-[10px] text-cad-muted font-mono">
            {project.metadata.location} • {project.metadata.plotArea} m² ({project.metadata.plotLength}m × {project.metadata.plotWidth}m)
          </span>
        </div>
      </div>

      {/* Primary Navigation Ribbon Tabs */}
      <nav className="flex items-center space-x-1">
        <button
          onClick={() => setActivePage('dashboard')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
            activePage === 'dashboard' ? 'bg-cad-surface text-gold font-medium' : 'text-cad-light hover:bg-cad-surface/60'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActivePage('designer')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
            activePage === 'designer' ? 'bg-gold text-black font-semibold shadow-gold-glow' : 'text-cad-light hover:bg-cad-surface/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>3D Designer</span>
        </button>

        <button
          onClick={() => setActivePage('interiors')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs transition-all ${
            activePage === 'interiors'
              ? 'bg-gradient-to-r from-gold via-amber-400 to-terracotta text-black font-bold shadow-gold-glow'
              : 'text-gold hover:text-white hover:bg-cad-surface/60 border border-gold/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-glow" />
          <span>AI Room Designer</span>
        </button>

        <button
          onClick={() => setActivePage('floorplans')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
            activePage === 'floorplans' ? 'bg-cad-surface text-gold font-medium' : 'text-cad-light hover:bg-cad-surface/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2D Floor Plans</span>
        </button>

        <button
          onClick={() => setActivePage('qto')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
            activePage === 'qto' ? 'bg-cad-surface text-gold font-medium' : 'text-cad-light hover:bg-cad-surface/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Quantity Take-Off</span>
        </button>

        <button
          onClick={() => setActivePage('estimator')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
            activePage === 'estimator' ? 'bg-cad-surface text-gold font-medium' : 'text-cad-light hover:bg-cad-surface/60'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>BOQ Cost Estimator</span>
        </button>

        <button
          onClick={() => setActivePage('schedule')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
            activePage === 'schedule' ? 'bg-cad-surface text-gold font-medium' : 'text-cad-light hover:bg-cad-surface/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule</span>
        </button>

        <button
          onClick={() => setActivePage('financials')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
            activePage === 'financials' ? 'bg-cad-surface text-gold font-medium' : 'text-cad-light hover:bg-cad-surface/60'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Financials</span>
        </button>

        <button
          onClick={() => setActivePage('reports')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
            activePage === 'reports' ? 'bg-cad-surface text-gold font-medium' : 'text-cad-light hover:bg-cad-surface/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Reports</span>
        </button>
      </nav>

      {/* Right Actions: Undo/Redo, Floor Level, Save Status, Export */}
      <div className="flex items-center space-x-2">
        {/* Floor Level Selector */}
        {project.floors.length > 1 && (
          <div className="flex items-center space-x-1 text-xs bg-cad-surface px-2 py-1 rounded border border-cad-border">
            <span className="text-[10px] text-cad-muted">Level:</span>
            <select
              value={activeFloorId}
              onChange={(e) => setActiveFloorId(e.target.value)}
              className="bg-transparent text-cad-light focus:outline-none cursor-pointer"
            >
              {project.floors.map((floor) => (
                <option key={floor.id} value={floor.id} className="bg-cad-surface">
                  {floor.name} (+{floor.elevation}m)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Undo / Redo */}
        <div className="flex items-center space-x-0.5 bg-cad-surface rounded border border-cad-border p-0.5">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className={`p-1 rounded ${past.length > 0 ? 'text-cad-light hover:bg-cad-border' : 'text-cad-muted/40 cursor-not-allowed'}`}
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className={`p-1 rounded ${future.length > 0 ? 'text-cad-light hover:bg-cad-border' : 'text-cad-muted/40 cursor-not-allowed'}`}
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Save Button & Dirty Indicator */}
        <button
          onClick={handleSave}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
            isDirty
              ? 'bg-gold/20 text-gold-bright border-gold/40 hover:bg-gold/30'
              : 'bg-cad-surface text-cad-muted border-cad-border hover:text-cad-light'
          }`}
          title={lastSavedAt ? `Saved at ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Save Project to Local Repository'}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isDirty ? 'Save*' : 'Saved'}</span>
        </button>

        {/* Export Dropdown / Menu */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-2.5 py-1 bg-blueprint/20 hover:bg-blueprint/30 text-blueprint-light border border-blueprint/40 rounded text-xs font-medium transition-colors"
            title="Export Bill of Quantities (BOQ) as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>BOQ CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="p-1 bg-cad-surface hover:bg-cad-border text-cad-light border border-cad-border rounded text-xs"
            title="Export Raw Project JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
