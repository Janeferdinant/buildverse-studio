import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { PlacedProductInstance, RetailerProduct } from '../../types/interior';
import { REAL_WORLD_PRODUCTS } from '../../data/retailerProductCatalog';
import { Html } from '@react-three/drei';

interface PlacedProduct3DMeshProps {
  instance: PlacedProductInstance;
  isSelected: boolean;
  onSelect: () => void;
}

export const PlacedProduct3DMesh: React.FC<PlacedProduct3DMeshProps> = ({
  instance,
  isSelected,
  onSelect
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const product: RetailerProduct = REAL_WORLD_PRODUCTS.find((p) => p.id === instance.productId) || {
    id: instance.productId,
    name: 'Interior Furnishing',
    brand: 'BuildVerse Studio',
    sku: 'BV-GEN-01',
    retailer: 'Custom User Supplier',
    productUrl: '#',
    unitPrice: 15000,
    currency: 'INR',
    dimensions: instance.dimensions || { length: 1.0, thickness: 0.6, height: 0.75 },
    material: 'Wood',
    category: 'sofas',
    deliveryCharge: 0,
    installationCharge: 0,
    availability: 'in_stock',
    localityAvailability: {},
    verificationStatus: 'catalog_sample',
    lastVerifiedDate: '2024-10-15'
  };

  const dims = instance.dimensions || product.dimensions;
  
  // Dimensions in meters (Three.js world units)
  const w = dims.length || 1.0;
  const d = dims.thickness || 0.6;
  const h = dims.height || 0.75;

  // Determine material color based on product finish/material
  const getProductColor = (): string => {
    const mat = (product.material || '').toLowerCase();
    const col = (product.color || '').toLowerCase();

    if (col.includes('white') || col.includes('ivory')) return '#e2e8f0';
    if (col.includes('grey') || col.includes('gray')) return '#64748b';
    if (col.includes('black') || col.includes('dark')) return '#1e293b';
    if (col.includes('beige') || col.includes('cream')) return '#f5efe6';
    if (col.includes('green') || col.includes('emerald')) return '#14532d';
    if (col.includes('blue') || col.includes('navy')) return '#1e3a8a';
    if (col.includes('gold') || col.includes('brass')) return '#d97706';
    if (mat.includes('teak') || mat.includes('wood') || mat.includes('sheesham')) return '#78350f';
    if (mat.includes('brass')) return '#b45309';
    return '#475569';
  };

  const primaryColor = getProductColor();

  return (
    <group
      ref={meshRef}
      position={[instance.position[0], instance.position[1], instance.position[2]]}
      rotation={[instance.rotation[0], instance.rotation[1], instance.rotation[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* 3D Furniture Procedural Geometry based on Category */}
      {product.category === 'sofas' && (
        <group position={[0, h / 2, 0]}>
          <mesh position={[0, -h * 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h * 0.4, d]} />
            <meshStandardMaterial 
              color={hovered || isSelected ? '#ca8a04' : primaryColor} 
              roughness={0.7} 
            />
          </mesh>
          <mesh position={[0, h * 0.15, -d * 0.35]} castShadow receiveShadow>
            <boxGeometry args={[w, h * 0.5, d * 0.3]} />
            <meshStandardMaterial color={primaryColor} roughness={0.7} />
          </mesh>
          <mesh position={[-w * 0.45, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[w * 0.1, h * 0.5, d]} />
            <meshStandardMaterial color={primaryColor} roughness={0.7} />
          </mesh>
          <mesh position={[w * 0.45, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[w * 0.1, h * 0.5, d]} />
            <meshStandardMaterial color={primaryColor} roughness={0.7} />
          </mesh>
        </group>
      )}

      {(product.category === 'coffee_tables' || product.category === 'dining_tables') && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, h - 0.03, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.06, d]} />
            <meshStandardMaterial 
              color={hovered || isSelected ? '#ca8a04' : primaryColor} 
              roughness={0.3} 
              metalness={0.1} 
            />
          </mesh>
          {[-w / 2 + 0.06, w / 2 - 0.06].map((lx, i) =>
            [-d / 2 + 0.06, d / 2 - 0.06].map((lz, j) => (
              <mesh key={`${i}-${j}`} position={[lx, (h - 0.06) / 2, lz]} castShadow receiveShadow>
                <cylinderGeometry args={[0.025, 0.02, h - 0.06, 12]} />
                <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.5} />
              </mesh>
            ))
          )}
        </group>
      )}

      {product.category === 'beds' && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, h * 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h * 0.35, d]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
          <mesh position={[0, h * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[w * 0.95, h * 0.25, d * 0.95]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
          <mesh position={[0, h * 0.6, -d / 2 + 0.05]} castShadow receiveShadow>
            <boxGeometry args={[w * 1.05, h * 0.9, 0.1]} />
            <meshStandardMaterial 
              color={hovered || isSelected ? '#ca8a04' : primaryColor} 
              roughness={0.5} 
            />
          </mesh>
          <mesh position={[-w * 0.25, h * 0.65, -d * 0.3]} castShadow>
            <boxGeometry args={[w * 0.35, 0.12, d * 0.2]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
          </mesh>
          <mesh position={[w * 0.25, h * 0.65, -d * 0.3]} castShadow>
            <boxGeometry args={[w * 0.35, 0.12, d * 0.2]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
          </mesh>
        </group>
      )}

      {(product.category === 'storage' || product.category === 'wardrobes' || product.category === 'cabinets') && (
        <group position={[0, h / 2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial 
              color={hovered || isSelected ? '#ca8a04' : primaryColor} 
              roughness={0.4} 
            />
          </mesh>
          <mesh position={[-0.05, 0, d / 2 + 0.015]}>
            <cylinderGeometry args={[0.008, 0.008, 0.25, 8]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.05, 0, d / 2 + 0.015]}>
            <cylinderGeometry args={[0.008, 0.008, 0.25, 8]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}

      {(product.category === 'lighting' || product.category === 'ceiling_lights') && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.6, 6]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <coneGeometry args={[w / 2, h, 16, 1, true]} />
            <meshStandardMaterial 
              color={hovered || isSelected ? '#ca8a04' : primaryColor} 
              metalness={0.4} 
              roughness={0.3} 
              side={THREE.DoubleSide} 
            />
          </mesh>
          <pointLight color="#fef08a" intensity={1.5} distance={6} decay={2} position={[0, -0.05, 0]} />
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      )}

      {product.category === 'rugs' && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial 
            color={hovered || isSelected ? '#ca8a04' : primaryColor} 
            roughness={0.9} 
          />
        </mesh>
      )}

      {/* Default Procedural Mesh Fallback */}
      {![
        'sofas',
        'coffee_tables',
        'dining_tables',
        'beds',
        'storage',
        'wardrobes',
        'cabinets',
        'lighting',
        'ceiling_lights',
        'rugs'
      ].includes(product.category) && (
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial 
            color={hovered || isSelected ? '#ca8a04' : primaryColor} 
            roughness={0.5} 
          />
        </mesh>
      )}

      {/* Selected Wireframe Indicator / Collision Alert */}
      {isSelected && (
        <lineSegments position={[0, h / 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(w + 0.04, h + 0.04, d + 0.04)]} />
          <lineBasicMaterial color="#eab308" linewidth={2} />
        </lineSegments>
      )}

      {instance.fitStatus === 'collision' && (
        <lineSegments position={[0, h / 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(w + 0.08, h + 0.08, d + 0.08)]} />
          <lineBasicMaterial color="#ef4444" linewidth={2} />
        </lineSegments>
      )}

      {/* Floating HTML Tag on Hover / Selected */}
      {(hovered || isSelected) && (
        <Html position={[0, h + 0.25, 0]} center distanceFactor={8}>
          <div className="bg-cad-darkest/95 backdrop-blur border border-gold/60 text-white rounded px-2.5 py-1.5 shadow-xl text-center pointer-events-none whitespace-nowrap z-50">
            <div className="text-[11px] font-bold text-gold">{product.name}</div>
            <div className="text-[10px] text-cad-muted flex items-center justify-center space-x-2">
              <span className="font-semibold text-white">₹{product.unitPrice.toLocaleString('en-IN')}</span>
              <span>•</span>
              <span className="text-cyan-400">{product.retailer}</span>
            </div>
            {instance.fitNotes && (
              <div className="text-[9px] text-amber-400 font-medium mt-0.5">
                ⚠️ {instance.fitNotes}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
