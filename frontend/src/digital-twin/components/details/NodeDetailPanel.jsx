import React from 'react';
import { usePlantStore } from '../../store/plantStore';
import { X, Activity, Thermometer, Gauge, Database as DatabaseIcon } from 'lucide-react';

export function NodeDetailPanel() {
  const { nodes, selectedNodeId, setSelectedNode, updateNodeData } = usePlantStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const { label, type, metadata } = node.data;

  const handleStatusChange = (e) => {
    updateNodeData(node.id, {
      metadata: {
        ...metadata,
        status: e.target.value
      }
    });
  };

  return (
    <div className="absolute inset-x-0 bottom-0 bg-slate-900 border-t border-slate-800 shadow-2xl z-10 animate-in slide-in-from-bottom-full duration-300">
      <div className="p-4 flex flex-col h-full max-h-[40vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{label}</h2>
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              {type} • ID: {node.id}
            </span>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <label className="text-xs text-slate-400 mb-1 block">
                Operational Status
              </label>
              <select
                value={metadata.status}
                onChange={handleStatusChange}
                className="w-full bg-slate-950 border border-slate-700 text-sm rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                style={{
                  color: `var(--plant-${metadata.status})`
                }}
              >
                <option value="online">Online</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {metadata.capacity !== undefined && (
                <div className="bg-slate-800/30 p-2 rounded border border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <DatabaseIcon size={14} />
                    <span className="text-[10px] uppercase">Capacity</span>
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {metadata.capacity.toLocaleString()}
                  </div>
                </div>
              )}
              {metadata.flowRate !== undefined && (
                <div className="bg-slate-800/30 p-2 rounded border border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Activity size={14} />
                    <span className="text-[10px] uppercase">Flow Rate</span>
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {metadata.flowRate.toLocaleString()}
                  </div>
                </div>
              )}
              {metadata.pressure !== undefined && (
                <div className="bg-slate-800/30 p-2 rounded border border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Gauge size={14} />
                    <span className="text-[10px] uppercase">Pressure</span>
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {metadata.pressure} PSI
                  </div>
                </div>
              )}
              {metadata.temperature !== undefined && (
                <div className="bg-slate-800/30 p-2 rounded border border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Thermometer size={14} />
                    <span className="text-[10px] uppercase">Temp</span>
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {metadata.temperature} °C
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg border border-slate-800/50 p-4 flex flex-col justify-center items-center text-center">
            <Activity size={32} className="text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">
              Historical telemetry data would appear here for this specific equipment node.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
