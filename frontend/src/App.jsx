import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { AgenticAssistant } from './components/AgenticAssistant';
import { CrisisOrchestrator } from './components/CrisisOrchestrator';

// Domain Views
import { CommandCenterView } from './components/CommandCenterView';
import { DigitalTwinView } from './components/DigitalTwinView';
import { ManufacturingView } from './components/ManufacturingView';
import { SupplyChainView } from './components/SupplyChainView';
import { CommercialView } from './components/CommercialView';
import { FinanceView } from './components/FinanceView';
import { HRView } from './components/HRView';
import { ITOpsView } from './components/ITOpsView';

// Transformation & Intelligence Modules
import { ERPMasterView } from './components/ERPMasterView';
import { ModelRegistryView } from './components/ModelRegistryView';
import { AlertCenterView } from './components/AlertCenterView';
import { TechDebtView } from './components/TechDebtView';
import { CoEView } from './components/CoEView';
import { GovernanceView } from './components/GovernanceView';
import { ChangeAdoptionView } from './components/ChangeAdoptionView';
import { ROIDashboardView } from './components/ROIDashboardView';
import { ComplianceMatrixView } from './components/ComplianceMatrixView';
import { FireDetectionView } from './components/FireDetectionView';
import { AgentTopologyView } from './components/AgentTopologyView';

function App() {
  const [currentView, setCurrentView] = useState('command');
  const [role, setRole] = useState('executive');

  const renderView = () => {
    switch (currentView) {
      case 'command': return <CommandCenterView setCurrentView={setCurrentView} />;
      case 'digitaltwin': return <DigitalTwinView setCurrentView={setCurrentView} />;
      case 'firedetection': return <FireDetectionView setCurrentView={setCurrentView} />;
      case 'topology': return <AgentTopologyView />;
      case 'manufacturing': return <ManufacturingView setCurrentView={setCurrentView} />;
      case 'supplychain': return <SupplyChainView setCurrentView={setCurrentView} />;
      case 'commercial': return <CommercialView setCurrentView={setCurrentView} />;
      case 'finance': return <FinanceView setCurrentView={setCurrentView} />;
      case 'hr': return <HRView setCurrentView={setCurrentView} />;
      case 'itops': return <ITOpsView setCurrentView={setCurrentView} />;

      // New Modules
      case 'erp': return <ERPMasterView setCurrentView={setCurrentView} />;
      case 'models': return <ModelRegistryView setCurrentView={setCurrentView} />;
      case 'alerts': return <AlertCenterView setCurrentView={setCurrentView} />;
      case 'techdebt': return <TechDebtView setCurrentView={setCurrentView} />;
      case 'coe': return <CoEView setCurrentView={setCurrentView} />;
      case 'governance': return <GovernanceView setCurrentView={setCurrentView} />;
      case 'change': return <ChangeAdoptionView setCurrentView={setCurrentView} />;
      case 'roi': return <ROIDashboardView setCurrentView={setCurrentView} />;

      default: return <CommandCenterView setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-shell-gray overflow-hidden font-sans text-shell-darkText text-[14px]">
      <Header role={role} setRole={setRole} setCurrentView={setCurrentView} />

      <div className="flex w-full pt-[58px] pb-[26px]">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} role={role} />

        <main className="flex-1 min-h-0 bg-[#f9fafb] relative">
          <div className="h-full">
            {renderView()}
          </div>
        </main>
      </div>

      <Ticker />
      <AgenticAssistant setCurrentView={setCurrentView} />
      <CrisisOrchestrator setCurrentView={setCurrentView} />
    </div>
  );
}

export default App;
