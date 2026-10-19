import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Ruler, 
  Sliders, 
  Box, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { useInteriorStore } from '../../store/interiorStore';
import { RoomMediaUploader } from './RoomMediaUploader';
import { RoomGeometryReview } from './RoomGeometryReview';
import { DesignPreferencesModal } from './DesignPreferencesModal';
import { InteractiveRoom3DEditor } from './InteractiveRoom3DEditor';
import { InteriorBudgetShoppingList } from './InteriorBudgetShoppingList';

export type WorkspaceStep = 'upload' | 'geometry_review' | 'preferences' | 'editor_3d' | 'procurement';

export const AIRoomDesignerWorkspace: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkspaceStep>('upload');
  const alternatives = useInteriorStore((state) => state.alternatives);
  const resetStore = useInteriorStore((state) => state.resetStore);

  const steps: { id: WorkspaceStep; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: '1. Room Media & Scan', icon: <Upload className="w-3.5 h-3.5" /> },
    { id: 'geometry_review', label: '2. Verify Geometry', icon: <Ruler className="w-3.5 h-3.5" /> },
    { id: 'preferences', label: '3. Style & Budget', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'editor_3d', label: '4. 3D Design & Replace', icon: <Box className="w-3.5 h-3.5" /> },
    { id: 'procurement', label: '5. Budget & Shopping', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-cad-darkest text-cad-light overflow-hidden select-none">
      
      {/* Workflow Navigation Header */}
      <div className="h-12 bg-cad-dark border-b border-cad-border px-6 flex items-center justify-between z-20">
        
        {/* Step Indicator Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = steps.findIndex((s) => s.id === currentStep) > idx;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gold text-black shadow-gold-glow'
                    : isCompleted
                    ? 'text-cad-light hover:text-white bg-cad-surface/60'
                    : 'text-cad-muted hover:text-cad-light'
                }`}
              >
                <span>{step.icon}</span>
                <span>{step.label}</span>
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Right Action: Step Jump & Reset */}
        <div className="flex items-center space-x-2">
          {currentStep === 'editor_3d' && (
            <button
              onClick={() => setCurrentStep('procurement')}
              className="px-3 py-1 bg-gold hover:bg-gold-light text-black text-xs font-bold rounded shadow-gold-glow flex items-center space-x-1 transition"
            >
              <span>View Shopping List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 'procurement' && (
            <button
              onClick={() => setCurrentStep('editor_3d')}
              className="px-3 py-1 bg-cad-surface hover:bg-cad-border text-white text-xs font-semibold rounded border border-cad-border flex items-center space-x-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to 3D Room</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('Reset current interior project and start a new scan?')) {
                resetStore();
                setCurrentStep('upload');
              }
            }}
            className="p-1.5 text-cad-muted hover:text-red-400 hover:bg-cad-surface rounded transition"
            title="Reset Project"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Step Body */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {currentStep === 'upload' && (
          <RoomMediaUploader onComplete={() => setCurrentStep('geometry_review')} />
        )}

        {currentStep === 'geometry_review' && (
          <RoomGeometryReview
            onProceed={() => setCurrentStep('preferences')}
            onBack={() => setCurrentStep('upload')}
          />
        )}

        {currentStep === 'preferences' && (
          <DesignPreferencesModal
            onGenerated={() => setCurrentStep('editor_3d')}
            onBack={() => setCurrentStep('geometry_review')}
          />
        )}

        {currentStep === 'editor_3d' && (
          <InteractiveRoom3DEditor />
        )}

        {currentStep === 'procurement' && (
          <InteriorBudgetShoppingList />
        )}
      </div>

    </div>
  );
};
