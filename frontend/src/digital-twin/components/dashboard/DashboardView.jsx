import React from 'react';
import { KPIDashboard } from './KPIDashboard';
import { ChartsPanel } from './ChartsPanel';

export function DashboardView() {
  return (
    <div className="h-full w-full flex flex-col bg-slate-950 overflow-y-auto custom-scrollbar p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Live Analytics</h2>
        <p className="text-sm text-slate-500">Real-time factory metrics and historical performance indicators.</p>
      </div>
      
      <div className="w-full">
        <KPIDashboard />
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <ChartsPanel />
      </div>
    </div>
  );
}
