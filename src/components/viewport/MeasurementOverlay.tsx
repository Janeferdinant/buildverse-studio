import React from 'react';
import { Html } from '@react-three/drei';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';

export const MeasurementOverlay: React.FC = () => {
  const showMeasurements = useEditorStore((state) => state.showMeasurements);
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const components = useProjectStore((state) => state.project.components);

  if (!showMeasurements && !selectedComponentId) return null;

  return (
    <group>
      {components.map((comp) => {
        const isSelected = comp.id === selectedComponentId;
        // Show all if showMeasurements is true, or only selected
        if (!showMeasurements && !isSelected) return null;

        const [px, py, pz] = comp.transform.position;
        const l = comp.dimensions.length;
        const h = comp.dimensions.height;
        const t = comp.dimensions.thickness;

        return (
          <group
            key={`meas-${comp.id}`}
            position={[px, py + h + 0.35, pz]}
          >
            <Html center distanceFactor={15}>
              <div
                className={`px-2 py-0.5 rounded text-[11px] font-mono tracking-wider pointer-events-none whitespace-nowrap shadow-md border ${
                  isSelected
                    ? 'bg-gold-bright text-black font-semibold border-white'
                    : 'bg-cad-darker/90 text-cad-light border-cad-border/70'
                }`}
              >
                {comp.name}: {l.toFixed(2)}m × {h.toFixed(2)}m {t > 0.05 ? `× ${t.toFixed(2)}m` : ''}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
