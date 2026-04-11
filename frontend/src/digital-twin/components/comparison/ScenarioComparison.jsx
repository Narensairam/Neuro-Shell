import React from 'react';
import { usePlantStore } from '../../store/plantStore';
import { X, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function ScenarioComparison() {
  const {
    scenarios,
    activeScenarioId,
    comparisonScenarioId,
    setComparisonScenario
  } = usePlantStore();

  if (!comparisonScenarioId) return null;

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId);
  const compareScenario = scenarios.find((s) => s.id === comparisonScenarioId);

  if (!activeScenario || !compareScenario) return null;

  const renderDiff = (activeVal, compareVal, invertGood = false) => {
    const diff = activeVal - compareVal;
    if (Math.abs(diff) < 0.05) return <Minus size={14} className="text-slate-500" />;

    const isPositive = diff > 0;
    const isGood = invertGood ? !isPositive : isPositive;

    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(diff).toFixed(1)}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100">
            Scenario Comparison
          </h2>
          <button
            onClick={() => setComparisonScenario(null)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-1 border border-slate-700 rounded-lg p-4 bg-slate-800/30">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                Baseline
              </div>
              <h3 className="text-lg font-semibold text-slate-200">
                {compareScenario.name}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                {compareScenario.nodes.length} Nodes •{' '}
                {compareScenario.edges.length} Connections
              </p>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <div className="bg-slate-800 p-3 rounded-full border border-slate-700">
                <ArrowRight size={24} className="text-cyan-500" />
              </div>
            </div>

            <div className="col-span-1 border border-cyan-900/50 rounded-lg p-4 bg-cyan-950/20">
              <div className="text-xs text-cyan-500/70 uppercase tracking-wider mb-1">
                Active Scenario
              </div>
              <h3 className="text-lg font-semibold text-cyan-100">
                {activeScenario.name}
              </h3>
              <p className="text-sm text-cyan-500/70 mt-2">
                {activeScenario.nodes.length} Nodes •{' '}
                {activeScenario.edges.length} Connections
              </p>
            </div>
          </div>

          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">
            KPI Impact Analysis
          </h3>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3">Metric</th>
                  <th className="px-6 py-3">{compareScenario.name}</th>
                  <th className="px-6 py-3">{activeScenario.name}</th>
                  <th className="px-6 py-3">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-300">
                    Efficiency
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {compareScenario.kpis.efficiency}%
                  </td>
                  <td className="px-6 py-4 text-slate-200">
                    {activeScenario.kpis.efficiency}%
                  </td>
                  <td className="px-6 py-4">
                    {renderDiff(
                      activeScenario.kpis.efficiency,
                      compareScenario.kpis.efficiency
                    )}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-300">
                    Throughput
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {(compareScenario.kpis.throughput / 1000).toFixed(1)}k bbl/d
                  </td>
                  <td className="px-6 py-4 text-slate-200">
                    {(activeScenario.kpis.throughput / 1000).toFixed(1)}k bbl/d
                  </td>
                  <td className="px-6 py-4">
                    {renderDiff(
                      activeScenario.kpis.throughput,
                      compareScenario.kpis.throughput
                    )}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-300">
                    Risk Score
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {compareScenario.kpis.riskScore}
                  </td>
                  <td className="px-6 py-4 text-slate-200">
                    {activeScenario.kpis.riskScore}
                  </td>
                  <td className="px-6 py-4">
                    {renderDiff(
                      activeScenario.kpis.riskScore,
                      compareScenario.kpis.riskScore,
                      true
                    )}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-300">
                    Energy Consumption
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {compareScenario.kpis.energyConsumption} MW
                  </td>
                  <td className="px-6 py-4 text-slate-200">
                    {activeScenario.kpis.energyConsumption} MW
                  </td>
                  <td className="px-6 py-4">
                    {renderDiff(
                      activeScenario.kpis.energyConsumption,
                      compareScenario.kpis.energyConsumption,
                      true
                    )}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-300">
                    Uptime
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {compareScenario.kpis.uptime}%
                  </td>
                  <td className="px-6 py-4 text-slate-200">
                    {activeScenario.kpis.uptime}%
                  </td>
                  <td className="px-6 py-4">
                    {renderDiff(
                      activeScenario.kpis.uptime,
                      compareScenario.kpis.uptime
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
