import React, { useState } from 'react';
import { usePlantStore } from '../../store/plantStore';
import { Play, Plus, Save, Settings2, Trash2, GitCompare } from 'lucide-react';

export function SimulationPanel() {
  const {
    simulationParams,
    updateSimulationParams,
    simulateRestructuring,
    isSimulating,
    nodes,
    addNode,
    removeNode,
    scenarios,
    saveScenario,
    loadScenario,
    activeScenarioId,
    setComparisonScenario
  } = usePlantStore();

  const [newScenarioName, setNewScenarioName] = useState('');
  const [newNodeType, setNewNodeType] = useState('tank');

  const handleAddNode = () => {
    const id = `node-${Date.now()}`;
    addNode({
      id,
      type: 'equipment',
      position: {
        x: Math.random() * 200 + 100,
        y: Math.random() * 200 + 100
      },
      data: {
        label: `New ${newNodeType}`,
        type: newNodeType,
        metadata: {
          status: 'offline',
          capacity: 10000,
          pressure: 14.7,
          temperature: 25
        }
      }
    });
  };

  const handleSaveScenario = () => {
    if (newScenarioName.trim()) {
      saveScenario(newScenarioName, 'Custom user scenario');
      setNewScenarioName('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Settings2 size={20} className="text-cyan-500" />
          Simulation Controls
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Parameters Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Global Parameters
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="text-slate-300">Flow Rate Multiplier</label>
                <span className="text-cyan-400">
                  {simulationParams.flowRateMultiplier.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={simulationParams.flowRateMultiplier}
                onChange={(e) =>
                  updateSimulationParams({
                    flowRateMultiplier: parseFloat(e.target.value)
                  })
                }
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="text-slate-300">Plant Load Factor</label>
                <span className="text-cyan-400">
                  {simulationParams.loadFactor}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                step="5"
                value={simulationParams.loadFactor}
                onChange={(e) =>
                  updateSimulationParams({
                    loadFactor: parseInt(e.target.value)
                  })
                }
                className="w-full accent-cyan-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={simulationParams.maintenanceMode}
                onChange={(e) =>
                  updateSimulationParams({
                    maintenanceMode: e.target.checked
                  })
                }
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
              />
              Enable Maintenance Mode
            </label>
          </div>

          <button
            onClick={simulateRestructuring}
            disabled={isSimulating}
            className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSimulating ? (
              <span className="animate-pulse">Simulating...</span>
            ) : (
              <>
                <Play size={16} />
                Run Simulation
              </>
            )}
          </button>
        </section>

        <div className="h-px bg-slate-800" />

        {/* Topology Editor */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Topology Editor
          </h3>

          <div className="flex gap-2">
            <select
              value={newNodeType}
              onChange={(e) => setNewNodeType(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="tank">Tank</option>
              <option value="pump">Pump</option>
              <option value="valve">Valve</option>
              <option value="reactor">Reactor</option>
              <option value="heater">Heater</option>
              <option value="separator">Separator</option>
              <option value="pipeline">Pipeline</option>
            </select>
            <button
              onClick={handleAddNode}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-md transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-800/50"
              >
                <span className="text-xs text-slate-300 truncate pr-2">
                  {node.data.label}
                </span>
                <button
                  onClick={() => removeNode(node.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-slate-800" />

        {/* Scenarios */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Scenarios
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Scenario name..."
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSaveScenario}
              disabled={!newScenarioName.trim()}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-md transition-colors disabled:opacity-50"
            >
              <Save size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-3 rounded-md border text-sm transition-colors cursor-pointer
                  ${activeScenarioId === scenario.id ? 'bg-cyan-900/20 border-cyan-800/50 text-cyan-100' : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'}`}
                onClick={() => loadScenario(scenario.id)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{scenario.name}</span>
                  {scenario.isBaseline && (
                    <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                      Baseline
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs opacity-70">
                    Eff: {scenario.kpis.efficiency}%
                  </span>
                  {activeScenarioId !== scenario.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setComparisonScenario(scenario.id);
                      }}
                      className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 px-2 py-1 rounded"
                    >
                      <GitCompare size={12} /> Compare
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
