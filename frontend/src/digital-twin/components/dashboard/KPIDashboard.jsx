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
      label: 'Risk Score',
      value: kpis.riskScore,
      icon: AlertTriangle,
      color: kpis.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400',
      trend: 'down'
    },
    {
      label: 'Energy',
      value: `${kpis.energyConsumption} MW`,
      icon: Battery,
      color: 'text-amber-400',
      trend: 'up'
    },
    {
      label: 'Uptime',
      value: `${kpis.uptime}%`,
      icon: Clock,
      color: 'text-emerald-400',
      trend: 'up'
    },
    {
      label: 'Emissions',
      value: `${kpis.emissions} t/d`,
      icon: CloudFog,
      color: 'text-slate-400',
      trend: 'down'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {kpiConfig.map((kpi, i) => (
        <div
          key={i}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex flex-col"
        >
          <div className="flex items-center justify-between mb-2">
            <kpi.icon size={16} className={kpi.color} />
            {kpi.trend === 'up' ? (
              <TrendingUp size={14} className="text-emerald-500/70" />
            ) : (
              <TrendingDown size={14} className="text-emerald-500/70" />
            )}
          </div>
          <span className="text-2xl font-bold text-slate-100">{kpi.value}</span>
          <span className="text-xs text-slate-400 mt-1">{kpi.label}</span>
        </div>
      ))}
    </div>
  );
}
