import React from 'react';
import { ArchitecturalComponent } from '../../types/project';
import { useEditorStore } from '../../store/editorStore';

interface ParametricOpeningMeshProps {
  component: ArchitecturalComponent;
}

export const ParametricOpeningMesh: React.FC<ParametricOpeningMeshProps> = ({ component }) => {
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId);

  const isSelected = selectedComponentId === component.id;

  const width = Math.max(0.4, component.dimensions.length);
  const height = Math.max(0.4, component.dimensions.height);
  const depth = Math.max(0.08, component.dimensions.thickness);

  const [px, py, pz] = component.transform.position;
  const [rx, ry, rz] = component.transform.rotation;

  const isDoor = component.type === 'door';

  return (
    <group
      position={[px, py, pz]}
      rotation={[rx, ry, rz]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedComponentId(component.id);
      }}
    >
      {isDoor ? (
        // Door Geometry: Outer wooden frame + door leaf + brass handle
        <group position={[width / 2, height / 2, depth / 2]}>
          {/* Frame */}
          <mesh castShadow>
            <boxGeometry args={[width, height, depth * 0.9]} />
            <meshStandardMaterial
              color={isSelected ? '#f59e0b' : '#78350f'} // Teak wood brown
              roughness={0.4}
            />
          </mesh>
          {/* Inner panel inlay */}
          <mesh position={[0, 0, depth * 0.1]}>
            <boxGeometry args={[width - 0.14, height - 0.14, depth * 0.8]} />
            <meshStandardMaterial color="#92400e" roughness={0.3} />
          </mesh>
          {/* Brass handle */}
          <mesh position={[width / 2 - 0.15, 0, depth / 2 + 0.02]}>
            <cylinderGeometry args={[0.015, 0.015, 0.12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ) : (
        // Window Geometry: UPVC frame + translucent glass pane + vertical mullion
        <group position={[width / 2, height / 2, depth / 2]}>
          {/* Frame */}
          <mesh>
            <boxGeometry args={[width, height, depth * 0.8]} />
            <meshStandardMaterial
              color={isSelected ? '#f59e0b' : '#f8fafc'} // White UPVC
              roughness={0.2}
            />
          </mesh>
          {/* Glazed Glass Pane */}
          <mesh>
            <boxGeometry args={[width - 0.1, height - 0.1, 0.02]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.45}
              roughness={0.1}
              transmission={0.6}
              ior={1.5}
            />
          </mesh>
          {/* Centre Mullion Divider */}
          <mesh>
            <boxGeometry args={[0.04, height - 0.08, depth * 0.85]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
        </group>
      )}

      {isSelected && (
        <mesh position={[width / 2, height / 2, depth / 2]}>
          <boxGeometry args={[width + 0.04, height + 0.04, depth + 0.04]} />
          <meshBasicMaterial color="#fbbf24" wireframe transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};
