import React from 'react';
import { ArchitecturalComponent } from '../../types/project';
import { useEditorStore } from '../../store/editorStore';

interface ParametricFloorMeshProps {
  floor: ArchitecturalComponent;
}

export const ParametricFloorMesh: React.FC<ParametricFloorMeshProps> = ({ floor }) => {
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId);

  const isSelected = selectedComponentId === floor.id;

  const length = Math.max(0.5, floor.dimensions.length);
  const depth = Math.max(0.5, floor.dimensions.thickness);
  const slabThickness = Math.max(0.05, floor.dimensions.height);

  const [px, py, pz] = floor.transform.position;
  const [rx, ry, rz] = floor.transform.rotation;

  return (
    <group
      position={[px, py + slabThickness / 2, pz]}
      rotation={[rx, ry, rz]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedComponentId(floor.id);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, slabThickness, depth]} />
        <meshStandardMaterial
          color={isSelected ? '#f59e0b' : '#334155'}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Surface chamfer border line */}
      <mesh position={[0, slabThickness / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length - 0.05, depth - 0.05]} />
        <meshStandardMaterial
          color={isSelected ? '#fbbf24' : '#475569'}
          roughness={0.2}
        />
      </mesh>

      {isSelected && (
        <mesh>
          <boxGeometry args={[length + 0.04, slabThickness + 0.04, depth + 0.04]} />
          <meshBasicMaterial color="#fbbf24" wireframe transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};
