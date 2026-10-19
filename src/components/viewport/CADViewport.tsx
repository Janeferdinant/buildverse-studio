import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { SceneLighting } from './SceneLighting';
import { GridAndAxes } from './GridAndAxes';
import { ParametricWallMesh } from './ParametricWallMesh';
import { ParametricFloorMesh } from './ParametricFloorMesh';
import { ParametricRoofMesh } from './ParametricRoofMesh';
import { ParametricOpeningMesh } from './ParametricOpeningMesh';
import { FurnitureMesh } from './FurnitureMesh';
import { MeasurementOverlay } from './MeasurementOverlay';
import { 
  Eye, 
  Sun, 
  Moon, 
  Sunset, 
  Grid, 
  Ruler, 
  Maximize2,
  Compass,
  Layers
} from 'lucide-react';

const CameraController: React.FC = () => {
  const cameraMode = useEditorStore((state) => state.cameraMode);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;

    if (cameraMode === 'top') {
      camera.position.set(0, 35, 0);
      controls.target.set(0, 0, 0);
    } else if (cameraMode === 'front') {
      camera.position.set(0, 3.5, 30);
      controls.target.set(0, 2.5, 0);
    } else if (cameraMode === 'side') {
      camera.position.set(30, 3.5, 0);
      controls.target.set(0, 2.5, 0);
    } else if (cameraMode === 'isometric') {
      camera.position.set(22, 18, 22);
      controls.target.set(0, 2, 0);
    } else {
      // Default orbit
      camera.position.set(18, 14, 18);
      controls.target.set(0, 1.5, 0);
    }
    controls.update();
  }, [cameraMode]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      dampingFactor={0.12}
      maxPolarAngle={cameraMode === 'top' ? 0.01 : Math.PI / 2 - 0.02} // Don't orbit below ground
      minDistance={1.5}
      maxDistance={90}
    />
  );
};

export const CADViewport: React.FC = () => {
  const components = useProjectStore((state) => state.project.components);
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId);
  const cameraMode = useEditorStore((state) => state.cameraMode);
  const setCameraMode = useEditorStore((state) => state.setCameraMode);
  const dayNightMode = useEditorStore((state) => state.dayNightMode);
  const setDayNightMode = useEditorStore((state) => state.setDayNightMode);
  const showGrid = useEditorStore((state) => state.showGrid);
  const setShowGrid = useEditorStore((state) => state.setShowGrid);
  const showMeasurements = useEditorStore((state) => state.showMeasurements);
  const setShowMeasurements = useEditorStore((state) => state.setShowMeasurements);
  const snapGridSize = useEditorStore((state) => state.snapGridSize);
  const setSnapGridSize = useEditorStore((state) => state.setSnapGridSize);

  return (
    <div className="relative w-full h-full bg-cad-darkest select-none overflow-hidden canvas-container">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        camera={{ position: [18, 14, 18], fov: 45, near: 0.1, far: 500 }}
        onPointerMissed={() => setSelectedComponentId(null)}
      >
        <CameraController />
        <SceneLighting />
        <GridAndAxes />

        {/* Architectural 3D Elements */}
        <group>
          {components.map((comp) => {
            switch (comp.type) {
              case 'wall':
                return <ParametricWallMesh key={comp.id} wall={comp} />;
              case 'floor':
                return <ParametricFloorMesh key={comp.id} floor={comp} />;
              case 'roof':
                return <ParametricRoofMesh key={comp.id} roof={comp} />;
              case 'door':
              case 'window':
                return <ParametricOpeningMesh key={comp.id} component={comp} />;
              case 'furniture':
              case 'landscape':
              default:
                return <FurnitureMesh key={comp.id} item={comp} />;
            }
          })}
        </group>

        <MeasurementOverlay />
      </Canvas>

      {/* Floating CAD HUD Overlay: Top-Left View Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-1 bg-cad-dark/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-cad-border shadow-cad text-xs">
        <button
          onClick={() => setCameraMode('orbit')}
          className={`px-2.5 py-1 rounded transition-colors ${
            cameraMode === 'orbit' || cameraMode === 'isometric'
              ? 'bg-gold text-black font-semibold'
              : 'text-cad-light hover:bg-cad-surface'
          }`}
          title="3D Orbit View"
        >
          3D Orbit
        </button>
        <button
          onClick={() => setCameraMode('top')}
          className={`px-2.5 py-1 rounded transition-colors ${
            cameraMode === 'top' ? 'bg-gold text-black font-semibold' : 'text-cad-light hover:bg-cad-surface'
          }`}
          title="Top Plan View (Orthographic Angle)"
        >
          Top Plan
        </button>
        <button
          onClick={() => setCameraMode('front')}
          className={`px-2.5 py-1 rounded transition-colors ${
            cameraMode === 'front' ? 'bg-gold text-black font-semibold' : 'text-cad-light hover:bg-cad-surface'
          }`}
          title="Front Elevation View"
        >
          Front
        </button>
        <button
          onClick={() => setCameraMode('side')}
          className={`px-2.5 py-1 rounded transition-colors ${
            cameraMode === 'side' ? 'bg-gold text-black font-semibold' : 'text-cad-light hover:bg-cad-surface'
          }`}
          title="Side Elevation View"
        >
          Side
        </button>
      </div>

      {/* Floating CAD HUD: Top-Right Toggles (Lighting, Grid, Snapping, Measurements) */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-cad-dark/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cad-border shadow-cad text-xs">
        {/* Day / Sunset / Night Toggle */}
        <div className="flex items-center space-x-1 border-r border-cad-border pr-2">
          <button
            onClick={() => setDayNightMode('day')}
            className={`p-1 rounded ${dayNightMode === 'day' ? 'bg-amber-500/20 text-amber-400' : 'text-cad-muted hover:text-cad-light'}`}
            title="Daylight Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDayNightMode('sunset')}
            className={`p-1 rounded ${dayNightMode === 'sunset' ? 'bg-orange-500/20 text-orange-400' : 'text-cad-muted hover:text-cad-light'}`}
            title="Golden Hour / Sunset Mode"
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDayNightMode('night')}
            className={`p-1 rounded ${dayNightMode === 'night' ? 'bg-indigo-500/20 text-indigo-400' : 'text-cad-muted hover:text-cad-light'}`}
            title="Night Simulation Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1 rounded transition-colors ${showGrid ? 'text-gold-bright bg-gold-dark/20' : 'text-cad-muted'}`}
          title="Toggle Grid Ground Plane"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Measurement Dimension Overlay */}
        <button
          onClick={() => setShowMeasurements(!showMeasurements)}
          className={`p-1 rounded transition-colors ${showMeasurements ? 'text-gold-bright bg-gold-dark/20' : 'text-cad-muted'}`}
          title="Toggle 3D Dimensional Overlays"
        >
          <Ruler className="w-4 h-4" />
        </button>

        {/* Snapping selector */}
        <div className="flex items-center space-x-1 text-[11px] font-mono pl-1 border-l border-cad-border">
          <span className="text-cad-muted">Snap:</span>
          <select
            value={snapGridSize === null ? 'none' : snapGridSize.toString()}
            onChange={(e) => setSnapGridSize(e.target.value === 'none' ? null : parseFloat(e.target.value))}
            className="bg-cad-surface text-cad-light text-xs rounded px-1.5 py-0.5 border border-cad-border focus:outline-none focus:border-gold"
          >
            <option value="none">Off</option>
            <option value="0.1">0.1m</option>
            <option value="0.5">0.5m</option>
            <option value="1.0">1.0m</option>
          </select>
        </div>
      </div>

      {/* Bottom-Left Compass / Orientation Marker */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-2 bg-cad-dark/80 px-2.5 py-1.5 rounded border border-cad-border/60 text-[11px] font-mono text-cad-muted">
        <Compass className="w-3.5 h-3.5 text-gold" />
        <span>Y: UP (Elevation) | Z: NORTH | 1.0 Unit = 1.0 Metre</span>
      </div>
    </div>
  );
};
