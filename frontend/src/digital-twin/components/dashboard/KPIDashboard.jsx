import React from 'react';
import { usePlantStore } from '../../store/plantStore';
import {
  Activity,
  Zap,
  AlertTriangle,
  Battery,
  Clock,
  CloudFog,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export function KPIDashboard() {
  const { kpis } = usePlantStore();
  const kpiConfig = [
    {
      label: 'Efficiency',
      value: `${kpis.efficiency}%`,
      icon: Activity,
      color: 'text-emerald-400',
      trend: 'up'
    },
    {
      label: 'Throughput',
      value: `${(kpis.throughput / 1000).toFixed(1)}k bbl/d`,
      icon: Zap,
      color: 'text-cyan-400',
      trend: 'up'
    },
    {
      label: 'Health Status',
      value: kpis.riskScore > 30 ? 'Warning' : 'Normal',
      icon: Activity,
      color: kpis.riskScore > 30 ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      trend: kpis.riskScore > 30 ? 'down' : 'up'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {kpiConfig.map((kpi, i) => (
        <div
          key={i}
          className={`border rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden bg-slate-800/40 ${
            kpi.label === 'Health Status' ? kpi.color : 'border-slate-700/50'
          }`}
        >
          <span className="text-sm font-medium text-slate-400 mb-2">{kpi.label}</span>
          <span className={`text-4xl font-bold tracking-tight ${kpi.label === 'Health Status' ? '' : 'text-slate-100'}`}>
            {kpi.value}
          </span>
          {kpi.label === 'Efficiency' && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500/50"></div>
          )}
          {kpi.label === 'Throughput' && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-500/50"></div>
          )}
        </div>
      ))}
    </div>
  );
}
