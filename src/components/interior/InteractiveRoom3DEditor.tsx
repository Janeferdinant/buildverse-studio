import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Sun, 
  Moon, 
  Camera, 
  Eye, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  Undo2, 
  Redo2, 
  Compass
} from 'lucide-react';
import { useInteriorStore } from '../../store/interiorStore';
import { PlacedProduct3DMesh } from './PlacedProduct3DMesh';
import { DesignAlternativesSelector } from './DesignAlternativesSelector';
import { ProductReplacementDrawer } from './ProductReplacementDrawer';
import { ProductComparisonModal } from './ProductComparisonModal';
import { PanoramaViewer360 } from './PanoramaViewer360';
import { PlacedProductInstance, RoomMedia } from '../../types/interior';
import { REAL_WORLD_PRODUCTS } from '../../data/retailerProductCatalog';

export const InteractiveRoom3DEditor: React.FC = () => {
  const alternatives = useInteriorStore((state) => state.alternatives);
  const activeTier = useInteriorStore((state) => state.activeAlternativeTier);
  const placedProducts = useInteriorStore((state) => state.placedProducts);
  const selectedPlacedInstanceId = useInteriorStore((state) => state.selectedPlacedInstanceId);
  const setSelectedPlacedInstanceId = useInteriorStore((state) => state.setSelectedPlacedInstanceId);
  const uploadedMedia = useInteriorStore((state) => state.uploadedMedia);
  const preferences = useInteriorStore((state) => state.preferences);

  // Local controls state
  const [dayNightMode, setDayNightMode] = useState<'day' | 'night'>('day');
  const [cameraMode, setCameraMode] = useState<'orbit' | 'top' | 'first_person'>('orbit');
  const [viewMode, setViewMode] = useState<'3d_furnished' | 'original_360'>('3d_furnished');
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [showCeiling, setShowCeiling] = useState<boolean>(false);

  const activeAlt = alternatives?.find((a) => a.tier === activeTier) || alternatives?.[1] || null;
  const selectedInstance = placedProducts.find((p: PlacedProductInstance) => p.instanceId === selectedPlacedInstanceId) || null;

  const panoMedia = uploadedMedia.find((m: RoomMedia) => m.type === 'panorama_360');

  // Room geometry dimensions in meters
  const L = preferences.roomDimensions.length || 5.5;
  const W = preferences.roomDimensions.width || 4.5;
  const H = preferences.roomDimensions.height || 3.0;

  // Collision & clearance alerts
  const collisionAlerts = placedProducts.filter((p: PlacedProductInstance) => p.fitStatus !== 'ok');

  // Camera presets
  const getCameraPosition = (): [number, number, number] => {
    switch (cameraMode) {
      case 'top':
        return [0, Math.max(L, W) * 1.6, 0.01];
      case 'first_person':
        return [0, 1.5, W / 2 - 0.4];
      case 'orbit':
      default:
        return [L * 0.9, H * 1.3, W * 1.1];
    }
  };

  const selectedProduct = selectedInstance 
    ? REAL_WORLD_PRODUCTS.find((p) => p.id === selectedInstance.productId)
    : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-cad-darkest text-cad-light relative overflow-hidden select-none">
      
      {/* Top Design Alternatives Ribbon */}
      <DesignAlternativesSelector />

      {/* 3D Viewport Toolbar */}
      <div className="h-11 bg-cad-dark border-b border-cad-border px-4 flex items-center justify-between text-xs z-10">
        
        {/* Left Toolbar: Camera & View Mode */}
        <div className="flex items-center space-x-2">
          {/* Before/After View Switcher */}
          <div className="flex bg-cad-surface p-0.5 rounded border border-cad-border">
            <button
              onClick={() => setViewMode('3d_furnished')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                viewMode === '3d_furnished' ? 'bg-gold text-black shadow-sm' : 'text-cad-muted hover:text-white'
              }`}
            >
              3D Furnished Room
            </button>
            <button
              onClick={() => setViewMode('original_360')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'original_360' ? 'bg-gold text-black shadow-sm' : 'text-cad-muted hover:text-white'
              }`}
            >
              Original 360° Capture
            </button>
          </div>

          <div className="h-4 w-px bg-cad-border mx-1" />

          {/* Camera View Mode */}
          {viewMode === '3d_furnished' && (
            <div className="flex bg-cad-surface p-0.5 rounded border border-cad-border">
              <button
                onClick={() => setCameraMode('orbit')}
                className={`px-2 py-1 rounded transition flex items-center space-x-1 ${
                  cameraMode === 'orbit' ? 'bg-cad-dark text-gold font-bold' : 'text-cad-muted hover:text-white'
                }`}
                title="Orbit Camera View"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Orbit</span>
              </button>
              <button
                onClick={() => setCameraMode('top')}
                className={`px-2 py-1 rounded transition flex items-center space-x-1 ${
                  cameraMode === 'top' ? 'bg-cad-dark text-gold font-bold' : 'text-cad-muted hover:text-white'
                }`}
                title="Top-Down 2D Plan View"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Top Plan</span>
              </button>
              <button
                onClick={() => setCameraMode('first_person')}
                className={`px-2 py-1 rounded transition flex items-center space-x-1 ${
                  cameraMode === 'first_person' ? 'bg-cad-dark text-gold font-bold' : 'text-cad-muted hover:text-white'
                }`}
                title="First-Person Walkthrough"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Walkthrough</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Toolbar: Lighting & Ceiling */}
        <div className="flex items-center space-x-3">
          {viewMode === '3d_furnished' && (
            <>
              {/* Day / Night Toggle */}
              <button
                onClick={() => setDayNightMode(dayNightMode === 'day' ? 'night' : 'day')}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-cad-surface hover:bg-cad-border border border-cad-border rounded text-cad-light transition"
                title="Toggle Day / Night Lighting"
              >
                {dayNightMode === 'day' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Daylight</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Night Warm Lights</span>
                  </>
                )}
              </button>

              {/* Ceiling Toggle */}
              <button
                onClick={() => setShowCeiling(!showCeiling)}
                className={`px-2 py-1 rounded border transition text-[11px] ${
                  showCeiling ? 'bg-cad-surface border-gold text-gold font-semibold' : 'bg-cad-surface border-cad-border text-cad-muted'
                }`}
              >
                Ceiling {showCeiling ? 'On' : 'Cutaway'}
              </button>
            </>
          )}
        </div>

      </div>

      {/* Main View Area */}
      <div className="flex-1 relative w-full h-full">
        {viewMode === 'original_360' ? (
          <div className="w-full h-full relative bg-black">
            <PanoramaViewer360
              imageUrl={panoMedia?.url || ''}
              className="w-full h-full"
            />
            <div className="absolute top-4 left-4 bg-cad-darkest/90 backdrop-blur border border-gold/40 px-3.5 py-2 rounded-lg text-xs text-white shadow-xl">
              <span className="font-bold text-gold uppercase tracking-wider block mb-0.5">
                Original Room Panoramic Capture
              </span>
              <span className="text-cad-muted text-[11px]">
                Drag around to inspect original space before applying BuildVerse interior design.
              </span>
            </div>
          </div>
        ) : (
          <Canvas
            shadows
            camera={{ position: getCameraPosition(), fov: 50 }}
            className="w-full h-full bg-[#0a0f1d]"
            onPointerMissed={() => setSelectedPlacedInstanceId(null)}
          >
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              maxPolarAngle={cameraMode === 'top' ? 0.01 : Math.PI / 2 + 0.05}
              minDistance={1.2}
              maxDistance={30}
            />

            {/* Ambient & Directional Scene Lighting */}
            {dayNightMode === 'day' ? (
              <>
                <ambientLight intensity={0.7} color="#ffffff" />
                <directionalLight
                  castShadow
                  position={[L * 0.8, H * 1.5, W * 0.9]}
                  intensity={1.2}
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-bias={-0.0001}
                />
                <hemisphereLight args={['#bae6fd', '#475569', 0.5]} />
              </>
            ) : (
              <>
                <ambientLight intensity={0.25} color="#1e1b4b" />
                <pointLight position={[0, H - 0.2, 0]} intensity={2.5} color="#fed7aa" distance={8} decay={2} castShadow />
                <pointLight position={[-L * 0.3, H - 0.2, -W * 0.3]} intensity={1.5} color="#fef08a" distance={6} decay={2} />
                <pointLight position={[L * 0.3, H - 0.2, W * 0.3]} intensity={1.5} color="#fef08a" distance={6} decay={2} />
              </>
            )}

            {/* Room Geometry Enclosure */}
            <group position={[0, 0, 0]}>
              {/* Floor */}
              <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[L, W]} />
                <meshStandardMaterial
                  color={activeAlt?.floorFinish.includes('Teak') ? '#78350f' : '#cbd5e1'}
                  roughness={0.4}
                  metalness={0.05}
                />
              </mesh>

              {/* Ceiling */}
              {showCeiling && (
                <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
                  <planeGeometry args={[L, W]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.9} />
                </mesh>
              )}

              {/* North Wall (Back) */}
              <mesh position={[0, H / 2, -W / 2]} receiveShadow>
                <boxGeometry args={[L, H, 0.15]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>

              {/* South Wall (Front with Doorway clearance) */}
              <group position={[0, H / 2, W / 2]}>
                <mesh position={[-L * 0.3, 0, 0]} receiveShadow>
                  <boxGeometry args={[L * 0.4, H, 0.15]} />
                  <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
                </mesh>
                <mesh position={[L * 0.3, 0, 0]} receiveShadow>
                  <boxGeometry args={[L * 0.4, H, 0.15]} />
                  <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
                </mesh>
                <mesh position={[0, H * 0.4, 0]} receiveShadow>
                  <boxGeometry args={[L * 0.2, H * 0.2, 0.15]} />
                  <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
                </mesh>
              </group>

              {/* West Wall (Left) */}
              <mesh position={[-L / 2, H / 2, 0]} receiveShadow>
                <boxGeometry args={[0.15, H, W]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
              </mesh>

              {/* East Wall (Right with Window) */}
              <group position={[L / 2, H / 2, 0]}>
                <mesh position={[0, -H * 0.25, 0]} receiveShadow>
                  <boxGeometry args={[0.15, H * 0.5, W]} />
                  <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
                </mesh>
                <mesh position={[0, H * 0.35, 0]} receiveShadow>
                  <boxGeometry args={[0.15, H * 0.3, W]} />
                  <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.1, 0]}>
                  <boxGeometry args={[0.02, 1.2, 1.4]} />
                  <meshPhysicalMaterial
                    color="#bae6fd"
                    transparent
                    opacity={0.3}
                    roughness={0.1}
                    transmission={0.9}
                    thickness={0.5}
                  />
                </mesh>
              </group>

              {/* Sub-floor CAD Grid */}
              <Grid
                position={[0, -0.01, 0]}
                args={[Math.max(L, W) * 2, Math.max(L, W) * 2]}
                cellSize={0.5}
                cellThickness={0.6}
                cellColor="#334155"
                sectionSize={2.0}
                sectionThickness={1.2}
                sectionColor="#475569"
                fadeDistance={25}
              />
            </group>

            {/* Placed Real-World Products */}
            {placedProducts.map((instance: PlacedProductInstance) => (
              <PlacedProduct3DMesh
                key={instance.instanceId}
                instance={instance}
                isSelected={instance.instanceId === selectedPlacedInstanceId}
                onSelect={() => setSelectedPlacedInstanceId(instance.instanceId)}
              />
            ))}
          </Canvas>
        )}

        {/* Floating Spatial Clearance Alert Banner */}
        {collisionAlerts.length > 0 && viewMode === '3d_furnished' && (
          <div className="absolute bottom-4 left-4 max-w-md bg-amber-950/90 backdrop-blur border border-amber-500/60 rounded-lg p-3 text-white text-xs shadow-2xl flex items-start space-x-2.5 z-20 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">
                Spatial Clearance Notice ({collisionAlerts.length})
              </span>
              <div className="text-[11px] text-amber-100/90 space-y-1">
                {collisionAlerts.map((ca: PlacedProductInstance) => (
                  <div key={ca.instanceId}>
                    • <strong className="text-white">Product {ca.productId}:</strong> {ca.fitNotes || 'Tight walkway clearance'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Item Selection Summary Banner */}
        {selectedProduct && viewMode === '3d_furnished' && (
          <div className="absolute top-4 left-4 bg-cad-darkest/90 backdrop-blur border border-gold/60 rounded-lg px-3 py-2 text-white text-xs shadow-xl flex items-center space-x-3 z-20">
            <span className="text-gold font-bold">Selected:</span>
            <span>{selectedProduct.name}</span>
            <span className="text-cad-muted font-mono">₹{selectedProduct.unitPrice.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* Slide-out Product Replacement Drawer */}
      {selectedInstance && (
        <ProductReplacementDrawer
          instance={selectedInstance}
          onClose={() => setSelectedPlacedInstanceId(null)}
          onOpenComparison={() => setIsComparisonOpen(true)}
        />
      )}

      {/* 4-Way Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        selectedInstanceId={selectedPlacedInstanceId}
      />

    </div>
  );
};
