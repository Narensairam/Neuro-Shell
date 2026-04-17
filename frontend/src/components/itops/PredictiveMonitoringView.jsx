import { useState, useEffect } from 'react';
import {
 Zap, Server, AlertTriangle, ShieldCheck, TrendingUp, Clock,
 ArrowUpRight, ChevronRight, Activity, Box, Search, RefreshCw
} from 'lucide-react';
import {
 AreaChart, Area, LineChart, Line, XAxis, YAxis,
 CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { CONFIG } from '../../config';

const API = CONFIG.ITOPS_AGENT;

const fetchWithTimeout = async (url, options = {}) => {
  const timeout = options.timeout || 2000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const cn = (...cls) => cls.filter(Boolean).join(' ');

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const mkHistory = (base) => Array.from({ length: 30 }, (_, i) => ({
 timestamp: new Date(Date.now() - (30 - i) * 60000).toISOString(),
 cpu_usage: Math.min(99, base.cpu + (Math.random() - 0.5) * 12),
 memory_usage: Math.min(99, base.mem + (Math.random() - 0.5) * 8),
 error_count: Math.max(0, Math.round(base.err + (Math.random() - 0.5) * 4)),
 network_latency: Math.max(10, base.lat + (Math.random() - 0.5) * 30),
}));

const MOCK_SERVERS = [
 { server_id: 'SRV-EU-01', cpu_usage: 93, memory_usage: 89, latency_ms: 340, error_count: 18, failure_risk: 88, anomaly: true },
 { server_id: 'SRV-EU-02', cpu_usage: 61, memory_usage: 54, latency_ms: 82, error_count: 2, failure_risk: 22, anomaly: false },
 { server_id: 'SRV-US-01', cpu_usage: 78, memory_usage: 82, latency_ms: 198, error_count: 9, failure_risk: 65, anomaly: false },
 { server_id: 'SRV-AP-01', cpu_usage: 91, memory_usage: 87, latency_ms: 310, error_count: 14, failure_risk: 82, anomaly: true },
 { server_id: 'SRV-AP-02', cpu_usage: 44, memory_usage: 39, latency_ms: 55, error_count: 1, failure_risk: 10, anomaly: false },
 { server_id: 'SRV-ME-01', cpu_usage: 72, memory_usage: 68, latency_ms: 145, error_count: 5, failure_risk: 38, anomaly: false },
].map(s => ({ ...s, history: mkHistory({ cpu: s.cpu_usage, mem: s.memory_usage, err: s.error_count, lat: s.latency_ms }) }));

const MOCK_SUMMARY = { deflection_rate: 42.8 };

// ─── Anomaly Server Table ──────────────────────────────────────────────────────
function AnomalyTable({ servers, selectedServerId, onSelectServer }) {
 const [filter, setFilter] = useState('all');

 const filtered = servers.filter(s => {
 if (filter === 'anomalous') return s.anomaly === true || (s.failure_risk && s.failure_risk > 50);
 return true;
 });

 return (
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
 <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <h3 className="text-sm font-semibold text-gray-900 ">System Node Status</h3>
 <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
 {[['all', 'Show All'], ['anomalous', 'Anomalies Only']].map(([val, label]) => (
 <button key={val} onClick={() => setFilter(val)}
 className={cn('px-3 py-1 text-xs font-semibold rounded-md transition-all',
 filter === val ? (val === 'anomalous' ? 'bg-white text-red-500 shadow-sm' : 'bg-white text-gray-900 shadow-sm') : 'text-gray-500 hover:text-gray-700')}>
 {label}
 </button>
 ))}
 </div>
 </div>
 <div className="relative">
 <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
 <input type="text" placeholder="Search asset..." className="bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-shell-yellow/20 w-40" />
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-gray-50/50">
 {['Server ID', 'CPU Load', 'Memory', 'Latency', 'Errors', 'Status'].map(h => (
 <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 border-b border-gray-100 ">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filtered.map(s => (
 <tr key={s.server_id} onClick={() => onSelectServer(s.server_id)}
 className={cn('group hover:bg-gray-50/80 cursor-pointer transition-colors',
 selectedServerId === s.server_id ? 'bg-gray-50 shadow-[inset_3px_0_0_0_#FFD500]' : '',
 s.anomaly ? 'bg-red-50/30' : '')}>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <div className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', s.anomaly ? 'bg-red-500' : 'bg-emerald-500')} />
 <span className="text-xs font-semibold text-gray-900 ">{s.server_id}</span>
 </div>
 </td>
 <td className="px-4 py-3">
 <div className="w-20">
 <span className="text-sm font-bold text-gray-600">{(s.cpu_usage || 0).toFixed(1)}%</span>
 <div className="h-1 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
 <div className={cn('h-full rounded-full transition-all', s.cpu_usage > 85 ? 'bg-red-500' : 'bg-gray-900')}
 style={{ width: `${Math.min(s.cpu_usage, 100)}%` }} />
 </div>
 </div>
 </td>
 <td className="px-4 py-3">
 <div className="w-20">
 <span className="text-sm font-bold text-gray-600">{(s.memory_usage || 0).toFixed(1)}%</span>
 <div className="h-1 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
 <div className={cn('h-full rounded-full transition-all', s.memory_usage > 90 ? 'bg-red-500' : 'bg-shell-yellow')}
 style={{ width: `${Math.min(s.memory_usage, 100)}%` }} />
 </div>
 </div>
 </td>
 <td className={cn('px-4 py-3 text-sm font-bold', s.latency_ms > 200 ? 'text-red-500' : 'text-gray-600')}>
 {(s.latency_ms || 0).toFixed(0)} ms
 </td>
 <td className={cn('px-4 py-3 text-sm font-bold', s.error_count > 5 ? 'text-red-500' : 'text-gray-600')}>
 {s.error_count} ERR
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <span className={cn('px-2 py-0.5 rounded text-xs font-semibold border',
 s.anomaly ? 'bg-red-100 text-red-600 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200')}>
 {s.anomaly ? 'CRITICAL' : 'HEALTHY'}
 </span>
 <ChevronRight className="w-3 h-3 text-gray-200 group-hover:text-gray-900 transition-all" />
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400 ">
 <span>Showing {filtered.length} of {servers.length} nodes</span>
 <div className="flex gap-3">
 <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy</span>
 <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Anomaly</span>
 </div>
 </div>
 </div>
 );
}

// ─── Predictive Charts ─────────────────────────────────────────────────────────
function PredictiveCharts({ data, serverName }) {
 const chartData = (data || []).map(p => ({
 time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
 cpu: Number((p.cpu_usage || 0).toFixed(1)),
 mem: Number((p.memory_usage || 0).toFixed(1)),
 errors: p.error_count || 0,
 }));

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between mb-5">
 <div>
 <h3 className="text-sm font-semibold text-gray-900 ">Resource Utilization</h3>
 <p className="text-xs font-bold text-gray-400 ">{serverName} · Real-time telemetry</p>
 </div>
 <div className="flex gap-3">
 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-xs font-bold text-gray-500 ">CPU</span></div>
 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-shell-yellow" /><span className="text-xs font-bold text-gray-500 ">MEM</span></div>
 </div>
 </div>
 <div className="h-[220px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={chartData}>
 <defs>
 <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EE1C25" stopOpacity={0.1} /><stop offset="95%" stopColor="#EE1C25" stopOpacity={0} /></linearGradient>
 <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FFD500" stopOpacity={0.1} /><stop offset="95%" stopColor="#FFD500" stopOpacity={0} /></linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} minTickGap={30} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} domain={[0, 100]} />
 <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 'bold' }} />
 <Area name="CPU" type="monotone" dataKey="cpu" stroke="#EE1C25" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
 <Area name="Memory" type="monotone" dataKey="mem" stroke="#FFD500" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between mb-5">
 <div>
 <h3 className="text-sm font-semibold text-gray-900 ">Error Propagation</h3>
 <p className="text-xs font-bold text-gray-400 ">{serverName} · Fault frequency</p>
 </div>
 <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded ">Rolling 60m</span>
 </div>
 <div className="h-[220px]">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} minTickGap={30} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
 <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 'bold' }} />
 <Line name="Errors" type="stepAfter" dataKey="errors" stroke="#0f172a" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 );
}

// ─── Main Predictive Monitoring View ───────────────────────────────────────────
export function PredictiveMonitoringView() {
 const [servers, setServers] = useState([]);
 const [summary, setSummary] = useState(null);
 const [loading, setLoading] = useState(true);
 const [selectedServerId, setSelectedServerId] = useState(null);

 const fetchData = async () => {
 try {
 const [infraRes, sumRes] = await Promise.all([
 fetchWithTimeout(`${API}/api/operational/infra`),
 fetchWithTimeout(`${API}/api/metrics/summary`),
 ]);
 const infraData = infraRes.ok ? await infraRes.json() : null;
 const sumData = sumRes.ok ? await sumRes.json() : null;
 const servers = Array.isArray(infraData) && infraData.length > 0 ? infraData : MOCK_SERVERS;
 setServers(servers);
 setSummary(sumData || MOCK_SUMMARY);
 if (!selectedServerId && servers.length > 0) setSelectedServerId(servers[0].server_id);
 } catch {
 setServers(MOCK_SERVERS);
 setSummary(MOCK_SUMMARY);
 if (!selectedServerId) setSelectedServerId(MOCK_SERVERS[0].server_id);
 } finally { setLoading(false); }
 };

 useEffect(() => {
 fetchData();
 const id = setInterval(fetchData, 10000);
 return () => clearInterval(id);
 }, []);

 const selectedServer = servers.find(s => s.server_id === selectedServerId) || servers[0];
 const predictiveAlerts = servers.filter(s => s.failure_risk > 60);

 const kpis = [
 { label: 'Nodes Monitored', value: servers.length, icon: Server, color: 'text-gray-900' },
 { label: 'Active Anomalies', value: servers.filter(s => s.anomaly).length, icon: AlertTriangle, color: 'text-red-500' },
 { label: 'Predictive Risk', value: predictiveAlerts.length, icon: TrendingUp, color: 'text-shell-yellow' },
 { label: 'Deflection Rate', value: summary?.deflection_rate ? `${summary.deflection_rate}%` : '--', icon: Zap, color: 'text-gray-900' },
 ];

 if (loading && servers.length === 0) return (
 <div className="flex items-center justify-center h-full">
 <div className="flex flex-col items-center gap-4">
 <div className="w-10 h-10 border-4 border-shell-yellow border-t-transparent rounded-full animate-spin" />
 <p className="text-xs font-semibold text-gray-400 ">Initializing AI Control Tower...</p>
 </div>
 </div>
 );

 return (
 <div className="h-full overflow-y-auto px-6 py-6 space-y-6 bg-gray-50">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <div className="px-2 py-0.5 rounded bg-shell-yellow/10 border border-shell-yellow/20 flex items-center gap-1.5">
 <Zap className="w-3 h-3 text-shell-yellow" fill="currentColor" />
 <span className="text-xs font-semibold text-yellow-700 ">AIOps Engine Active</span>
 </div>
 <div className="w-1 h-1 rounded-full bg-gray-300" />
 <span className="text-xs font-bold text-gray-400 ">Live Predictive Infrastructure Monitoring</span>
 </div>
 <h1 className="text-2xl font-semibold text-gray-900 ">
 Predictive <span className="text-red-500">Infrastructure</span>
 </h1>
 <p className="text-sm text-gray-500 font-medium mt-1">AI-driven anomaly detection & proactive failure prevention</p>
 </div>
 <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
 <div className="text-right">
 <p className="text-xs font-semibold text-gray-400 mb-0.5">Global Status</p>
 <p className="text-xs font-semibold text-gray-900 ">System Nominal</p>
 </div>
 <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
 <ShieldCheck className="w-4 h-4 text-emerald-500" />
 </div>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {kpis.map((k, i) => (
 <div key={k.label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
 <div className="absolute top-0 right-0 w-14 h-14 bg-gray-50 rounded-bl-full transform translate-x-3 -translate-y-3 group-hover:scale-110 transition-transform" />
 <k.icon className={cn('w-5 h-5 mb-3', k.color)} />
 <p className="text-xs font-semibold text-gray-400 mb-1">{k.label}</p>
 <p className={cn('text-2xl font-semibold er ', k.color)}>{k.value}</p>
 </div>
 ))}
 </div>

 {/* Main Grid */}
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 {/* Left: Table + Charts */}
 <div className="xl:col-span-2 space-y-6">
 <AnomalyTable servers={servers} selectedServerId={selectedServerId} onSelectServer={setSelectedServerId} />
 {selectedServer && (
 <PredictiveCharts data={selectedServer.history || []} serverName={selectedServer.server_id} />
 )}
 </div>

 {/* Right: Sidebar */}
 <div className="space-y-6">
 {/* AI Forecast */}
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
 <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
 <h3 className="text-sm font-semibold text-gray-900 ">AI Forecast & Risk</h3>
 <TrendingUp className="w-4 h-4 text-gray-400" />
 </div>
 <div className="p-4 space-y-3">
 {predictiveAlerts.length === 0 ? (
 <div className="text-center py-8">
 <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 border border-gray-100">
 <Box className="w-4 h-4 text-gray-300" />
 </div>
 <p className="text-xs font-bold text-gray-400 ">No Near-Term Risks Detected</p>
 </div>
 ) : predictiveAlerts.map((alert, i) => (
 <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-shell-yellow/50 transition-all">
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-semibold text-gray-900 ">{alert.server_id}</span>
 <div className="px-2 py-0.5 rounded-full bg-red-100 border border-red-200">
 <span className="text-xs font-semibold text-red-600 ">HIGH RISK</span>
 </div>
 </div>
 <div className="flex items-center justify-between mb-3">
 <div>
 <p className="text-xs font-bold text-gray-400 ">Impacted Metric</p>
 <p className="text-xs font-semibold text-gray-900 ">Memory Exhaustion</p>
 </div>
 <div className="text-right">
 <p className="text-xs font-bold text-gray-400 ">Time to Breach</p>
 <div className="flex items-center gap-1 text-red-500">
 <Clock className="w-2.5 h-2.5" />
 <span className="text-xs font-semibold ">~12 Mins</span>
 </div>
 </div>
 </div>
 <div className="p-2 rounded-lg bg-white border border-gray-100 text-xs text-gray-500 ">
 "Observed linear growth in memory allocation. Predicted OOM failure likely in next cycle."
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Preventive Intelligence Log */}
 <div className="bg-gray-900 text-white rounded-xl shadow-xl overflow-hidden">
 <div className="p-4 border-b border-white/10 flex items-center justify-between">
 <div>
 <h3 className="text-xs font-semibold text-shell-yellow ">Preventive Intelligence</h3>
 <p className="text-xs font-bold text-gray-400 mt-0.5">Automated Ticket Stream</p>
 </div>
 <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
 <Activity className="w-4 h-4 text-shell-yellow" />
 </div>
 </div>
 <div className="p-4 space-y-3">
 {[
 { id: 'PT-901', asset: 'SRV-AG-04', issue: 'Predictive CPU Spike', status: 'Deflected' },
 { id: 'PT-904', asset: 'SRV-US-01', issue: 'Latent Disk Bottleneck', status: 'Deflected' },
 ].map((pt, i) => (
 <div key={i} className="flex items-center gap-3 group/item cursor-pointer">
 <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0">
 <span className="text-sm font-semibold text-shell-yellow leading-tight">AI</span>
 <span className="text-[7px] font-bold text-gray-500 ">Auto</span>
 </div>
 <div className="flex-1 overflow-hidden">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-white group-hover/item:text-shell-yellow transition-colors ">{pt.id} · {pt.asset}</span>
 <span className="text-xs font-bold text-emerald-400 ">{pt.status}</span>
 </div>
 <p className="text-xs text-gray-400 truncate">{pt.issue}</p>
 </div>
 <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover/item:text-shell-yellow transition-colors" />
 </div>
 ))}
 <button className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold hover:bg-white/10 transition-all text-gray-400 hover:text-white mt-1">
 View Complete Intelligence Log
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
