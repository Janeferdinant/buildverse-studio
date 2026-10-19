import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ArchitecturalComponent } from '../../types/project';
import { useEditorStore } from '../../store/editorStore';

interface ParametricWallMeshProps {
  wall: ArchitecturalComponent;
}

export const ParametricWallMesh: React.FC<ParametricWallMeshProps> = ({ wall }) => {
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId);

  const isSelected = selectedComponentId === wall.id;

  const length = Math.max(0.1, wall.dimensions.length);
  const height = Math.max(0.1, wall.dimensions.height);
  const thickness = Math.max(0.05, wall.dimensions.thickness);

  // Material appearance based on materialId
  const materialColor = useMemo(() => {
    if (wall.materialId.includes('laterite')) return '#a84e32'; // Malabar laterite red-brown
    if (wall.materialId.includes('concrete-block')) return '#94a3b8'; // Slate grey concrete
    if (wall.materialId.includes('brick')) return '#b45309'; // Warm burnt terracotta brick
    return '#cbd5e1'; // Off-white plastered paint
  }, [wall.materialId]);

  // Construct wall segments around openings
  const segments = useMemo(() => {
    const list: {
      position: [number, number, number];
      size: [number, number, number];
    }[] = [];

    const openings = (wall.openings || []).slice().sort((a, b) => a.offset - b.offset);

    if (openings.length === 0) {
      // Solid continuous wall
      list.push({
        position: [length / 2, height / 2, thickness / 2],
        size: [length, height, thickness],
      });
      return list;
    }

    let cursor = 0;
    for (const op of openings) {
      const opStart = Math.min(length, Math.max(0, op.offset));
      const opWidth = Math.min(length - opStart, Math.max(0, op.width));
      const opEnd = opStart + opWidth;
      const sillH = Math.min(height, Math.max(0, op.sillHeight));
      const opH = Math.min(height - sillH, Math.max(0, op.height));
      const headerH = Math.max(0, height - (sillH + opH));

      // 1. Solid segment before opening
      if (opStart > cursor) {
        const segWidth = opStart - cursor;
        list.push({
          position: [cursor + segWidth / 2, height / 2, thickness / 2],
          size: [segWidth, height, thickness],
        });
      }

      // 2. Sill segment below opening (if sill > 0, e.g. windows)
      if (sillH > 0.05) {
        list.push({
          position: [opStart + opWidth / 2, sillH / 2, thickness / 2],
          size: [opWidth, sillH, thickness],
        });
      }

      // 3. Lintel/Header segment above opening
      if (headerH > 0.05) {
        list.push({
          position: [opStart + opWidth / 2, sillH + opH + headerH / 2, thickness / 2],
          size: [opWidth, headerH, thickness],
        });
      }

      cursor = opEnd;
    }

    // Trailing segment after last opening
    if (cursor < length) {
      const segWidth = length - cursor;
      list.push({
        position: [cursor + segWidth / 2, height / 2, thickness / 2],
        size: [segWidth, height, thickness],
      });
    }

    return list;
  }, [length, height, thickness, wall.openings]);

  const [px, py, pz] = wall.transform.position;
  const [rx, ry, rz] = wall.transform.rotation;

  return (
    <group
      position={[px, py, pz]}
      rotation={[rx, ry, rz]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedComponentId(wall.id);
      }}
    >
      {segments.map((seg, idx) => (
        <mesh
          key={idx}
          position={seg.position}
          castShadow
          receiveShadow
        >
          <boxGeometry args={seg.size} />
          <meshStandardMaterial
            color={isSelected ? '#f59e0b' : materialColor}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Selection bounding box indicator */}
      {isSelected && (
        <mesh position={[length / 2, height / 2, thickness / 2]}>
          <boxGeometry args={[length + 0.04, height + 0.04, thickness + 0.04]} />
          <meshBasicMaterial
            color="#fbbf24"
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
};
