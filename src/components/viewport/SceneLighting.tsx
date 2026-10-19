import React from 'react';
import { useEditorStore } from '../../store/editorStore';

export const SceneLighting: React.FC = () => {
  const dayNightMode = useEditorStore((state) => state.dayNightMode);

  if (dayNightMode === 'night') {
    return (
      <>
        <ambientLight intensity={0.2} color="#1e293b" />
        <directionalLight
          position={[10, 25, 10]}
          intensity={0.4}
          color="#94a3b8"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={60}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <pointLight position={[0, 4, 0]} intensity={1.5} distance={15} color="#fde68a" />
      </>
    );
  }

  if (dayNightMode === 'sunset') {
    return (
      <>
        <ambientLight intensity={0.5} color="#fdba74" />
        <directionalLight
          position={[30, 12, 10]}
          intensity={1.8}
          color="#f97316"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={60}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <hemisphereLight args={['#fed7aa', '#334155', 0.6]} />
      </>
    );
  }

  // Default: Crisp Architectural Daylight
  return (
    <>
      <ambientLight intensity={0.65} color="#ffffff" />
      <directionalLight
        position={[20, 35, 15]}
        intensity={1.4}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        shadow-camera-far={70}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight args={['#e0f2fe', '#0f172a', 0.5]} />
    </>
  );
};
