import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { Calendar, Clock, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

interface ScheduleTask {
  id: string;
  name: string;
  durationDays: number;
  startWeek: number;
  endWeek: number;
  progressPercent: number;
  responsible: string;
  plannedCostINR: number;
  status: 'completed' | 'in_progress' | 'scheduled';
}

const DEFAULT_SCHEDULE_TASKS: ScheduleTask[] = [
  {
    id: 't-1',
    name: 'Site Clearance, Surveying & Demarcation',
    durationDays: 14,
    startWeek: 1,
    endWeek: 2,
    progressPercent: 100,
    responsible: 'Civil Contractor',
    plannedCostINR: 125000,
    status: 'completed',
  },
  {
    id: 't-2',
    name: 'Foundation Earthwork & RCC Footings',
    durationDays: 28,
    startWeek: 2,
    endWeek: 6,
    progressPercent: 85,
    responsible: 'RCC Structural Team',
    plannedCostINR: 850000,
    status: 'in_progress',
  },
  {
    id: 't-3',
    name: 'Basement / Plinth Beam Casting & Compaction',
    durationDays: 21,
    startWeek: 5,
    endWeek: 8,
    progressPercent: 50,
    responsible: 'RCC Structural Team',
    plannedCostINR: 620000,
    status: 'in_progress',
  },
  {
    id: 't-4',
    name: 'Ground Floor Brick/Solid Block Masonry',
    durationDays: 35,
    startWeek: 7,
    endWeek: 12,
    progressPercent: 20,
    responsible: 'Masonry Subcontractor',
    plannedCostINR: 980000,
    status: 'in_progress',
  },
  {
    id: 't-5',
    name: 'First Floor RCC Slab Shuttering & Casting',
    durationDays: 21,
    startWeek: 11,
    endWeek: 14,
    progressPercent: 0,
    responsible: 'Structural Contractor',
    plannedCostINR: 750000,
    status: 'scheduled',
  },
  {
    id: 't-6',
    name: 'Roof Truss Fabrication & Kerala Clay Tile Laying',
    durationDays: 28,
    startWeek: 13,
    endWeek: 17,
    progressPercent: 0,
    responsible: 'Carpentry & Roofing Team',
    plannedCostINR: 580000,
    status: 'scheduled',
  },
  {
    id: 't-7',
    name: 'MEP: Electrical Piping & Plumbing Conduiting',
    durationDays: 28,
    startWeek: 14,
    endWeek: 18,
    progressPercent: 0,
    responsible: 'MEP Licensed Contractor',
    plannedCostINR: 480000,
    status: 'scheduled',
  },
  {
    id: 't-8',
    name: 'Internal & External Cement Plastering (1:4 & 1:6)',
    durationDays: 35,
    startWeek: 17,
    endWeek: 22,
    progressPercent: 0,
    responsible: 'Plastering Team',
    plannedCostINR: 520000,
    status: 'scheduled',
  },
  {
    id: 't-9',
    name: 'Vitrified Tile Flooring & Granite Countertops',
    durationDays: 28,
    startWeek: 21,
    endWeek: 25,
    progressPercent: 0,
    responsible: 'Finishing Subcontractor',
    plannedCostINR: 680000,
    status: 'scheduled',
  },
  {
    id: 't-10',
    name: 'Doors, Windows, UPVC Glazing & Teak Millwork',
    durationDays: 21,
    startWeek: 23,
    endWeek: 26,
    progressPercent: 0,
    responsible: 'Joinery Fabricators',
    plannedCostINR: 650000,
    status: 'scheduled',
  },
  {
    id: 't-11',
    name: 'Weather-Proof Emulsion Painting & Landscaping',
    durationDays: 21,
    startWeek: 25,
    endWeek: 28,
    progressPercent: 0,
    responsible: 'Decorators & Landscapers',
    plannedCostINR: 420000,
    status: 'scheduled',
  },
];

export const ConstructionGantt: React.FC = () => {
  const project = useProjectStore((state) => state.project);
  const [tasks, setTasks] = useState<ScheduleTask[]>(DEFAULT_SCHEDULE_TASKS);

  const totalWeeks = 28;
  const totalCost = tasks.reduce((sum, t) => sum + t.plannedCostINR, 0);
  const overallProgress = Math.round(
    tasks.reduce((sum, t) => sum + (t.progressPercent * t.durationDays) / 100, 0) /
      tasks.reduce((sum, t) => sum + t.durationDays, 0) *
      100
  );

  return (
    <div className="flex-1 h-full bg-cad-darkest flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-cad-dark border-b border-cad-border flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Construction Scheduling & Gantt Timeline
            </h2>
          </div>
          <p className="text-xs text-cad-muted mt-0.5">
            Phased construction milestones, task dependencies, progress tracking, and scheduled cost distributions.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-cad-surface px-3 py-1.5 rounded border border-cad-border">
            Overall Project Progress: <strong className="text-gold font-bold">{overallProgress}%</strong>
          </div>
          <div className="bg-cad-surface px-3 py-1.5 rounded border border-cad-border">
            Total Duration: <strong className="text-white">28 Weeks (~6.5 Months)</strong>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-cad-dark border border-cad-border rounded-xl shadow-panel p-4 min-w-[900px]">
          {/* Week Scale Header */}
          <div className="grid grid-cols-12 gap-1 pb-3 border-b border-cad-border text-xs font-mono text-cad-muted">
            <div className="col-span-4 font-semibold text-white">Task Description & Responsibility</div>
            <div className="col-span-1 text-center">Days</div>
            <div className="col-span-1 text-right">Budget (₹)</div>
            <div className="col-span-6 flex justify-between px-2 text-[10px]">
              <span>W1 (Month 1)</span>
              <span>W7 (Month 2)</span>
              <span>W14 (Month 4)</span>
              <span>W21 (Month 5)</span>
              <span>W28 (Finish)</span>
            </div>
          </div>

          {/* Tasks Rows */}
          <div className="divide-y divide-cad-border/60 mt-2">
            {tasks.map((task) => {
              const startOffsetPct = ((task.startWeek - 1) / totalWeeks) * 100;
              const widthPct = ((task.endWeek - task.startWeek + 1) / totalWeeks) * 100;

              return (
                <div key={task.id} className="grid grid-cols-12 gap-1 py-3 items-center text-xs hover:bg-cad-surface/30 px-1 rounded transition-colors">
                  <div className="col-span-4 pr-2">
                    <div className="font-semibold text-white font-sans">{task.name}</div>
                    <div className="text-[10px] text-cad-muted font-mono">{task.responsible}</div>
                  </div>

                  <div className="col-span-1 text-center font-mono text-cad-light">
                    {task.durationDays}d
                  </div>

                  <div className="col-span-1 text-right font-mono text-gold text-[11px]">
                    ₹{(task.plannedCostINR / 100000).toFixed(1)}L
                  </div>

                  {/* Gantt Bar Visualizer */}
                  <div className="col-span-6 relative h-6 bg-cad-surface/60 rounded overflow-hidden">
                    <div
                      className={`absolute top-1 bottom-1 rounded transition-all flex items-center px-2 text-[10px] font-mono text-black font-bold truncate ${
                        task.status === 'completed'
                          ? 'bg-emerald-500'
                          : task.status === 'in_progress'
                          ? 'bg-gold'
                          : 'bg-blueprint/60 text-white'
                      }`}
                      style={{
                        left: `${startOffsetPct}%`,
                        width: `${Math.max(widthPct, 4)}%`,
                      }}
                    >
                      {task.progressPercent > 0 && `${task.progressPercent}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
