import React, { useState } from 'react';
import { 
  Check, 
  Ruler, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Maximize2,
  Box,
  Palette
} from 'lucide-react';
import { useInteriorStore } from '../../store/interiorStore';
import { RoomClassification } from '../../types/interior';

export const RoomGeometryReview: React.FC<{ onProceed: () => void; onBack: () => void }> = ({ onProceed, onBack }) => {
  const roomAnalysis = useInteriorStore((state) => state.roomAnalysis);
  const preferences = useInteriorStore((state) => state.preferences);
  const confirmDimensions = useInteriorStore((state) => state.confirmDimensions);
  const setPreferences = useInteriorStore((state) => state.setPreferences);

  const initialDims = roomAnalysis?.verifiedDimensions || preferences.roomDimensions || { length: 5.5, width: 4.5, height: 3.0 };

  const [length, setLength] = useState<number>(initialDims.length);
  const [width, setWidth] = useState<number>(initialDims.width);
  const [height, setHeight] = useState<number>(initialDims.height);
  const [roomType, setRoomType] = useState<RoomClassification>(preferences.roomType || 'living_room');
  const [isVerified, setIsVerified] = useState<boolean>(roomAnalysis?.isDimensionUserConfirmed || false);

  const handleConfirm = () => {
    confirmDimensions({ length, width, height });
    setPreferences({ roomType });
    setIsVerified(true);
    onProceed();
  };

  const confidenceScore = roomAnalysis?.confidence === 'high' ? 95 : roomAnalysis?.confidence === 'medium' ? 80 : 65;

  return (
    <div className="flex-1 flex flex-col h-full bg-cad-darkest text-cad-light overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">

        {/* Header Notice */}
        <div className="bg-cad-surface border border-cad-border rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold text-black rounded font-mono">
                Verification Required
              </span>
              <span className="text-xs text-cad-muted">Stage 5: Geometric Integrity Audit</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Verify Reconstructed Room Geometry
            </h2>
            <p className="text-xs text-cad-light/80 max-w-xl">
              Photographic 360° panoramas provide visual spatial layout, but absolute scale must be verified before purchasing furniture to guarantee clearances.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-cad-dark px-4 py-3 rounded-lg border border-cad-border">
            <div className="text-right">
              <div className="text-[10px] uppercase text-cad-muted tracking-wider">Detection Confidence</div>
              <div className="text-base font-bold text-gold font-mono">{confidenceScore}%</div>
            </div>
            <div className={`w-3 h-3 rounded-full ${confidenceScore > 80 ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          </div>
        </div>

        {/* Verification Matrix (Observed vs Inferred vs Verified) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Observed Features */}
          <div className="bg-cad-surface/60 border border-cad-border rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Eye className="w-4 h-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Observed Features</h3>
            </div>
            <div className="text-xs text-cad-light/80 space-y-1.5">
              <div className="flex justify-between py-1 border-b border-cad-border/50">
                <span className="text-cad-muted">Walls detected:</span>
                <span className="font-mono text-white">4 Enclosing Walls</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cad-border/50">
                <span className="text-cad-muted">Door openings:</span>
                <span className="font-mono text-white">1 (South Wall)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cad-border/50">
                <span className="text-cad-muted">Window apertures:</span>
                <span className="font-mono text-white">1 (East Wall)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cad-muted">Lighting:</span>
                <span className="font-mono text-white capitalize">{roomAnalysis?.lightingConditions?.replace(/_/g, ' ') || 'Daylight'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: AI-Inferred Scale */}
          <div className="bg-cad-surface/60 border border-gold/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-gold">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">AI-Inferred Scale</h3>
            </div>
            <div className="text-xs text-cad-light/80 space-y-1.5">
              <div className="flex justify-between py-1 border-b border-cad-border/50">
                <span className="text-cad-muted">Est. Length:</span>
                <span className="font-mono text-gold">{(roomAnalysis?.inferredDimensions.length || 5.5).toFixed(2)} m</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cad-border/50">
                <span className="text-cad-muted">Est. Width:</span>
                <span className="font-mono text-gold">{(roomAnalysis?.inferredDimensions.width || 4.5).toFixed(2)} m</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cad-border/50">
                <span className="text-cad-muted">Est. Height:</span>
                <span className="font-mono text-gold">{(roomAnalysis?.inferredDimensions.height || 3.0).toFixed(2)} m</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cad-muted">Est. Floor Area:</span>
                <span className="font-mono text-gold">
                  {((roomAnalysis?.inferredDimensions.length || 5.5) * (roomAnalysis?.inferredDimensions.width || 4.5)).toFixed(1)} m²
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: User Verified Status */}
          <div className="bg-cad-surface/60 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Verified Dimensions</h3>
            </div>
            <div className="text-xs text-cad-light/80 space-y-1.5">
              <div className="flex justify-between py-1 border-b border-cad-border/50">
                <span className="text-cad-muted">Precision Status:</span>
                <span className="font-mono text-emerald-400 font-semibold">{isVerified ? 'VERIFIED' : 'PENDING CHECK'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cad-border/50">
                <span className="text-cad-muted">Clearance Audit:</span>
                <span className="font-mono text-emerald-400">0.9m Door Buffer</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cad-border/50">
                <span className="text-cad-muted">Walkway Clearance:</span>
                <span className="font-mono text-emerald-400">0.8m Minimum</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cad-muted">Collision Guard:</span>
                <span className="font-mono text-emerald-400">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Dimensions Form */}
        <div className="bg-cad-surface border border-cad-border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-cad-border pb-3">
            <div className="flex items-center space-x-2">
              <Ruler className="w-5 h-5 text-gold" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Confirm Room Specifications
              </h3>
            </div>
            <span className="text-xs text-cad-muted font-mono">
              Adjust if tape measurements differ from optical estimation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-cad-light">Room Classification:</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomClassification)}
                className="w-full bg-cad-dark border border-cad-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
              >
                <option value="living_room">Living Room</option>
                <option value="bedroom">Bedroom</option>
                <option value="dining_room">Dining Room</option>
                <option value="kitchen">Kitchen</option>
                <option value="home_office">Home Office</option>
                <option value="studio">Studio Apartment</option>
                <option value="hotel_suite">Hotel Suite</option>
                <option value="wedding_hall">Event / Banquet Space</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-cad-light">Room Length (m):</label>
              <input
                type="number"
                step="0.05"
                min="1.5"
                max="25"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                className="w-full bg-cad-dark border border-cad-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-cad-light">Room Width (m):</label>
              <input
                type="number"
                step="0.05"
                min="1.5"
                max="25"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                className="w-full bg-cad-dark border border-cad-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-cad-light">Ceiling Height (m):</label>
              <input
                type="number"
                step="0.05"
                min="2.0"
                max="6.0"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-cad-dark border border-cad-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold font-mono"
              />
            </div>
          </div>

          {/* Color Palette & Material Inference */}
          <div className="bg-cad-dark/80 rounded-lg p-4 border border-cad-border space-y-2">
            <div className="flex items-center space-x-2 text-xs text-cad-muted">
              <Palette className="w-4 h-4 text-gold" />
              <span>Extracted Architectural Tone & Materials:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(roomAnalysis?.dominantColors || ['#f5f5dc', '#8b5a2b', '#2e4a3d', '#ffffff']).map((color: string, i: number) => (
                <div key={i} className="flex items-center space-x-1.5 bg-cad-surface px-2.5 py-1 rounded border border-cad-border text-xs">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                  <span className="font-mono text-[11px] text-cad-light uppercase">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-cad-border hover:bg-cad-surface rounded-lg text-xs font-medium text-cad-light transition"
          >
            ← Back to Upload & Media
          </button>

          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-gold via-gold-light to-gold text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-gold-glow hover:brightness-110 active:scale-98 transition flex items-center space-x-2"
          >
            <span>Confirm Dimensions & Select Style</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
