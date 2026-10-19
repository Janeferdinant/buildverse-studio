import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { calculateWallQuantity, calculateFloorQuantity, calculateRoofQuantity } from '../../engine/qto';
import { 
  X, 
  Trash2, 
  Copy, 
  Layers, 
  Move, 
  Sliders, 
  Plus, 
  Info,
  DollarSign
} from 'lucide-react';

export const ComponentInspector: React.FC = () => {
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId);
  const isPanelOpen = useEditorStore((state) => state.isPropertiesPanelOpen);
  const setPanelOpen = useEditorStore((state) => state.setPropertiesPanelOpen);

  const project = useProjectStore((state) => state.project);
  const catalog = useProjectStore((state) => state.catalog);
  const updateComponent = useProjectStore((state) => state.updateComponent);
  const removeComponent = useProjectStore((state) => state.removeComponent);
  const duplicateComponent = useProjectStore((state) => state.duplicateComponent);
  const addOpening = useProjectStore((state) => state.addOpening);
  const removeOpening = useProjectStore((state) => state.removeOpening);

  const component = project.components.find((c) => c.id === selectedComponentId);

  if (!selectedComponentId || !component || !isPanelOpen) {
    return null;
  }

  const assignedPrice = catalog.find((p) => p.materialId === component.materialId);

  // Derived quantity calculations for current component
  let quantityNote = '';
  if (component.type === 'wall') {
    const q = calculateWallQuantity(component);
    quantityNote = `Gross: ${q.grossArea.toFixed(2)} m² | Openings: ${q.openingDeductions.toFixed(2)} m² | Net: ${q.netArea.toFixed(2)} m² (${q.netVolume.toFixed(2)} m³)`;
  } else if (component.type === 'floor') {
    const q = calculateFloorQuantity(component);
    quantityNote = `Area: ${q.area.toFixed(2)} m² | RCC Volume: ${q.concreteVolume.toFixed(2)} m³`;
  } else if (component.type === 'roof') {
    const q = calculateRoofQuantity(component);
    quantityNote = `Footprint: ${q.planFootprintArea.toFixed(2)} m² | True Slope Area: ${q.trueSurfaceArea.toFixed(2)} m²`;
  }

  const handleDimensionChange = (key: string, value: number) => {
    if (isNaN(value) || value < 0) return;
    updateComponent(component.id, {
      dimensions: {
        ...component.dimensions,
        [key]: value,
      },
    });
  };

  const handlePositionChange = (axis: 0 | 1 | 2, value: number) => {
    if (isNaN(value)) return;
    const newPos = [...component.transform.position] as [number, number, number];
    newPos[axis] = value;
    updateComponent(component.id, {
      transform: {
        ...component.transform,
        position: newPos,
      },
    });
  };

  const handleRotationYChange = (degrees: number) => {
    if (isNaN(degrees)) return;
    const radians = (degrees * Math.PI) / 180;
    const newRot = [
      component.transform.rotation[0],
      radians,
      component.transform.rotation[2],
    ] as [number, number, number];
    updateComponent(component.id, {
      transform: {
        ...component.transform,
        rotation: newRot,
      },
    });
  };

  const handleAddDefaultDoorOpening = () => {
    addOpening(component.id, {
      id: `op-${Date.now()}`,
      componentId: `door-${Date.now()}`,
      offset: 1.0,
      width: 1.0,
      height: 2.1,
      sillHeight: 0,
    });
  };

  const handleAddDefaultWindowOpening = () => {
    addOpening(component.id, {
      id: `op-${Date.now()}`,
      componentId: `win-${Date.now()}`,
      offset: 2.0,
      width: 1.2,
      height: 1.2,
      sillHeight: 0.9,
    });
  };

  const rotYDeg = Math.round((component.transform.rotation[1] * 180) / Math.PI);

  return (
    <div className="absolute top-16 right-4 z-20 w-80 bg-cad-dark/95 backdrop-blur-md border border-cad-border rounded-xl shadow-panel p-4 text-xs select-none max-h-[calc(100vh-5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cad-border/70 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-gold" />
          <span className="font-bold text-white tracking-wide uppercase">Properties Inspector</span>
        </div>
        <button
          onClick={() => setSelectedComponentId(null)}
          className="text-cad-muted hover:text-cad-light p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Component Name & ID */}
      <div className="mt-3 space-y-2">
        <div>
          <label className="text-[10px] text-cad-muted uppercase tracking-wider block mb-1">
            Element Name
          </label>
          <input
            type="text"
            value={component.name}
            onChange={(e) => updateComponent(component.id, { name: e.target.value })}
            className="w-full bg-cad-surface border border-cad-border rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-cad-muted font-mono">
          <span>Type: <strong className="text-cad-light uppercase">{component.type}</strong></span>
          <span>ID: {component.id.slice(0, 12)}...</span>
        </div>
      </div>

      {/* Dimensions Section */}
      <div className="mt-4 pt-3 border-t border-cad-border/60">
        <label className="text-[10px] text-cad-muted uppercase tracking-wider block mb-2 font-semibold">
          Metric Dimensions (Metres)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-cad-muted block mb-0.5">Length (m)</span>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={component.dimensions.length}
              onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value))}
              className="w-full bg-cad-surface border border-cad-border rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <span className="text-[10px] text-cad-muted block mb-0.5">Height (m)</span>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={component.dimensions.height}
              onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
              className="w-full bg-cad-surface border border-cad-border rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <span className="text-[10px] text-cad-muted block mb-0.5">Thickness (m)</span>
            <input
              type="number"
              step="0.01"
              min="0.05"
              value={component.dimensions.thickness}
              onChange={(e) => handleDimensionChange('thickness', parseFloat(e.target.value))}
              className="w-full bg-cad-surface border border-cad-border rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Roof pitch parameter if roof */}
        {component.type === 'roof' && (
          <div className="mt-2">
            <span className="text-[10px] text-cad-muted block mb-0.5">Slope Pitch Angle (Degrees)</span>
            <input
              type="number"
              step="1"
              min="5"
              max="60"
              value={component.dimensions.pitch ?? 30}
              onChange={(e) => handleDimensionChange('pitch', parseFloat(e.target.value))}
              className="w-full bg-cad-surface border border-cad-border rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-gold"
            />
          </div>
        )}
      </div>

      {/* World Coordinates & Orientation */}
      <div className="mt-4 pt-3 border-t border-cad-border/60">
        <label className="text-[10px] text-cad-muted uppercase tracking-wider block mb-2 font-semibold flex items-center space-x-1">
          <Move className="w-3 h-3 text-gold" />
          <span>Coordinates & Orientation</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
          <div>
            <span className="text-[10px] text-cad-muted block mb-0.5">X (East)</span>
            <input
              type="number"
              step="0.5"
              value={component.transform.position[0]}
              onChange={(e) => handlePositionChange(0, parseFloat(e.target.value))}
              className="w-full bg-cad-surface border border-cad-border rounded px-1.5 py-1 text-white focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <span className="text-[10px] text-cad-muted block mb-0.5">Y (Elev)</span>
            <input
              type="number"
              step="0.5"
              value={component.transform.position[1]}
              onChange={(e) => handlePositionChange(1, parseFloat(e.target.value))}
              className="w-full bg-cad-surface border border-cad-border rounded px-1.5 py-1 text-white focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <span className="text-[10px] text-cad-muted block mb-0.5">Z (North)</span>
            <input
              type="number"
              step="0.5"
              value={component.transform.position[2]}
              onChange={(e) => handlePositionChange(2, parseFloat(e.target.value))}
              className="w-full bg-cad-surface border border-cad-border rounded px-1.5 py-1 text-white focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <span className="text-[10px] text-cad-muted block mb-0.5">Rot (deg)</span>
            <input
              type="number"
              step="15"
              value={rotYDeg}
              onChange={(e) => handleRotationYChange(parseFloat(e.target.value))}
              className="w-full bg-cad-surface border border-cad-border rounded px-1.5 py-1 text-white focus:outline-none focus:border-gold"
            />
          </div>
        </div>
      </div>

      {/* Material & Specification */}
      <div className="mt-4 pt-3 border-t border-cad-border/60">
        <label className="text-[10px] text-cad-muted uppercase tracking-wider block mb-1.5 font-semibold flex items-center justify-between">
          <span>Assigned Material & Price</span>
          <span className="text-[10px] text-gold font-mono">
            {assignedPrice ? `₹${assignedPrice.unitRate} / ${assignedPrice.unit}` : 'Unpriced'}
          </span>
        </label>
        <select
          value={component.materialId}
          onChange={(e) => updateComponent(component.id, { materialId: e.target.value })}
          className="w-full bg-cad-surface border border-cad-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
        >
          {catalog.map((mat) => (
            <option key={mat.id} value={mat.materialId}>
              {mat.materialName} ({mat.region})
            </option>
          ))}
        </select>
        {assignedPrice && (
          <div className="mt-1 text-[10px] text-cad-muted leading-tight">
            Source: <span className="text-cad-light">{assignedPrice.sourceReference}</span>
          </div>
        )}
      </div>

      {/* Parametric Wall Openings Manager */}
      {component.type === 'wall' && (
        <div className="mt-4 pt-3 border-t border-cad-border/60">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-cad-muted uppercase tracking-wider font-semibold">
              Wall Openings ({component.openings?.length || 0})
            </label>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleAddDefaultDoorOpening}
                className="px-1.5 py-0.5 bg-cad-surface hover:bg-cad-border text-[10px] rounded text-cad-light border border-cad-border flex items-center space-x-1"
                title="Add 1m × 2.1m Door Opening"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>+ Door</span>
              </button>
              <button
                onClick={handleAddDefaultWindowOpening}
                className="px-1.5 py-0.5 bg-cad-surface hover:bg-cad-border text-[10px] rounded text-cad-light border border-cad-border flex items-center space-x-1"
                title="Add 1.2m × 1.2m Window Opening"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>+ Window</span>
              </button>
            </div>
          </div>

          {component.openings && component.openings.length > 0 ? (
            <div className="space-y-1.5">
              {component.openings.map((op, idx) => (
                <div
                  key={op.id}
                  className="flex items-center justify-between p-1.5 bg-cad-surface/80 rounded border border-cad-border/60 text-[11px] font-mono"
                >
                  <div>
                    <span className="text-cad-light font-semibold">#{idx + 1}</span>{' '}
                    <span>{op.width}m × {op.height}m</span>{' '}
                    <span className="text-cad-muted">@{op.offset}m</span>
                  </div>
                  <button
                    onClick={() => removeOpening(component.id, op.id)}
                    className="text-red-400 hover:text-red-300 p-0.5"
                    title="Delete Opening"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-cad-muted italic">No openings (continuous solid wall)</div>
          )}
        </div>
      )}

      {/* Live Calculated Geometric Take-Off */}
      {quantityNote && (
        <div className="mt-4 p-2 rounded bg-blueprint/10 border border-blueprint/30 text-[11px] font-mono text-blueprint-light">
          <div className="font-semibold text-xs mb-0.5 flex items-center space-x-1">
            <Info className="w-3 h-3 text-blueprint-light" />
            <span>Derived QTO Geometry</span>
          </div>
          <div>{quantityNote}</div>
        </div>
      )}

      {/* Action Buttons: Duplicate & Delete */}
      <div className="mt-4 pt-3 border-t border-cad-border/60 flex items-center space-x-2">
        <button
          onClick={() => duplicateComponent(component.id)}
          className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-cad-surface hover:bg-cad-border text-cad-light border border-cad-border rounded text-xs transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate</span>
        </button>
        <button
          onClick={() => {
            removeComponent(component.id);
            setSelectedComponentId(null);
          }}
          className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded text-xs transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
