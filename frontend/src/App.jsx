import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { AgenticAssistant } from './components/AgenticAssistant';
import { CrisisOrchestrator } from './components/CrisisOrchestrator';
import { Menu, X } from 'lucide-react';

// Domain Views
import { CommandCenterView } from './components/CommandCenterView';
import { DigitalTwinView } from './components/DigitalTwinView';
import { ManufacturingView } from './components/ManufacturingView';
import { SupplyChainView } from './components/SupplyChainView';
import { CommercialView } from './components/CommercialView';
import { FinanceView } from './components/FinanceView';
import { HRView } from './components/HRView';
import { ITOpsView } from './components/ITOpsView';

// Dedicated Agent Views
import { CommercialAgent } from './components/CommercialAgent';
import { HRWorkforceAgent } from './components/HRWorkforceAgent';
import { ITOpsAgent } from './components/ITOpsAgent';

// Transformation & Intelligence Modules
import { ERPMasterView } from './components/ERPMasterView';
import { ModelRegistryView } from './components/ModelRegistryView';
import { AlertCenterView } from './components/AlertCenterView';
import { TechDebtView } from './components/TechDebtView';
import { CoEView } from './components/CoEView';
import { GovernanceView } from './components/GovernanceView';
import { ChangeAdoptionView } from './components/ChangeAdoptionView';
import { ROIDashboardView } from './components/ROIDashboardView';
import { FireDetectionView } from './components/FireDetectionView';
import { AgentTopologyView } from './components/AgentTopologyView';

function App() {
  const [currentView, setCurrentView] = useState('command');
  const [role, setRole] = useState('executive');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDigitalTwin = currentView === 'digitaltwin';

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

      // Focused Agent Views
      case 'commercial_agent': return <CommercialAgent />;
      case 'hr_agent': return <HRWorkforceAgent />;
      case 'itops_agent': return <ITOpsAgent setCurrentView={setCurrentView} />;

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
    <>
      {isDigitalTwin ? (
        <div className="flex h-screen w-full overflow-hidden flex-col bg-black relative z-0">
          {/* Keep the main Neuro Shell header */}
          <Header role={role} setRole={setRole} setCurrentView={setCurrentView} />

          {/* Hamburger button — top-left, just under header */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="fixed top-[66px] left-3 z-[9999] w-9 h-9 rounded-lg bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
            title="Toggle Navigation"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Slide-in sidebar drawer */}
          <div className={`fixed inset-y-0 left-0 z-[9998] transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar
              currentView={currentView}
              setCurrentView={(v) => { setCurrentView(v); setSidebarOpen(false); }}
              role={role}
            />
          </div>

          {/* Dimmed backdrop when sidebar is open */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Full-screen Digital Twin area — no top-level scroll, internal components handle it */}
          <main className="flex-1 min-h-0 overflow-hidden w-full pt-[58px] flex flex-col">
            <div className="flex-1 min-h-0 flex flex-col">
              <DigitalTwinView setCurrentView={(v) => { setCurrentView(v); setSidebarOpen(false); }} />
            </div>
          </main>
        </div>
      ) : (
        <div className="flex h-screen w-full bg-shell-gray overflow-hidden font-sans text-shell-darkText text-[14px] relative z-0">
          <Header role={role} setRole={setRole} setCurrentView={setCurrentView} />

          <div className="flex w-full pt-[58px] pb-[26px]">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} role={role} />

            <main className="flex-1 min-h-0 bg-shell-gray relative">
              <div className="h-full">
                {renderView()}
              </div>
            </main>
          </div>

          <Ticker />
        </div>
      )}

      {/* Global Persisted Elements — NEVER UNMOUNT DURING VIEW CHANGES */}
      <AgenticAssistant setCurrentView={setCurrentView} />
      <CrisisOrchestrator setCurrentView={setCurrentView} />
    </>
  );
}

export default App;
