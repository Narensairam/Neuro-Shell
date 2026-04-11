import React, { useEffect } from 'react';
import { usePlantStore } from '../../store/plantStore';
import { SimulationPanel } from '../simulation/SimulationPanel';
import { KPIDashboard } from '../dashboard/KPIDashboard';
import { ChartsPanel } from '../dashboard/ChartsPanel';
import { PlantTopology } from '../topology/PlantTopology';
import { PlantView3D } from '../three/PlantView3D';
import { NodeDetailPanel } from '../details/NodeDetailPanel';
import { ScenarioComparison } from '../comparison/ScenarioComparison';
import { Hexagon, Layers, Box as BoxIcon, Activity } from 'lucide-react';
export function AppLayout() {
  const { viewMode, setViewMode, isLoading, initialize } = usePlantStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-cyan-500">
        <Hexagon size={48} className="animate-spin-slow mb-4" />
        <h1 className="text-xl font-bold tracking-widest uppercase">
          Initializing Digital Twin
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Loading plant topology and telemetry...
        </p>
      </div>);

  }
  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden text-slate-200 rounded-lg border border-slate-800 shadow-2xl relative">
      {/* View Mode Toggle (Injected into the view) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex bg-slate-900/80 backdrop-blur rounded-md p-1 border border-slate-700 shadow-lg">
        <button
          onClick={() => setViewMode('2d')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === '2d' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover-slate-200'}`}>
          <Layers size={14} /> 2D Topology
        </button>
        <button
          onClick={() => setViewMode('3d')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === '3d' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover-slate-200'}`}>
          <BoxIcon size={14} /> 3D View
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Simulation */}
        <aside className="w-[300px] shrink-0 flex flex-col z-10 relative bg-slate-900/50 border-r border-slate-800">
          <SimulationPanel />
        </aside>

        {/* Center - Visualization */}
        <section className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
          <div className="flex-1 relative">
            {viewMode === '2d' ? <PlantTopology /> : <PlantView3D />}
          </div>

          {/* Node Details overlay at bottom of center panel */}
          <NodeDetailPanel />
        </section>

        {/* Right Panel - Dashboard */}
        <aside className="w-[340px] shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto custom-scrollbar z-10">
          <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              Live Analytics
            </h2>
            <span className="text-[9px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 animate-pulse">SYNC ACTIVE</span>
          </div>
          <KPIDashboard />
          <div className="h-px bg-slate-800 mx-4" />
          <ChartsPanel />
        </aside>
      </div>

      {/* Modals */}
      <ScenarioComparison />
    </div>
  );
}
