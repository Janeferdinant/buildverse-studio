import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { ArchitecturalComponent } from '../../types/project';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Box, 
  DoorClosed, 
  Layers, 
  Armchair, 
  Trees, 
  Maximize2 
} from 'lucide-react';

interface CatalogPreset {
  id: string;
  name: string;
  type: ArchitecturalComponent['type'];
  category: 'structure' | 'openings' | 'interiors' | 'landscape';
  description: string;
  materialId: string;
  dimensions: {
    length: number;
    height: number;
    thickness: number;
    pitch?: number;
    sillHeight?: number;
  };
}

const PRESET_ITEMS: CatalogPreset[] = [
  // --- STRUCTURE ---
  {
    id: 'wall-brick-9in',
    name: 'Country Brick Wall (9")',
    type: 'wall',
    category: 'structure',
    description: '230mm brick masonry in cement mortar 1:6',
    materialId: 'mat-brick-9in',
    dimensions: { length: 5.0, height: 3.0, thickness: 0.23 },
  },
  {
    id: 'wall-block-6in',
    name: 'Solid Concrete Block Wall (6")',
    type: 'wall',
    category: 'structure',
    description: '150mm precast solid blockwork',
    materialId: 'mat-concrete-block-6in',
    dimensions: { length: 5.0, height: 3.0, thickness: 0.15 },
  },
  {
    id: 'wall-laterite',
    name: 'Laterite Stone Wall (Vettu Kallu)',
    type: 'wall',
    category: 'structure',
    description: 'Dressed Malabar laterite stones for natural thermal insulation',
    materialId: 'mat-laterite-stone',
    dimensions: { length: 5.0, height: 3.0, thickness: 0.23 },
  },
  {
    id: 'slab-rcc-floor',
    name: 'RCC Floor Slab & Vitrified Tile',
    type: 'floor',
    category: 'structure',
    description: '150mm M25 reinforced concrete slab with tile bed',
    materialId: 'mat-vitrified-tile-600',
    dimensions: { length: 6.0, height: 0.15, thickness: 5.0 },
  },
  {
    id: 'roof-pitched-kerala',
    name: 'Kerala Pitched Clay Roof (30°)',
    type: 'roof',
    category: 'structure',
    description: 'Mangalore clay roof tiles on timber/steel truss',
    materialId: 'mat-kerala-clay-tile',
    dimensions: { length: 7.0, height: 1.8, thickness: 6.0, pitch: 30 },
  },

  // --- OPENINGS ---
  {
    id: 'door-teak-carved',
    name: 'Teak Wood Main Door (1.2m × 2.1m)',
    type: 'door',
    category: 'openings',
    description: 'Carved Nilambur teak entrance door with brass fittings',
    materialId: 'mat-teak-door',
    dimensions: { length: 1.2, height: 2.1, thickness: 0.12 },
  },
  {
    id: 'door-flush-internal',
    name: 'Internal Flush Door (0.9m × 2.1m)',
    type: 'door',
    category: 'openings',
    description: 'Solid core hardwood flush door with laminate finish',
    materialId: 'mat-internal-flush-door',
    dimensions: { length: 0.9, height: 2.1, thickness: 0.12 },
  },
  {
    id: 'win-upvc-casement',
    name: 'UPVC Glazed Casement Window (1.2m × 1.2m)',
    type: 'window',
    category: 'openings',
    description: 'Monsoon-proof UPVC window with toughened float glass',
    materialId: 'mat-upvc-window',
    dimensions: { length: 1.2, height: 1.2, thickness: 0.12, sillHeight: 0.9 },
  },
  {
    id: 'win-upvc-wide',
    name: 'Wide Panoramic UPVC Window (1.8m × 1.4m)',
    type: 'window',
    category: 'openings',
    description: 'Large glazed living room window',
    materialId: 'mat-upvc-window',
    dimensions: { length: 1.8, height: 1.4, thickness: 0.12, sillHeight: 0.8 },
  },

  // --- INTERIORS ---
  {
    id: 'furn-bed-king',
    name: 'Teak Wood King Bed',
    type: 'furniture',
    category: 'interiors',
    description: '1.8m x 2.0m solid teak bed with headboard and mattress',
    materialId: 'mat-king-bed-teak',
    dimensions: { length: 1.9, height: 1.0, thickness: 2.0 },
  },
  {
    id: 'furn-sofa-3seat',
    name: '3-Seater Living Room Sofa',
    type: 'furniture',
    category: 'interiors',
    description: 'Contemporary upholstered linen sofa (2.2m length)',
    materialId: 'mat-luxury-sofa-3seater',
    dimensions: { length: 2.2, height: 0.85, thickness: 0.95 },
  },
  {
    id: 'furn-banquet-chair',
    name: 'Commercial Banquet Chair',
    type: 'furniture',
    category: 'interiors',
    description: 'Stackable steel banquet chair for event halls',
    materialId: 'mat-banquet-chair',
    dimensions: { length: 0.5, height: 0.85, thickness: 0.5 },
  },
  {
    id: 'furn-dining-table',
    name: 'Round Banquet Dining Table (5ft / 1.5m)',
    type: 'furniture',
    category: 'interiors',
    description: '8-seater commercial dining table',
    materialId: 'mat-dining-table-round',
    dimensions: { length: 1.5, height: 0.75, thickness: 1.5 },
  },

  // --- LANDSCAPING ---
  {
    id: 'land-lawn-turf',
    name: 'Tropical Bermuda Lawn Turf (5m × 4m)',
    type: 'landscape',
    category: 'landscape',
    description: 'Natural garden grass sod over prepared topsoil',
    materialId: 'mat-kerala-lawn-grass',
    dimensions: { length: 5.0, height: 0.05, thickness: 4.0 },
  },
  {
    id: 'land-pavers',
    name: 'Interlocking Paver Driveway (4m × 6m)',
    type: 'landscape',
    category: 'landscape',
    description: '60mm M30 heavy-duty driveway paving blocks',
    materialId: 'mat-interlock-paver',
    dimensions: { length: 4.0, height: 0.06, thickness: 6.0 },
  },
  {
    id: 'land-pool',
    name: 'Swimming Pool (10m × 4m)',
    type: 'landscape',
    category: 'landscape',
    description: 'Reinforced concrete pool with ceramic mosaic tiles and coping',
    materialId: 'mat-vitrified-tile-600',
    dimensions: { length: 10.0, height: 1.4, thickness: 4.0 },
  },
];

export const AssetCatalogDrawer: React.FC = () => {
  const isDrawerOpen = useEditorStore((state) => state.isAssetDrawerOpen);
  const setAssetDrawerOpen = useEditorStore((state) => state.setAssetDrawerOpen);
  const activeFloorId = useEditorStore((state) => state.activeFloorId);
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId);
  const addComponent = useProjectStore((state) => state.addComponent);
  const existingComponents = useProjectStore((state) => state.project.components);

  const [activeCategory, setActiveCategory] = useState<'all' | 'structure' | 'openings' | 'interiors' | 'landscape'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = PRESET_ITEMS.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddPreset = (preset: CatalogPreset) => {
    // Generate new position with slight randomized or sequential offset
    const count = existingComponents.length;
    const offsetX = ((count % 5) - 2) * 2.0;
    const offsetZ = Math.floor(count / 5) * 2.0;

    const newComponent: ArchitecturalComponent = {
      id: `${preset.type}-${Date.now()}`,
      name: preset.name,
      type: preset.type,
      floorId: activeFloorId,
      materialId: preset.materialId,
      transform: {
        position: [offsetX, 0, offsetZ],
        rotation: [0, 0, 0],
      },
      dimensions: {
        ...preset.dimensions,
      },
    };

    addComponent(newComponent);
    setSelectedComponentId(newComponent.id);
  };

  if (!isDrawerOpen) {
    return (
      <button
        onClick={() => setAssetDrawerOpen(true)}
        className="absolute top-16 left-0 z-20 bg-cad-dark/95 border-r border-y border-cad-border text-cad-light p-2 rounded-r-lg shadow-cad hover:text-gold transition-colors"
        title="Open Asset Catalog Library"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="w-72 bg-cad-dark/95 backdrop-blur-md border-r border-cad-border flex flex-col h-[calc(100vh-3.5rem)] z-20 select-none">
      {/* Drawer Header */}
      <div className="p-3 border-b border-cad-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Box className="w-4 h-4 text-gold" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">Asset Library</span>
        </div>
        <button
          onClick={() => setAssetDrawerOpen(false)}
          className="text-cad-muted hover:text-cad-light p-1 rounded"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="px-3 py-2 border-b border-cad-border/60 flex items-center space-x-1 overflow-x-auto text-[11px]">
        {(['all', 'structure', 'openings', 'interiors', 'landscape'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 rounded capitalize whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-gold text-black font-semibold' : 'text-cad-muted hover:text-cad-light hover:bg-cad-surface'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-cad-border/60">
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-cad-surface border border-cad-border rounded px-2.5 py-1 text-xs text-cad-light placeholder-cad-muted focus:outline-none focus:border-gold"
        />
      </div>

      {/* Preset List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="p-2.5 rounded-lg bg-cad-surface/70 hover:bg-cad-surface border border-cad-border/60 hover:border-gold/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cad-light group-hover:text-gold-glow">
                  {preset.name}
                </span>
                <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-cad-dark rounded text-cad-muted">
                  {preset.type}
                </span>
              </div>
              <p className="text-[11px] text-cad-muted mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
              <div className="text-[10px] text-cad-muted font-mono mt-1.5 flex items-center space-x-2">
                <span>{preset.dimensions.length}m × {preset.dimensions.height}m</span>
                {preset.dimensions.thickness > 0.05 && (
                  <span>× {preset.dimensions.thickness}m</span>
                )}
                {preset.dimensions.pitch && <span>• {preset.dimensions.pitch}° pitch</span>}
              </div>
            </div>

            <button
              onClick={() => handleAddPreset(preset)}
              className="mt-2.5 flex items-center justify-center space-x-1.5 w-full py-1 bg-cad-dark hover:bg-gold hover:text-black text-cad-light border border-cad-border/70 hover:border-gold rounded text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Place in Scene</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
