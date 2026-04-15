import React from 'react';
import { usePlantStore } from '../../store/plantStore';
import { X, ArrowRight, TrendingUp, TrendingDown, Minus, GitCompare } from 'lucide-react';

export function ScenarioComparison() {
  const {
    scenarios,
    activeScenarioId,
    comparisonScenarioId,
    setComparisonScenario
  } = usePlantStore();

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const compareScenario = scenarios.find((s) => s.id === comparisonScenarioId) || (scenarios.length > 1 ? scenarios[1] : activeScenario);

  if (!activeScenario || !compareScenario) return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-500">
      Need at least two scenarios to compare. Create one in the Simulation tab.
    </div>
  );

  const renderDiff = (activeVal, compareVal, invertGood = false) => {
    const diff = activeVal - compareVal;
    if (diff === 0) return <Minus size={14} className="text-slate-500" />;

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
    <div className="w-full flex flex-col bg-slate-950 p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GitCompare size={24} className="text-cyan-500" />
            Scenario Comparison
          </h2>
          <p className="text-sm text-slate-500 mt-1">Analyze KPI impacts between baseline operations and simulated scenarios.</p>
        </div>

        {comparisonScenarioId && (
          <button
            onClick={() => setComparisonScenario(null)}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors text-sm font-medium border border-slate-700"
          >
            Clear Comparison
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-5xl mx-auto w-full overflow-hidden flex flex-col">
        <div className="p-6">
          <div className="flex gap-4 mb-8">
            <select
              value={compareScenario.id}
              onChange={(e) => setComparisonScenario(e.target.value)}
              className="w-1/2 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 cursor-pointer focus:outline-none focus:border-cyan-500"
            >
              {scenarios.map(s => <option key={s.id} value={s.id}>{s.name} {s.isBaseline ? '(Baseline)' : ''}</option>)}
            </select>

            <div className="flex items-center justify-center -mx-2 z-10 w-8">
              <span className="bg-slate-950 border border-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full font-bold">VS</span>
            </div>

            <select
              value={activeScenario.id}
              disabled
              className="w-1/2 bg-cyan-950/20 border border-cyan-800/50 text-cyan-100 text-sm rounded-md px-3 py-2 opacity-80 cursor-not-allowed"
            >
              <option>{activeScenario.name} (Active)</option>
            </select>
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-6 mb-8 relative items-center">
            <div className="col-span-1 border border-slate-700 rounded-lg p-6 bg-slate-800/30 text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                Scenario A
              </div>
              <h3 className="text-2xl font-semibold text-slate-200">
                {compareScenario.name}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                {compareScenario.nodes.length} Nodes •{' '}
                {compareScenario.edges.length} Connections
              </p>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <div className="bg-slate-800 p-4 rounded-full border border-slate-700">
                <ArrowRight size={28} className="text-cyan-500" />
              </div>
            </div>

            <div className="col-span-1 border border-cyan-900/50 rounded-lg p-6 bg-cyan-950/20 text-center">
              <div className="text-xs text-cyan-500/70 uppercase tracking-wider mb-2">
                Scenario B (Active)
              </div>
              <h3 className="text-2xl font-semibold text-cyan-100">
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
                  <td className="px-6 py-4 font-medium text-slate-300">Efficiency</td>
                  <td className="px-6 py-4 text-slate-400">{compareScenario.kpis.efficiency}%</td>
                  <td className="px-6 py-4 text-slate-200">{activeScenario.kpis.efficiency}%</td>
                  <td className="px-6 py-4">
                    {renderDiff(activeScenario.kpis.efficiency, compareScenario.kpis.efficiency)}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-300">Throughput</td>
                  <td className="px-6 py-4 text-slate-400">
                    {(compareScenario.kpis.throughput / 1000).toFixed(1)}k bbl/d
                  </td>
                  <td className="px-6 py-4 text-slate-200">
                    {(activeScenario.kpis.throughput / 1000).toFixed(1)}k bbl/d
                  </td>
                  <td className="px-6 py-4">
                    {renderDiff(activeScenario.kpis.throughput, compareScenario.kpis.throughput)}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-300">Risk Score</td>
                  <td className="px-6 py-4 text-slate-400">{compareScenario.kpis.riskScore}</td>
                  <td className="px-6 py-4 text-slate-200">{activeScenario.kpis.riskScore}</td>
                  <td className="px-6 py-4">
                    {renderDiff(activeScenario.kpis.riskScore, compareScenario.kpis.riskScore, true)}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-300">Energy Consumption</td>
                  <td className="px-6 py-4 text-slate-400">{compareScenario.kpis.energyConsumption} MW</td>
                  <td className="px-6 py-4 text-slate-200">{activeScenario.kpis.energyConsumption} MW</td>
                  <td className="px-6 py-4">
                    {renderDiff(activeScenario.kpis.energyConsumption, compareScenario.kpis.energyConsumption, true)}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-300">Uptime</td>
                  <td className="px-6 py-4 text-slate-400">{compareScenario.kpis.uptime}%</td>
                  <td className="px-6 py-4 text-slate-200">{activeScenario.kpis.uptime}%</td>
                  <td className="px-6 py-4">
                    {renderDiff(activeScenario.kpis.uptime, compareScenario.kpis.uptime)}
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
