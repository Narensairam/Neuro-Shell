import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { usePlantStore } from '../../store/plantStore';

// Generate some mock historical data based on current KPIs
const generateTrendData = (baseVal) => {
  return Array.from({ length: 7 }).map((_, i) => ({
    time: `${i * 4}h`,
    value: baseVal * (0.9 + Math.random() * 0.2)
  }));
};

export function ChartsPanel() {
  const { kpis, nodes } = usePlantStore();
  const trendData = useMemo(
    () => generateTrendData(kpis.throughput),
    [kpis.throughput]
  );
  
  const statusCounts = useMemo(() => {
    const counts = { online: 0, warning: 0, critical: 0, offline: 0 };
    nodes.forEach((n) => {
      if (counts[n.data.metadata.status] !== undefined) {
        counts[n.data.metadata.status]++;
      }
    });
    return [
      { name: 'Online', value: counts.online, color: '#10b981' },
      { name: 'Warning', value: counts.warning, color: '#f59e0b' },
      { name: 'Critical', value: counts.critical, color: '#ef4444' },
      { name: 'Offline', value: counts.offline, color: '#64748b' }
    ].filter((d) => d.value > 0);
  }, [nodes]);

  return (
    <div className="grid grid-cols-2 gap-6 h-80">
      <div className="space-y-4 flex flex-col h-full bg-slate-800/30 rounded-xl p-4 border border-slate-800/50">
        <h3 className="text-sm font-semibold text-slate-200">Throughput Temperature & Output Trend</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '13px', borderRadius: '8px' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4 flex flex-col h-full bg-slate-800/30 rounded-xl p-4 border border-slate-800/50">
        <h3 className="text-sm font-semibold text-slate-200">Equipment Operational Status</h3>
        <div className="flex-1 w-full min-h-0 flex items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={statusCounts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '13px', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-1/2 flex flex-col gap-4 pl-8 justify-center">
            {statusCounts.map((stat) => (
              <div key={stat.name} className="flex items-center gap-3 text-sm">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: stat.color }} />
                <span className="text-slate-400 font-medium">{stat.name}</span>
                <span className="text-slate-100 font-bold ml-auto text-lg">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
