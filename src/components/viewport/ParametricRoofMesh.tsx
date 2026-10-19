import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ArchitecturalComponent } from '../../types/project';
import { useEditorStore } from '../../store/editorStore';

interface ParametricRoofMeshProps {
  roof: ArchitecturalComponent;
}

export const ParametricRoofMesh: React.FC<ParametricRoofMeshProps> = ({ roof }) => {
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId);

  const isSelected = selectedComponentId === roof.id;

  const length = Math.max(1.0, roof.dimensions.length);
  const depth = Math.max(1.0, roof.dimensions.thickness);
  const ridgeHeight = Math.max(0.5, roof.dimensions.height);

  // Construct a 3D gable pitched roof prism geometry
  const roofGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const halfL = length / 2;
    const halfD = depth / 2;

    // 6 vertices of a triangular prism:
    // Bottom 4:
    // v0: [-halfL, 0, -halfD]
    // v1: [halfL, 0, -halfD]
    // v2: [halfL, 0, halfD]
    // v3: [-halfL, 0, halfD]
    // Top ridge 2:
    // v4: [-halfL, ridgeHeight, 0]
    // v5: [halfL, ridgeHeight, 0]

    const vertices = new Float32Array([
      // North slope (v0, v1, v5, v4)
      -halfL, 0, -halfD,
       halfL, 0, -halfD,
       halfL, ridgeHeight, 0,

      -halfL, 0, -halfD,
       halfL, ridgeHeight, 0,
      -halfL, ridgeHeight, 0,

      // South slope (v3, v4, v5, v2)
      -halfL, 0, halfD,
      -halfL, ridgeHeight, 0,
       halfL, ridgeHeight, 0,

      -halfL, 0, halfD,
       halfL, ridgeHeight, 0,
       halfL, 0, halfD,

      // West triangular gable (v0, v4, v3)
      -halfL, 0, -halfD,
      -halfL, ridgeHeight, 0,
      -halfL, 0, halfD,

      // East triangular gable (v1, v2, v5)
       halfL, 0, -halfD,
       halfL, 0, halfD,
       halfL, ridgeHeight, 0,

      // Bottom ceiling face
      -halfL, 0, -halfD,
      -halfL, 0, halfD,
       halfL, 0, halfD,

      -halfL, 0, -halfD,
       halfL, 0, halfD,
       halfL, 0, -halfD,
    ]);

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, [length, depth, ridgeHeight]);

  const [px, py, pz] = roof.transform.position;
  const [rx, ry, rz] = roof.transform.rotation;

  return (
    <group
      position={[px, py, pz]}
      rotation={[rx, ry, rz]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedComponentId(roof.id);
      }}
    >
      <mesh geometry={roofGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={isSelected ? '#f59e0b' : '#991b1b'} // Kerala terracotta clay tile red
          roughness={0.65}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ridge Cap Accent Line */}
      <mesh position={[0, ridgeHeight + 0.04, 0]}>
        <boxGeometry args={[length + 0.1, 0.08, 0.15]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
      </mesh>

      {isSelected && (
        <mesh position={[0, ridgeHeight / 2, 0]}>
          <boxGeometry args={[length + 0.1, ridgeHeight + 0.1, depth + 0.1]} />
          <meshBasicMaterial color="#fbbf24" wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};
