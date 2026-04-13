import React from 'react';
import { usePlantStore } from '../../store/plantStore';
import { SimulationPanel } from '../simulation/SimulationPanel';
import { DashboardView } from '../dashboard/DashboardView';
import { PlantTopology } from '../topology/PlantTopology';
import { PlantView3D } from '../three/PlantView3D';
import { NodeDetailPanel } from '../details/NodeDetailPanel';
import { ScenarioComparison } from '../comparison/ScenarioComparison';
import { 
  Hexagon, 
  Settings2, 
  Menu,
  LayoutDashboard,
  Network,
  Box as BoxIcon,
  LineChart,
  GitCompare,
  Activity
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'topology', label: 'Topology', icon: Network },
  { id: '3d', label: '3D View', icon: BoxIcon },
  { id: 'simulation', label: 'Simulation', icon: LineChart },
  { id: 'comparison', label: 'Comparison', icon: GitCompare }
];

export function AppLayout() {
  const { activeTab, setActiveTab, isLoading } = usePlantStore();
  
  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-cyan-500 rounded-lg">
        <Hexagon size={48} className="animate-[spin_4s_linear_infinite] mb-4" />
        <h1 className="text-xl font-bold tracking-widest uppercase">Initializing Digital Twin</h1>
        <p className="text-slate-500 text-sm mt-2">Loading plant topology and telemetry...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'topology': return <PlantTopology />;
      case '3d': return <PlantView3D />;
      case 'simulation': return <SimulationPanel />;
      case 'comparison': return <ScenarioComparison />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b border-slate-800 bg-[#0b1120] flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-[15px] tracking-wide text-slate-100">
            Digital Twin Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-slate-200 transition-colors"><Settings2 size={18} /></button>
          <button className="hover:text-slate-200 transition-colors"><Menu size={18} /></button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-auto">
        {/* Navigation Sidebar */}
        <aside className="w-[200px] shrink-0 bg-[#0f172a] border-r border-slate-800 flex flex-col py-4 gap-1 z-20">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left ${
                  isActive 
                  ? 'bg-slate-800/50 text-cyan-300 border-l-2 border-cyan-500' 
                  : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <tab.icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                {tab.label}
              </button>
            )
          })}
          
          <div className="mt-auto px-4 py-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded flex flex-col p-3 gap-2">
               <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Activity size={14} className="text-emerald-500"/> System Online
               </div>
               <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                 Latency: 24ms
               </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 relative flex flex-col">
            {renderContent()}
          </div>
          {/* Node Details Overlay only for Topology view */}
          {(activeTab === 'topology' || activeTab === '3d') && <NodeDetailPanel />}
        </main>
      </div>
    </div>
  );
}
