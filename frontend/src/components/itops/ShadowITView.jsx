import { useState, useEffect, useMemo } from 'react';
import {
 Database, ShieldCheck, Search, UserX, PlusCircle, ArrowUpRight,
 TrendingUp, AlertTriangle, History, RefreshCw, LayoutGrid,
 X, Bot, AlertCircle, Activity, ChevronRight, ExternalLink,
 Cpu, Server, Cloud, Zap, Globe
} from 'lucide-react';
import {
 PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
 BarChart, Bar, XAxis, YAxis, CartesianGrid
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
const COLORS = ['#e60000', '#ffcc00', '#3b82f6'];

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_DEVICES = [
 { device_id: 'UNKN-CLO-001', known: 0, cpu_usage: 54, network_activity: 9450, access_frequency: 58, location: 'cloud', risk_score: 91, severity: 'High', issue: 'Unregistered asset with abnormal outbound traffic' },
 { device_id: 'UNKN-CLO-002', known: 0, cpu_usage: 38, network_activity: 6200, access_frequency: 41, location: 'cloud', risk_score: 78, severity: 'High', issue: 'Cloud VM not in ITAM registry' },
 { device_id: 'MGMT-EDG-001', known: 1, cpu_usage: 62, network_activity: 3100, access_frequency: 22, location: 'edge', risk_score: 30, severity: 'Low', issue: null },
 { device_id: 'UNKN-EDG-003', known: 0, cpu_usage: 71, network_activity: 7800, access_frequency: 49, location: 'edge', risk_score: 84, severity: 'High', issue: 'Edge device outside approved deployment scope' },
 { device_id: 'MGMT-SRV-002', known: 1, cpu_usage: 45, network_activity: 2200, access_frequency: 18, location: 'on-prem', risk_score: 22, severity: 'Low', issue: null },
 { device_id: 'MGMT-SRV-003', known: 1, cpu_usage: 58, network_activity: 2900, access_frequency: 25, location: 'on-prem', risk_score: 28, severity: 'Low', issue: null },
 { device_id: 'UNKN-CLO-004', known: 0, cpu_usage: 29, network_activity: 4100, access_frequency: 33, location: 'cloud', risk_score: 62, severity: 'Medium', issue: 'SaaS application without DLP policy' },
 { device_id: 'MGMT-EDG-005', known: 1, cpu_usage: 39, network_activity: 1800, access_frequency: 14, location: 'edge', risk_score: 18, severity: 'Low', issue: null },
 { device_id: 'UNKN-OPR-007', known: 0, cpu_usage: 82, network_activity: 11200, access_frequency: 67, location: 'on-prem', risk_score: 95, severity: 'High', issue: 'Rogue device on OT network segment' },
 { device_id: 'MGMT-CLO-009', known: 1, cpu_usage: 51, network_activity: 2400, access_frequency: 19, location: 'cloud', risk_score: 25, severity: 'Low', issue: null },
 { device_id: 'UNKN-CLO-011', known: 0, cpu_usage: 43, network_activity: 5500, access_frequency: 38, location: 'cloud', risk_score: 71, severity: 'Medium', issue: 'Unauthorized API gateway detected' },
 { device_id: 'MGMT-SRV-012', known: 1, cpu_usage: 37, network_activity: 1900, access_frequency: 16, location: 'on-prem', risk_score: 20, severity: 'Low', issue: null },
];

// ─── KPI Cards ────────────────────────────────────────────────────────────────
function ShadowKpiCards({ totalDiscovered, registered, shadowIt, highRisk }) {
 const cards = [
 { label: 'Total Devices Discovered', value: totalDiscovered, icon: Database, color: 'text-gray-900', bg: 'bg-gray-50', trend: '+12 across multi-cloud' },
 { label: 'Registered Assets', value: registered, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Managed via EOS-ITAM' },
 { label: 'Shadow IT Devices', value: shadowIt, icon: Search, color: 'text-shell-yellow', bg: 'bg-yellow-50', trend: 'Awaiting Registration', isWarning: shadowIt > 0 },
 { label: 'High Risk Devices', value: highRisk, icon: UserX, color: 'text-red-600', bg: 'bg-red-50', trend: 'Immediate Action Required', isCritical: highRisk > 0 },
 ];

 return (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {cards.map((c, i) => (
 <div key={i} className={cn('p-5 rounded-xl bg-white border shadow-sm relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-md', c.isCritical ? 'border-red-200' : 'border-gray-200')}>
 <div className={cn('absolute top-0 left-0 w-full h-1', c.isWarning ? 'bg-shell-yellow' : c.isCritical ? 'bg-red-500' : 'bg-emerald-500')} />
 <div className="flex items-start justify-between mb-5">
 <div className={cn('p-3 rounded-xl', c.bg)}>
 <c.icon className={cn('w-5 h-5', c.color)} />
 </div>
 {c.isCritical ? (
 <div className="px-2.5 py-1 rounded-full bg-red-100 border border-red-200 flex items-center gap-1 animate-pulse">
 <span className="text-xs font-semibold text-red-600 ">Unmanaged</span>
 </div>
 ) : (
 <PlusCircle className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" />
 )}
 </div>
 <div>
 <span className="text-xs font-semibold text-gray-400 block mb-1">{c.label}</span>
 <div className="flex items-end gap-2">
 <span className={cn('text-3xl font-semibold er leading-none', c.color)}>{c.value}</span>
 <span className="text-xs font-bold text-gray-400 mb-1">Units</span>
 </div>
 </div>
 <div className="mt-5 pt-3 border-t border-gray-50">
 <span className="text-xs font-bold text-gray-400 ">{c.trend}</span>
 </div>
 </div>
 ))}
 </div>
 );
}

// ─── Risk Charts (Donut + Bar) ─────────────────────────────────────────────────
function ShadowRiskCharts({ devices }) {
 const riskData = useMemo(() => {
 const counts = (devices || []).reduce((acc, d) => {
 const l = d.risk_score > 70 ? 'High' : d.risk_score > 40 ? 'Medium' : 'Low';
 acc[l] = (acc[l] || 0) + 1;
 return acc;
 }, {});
 return [{ name: 'High Risk', value: counts['High'] || 0 }, { name: 'Medium Risk', value: counts['Medium'] || 0 }, { name: 'Low Risk', value: counts['Low'] || 0 }];
 }, [devices]);

 const locationData = useMemo(() => {
 const counts = (devices || []).reduce((acc, d) => {
 if (!acc[d.location]) acc[d.location] = { name: (d.location || 'unknown').toUpperCase(), managed: 0, shadow: 0 };
 if (d.known === 1) acc[d.location].managed++;
 else acc[d.location].shadow++;
 return acc;
 }, {});
 return Object.values(counts);
 }, [devices]);

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
 <div className="flex items-center justify-between mb-5">
 <div>
 <h3 className="text-sm font-semibold text-gray-900 ">Risk Vulnerability Profile</h3>
 <p className="text-xs font-bold text-gray-400 mt-1">Cross-Asset Scoring</p>
 </div>
 <AlertTriangle className="w-4 h-4 text-gray-300" />
 </div>
 <div className="flex-1 min-h-[240px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={riskData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" animationDuration={1500}>
 {riskData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
 </Pie>
 <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 'bold' }} />
 <Legend iconType="circle" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: '', paddingTop: '16px' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
 <div className="flex items-center justify-between mb-5">
 <div>
 <h3 className="text-sm font-semibold text-gray-900 ">Discovery Heatmap by Location</h3>
 <p className="text-xs font-bold text-gray-400 mt-1">Managed vs Shadow Assets</p>
 </div>
 <Globe className="w-4 h-4 text-gray-300" />
 </div>
 <div className="flex-1 min-h-[240px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={locationData} barGap={8}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
 <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 'bold' }} cursor={{ fill: '#f8fafc' }} />
 <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: '', paddingBottom: '16px' }} />
 <Bar dataKey="managed" fill="#10b981" radius={[4, 4, 0, 0]} name="Managed" />
 <Bar dataKey="shadow" fill="#ffcc00" radius={[4, 4, 0, 0]} name="Shadow IT" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 );
}

// ─── Asset Inventory Table ─────────────────────────────────────────────────────
function ShadowInventoryTable({ devices, onRowClick, selectedDeviceId }) {
 const [filter, setFilter] = useState('all');

 const filtered = devices.filter(d => {
 if (filter === 'shadow') return d.known === 0;
 if (filter === 'high-risk') return d.risk_score > 70;
 return true;
 });

 return (
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
 <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <h3 className="text-sm font-semibold text-gray-900 ">Enterprise Asset Inventory</h3>
 <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100">
 {['all', 'shadow', 'high-risk'].map(mode => (
 <button key={mode} onClick={() => setFilter(mode)}
 className={cn('px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
 filter === mode ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600')}>
 {mode}
 </button>
 ))}
 </div>
 </div>
 <div className="relative">
 <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
 <input type="text" placeholder="Filter assets..." className="bg-gray-50/50 border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-shell-yellow/20 w-52" />
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-gray-50/30">
 {['Device ID', 'Location', 'Status', 'Risk Score', 'Traffic Profile'].map(h => (
 <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-400 border-b border-gray-50 ">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filtered.map((d, i) => (
 <tr key={d.device_id + i} onClick={() => onRowClick(d)}
 className={cn('group hover:bg-gray-50/80 cursor-pointer transition-colors',
 selectedDeviceId === d.device_id ? 'bg-gray-50 shadow-[inset_4px_0_0_0_#FFD500]' : '',
 d.known === 0 && d.risk_score > 70 ? 'bg-red-50/20' : '')}>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <div className={cn('w-2 h-2 rounded-full', d.known === 0 ? 'bg-red-500' : 'bg-emerald-500')} />
 <span className="text-xs font-semibold text-gray-900 ">{d.device_id}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 {d.location === 'cloud' ? <Cloud className="w-3.5 h-3.5 text-blue-400" /> :
 d.location === 'edge' ? <Zap className="w-3.5 h-3.5 text-shell-yellow" /> :
 <Server className="w-3.5 h-3.5 text-gray-400" />}
 <span className="text-xs font-bold text-gray-700 er">{d.location}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold border',
 d.known === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100')}>
 {d.known === 1 ? 'MANAGED' : 'UNMANAGED'}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="flex flex-col items-start">
 <span className={cn('text-sm font-semibold er', d.risk_score > 70 ? 'text-red-500' : 'text-gray-900')}>{d.risk_score}</span>
 <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
 <div className={cn('h-full rounded-full', d.risk_score > 70 ? 'bg-red-500' : 'bg-emerald-500')} style={{ width: `${d.risk_score}%` }} />
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex flex-col">
 <span className="text-xs font-semibold text-gray-900 er">{((d.network_activity || 0) / 1000).toFixed(1)} GB/s</span>
 <span className="text-xs font-bold text-gray-400 ">{d.access_frequency || 0} REQ/HR</span>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-400 ">
 <div className="flex gap-6">
 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Shadow IT Detected</span>
 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> EOS-ITAM Compliance Active</span>
 </div>
 <span>Discovery Node: Global Explorer-01 · Uptime: 99.9%</span>
 </div>
 </div>
 );
}

// ─── Shadow Detail Drawer ──────────────────────────────────────────────────────
function ShadowDetailDrawer({ device, onClose }) {
 if (!device) return null;
 return (
 <>
 <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" onClick={onClose} />
 <div className="fixed right-0 top-0 bottom-0 w-[560px] bg-white z-[111] shadow-2xl border-l border-gray-100 p-10 overflow-y-auto">
 <div className="flex items-center justify-between mb-10">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-xl">
 <Search className="w-6 h-6 text-shell-yellow" />
 </div>
 <div>
 <h3 className="text-lg font-semibold text-gray-900 ">Asset Intelligence</h3>
 <p className="text-xs text-gray-400 font-semibold mt-0.5">DEVICE ID: #{device.device_id}</p>
 </div>
 </div>
 <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><X className="w-5 h-5" /></button>
 </div>

 <div className="space-y-8">
 <div className="p-5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className={cn('w-2.5 h-2.5 rounded-full', device.known === 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500')} />
 <span className="text-sm font-semibold text-gray-900 ">
 {device.known === 0 ? 'UNMANAGED (SHADOW IT)' : 'MANAGED ASSET'}
 </span>
 </div>
 <div className="flex items-center gap-2 text-emerald-600">
 <ShieldCheck className="w-4 h-4" /><span className="text-xs font-semibold text-gray-400 ">EOS Verified</span>
 </div>
 </div>

 <div>
 <h1 className="text-xl font-semibold text-gray-900 leading-tight">
 {device.known === 0 ? 'Suspicious Infrastructure Node' : 'Authorized Resource Node'}
 </h1>
 <div className="flex gap-2 mt-2">
 <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-500">Location: {(device.location || '').toUpperCase()}</span>
 <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-500">Risk Score: {device.risk_score}/100</span>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-50">
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-gray-400"><Activity className="w-3.5 h-3.5" /><span className="text-xs font-semibold ">Traffic Analysis</span></div>
 <p className="text-xs font-semibold text-gray-900 ">Net Activity: <span className={device.network_activity > 8000 ? 'text-red-500' : ''}>{((device.network_activity || 0) / 1000).toFixed(2)} GB/s</span></p>
 <p className="text-xs font-semibold text-gray-900 ">Access Freq: <span className={device.access_frequency > 40 ? 'text-orange-500' : ''}>{device.access_frequency || 0} req/hr</span></p>
 </div>
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-gray-400"><Cpu className="w-3.5 h-3.5" /><span className="text-xs font-semibold ">Resource Profile</span></div>
 <p className="text-xs font-semibold text-gray-900 ">CPU Compute: {(device.cpu_usage || 0).toFixed(1)}%</p>
 <p className="text-xs font-semibold text-gray-900 ">Asset Type: <span className="text-gray-400">Unclassified</span></p>
 </div>
 </div>

 <div className="space-y-3">
 <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 "><Zap className="w-3.5 h-3.5 text-shell-yellow" /> Intelligence Insight</h4>
 <ul className="space-y-2 pl-4 border-l-2 border-gray-100">
 <li className="text-sm font-semibold text-gray-900 ">
 • {device.known === 0 ? 'Device is not registered in central asset inventory (ITAM).' : 'Device activity matches standard operational baseline.'}
 </li>
 {device.network_activity > 8000 && <li className="text-sm font-semibold text-gray-900 ">• High volume data throughput detected outside typical work hours.</li>}
 {device.access_frequency > 40 && <li className="text-sm font-semibold text-gray-900 ">• Abnormal frequency of API handshake attempts detected.</li>}
 </ul>
 </div>

 <div className="space-y-3">
 <h4 className="text-sm font-semibold text-red-600 flex items-center gap-2 "><AlertCircle className="w-3.5 h-3.5" /> Business Exposure</h4>
 <p className="text-xs font-bold text-gray-400 leading-relaxed ">
 {device.known === 0 ? 'Potential compliance breach (ISO 27001/SOC2). Unauthorized assets bypass security policy enforcement, leading to data exfiltration risks.' : 'Minimal risk profile. Asset is within managed boundary.'}
 </p>
 </div>

 {device.known === 0 && (
 <div className="space-y-3">
 <h4 className="text-sm font-semibold text-blue-600 flex items-center gap-2 "><Activity className="w-3.5 h-3.5" /> Remediation Path</h4>
 <div className="space-y-2">
 {['Investigate Owner', 'Register in ITAM', 'Quarantine Node'].map(a => (
 <div key={a} className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all group">
 <span className="text-xs font-semibold text-gray-900 ">{a}</span>
 <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="p-6 rounded-xl bg-gray-900 text-white space-y-4 relative overflow-hidden">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-shell-yellow"><Bot className="w-4 h-4" /><span className="text-xs font-semibold ">Auto-Response Enabled</span></div>
 <span className="text-xs font-semibold text-gray-500 ">SYS-SCAN-902</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-gray-400 ">Decision:</span>
 <span className={cn('px-2 py-0.5 rounded-md text-xs font-semibold bg-white/10', device.known === 0 ? 'text-red-400' : 'text-emerald-400')}>
 {device.known === 0 ? 'Escalated to SOC' : 'Monitoring Active'}
 </span>
 </div>
 <p className="text-xs text-gray-400 leading-relaxed ">
 {device.known === 0
 ? 'AI Orchestrator has generated a High-Severity incident. No known owner found in HR-database for MAC association.'
 : 'Standard behavior detected. Asset verified against cloud-inventory registry.'}
 </p>
 </div>

 <div className="flex gap-4">
 <button className="flex-1 py-3 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors shadow-lg">Take Command</button>
 <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><ExternalLink className="w-4 h-4" /></button>
 </div>
 </div>
 </div>
 </>
 );
}

// ─── Main Shadow IT View ────────────────────────────────────────────────────────
export function ShadowITView() {
 const [devices, setDevices] = useState([]);
 const [summary, setSummary] = useState(null);
 const [loading, setLoading] = useState(true);
 const [selectedDevice, setSelectedDevice] = useState(null);
 const [lastRefreshed, setLastRefreshed] = useState(new Date());

 const fetchData = async () => {
 try {
 setLoading(true);
 const [shadowRes, sumRes] = await Promise.all([
 fetchWithTimeout(`${API}/api/operational/shadow`),
 fetchWithTimeout(`${API}/api/metrics/summary`),
 ]);
 const shadowData = shadowRes.ok ? await shadowRes.json() : null;
 setDevices(Array.isArray(shadowData) && shadowData.length > 0 ? shadowData : MOCK_DEVICES);
 setSummary(sumRes.ok ? await sumRes.json() : null);
 setLastRefreshed(new Date());
 } catch {
 setDevices(MOCK_DEVICES);
 } finally { setLoading(false); }
 };

 useEffect(() => {
 fetchData();
 const id = setInterval(fetchData, 20000);
 return () => clearInterval(id);
 }, []);

 const shadowCount = devices.filter(d => d.known === 0).length;
 const highRiskCount = devices.filter(d => d.risk_score >= 80).length;

 return (
 <div className="h-full overflow-y-auto px-6 py-6 space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-semibold text-gray-900 ">
 Shadow IT <span className="text-gray-300 font-light">Discovery</span>
 </h2>
 <div className="flex items-center gap-2 mt-1 text-gray-400">
 <span className="text-xs font-semibold ">AI-Driven Asset Visibility</span>
 <div className="w-1.5 h-1.5 rounded-full bg-shell-yellow" />
 <span className="text-xs font-semibold ">High-Fidelity Infrastructure Mapping</span>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className={cn('px-4 py-2 rounded-xl border flex items-center gap-2',
 shadowCount > 0 ? 'bg-yellow-50 border-yellow-100 text-yellow-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600')}>
 {shadowCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
 <span className="text-xs font-semibold ">{shadowCount > 0 ? 'Shadow Assets Detected' : 'Fully Registered'}</span>
 </div>
 <button onClick={fetchData} className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-white transition-all shadow-sm">
 <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
 </button>
 </div>
 </div>

 <ShadowKpiCards totalDiscovered={devices.length} registered={devices.length - shadowCount} shadowIt={shadowCount} highRisk={highRiskCount} />
 <ShadowRiskCharts devices={devices} />
 <ShadowInventoryTable devices={devices} onRowClick={setSelectedDevice} selectedDeviceId={selectedDevice?.device_id} />

 {/* Status Footer */}
 <div className="flex items-center justify-between p-6 rounded-xl bg-gray-900 text-white relative overflow-hidden">
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-3">
 <LayoutGrid className="w-5 h-5 text-blue-400" />
 <div>
 <p className="text-xs font-semibold text-gray-500 ">Discovery Core</p>
 <p className="text-xs font-semibold ">Global Asset Intelligence Online</p>
 </div>
 </div>
 <div className="h-6 w-px bg-white/10" />
 <div className="flex items-center gap-2 text-gray-400">
 <History className="w-4 h-4" />
 <span className="text-sm font-bold ">Last Deep Scan: {lastRefreshed.toLocaleTimeString()}</span>
 </div>
 </div>
 <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-blue-400">
 Multi-Edge Support: Active
 </div>
 </div>

 {/* Detail Drawer */}
 {selectedDevice && <ShadowDetailDrawer device={selectedDevice} onClose={() => setSelectedDevice(null)} />}
 </div>
 );
}
