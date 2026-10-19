import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Rotate3d, ZoomIn, ZoomOut, Maximize2, Compass, Eye } from 'lucide-react';

interface PanoramaViewer360Props {
  imageUrl?: string;
  roomName?: string;
  className?: string;
}

const PanoramicSphere: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  // Generate high-resolution procedural architectural room panorama texture if no user image provided
  const texture = useMemo(() => {
    if (imageUrl && !imageUrl.startsWith('sample:')) {
      const loader = new THREE.TextureLoader();
      const tex = loader.load(imageUrl);
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1; // Invert horizontally for interior projection
      return tex;
    }

    // High-resolution procedural equirectangular architectural living room texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Sky & Ceiling gradient (top 30%)
    const ceilingGrad = ctx.createLinearGradient(0, 0, 0, 350);
    ceilingGrad.addColorStop(0, '#0f172a');
    ceilingGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = ceilingGrad;
    ctx.fillRect(0, 0, 2048, 350);

    // Ceiling beams
    ctx.fillStyle = '#334155';
    for (let x = 0; x < 2048; x += 256) {
      ctx.fillRect(x, 150, 40, 200);
    }

    // 2. Walls (middle 40%)
    const wallGrad = ctx.createLinearGradient(0, 350, 0, 750);
    wallGrad.addColorStop(0, '#fef3c7'); // Warm Ivory Kerala home wall
    wallGrad.addColorStop(1, '#fde68a');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 350, 2048, 400);

    // Architectural features: Windows overlooking tropical lush greenery
    ctx.fillStyle = '#1e3a8a'; // Deep blue window frame
    ctx.fillRect(200, 380, 450, 300);
    const gardenGrad = ctx.createLinearGradient(210, 390, 640, 670);
    gardenGrad.addColorStop(0, '#38bdf8'); // Daylight sky
    gardenGrad.addColorStop(0.4, '#15803d'); // Coconut palm greenery
    gardenGrad.addColorStop(1, '#166534');
    ctx.fillStyle = gardenGrad;
    ctx.fillRect(210, 390, 430, 280);

    // Teakwood wall panelling on North wall
    ctx.fillStyle = '#78350f';
    ctx.fillRect(900, 380, 500, 320);
    ctx.fillStyle = '#92400e';
    for (let x = 920; x < 1380; x += 60) {
      ctx.fillRect(x, 390, 45, 300);
    }

    // Teak Door on East wall
    ctx.fillStyle = '#451a03';
    ctx.fillRect(1600, 400, 250, 350);
    ctx.fillStyle = '#fbbf24'; // Brass handle
    ctx.beginPath();
    ctx.arc(1630, 580, 10, 0, Math.PI * 2);
    ctx.fill();

    // 3. Floor (bottom 30%)
    const floorGrad = ctx.createLinearGradient(0, 750, 0, 1024);
    floorGrad.addColorStop(0, '#334155');
    floorGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 750, 2048, 274);

    // Tile grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 2048; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 750);
      ctx.lineTo(x + 200, 1024);
      ctx.stroke();
    }
    for (let y = 750; y < 1024; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = -1;
    return tex;
  }, [imageUrl]);

  return (
    <mesh>
      <sphereGeometry args={[50, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

export const PanoramaViewer360: React.FC<PanoramaViewer360Props> = ({ imageUrl, roomName }) => {
  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden rounded-2xl border border-cad-border shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 0.1], fov: 75, near: 0.1, far: 1000 }}
      >
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.1}
          rotateSpeed={-0.4} // Natural drag-to-look direction
          minDistance={0.01}
          maxDistance={5}
        />
        <PanoramicSphere imageUrl={imageUrl} />
      </Canvas>

      {/* Top Floating HUD: Controls & Title */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-cad-dark/90 backdrop-blur-md px-3 py-2 rounded-xl border border-cad-border text-xs">
        <Rotate3d className="w-4 h-4 text-gold animate-spin-slow" />
        <span className="font-bold text-white tracking-wide uppercase">
          360° Spherical Room Viewer
        </span>
        <span className="text-cad-muted text-[11px] font-mono">
          {roomName || 'Interactive Panorama'}
        </span>
      </div>

      {/* Interactive Helper Banner */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-cad-dark/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-cad-border/70 text-xs text-cad-light font-mono flex items-center space-x-2 shadow-cad">
        <Eye className="w-3.5 h-3.5 text-gold" />
        <span>Click & drag in any direction to look around the 360° space • Scroll to zoom</span>
      </div>
    </div>
  );
};
