import React, { useRef } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { Download, ZoomIn, ZoomOut, RotateCcw, Layers } from 'lucide-react';

export const FloorPlan2D: React.FC = () => {
  const project = useProjectStore((state) => state.project);
  const activeFloorId = useEditorStore((state) => state.activeFloorId);
  const setActiveFloorId = useEditorStore((state) => state.setActiveFloorId);
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId);
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter components on active floor or global site
  const components = project.components.filter(
    (c) => c.floorId === activeFloorId || c.type === 'landscape'
  );

  // SVG coordinate transformation:
  // Center is (400, 350)
  // Scale factor: 1m = 25px
  const cx = 400;
  const cy = 350;
  const scale = 26;

  const toSvgX = (x: number) => cx + x * scale;
  const toSvgY = (z: number) => cy + z * scale;

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_floorplan.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(svgUrl);
  };

  // Door and window schedules
  const doorList = project.components.filter((c) => c.type === 'door');
  const windowList = project.components.filter((c) => c.type === 'window');

  return (
    <div className="flex-1 h-full bg-cad-darkest flex flex-col overflow-hidden select-none">
      {/* 2D Toolbar */}
      <div className="h-12 bg-cad-dark border-b border-cad-border px-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-bold text-white tracking-wide uppercase">
            <Layers className="w-4 h-4 text-gold" />
            <span>Architectural 2D Drawings</span>
          </div>

          <div className="flex items-center space-x-1 bg-cad-surface px-2 py-1 rounded border border-cad-border text-xs">
            <span className="text-cad-muted">Active Level:</span>
            <select
              value={activeFloorId}
              onChange={(e) => setActiveFloorId(e.target.value)}
              className="bg-transparent text-cad-light focus:outline-none cursor-pointer"
            >
              {project.floors.map((fl) => (
                <option key={fl.id} value={fl.id} className="bg-cad-surface">
                  {fl.name} (+{fl.elevation}m)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-cad-muted font-mono text-[11px]">
            Scale 1:50 Metric • Grid 1.0m
          </span>
          <button
            onClick={handleExportSVG}
            className="flex items-center space-x-1.5 px-3 py-1 bg-gold hover:bg-gold-bright text-black font-semibold rounded text-xs transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG Plan</span>
          </button>
        </div>
      </div>

      {/* Main Drawing Area & Schedules Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* SVG Architectural Canvas */}
        <div className="flex-1 bg-[#090d16] flex items-center justify-center p-4 overflow-auto">
          <div className="bg-[#0b1120] border border-cad-border/80 rounded-xl shadow-2xl p-6 relative">
            {/* Title Block Header */}
            <div className="flex justify-between items-start mb-4 border-b border-cad-border/70 pb-2">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                  {project.name}
                </h2>
                <p className="text-[11px] text-cad-muted font-mono">
                  ARCHITECTURAL FLOOR PLAN — LEVEL 0.00m • REGION: KERALA
                </p>
              </div>
              <div className="text-right text-[11px] text-cad-muted font-mono">
                <div>PLOT: {project.metadata.plotLength}m × {project.metadata.plotWidth}m</div>
                <div>PROJECT CODE: BV-{project.id.slice(0, 6).toUpperCase()}</div>
              </div>
            </div>

            <svg
              ref={svgRef}
              width="800"
              height="650"
              className="bg-[#080d1a] rounded border border-cad-border/50"
              viewBox="0 0 800 650"
            >
              {/* Architectural Grid Lines (1m grid) */}
              <defs>
                <pattern id="gridPattern" width="26" height="26" patternUnits="userSpaceOnUse">
                  <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                <pattern id="majorGrid" width="130" height="130" patternUnits="userSpaceOnUse">
                  <path d="M 130 0 L 0 0 0 130" fill="none" stroke="#334155" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="800" height="650" fill="url(#gridPattern)" />
              <rect width="800" height="650" fill="url(#majorGrid)" />

              {/* Site Boundary (Dotted Gold Line) */}
              {(() => {
                const pW = project.metadata.plotLength * scale;
                const pD = project.metadata.plotWidth * scale;
                return (
                  <rect
                    x={cx - pW / 2}
                    y={cy - pD / 2}
                    width={pW}
                    height={pD}
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    opacity="0.6"
                  />
                );
              })()}

              {/* Floor Slabs */}
              {components
                .filter((c) => c.type === 'floor')
                .map((slab) => {
                  const [px, , pz] = slab.transform.position;
                  const w = slab.dimensions.length * scale;
                  const d = slab.dimensions.thickness * scale;
                  return (
                    <rect
                      key={`slab-${slab.id}`}
                      x={toSvgX(px) - w / 2}
                      y={toSvgY(pz) - d / 2}
                      width={w}
                      height={d}
                      fill="#1e293b"
                      fillOpacity="0.4"
                      stroke="#475569"
                      strokeWidth="1"
                    />
                  );
                })}

              {/* Landscaping / Pools / Lawns */}
              {components
                .filter((c) => c.type === 'landscape')
                .map((land) => {
                  const [px, , pz] = land.transform.position;
                  const w = land.dimensions.length * scale;
                  const d = land.dimensions.thickness * scale;
                  const isPool = land.name.toLowerCase().includes('pool');
                  const isLawn = land.materialId?.includes('lawn');
                  return (
                    <rect
                      key={`land-${land.id}`}
                      x={toSvgX(px) - w / 2}
                      y={toSvgY(pz) - d / 2}
                      width={w}
                      height={d}
                      fill={isPool ? '#0284c7' : isLawn ? '#166534' : '#475569'}
                      fillOpacity="0.35"
                      stroke={isPool ? '#38bdf8' : isLawn ? '#22c55e' : '#64748b'}
                      strokeWidth="1"
                      strokeDasharray={isLawn ? '4 2' : undefined}
                    />
                  );
                })}

              {/* Walls */}
              {components
                .filter((c) => c.type === 'wall')
                .map((wall) => {
                  const [px, , pz] = wall.transform.position;
                  const rot = wall.transform.rotation[1];
                  const l = wall.dimensions.length * scale;
                  const t = wall.dimensions.thickness * scale;

                  const isSelected = selectedComponentId === wall.id;

                  return (
                    <g
                      key={`wall-${wall.id}`}
                      transform={`translate(${toSvgX(px)}, ${toSvgY(pz)}) rotate(${(rot * 180) / Math.PI})`}
                      onClick={() => setSelectedComponentId(wall.id)}
                      className="cursor-pointer"
                    >
                      {/* Wall Body with architectural hatch */}
                      <rect
                        x="0"
                        y="0"
                        width={l}
                        height={t}
                        fill={isSelected ? '#f59e0b' : '#cbd5e1'}
                        stroke={isSelected ? '#fbbf24' : '#94a3b8'}
                        strokeWidth="1.5"
                      />

                      {/* Cutout Openings (Doors & Windows) */}
                      {wall.openings?.map((op) => {
                        const opX = op.offset * scale;
                        const opW = op.width * scale;
                        const isDoor = op.height > 1.8;

                        return (
                          <g key={`op-${op.id}`}>
                            {/* Opening void */}
                            <rect
                              x={opX}
                              y="-1"
                              width={opW}
                              height={t + 2}
                              fill="#080d1a"
                              stroke="none"
                            />

                            {/* Architectural symbol */}
                            {isDoor ? (
                              // Door: Swing Arc & Leaf
                              <g>
                                <line
                                  x1={opX}
                                  y1={t}
                                  x2={opX + opW}
                                  y2={t}
                                  stroke="#d97706"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d={`M ${opX} ${0} A ${opW} ${opW} 0 0 1 ${opX + opW} ${opW}`}
                                  fill="none"
                                  stroke="#d97706"
                                  strokeWidth="1"
                                  strokeDasharray="3 3"
                                />
                              </g>
                            ) : (
                              // Window: Double Glass Lines
                              <g>
                                <line
                                  x1={opX}
                                  y1={t * 0.3}
                                  x2={opX + opW}
                                  y2={t * 0.3}
                                  stroke="#38bdf8"
                                  strokeWidth="1.2"
                                />
                                <line
                                  x1={opX}
                                  y1={t * 0.7}
                                  x2={opX + opW}
                                  y2={t * 0.7}
                                  stroke="#38bdf8"
                                  strokeWidth="1.2"
                                />
                              </g>
                            )}
                          </g>
                        );
                      })}

                      {/* Dimension Text Label */}
                      <text
                        x={l / 2}
                        y={-6}
                        fill="#64748b"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {wall.dimensions.length}m
                      </text>
                    </g>
                  );
                })}

              {/* Furniture Footprints */}
              {components
                .filter((c) => c.type === 'furniture')
                .map((furn) => {
                  const [px, , pz] = furn.transform.position;
                  const rot = furn.transform.rotation[1];
                  const w = furn.dimensions.length * scale;
                  const d = furn.dimensions.thickness * scale;
                  const isSelected = selectedComponentId === furn.id;

                  return (
                    <g
                      key={`furn-${furn.id}`}
                      transform={`translate(${toSvgX(px)}, ${toSvgY(pz)}) rotate(${(rot * 180) / Math.PI})`}
                      onClick={() => setSelectedComponentId(furn.id)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={-w / 2}
                        y={-d / 2}
                        width={w}
                        height={d}
                        fill={isSelected ? '#f59e0b' : '#334155'}
                        fillOpacity="0.8"
                        stroke={isSelected ? '#fbbf24' : '#64748b'}
                        strokeWidth="1"
                        rx="3"
                      />
                      <text
                        x="0"
                        y="3"
                        fill="#cbd5e1"
                        fontSize="8"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                      >
                        {furn.name.slice(0, 14)}
                      </text>
                    </g>
                  );
                })}

              {/* North Arrow Symbol */}
              <g transform="translate(730, 80)">
                <circle cx="0" cy="0" r="22" fill="#151f32" stroke="#334155" strokeWidth="1" />
                <path d="M 0 -18 L 6 8 L 0 4 L -6 8 Z" fill="#d97706" />
                <text x="0" y="-22" fill="#d97706" fontSize="11" fontWeight="bold" textAnchor="middle">
                  N
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right Side Schedules: Door/Window Schedule & Room Areas */}
        <div className="w-80 bg-cad-dark border-l border-cad-border p-4 flex flex-col space-y-4 overflow-y-auto text-xs">
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <span>Door Schedule ({doorList.length})</span>
            </h3>
            <div className="border border-cad-border rounded overflow-hidden">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-cad-surface text-cad-muted">
                  <tr>
                    <th className="p-1.5">Tag</th>
                    <th className="p-1.5">Size (m)</th>
                    <th className="p-1.5">Material</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cad-border">
                  {doorList.map((d, i) => (
                    <tr key={d.id} className="hover:bg-cad-surface/40">
                      <td className="p-1.5 font-bold text-gold">D{i + 1}</td>
                      <td className="p-1.5">{d.dimensions.length} × {d.dimensions.height}</td>
                      <td className="p-1.5 truncate max-w-[100px]">{d.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <span>Window Schedule ({windowList.length})</span>
            </h3>
            <div className="border border-cad-border rounded overflow-hidden">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-cad-surface text-cad-muted">
                  <tr>
                    <th className="p-1.5">Tag</th>
                    <th className="p-1.5">Size (m)</th>
                    <th className="p-1.5">Sill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cad-border">
                  {windowList.map((w, i) => (
                    <tr key={w.id} className="hover:bg-cad-surface/40">
                      <td className="p-1.5 font-bold text-blueprint-light">W{i + 1}</td>
                      <td className="p-1.5">{w.dimensions.length} × {w.dimensions.height}</td>
                      <td className="p-1.5">+{w.dimensions.sillHeight || 0.9}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Area statement summary */}
          <div className="p-3 bg-cad-surface rounded-lg border border-cad-border font-mono text-xs space-y-1.5">
            <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
              Floor Area Statement
            </div>
            <div className="flex justify-between">
              <span className="text-cad-muted">Plot Area:</span>
              <span className="text-cad-light">{project.metadata.plotArea} m² (~{(project.metadata.plotArea * 0.0247).toFixed(1)} cents)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cad-muted">Plinth / Floor Area:</span>
              <span className="text-gold font-semibold">
                {components
                  .filter((c) => c.type === 'floor')
                  .reduce((acc, f) => acc + f.dimensions.length * f.dimensions.thickness, 0)
                  .toFixed(1)}{' '}
                m²
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cad-muted">Ground Coverage:</span>
              <span className="text-cad-light">
                {(
                  (components
                    .filter((c) => c.type === 'floor')
                    .reduce((acc, f) => acc + f.dimensions.length * f.dimensions.thickness, 0) /
                    (project.metadata.plotArea || 1)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
