import React from 'react';
import { ArchitecturalComponent } from '../../types/project';
import { useEditorStore } from '../../store/editorStore';

interface FurnitureMeshProps {
  item: ArchitecturalComponent;
}

export const FurnitureMesh: React.FC<FurnitureMeshProps> = ({ item }) => {
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId);

  const isSelected = selectedComponentId === item.id;

  const w = Math.max(0.3, item.dimensions.length);
  const h = Math.max(0.05, item.dimensions.height);
  const d = Math.max(0.3, item.dimensions.thickness);

  const [px, py, pz] = item.transform.position;
  const [rx, ry, rz] = item.transform.rotation;

  // Specific renderers based on material or item name
  const isLawn = item.materialId?.includes('lawn');
  const isPaver = item.materialId?.includes('paver');
  const isPool = item.name.toLowerCase().includes('pool');
  const isBed = item.name.toLowerCase().includes('bed');
  const isSofa = item.name.toLowerCase().includes('sofa');
  const isChair = item.name.toLowerCase().includes('chair');

  return (
    <group
      position={[px, py + h / 2, pz]}
      rotation={[rx, ry, rz]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedComponentId(item.id);
      }}
    >
      {isPool ? (
        // Swimming pool: Blue water surface with concrete coping
        <group>
          <mesh position={[0, -h / 2, 0]} receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <planeGeometry args={[w - 0.4, d - 0.4]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transmission={0.8}
              opacity={0.85}
              transparent
              roughness={0.05}
            />
          </mesh>
        </group>
      ) : isLawn ? (
        // Tropical lawn turf
        <mesh receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={isSelected ? '#f59e0b' : '#15803d'} roughness={0.9} />
        </mesh>
      ) : isPaver ? (
        // Interlocking concrete driveway pavers
        <mesh receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={isSelected ? '#f59e0b' : '#64748b'} roughness={0.8} />
        </mesh>
      ) : isBed ? (
        // King bed: Teak frame + Mattress + Pillows
        <group>
          {/* Base Frame */}
          <mesh position={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[w, 0.3, d]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[w - 0.1, 0.25, d - 0.1]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, h / 2, -d / 2 + 0.08]} castShadow>
            <boxGeometry args={[w, h, 0.12]} />
            <meshStandardMaterial color="#451a03" roughness={0.4} />
          </mesh>
        </group>
      ) : isSofa ? (
        // Living room sofa: Seating base + backrest + armrests
        <group>
          {/* Seat cushion */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[w, h * 0.5, d]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, h * 0.35, -d * 0.35]} castShadow>
            <boxGeometry args={[w, h * 0.7, d * 0.3]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
        </group>
      ) : (
        // Generic architectural block furniture (tables, chairs, cabinets)
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={isSelected ? '#f59e0b' : '#475569'}
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
      )}

      {isSelected && (
        <mesh>
          <boxGeometry args={[w + 0.05, h + 0.05, d + 0.05]} />
          <meshBasicMaterial color="#fbbf24" wireframe transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};
