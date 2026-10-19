import React from 'react';
import { useEditorStore } from './store/editorStore';
import { StudioHeader } from './components/layout/StudioHeader';
import { AssetCatalogDrawer } from './components/layout/AssetCatalogDrawer';
import { CADViewport } from './components/viewport/CADViewport';
import { ComponentInspector } from './components/inspector/ComponentInspector';
import { BottomEngineeringDock } from './components/layout/BottomEngineeringDock';
import { ProjectDashboard } from './components/dashboard/ProjectDashboard';
import { FloorPlan2D } from './components/drawings/FloorPlan2D';
import { QuantityTakeOffTable } from './components/estimation/QuantityTakeOffTable';
import { BOQEstimatorTable } from './components/estimation/BOQEstimatorTable';
import { PriceCatalogManager } from './components/estimation/PriceCatalogManager';
import { ConstructionGantt } from './components/schedule/ConstructionGantt';
import { FinancialAnalysisView } from './components/financials/FinancialAnalysisView';
import { ProjectReportsView } from './components/reports/ProjectReportsView';

export function App() {
  const activePage = useEditorStore((state) => state.activePage);

  return (
    <div className="w-screen h-screen bg-cad-darkest flex flex-col overflow-hidden text-cad-light antialiased font-sans">
      {/* Top Application Header */}
      <StudioHeader />

      {/* Main View Router */}
      <main className="flex-1 relative flex overflow-hidden">
        {activePage === 'dashboard' && <ProjectDashboard />}

        {activePage === 'designer' && (
          <div className="flex-1 relative flex overflow-hidden">
            <AssetCatalogDrawer />
            <div className="flex-1 relative h-full">
              <CADViewport />
              <ComponentInspector />
              <BottomEngineeringDock />
            </div>
          </div>
        )}

        {activePage === 'floorplans' && <FloorPlan2D />}
        {activePage === 'qto' && <QuantityTakeOffTable />}
        {activePage === 'estimator' && <BOQEstimatorTable />}
        {activePage === 'materials' && <PriceCatalogManager />}
        {activePage === 'schedule' && <ConstructionGantt />}
        {activePage === 'financials' && <FinancialAnalysisView />}
        {activePage === 'reports' && <ProjectReportsView />}
      </main>
    </div>
  );
}

export default App;
