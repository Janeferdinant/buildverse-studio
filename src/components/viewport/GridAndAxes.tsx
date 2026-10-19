import React from 'react';
import { useEditorStore } from '../../store/editorStore';

export const GridAndAxes: React.FC = () => {
  const showGrid = useEditorStore((state) => state.showGrid);

  if (!showGrid) return null;

  return (
    <group position={[0, -0.01, 0]}>
      {/* Primary CAD Ground Grid */}
      <gridHelper
        args={[80, 80, '#d97706', '#1e293b']}
        position={[0, 0, 0]}
      />
      {/* 5-Metre Major Accent Grid */}
      <gridHelper
        args={[80, 16, '#ea580c', '#334155']}
        position={[0, 0.001, 0]}
      />

      {/* Shadow catcher plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </group>
  );
};
